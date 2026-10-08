"use client";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Center, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Artwork } from "@/lib/types";
import { campaign } from "@/lib/campaign";
import { CENTRAL_ID, EYE_HEIGHT, HALL, HERO, PEDESTAL_ROWS, START, WALK, focusPose, heroPose, hotspotPosition, pedestalPositions, BACK_X, BACK_Z, avoidHero, walkPath, type Pose, type Vec3 } from "@/lib/museum-layout";

export interface WalkInput { move: number; turn: number; wake: () => void }

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const SERIF = '"Cormorant Garamond Variable", Georgia, serif';
const SANS = '"DM Sans Variable", sans-serif';

// Canvas textures are drawn once; wait for the web fonts so plaques don't render in the fallback face.
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => { let alive = true; Promise.all([document.fonts.load(`40px ${SERIF}`), document.fonts.load(`20px ${SANS}`)]).catch(() => undefined).finally(() => { if (alive) setReady(true); }); return () => { alive = false; }; }, []);
  return ready;
}
function canvasTexture(width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void, srgb = true) {
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  paint(canvas.getContext("2d")!);
  const texture = new THREE.CanvasTexture(canvas); if (srgb) texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; return texture;
}
function textTexture(lines: { text: string; size: number; color?: string; font?: string }[], background: string, width = 1024, height = 640, top = 65) {
  return canvasTexture(width, height, ctx => {
    ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#a7ac9650"; ctx.lineWidth = 3; ctx.strokeRect(17, 17, width - 34, height - 34);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    let y = top;
    for (const line of lines) {
      ctx.font = `${line.size}px ${line.font || SANS}`; ctx.fillStyle = line.color || "#fcf7e9";
      const rows: string[] = []; let row = "";
      for (const word of line.text.split(/\s+/)) { if (ctx.measureText(`${row} ${word}`).width > width - 100 && row) { rows.push(row); row = word; } else row += (row ? " " : "") + word; }
      if (row) rows.push(row);
      for (const rowText of rows.slice(0, 3)) { ctx.fillText(rowText, width / 2, y, width - 90); y += line.size * 1.22; }
      y += 22;
    }
  });
}
function woodTexture() {
  const texture = canvasTexture(1024, 1024, ctx => {
    const tones = ["#c58f4a", "#cd9850", "#bd8744", "#c69149", "#c9944c", "#c28b47"]; const planks = 6, w = 1024 / planks;
    let seed = 7; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < planks; i++) {
      ctx.fillStyle = tones[Math.floor(rand() * tones.length)]; ctx.fillRect(i * w, 0, w, 1024);
      for (let g = 0; g < 38; g++) { ctx.strokeStyle = `rgba(${rand() > .5 ? "90,50,18" : "225,165,95"},${.03 + rand() * .05})`; ctx.lineWidth = .6 + rand() * 1.6; const x = i * w + rand() * w; ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + (rand() - .5) * 14, 340, x + (rand() - .5) * 14, 680, x + (rand() - .5) * 10, 1024); ctx.stroke(); }
      for (const y of [rand() * 1024]) { ctx.fillStyle = "rgba(60,32,12,.3)"; ctx.fillRect(i * w, y, w, 2); const shade = ctx.createLinearGradient(0, y, 0, y + 90); shade.addColorStop(0, `rgba(${rand() > .5 ? "255,225,170" : "70,38,14"},.07)`); shade.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = shade; ctx.fillRect(i * w, y, w, 90); }
      ctx.fillStyle = "rgba(55,30,10,.32)"; ctx.fillRect(i * w, 0, 2, 1024);
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(HALL.halfWidth * 2 / 1.8, (HALL.front - HALL.back) / 4); return texture;
}
const radial = (stops: [number, string][], size = 512, cy = .5) => canvasTexture(size, size, ctx => { const g = ctx.createRadialGradient(size / 2, size * cy, 0, size / 2, size * cy, size / 2); stops.forEach(([at, color]) => g.addColorStop(at, color)); ctx.fillStyle = g; ctx.fillRect(0, 0, size, size); });

const pointerOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; };
const pointerOut = () => { document.body.style.cursor = ""; };
// A drag to look around must not count as a click on whatever is under the cursor.
const clicked = (e: ThreeEvent<MouseEvent>, action: () => void) => { e.stopPropagation(); if (e.delta <= 6) action(); };

function Photo({ url, x, outer, ratioFallback = .75 }: { url: string; x: number; outer: [number, number]; ratioFallback?: number }) {
  const source = useTexture(url);
  const texture = useMemo(() => { const clone = source.clone(); clone.colorSpace = THREE.SRGBColorSpace; clone.anisotropy = 8; clone.needsUpdate = true; return clone; }, [source]);
  useEffect(() => () => texture.dispose(), [texture]);
  const image = texture.image as HTMLImageElement; const ratio = image.width && image.height ? image.width / image.height : ratioFallback;
  const [ow, oh] = outer, mw = ow - .05, mh = oh - .05, maxW = mw - .03, maxH = mh - .03;
  const width = Math.min(maxW, maxH * ratio), height = width / ratio;
  return <group position={[x, 1.4, 0]} rotation={[-.11, 0, 0]}>
    <mesh position={[0, oh / 2, 0]} castShadow><boxGeometry args={[ow, oh, .025]} /><meshStandardMaterial color="#6f4220" roughness={.5} /></mesh>
    <mesh position={[0, oh / 2, .0133]}><planeGeometry args={[mw, mh]} /><meshStandardMaterial color="#fffdf5" roughness={.9} /></mesh>
    <mesh position={[0, oh / 2, .0141]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
  </group>;
}
function PhotoFallback({ x, outer }: { x: number; outer: [number, number] }) { return <group position={[x, 1.4, 0]} rotation={[-.11, 0, 0]}><mesh position={[0, outer[1] / 2, 0]}><boxGeometry args={[outer[0], outer[1], .025]} /><meshStandardMaterial color="#6f4220" /></mesh></group>; }
// The pet's portrait is the larger frame; the keepsake's frame is smaller so the two read differently.
const PET_FRAME = { x: -.115, outer: [.3, .4] as [number, number] }, OBJECT_FRAME = { x: .16, outer: [.2, .26] as [number, number] };

type PlaqueLine = { text: string; size: number; color?: string; font?: string };
// Blue "papel picado" tag: scalloped lower edge, punched dots and corner flowers, text on top.
function papelPicado(lines: PlaqueLine[], width: number, height: number) {
  return canvasTexture(width, height, ctx => {
    const r = height * .045, scallop = height * .06, bodyBottom = height - scallop;
    ctx.clearRect(0, 0, width, height); ctx.fillStyle = "#11275f"; ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(width - r, 0); ctx.quadraticCurveTo(width, 0, width, r); ctx.lineTo(width, bodyBottom);
    const count = Math.round(width / (scallop * 2.1)), step = width / count;
    for (let k = count - 1; k >= 0; k--) { ctx.arc(k * step + step / 2, bodyBottom, step / 2, 0, Math.PI, false); }
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    const dot = height * .012, inset = height * .05;
    for (let x = inset * 2.2; x < width - inset * 1.6; x += dot * 5.2) { ctx.beginPath(); ctx.arc(x, inset * .6, dot, 0, 7); ctx.fill(); }
    for (let y = inset * 2.4; y < bodyBottom - inset; y += dot * 5.2) { for (const x of [inset * .6, width - inset * .6]) { ctx.beginPath(); ctx.arc(x, y, dot, 0, 7); ctx.fill(); } }
    for (let k = 0; k < count; k++) { ctx.beginPath(); ctx.arc(k * step + step / 2, bodyBottom - inset * .55, dot * 1.2, 0, 7); ctx.fill(); }
    for (const [cx, cy, dir] of [[inset * 1.5, inset * 1.45, 1], [width - inset * 1.5, inset * 1.45, -1]] as const) for (let petal = 0; petal < 5; petal++) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(dir * (petal * .42 - .1)); ctx.beginPath(); ctx.ellipse(dir * inset * .85, 0, inset * .62, inset * .2, 0, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.globalCompositeOperation = "source-over"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const total = lines.reduce((sum, l) => sum + l.size * 1.3, 0); let y = (bodyBottom - total) / 2 + inset * .9;
    for (const line of lines) {
      ctx.font = `${line.size}px ${line.font || SANS}`; ctx.fillStyle = line.color || "#fdf8ea";
      const rows: string[] = []; let row = "";
      for (const word of line.text.split(/\s+/)) { if (ctx.measureText(`${row} ${word}`).width > width - inset * 5 && row) { rows.push(row); row = word; } else row += (row ? " " : "") + word; }
      if (row) rows.push(row);
      for (const text of rows.slice(0, 3)) { y += line.size * .65; ctx.fillText(text, width / 2, y, width - inset * 4); y += line.size * .65; }
    }
  });
}
function Plaque({ lines, position, size, pixels }: { lines: PlaqueLine[]; position: Vec3; size: [number, number]; pixels: [number, number] }) {
  const fonts = useFontsReady();
  const texture = useMemo(() => papelPicado(lines, ...pixels), [lines, fonts]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={position}><planeGeometry args={size} /><meshStandardMaterial map={texture} transparent alphaTest={.04} roughness={.75} /></mesh>;
}
// Glass case resting directly on the plinth top, inset from its edges: a faint hazy pane, no frame or cap.
function Vitrine() {
  const w = .56, d = .54, h = .62, cy = 1.4 + h / 2, e = .006;
  const edges: [Vec3, Vec3][] = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) edges.push([[sx * w / 2, cy, sz * d / 2], [e, h, e]]);
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) edges.push([[0, cy + sy * h / 2, sz * d / 2], [w, e, e]]);
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) edges.push([[sx * w / 2, cy + sy * h / 2, 0], [e, e, d]]);
  return <group>
    <mesh position={[0, cy, 0]} renderOrder={2}><boxGeometry args={[w, h, d]} /><meshPhysicalMaterial color="#d9d3c7" transparent opacity={.2} roughness={.2} metalness={0} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    {edges.map(([position, size], i) => <mesh key={i} position={position} raycast={() => null}><boxGeometry args={size} /><meshBasicMaterial color="#ffffff" transparent opacity={.3} depthWrite={false} /></mesh>)}
  </group>;
}
function Plinth({ children }: { children?: ReactNode }) {
  return <>
    <mesh position={[0, .05, 0]} castShadow receiveShadow><boxGeometry args={[.82, .1, .8]} /><meshStandardMaterial color="#c68c54" roughness={.55} /></mesh>
    <mesh position={[0, .75, 0]} castShadow receiveShadow><boxGeometry args={[.64, 1.3, .62]} /><meshStandardMaterial color="#ebddca" emissive="#5a4632" emissiveIntensity={.1} roughness={.92} /></mesh>
    {children}
    <Vitrine />
  </>;
}

function Pedestal({ artwork, index, onSelect, onAdd }: { artwork: Artwork | null; index: number; onSelect: (id: string) => void; onAdd: () => void }) {
  const { position, rotation } = pedestalPositions[index]; const open = () => (artwork ? onSelect(artwork.id) : onAdd());
  const lines = useMemo(() => artwork
    ? [{ text: artwork.title, size: 56 }, { text: `${artwork.petName}, ${artwork.age} años.`, size: 40 }, { text: "Un amor que permanece.", size: 27, color: "#d6dcf2" }]
    : [{ text: "Exhibe aquí su historia", size: 62 }, { text: "Toca para crear su obra", size: 34, color: "#d6dcf2" }], [artwork]);
  return <group position={position} rotation={[0, rotation, 0]} scale={1.15}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .004, 0]} raycast={() => null}><planeGeometry args={[1.9, 1.8]} /><meshBasicMaterial map={shadowBlob()} transparent depthWrite={false} /></mesh>
    <group onClick={e => clicked(e, open)} onPointerOver={pointerOver} onPointerOut={pointerOut}>
      <Plinth><Plaque lines={lines} position={[0, 1.15, .313]} size={[.47, .4]} pixels={[640, 544]} /></Plinth>
      {artwork && <>
        <SceneBoundary fallback={<PhotoFallback {...PET_FRAME} />} key={`pet-${artwork.id}`}><Suspense fallback={<PhotoFallback {...PET_FRAME} />}><Photo url={artwork.petImage} {...PET_FRAME} /></Suspense></SceneBoundary>
        <SceneBoundary fallback={<PhotoFallback {...OBJECT_FRAME} />} key={`object-${artwork.id}`}><Suspense fallback={<PhotoFallback {...OBJECT_FRAME} />}><Photo url={artwork.objectImage} {...OBJECT_FRAME} /></Suspense></SceneBoundary>
      </>}
    </group>
  </group>;
}

let blob: THREE.CanvasTexture | null = null;
function shadowBlob() { return blob ??= radial([[0, "rgba(20,10,0,.55)"], [.55, "rgba(20,10,0,.28)"], [1, "rgba(20,10,0,0)"]], 256); }

function PlaceholderFigure() {
  return <group position={[0, 1.55, 0]} rotation={[0, -.4, .15]}>
    <mesh castShadow><torusKnotGeometry args={[.62, .2, 160, 24, 2, 3]} /><meshStandardMaterial color="#cdb28a" metalness={.05} roughness={.75} /></mesh>
    <mesh position={[0, -.72, 0]} castShadow><cylinderGeometry args={[.15, .22, .5, 32]} /><meshStandardMaterial color="#c2a984" metalness={.05} roughness={.8} /></mesh>
  </group>;
}
function LoadedFigure() {
  const gltf = useGLTF(campaign.centralModel.url!);
  const { object, scale } = useMemo(() => { const object = gltf.scene.clone(true); object.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } }); const box = new THREE.Box3().setFromObject(object); const size = box.getSize(new THREE.Vector3()); return { object, scale: Math.min(campaign.centralModel.height / Math.max(size.y, .01), 2.3 / Math.max(size.x, size.z, .01)) }; }, [gltf]);
  return <group position={[0, .56, 0]} rotation={[0, campaign.centralModel.rotationY, 0]}><Center top><primitive object={object} scale={scale} /></Center></group>;
}
const ModelLoading = PlaceholderFigure, ModelFailed = PlaceholderFigure;

function CentralExhibit({ onSelect }: { onSelect: (id: string) => void }) {
  const lines = useMemo(() => [{ text: "El amor deja huellas", size: 78 }, { text: "Un vínculo que permanece", size: 46, color: "#d6dcf2" }], []);
  const open = () => onSelect(CENTRAL_ID);
  return <group position={HERO.position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .004, 0]} raycast={() => null}><planeGeometry args={[5.4, 4.6]} /><meshBasicMaterial map={shadowBlob()} transparent depthWrite={false} /></mesh>
    <group onClick={e => clicked(e, open)} onPointerOver={pointerOver} onPointerOut={pointerOut}>
      <mesh position={[0, .06, 0]} castShadow receiveShadow><boxGeometry args={[3.5, .12, 2.7]} /><meshStandardMaterial color="#c68c54" roughness={.55} /></mesh>
      <mesh position={[0, .37, 0]} castShadow receiveShadow><boxGeometry args={[3.3, .5, 2.5]} /><meshStandardMaterial color="#e4d7c3" emissive="#5a4632" emissiveIntensity={.1} roughness={.95} /></mesh>
      <mesh position={[0, .625, 0]} receiveShadow><boxGeometry args={[3.36, .02, 2.56]} /><meshStandardMaterial color="#ebe0cd" roughness={.95} /></mesh>
      <Plaque lines={lines} position={[0, .34, 1.256]} size={[1.5, .44]} pixels={[1200, 352]} />
      {campaign.centralModel.url ? <SceneBoundary fallback={<ModelFailed />}><Suspense fallback={<ModelLoading />}><LoadedFigure /></Suspense></SceneBoundary> : <PlaceholderFigure />}
    </group>
    
  </group>;
}

function Spot({ position, target, intensity = 70, angle = .5, penumbra = .8, color = "#ffd9a8" }: { position: Vec3; target: Vec3; intensity?: number; angle?: number; penumbra?: number; color?: string }) {
  const aim = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => { aim.position.set(...target); aim.updateMatrixWorld(); }, [aim, target]);
  return <><primitive object={aim} /><spotLight position={position} target={aim} intensity={intensity} angle={angle} penumbra={penumbra} decay={2} color={color} /></>;
}

function Architecture() {
  const fonts = useFontsReady();
  const floor = useMemo(woodTexture, []);
  const wash = useMemo(() => radial([[0, "rgba(255,218,165,.62)"], [.3, "rgba(255,208,148,.42)"], [.6, "rgba(255,200,130,.13)"], [.85, "rgba(255,192,118,.03)"], [1, "rgba(255,190,115,0)"]], 512, 1), []);
  const heroWash = useMemo(() => radial([[0, "rgba(255,226,170,.22)"], [.45, "rgba(255,216,152,.1)"], [1, "rgba(255,205,135,0)"]], 512), []);
  const sign = useMemo(() => textTexture([{ text: "EL MUSEO", size: 96, color: "#8a6e4f", font: SERIF }, { text: "DE LAS HUELLAS", size: 70, color: "#8a6e4f", font: SERIF }, { text: "LOS OBJETOS QUE CUENTAN SU HISTORIA", size: 20, color: "#a58b6b" }], "#ead8bf", 1024, 400, 110), [fonts]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { floor.dispose(); wash.dispose(); heroWash.dispose(); }, [floor, wash, heroWash]);
  useEffect(() => () => sign.dispose(), [sign]);
  const { halfWidth: hw, front, back, height } = HALL; const length = front - back, cz = (front + back) / 2;
  const wall = <meshStandardMaterial color="#e2c7ad" emissive="#5a3f2a" emissiveIntensity={.2} roughness={1} />;
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, cz]} receiveShadow><planeGeometry args={[hw * 2, length]} /><meshStandardMaterial map={floor} color="#f0d8b2" roughness={.72} metalness={0} /></mesh>
    <mesh position={[0, height, cz]}><boxGeometry args={[hw * 2 + .4, .2, length + .4]} /><meshStandardMaterial color="#f0e2d0" emissive="#b59a80" emissiveIntensity={.6} roughness={1} /></mesh>
    <mesh position={[0, height / 2, back - .1]} receiveShadow><boxGeometry args={[hw * 2 + .4, height, .2]} />{wall}</mesh>
    <mesh position={[0, height / 2, front + .1]}><boxGeometry args={[hw * 2 + .4, height, .2]} />{wall}</mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * (hw + .1), height / 2, cz]} receiveShadow><boxGeometry args={[.2, height, length]} />{wall}</mesh>
      <mesh position={[side * (hw - .04), .08, cz]}><boxGeometry args={[.08, .16, length]} /><meshStandardMaterial color="#c68c54" roughness={.5} /></mesh>
      <mesh position={[side * (hw - .12), height - .08, cz]}><boxGeometry args={[.24, .16, length]} /><meshStandardMaterial color="#d8cbbb" emissive="#6a5d4e" emissiveIntensity={.35} roughness={.9} /></mesh>
      <mesh position={[side * (hw - .3), height - .21, cz]}><boxGeometry args={[.04, .06, length - .4]} /><meshStandardMaterial color="#fff6e6" emissive="#ffe6bf" emissiveIntensity={2.4} toneMapped={false} /></mesh>
      {PEDESTAL_ROWS.map(z => <mesh key={`wash-${z}`} position={[side * (hw - .006), 1.95, z]} rotation={[0, -side * Math.PI / 2, 0]} raycast={() => null}><planeGeometry args={[2.7, 3.7]} /><meshBasicMaterial map={wash} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>)}
    </group>)}
    <mesh position={[0, .12, back + .05]}><boxGeometry args={[hw * 2, .16, .1]} /><meshStandardMaterial color="#c68c54" roughness={.5} /></mesh>
    <mesh position={[0, 3.1, front - .01]} rotation={[0, Math.PI, 0]}><planeGeometry args={[4.2, 1.63]} /><meshStandardMaterial map={sign} roughness={1} /></mesh>
    <mesh position={[0, height - .12, HERO.position[2]]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.9, .045, 12, 96]} /><meshStandardMaterial color="#fff6e6" emissive="#ffe6bf" emissiveIntensity={1.3} toneMapped={false} /></mesh>
    <mesh position={[0, .008, HERO.position[2]]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}><planeGeometry args={[9, 9]} /><meshBasicMaterial map={heroWash} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    {[1, -1].flatMap(side => PEDESTAL_ROWS.map(z => <group key={`${side}-${z}`}>
      <mesh position={[side * 3.1, height - .05, z]}><cylinderGeometry args={[.07, .1, .12, 20]} /><meshStandardMaterial color="#a8927a" roughness={.5} metalness={.4} /></mesh>
      <Spot position={[side * 3.1, height - .3, z]} target={[side * 5.2, 2.3, z]} intensity={105} angle={.62} penumbra={1} />
    </group>))}
    {[4, -4].map(z => <pointLight key={z} position={[0, height - .8, z]} intensity={9} distance={9} decay={2} color="#ffd9aa" />)}
    {BACK_X.map(x => <group key={`back-${x}`}>
      <mesh position={[x, height - .05, BACK_Z + 2.8]}><cylinderGeometry args={[.07, .1, .12, 20]} /><meshStandardMaterial color="#a8927a" roughness={.5} metalness={.4} /></mesh>
      <Spot position={[x, height - .3, BACK_Z + 2.8]} target={[x, 2.3, BACK_Z]} intensity={105} angle={.62} penumbra={1} />
      <mesh position={[x, 1.95, back + .006]} raycast={() => null}><planeGeometry args={[2.4, 3.7]} /><meshBasicMaterial map={wash} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    </group>)}
    <mesh position={[0, height - .05, HERO.position[2] + 3.4]}><cylinderGeometry args={[.09, .12, .12, 20]} /><meshStandardMaterial color="#a8927a" roughness={.5} metalness={.4} /></mesh>
    <Spot position={[0, height - .3, HERO.position[2] + 3.4]} target={[0, 1.4, HERO.position[2]]} intensity={95} angle={.7} penumbra={1} />
    <Spot position={[0, height - .3, HERO.position[2] - 3.4]} target={[0, 1.4, HERO.position[2]]} intensity={45} angle={.7} penumbra={1} />
    
  </group>;
}

function ease(t: number) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const typing = (target: EventTarget | null) => target instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable);

// First-person visitor: arrows/WASD walk and turn, drag looks around, wheel walks, a selection glides the visitor to the exhibit.
function WalkRig({ selection, artworks, roomKey, reducedMotion, input, hotspots, onFirstMove }: { selection: string | null; artworks: Artwork[]; roomKey: number; reducedMotion: boolean; input: MutableRefObject<WalkInput>; hotspots: RefObject<HTMLElement | null>; onFirstMove: () => void }) {
  const { camera, gl, size, invalidate } = useThree();
  const s = useRef({ ...START, vf: 0, vs: 0, vt: 0, bob: 0, offX: 0, offY: 0, room: roomKey, moved: false, tween: null as null | { from: Pose; to: Pose; path: [number, number][]; length: number; t: number; dur: number }, keys: new Set<string>(), drag: null as null | { x: number; y: number } });
  const probe = useMemo(() => new THREE.Vector3(), []);
  const locked = useRef(false); locked.current = !!selection;
  const firstMove = useRef(onFirstMove); firstMove.current = onFirstMove;
  const markMoved = () => { if (!s.current.moved) { s.current.moved = true; firstMove.current(); } };

  useEffect(() => {
    const state = s.current; input.current.wake = invalidate;
    const keyDown = (e: KeyboardEvent) => {
      if (typing(e.target) || locked.current || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) return;
      e.preventDefault(); state.keys.add(key); state.tween = null; invalidate();
    };
    const keyUp = (e: KeyboardEvent) => { state.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); };
    const blur = () => state.keys.clear();
    const down = (e: PointerEvent) => { if (locked.current || e.button > 0) return; state.drag = { x: e.clientX, y: e.clientY }; };
    const move = (e: PointerEvent) => {
      if (!state.drag || locked.current) return;
      const dx = e.clientX - state.drag.x, dy = e.clientY - state.drag.y; state.drag = { x: e.clientX, y: e.clientY };
      if (dx || dy) { state.tween = null; state.yaw -= dx * .0042; state.pitch = clamp(state.pitch - dy * .003, -.6, .45); markMoved(); invalidate(); }
    };
    const up = () => { state.drag = null; };
    const wheel = (e: WheelEvent) => { if (locked.current) return; e.preventDefault(); state.tween = null; const d = clamp(-e.deltaY * .006, -1.4, 1.4); [state.x, state.z] = avoidHero(clamp(state.x - Math.sin(state.yaw) * d, WALK.minX, WALK.maxX), clamp(state.z - Math.cos(state.yaw) * d, WALK.minZ, WALK.maxZ)); markMoved(); invalidate(); };
    window.addEventListener("keydown", keyDown); window.addEventListener("keyup", keyUp); window.addEventListener("blur", blur);
    gl.domElement.addEventListener("pointerdown", down); window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    gl.domElement.addEventListener("wheel", wheel, { passive: false });
    return () => { window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); window.removeEventListener("blur", blur); gl.domElement.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); gl.domElement.removeEventListener("wheel", wheel); };
  }, [gl, input, invalidate]);

  useEffect(() => {
    const state = s.current;
    if (state.room !== roomKey) { state.room = roomKey; Object.assign(state, START, { tween: null }); }
    if (selection) {
      const index = selection === CENTRAL_ID ? -1 : artworks.findIndex(a => a.id === selection);
      const to = selection === CENTRAL_ID ? heroPose() : index >= 0 ? focusPose(index) : null;
      if (to) {
        const from = { x: state.x, z: state.z, yaw: state.yaw, pitch: state.pitch };
        if (reducedMotion) { Object.assign(state, to, { tween: null }); }
        else {
          const path = walkPath(from, to), length = path.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0);
          const yawGap = Math.abs(Math.atan2(Math.sin(to.yaw - from.yaw), Math.cos(to.yaw - from.yaw)));
          state.tween = { from, to, path, length, t: 0, dur: clamp(.9 + (length + yawGap * 2) * .17, 1, 2.8) };
        }
        markMoved();
      }
    }
    invalidate();
  }, [selection, roomKey, artworks, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    const st = s.current; const dt = Math.min(delta, .05); let active = false;
    if (st.tween) {
      const tw = st.tween; tw.t = Math.min(1, tw.t + dt / tw.dur); const k = ease(tw.t);
      let remaining = k * tw.length, point = tw.path[tw.path.length - 1];
      for (let i = 1; i < tw.path.length; i++) { const a = tw.path[i - 1], b = tw.path[i], leg = Math.hypot(b[0] - a[0], b[1] - a[1]); if (remaining <= leg || i === tw.path.length - 1) { const f = leg ? Math.min(1, remaining / leg) : 1; point = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; break; } remaining -= leg; }
      st.x = point[0]; st.z = point[1]; st.pitch = tw.from.pitch + (tw.to.pitch - tw.from.pitch) * k;
      st.yaw = tw.from.yaw + Math.atan2(Math.sin(tw.to.yaw - tw.from.yaw), Math.cos(tw.to.yaw - tw.from.yaw)) * k;
      if (tw.t >= 1) st.tween = null; active = true;
    } else if (!locked.current) {
      const k = st.keys, i = input.current, has = (...names: string[]) => names.some(n => k.has(n)) ? 1 : 0;
      const f = has("ArrowUp", "w") - has("ArrowDown", "s") + i.move, t = has("ArrowLeft") - has("ArrowRight") + i.turn, side = has("d") - has("a");
      const a = 1 - Math.exp(-dt * 9);
      st.vf += (clamp(f, -1, 1) - st.vf) * a; st.vt += (clamp(t, -1, 1) - st.vt) * a; st.vs += (side - st.vs) * a;
      if (Math.abs(st.vf) + Math.abs(st.vt) + Math.abs(st.vs) > .01) {
        const step = 3.6 * dt; st.yaw += st.vt * 1.45 * dt;
        [st.x, st.z] = avoidHero(clamp(st.x - Math.sin(st.yaw) * st.vf * step + Math.cos(st.yaw) * st.vs * step, WALK.minX, WALK.maxX), clamp(st.z - Math.cos(st.yaw) * st.vf * step - Math.sin(st.yaw) * st.vs * step, WALK.minZ, WALK.maxZ));
        st.bob += (Math.abs(st.vf) + Math.abs(st.vs)) * dt * 7.5; markMoved(); active = true;
      }
    }
    const walking = Math.abs(s.current.vf) + Math.abs(s.current.vs) > .05 && !st.tween;
    const lift = walking ? Math.sin(st.bob) * .022 : 0;
    camera.rotation.order = "YXZ"; camera.position.set(st.x, EYE_HEIGHT + lift, st.z); camera.rotation.set(st.pitch, st.yaw, 0);
    // With the detail panel open, shift the projection so the exhibit sits in the free part of the screen.
    const targetX = selection && size.width >= 700 ? 190 : 0, targetY = selection && size.width < 700 ? size.height * .24 : 0;
    st.offX += (targetX - st.offX) * (1 - Math.exp(-dt * 6)); st.offY += (targetY - st.offY) * (1 - Math.exp(-dt * 6));
    if (Math.abs(targetX - st.offX) < .5 && Math.abs(targetY - st.offY) < .5) { st.offX = targetX; st.offY = targetY; } else active = true;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = size.width < 700 ? 70 : 58;
      if (st.offX || st.offY) camera.setViewOffset(size.width, size.height, st.offX, st.offY, size.width, size.height); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
    // Info buttons are plain DOM nodes; pin each one to its exhibit's projected position.
    const layer = hotspots.current;
    if (layer) layer.querySelectorAll<HTMLElement>("[data-hotspot]").forEach(el => {
      const world = hotspotPosition(el.dataset.hotspot!); if (!world) return;
      probe.set(...world); const distance = probe.distanceTo(camera.position); probe.project(camera);
      const visible = probe.z < 1 && Math.abs(probe.x) < 1.08 && Math.abs(probe.y) < 1.08;
      // "+" markers only appear when the visitor is close; info buttons shrink with distance.
      const add = el.classList.contains("hotspot-add");
      const presence = add ? clamp((8 - distance) / 3, 0, 1) : clamp(1.35 - distance / 32, .5, 1), scale = add ? .75 + presence * .25 : clamp(1.2 - distance / 22, .5, 1);
      el.style.visibility = visible && presence > 0 ? "visible" : "hidden"; el.style.opacity = String(presence); el.style.pointerEvents = presence > .25 ? "auto" : "none";
      el.style.transform = `translate3d(${(probe.x + 1) / 2 * size.width}px, ${(1 - probe.y) / 2 * size.height}px, 0) translate(-50%, -50%) scale(${scale})`;
    });
    if (active) invalidate();
  });
  return null;
}

function SceneReady({ onReady }: { onReady: () => void }) { useEffect(() => { onReady(); }, [onReady]); return null; }

export default function MuseumScene({ artworks, selection, roomKey, reducedMotion, input, hotspots, onSelect, onAdd, onFailure, onReady, onFirstMove }: { artworks: Artwork[]; selection: string | null; roomKey: number; reducedMotion: boolean; input: MutableRefObject<WalkInput>; hotspots: RefObject<HTMLElement | null>; onSelect: (id: string) => void; onAdd: () => void; onFailure: () => void; onReady: () => void; onFirstMove: () => void }) {
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  return <Canvas dpr={[1, 1.5]} camera={{ position: [START.x, EYE_HEIGHT, START.z], fov: 58, near: .1, far: 90 }} frameloop="demand" gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }} onCreated={({ gl }) => { gl.setClearColor("#9c7c62"); gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true }); }} fallback={<div className="scene-loading"><p>La vista 3D no está disponible.</p><button onClick={onFailure}>Ver las obras en tarjetas</button></div>}>
    <fog attach="fog" args={["#9c7c62", 14, 40]} />
    <ambientLight intensity={.5} color="#ffd8b0" /><hemisphereLight args={["#ffe0bc", "#a07448", .42]} />
    <Architecture /><CentralExhibit onSelect={onSelect} />
    {pedestalPositions.map((_, index) => <Pedestal key={index} artwork={artworks[index] ?? null} index={index} onSelect={onSelect} onAdd={onAdd} />)}
    <WalkRig artworks={artworks} selection={selection} roomKey={roomKey} reducedMotion={reducedMotion} input={input} hotspots={hotspots} onFirstMove={onFirstMove} /><SceneReady onReady={onReady} />
  </Canvas>;
}
