"use client";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Center, MeshReflectorMaterial, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Artwork } from "@/lib/types";
import { campaign, type CentralModel, type CentralWork } from "@/lib/campaign";
import { CENTRAL_ID, EYE_HEIGHT, HALL, HERO, PEDESTAL_ROWS, ROOM_SIZE, START, WALK, focusPose, heroPose, hotspotPosition, pedestalPositions, BACK_X, BACK_Z, avoidHero, walkPath, type Pose, type Vec3 } from "@/lib/museum-layout";

export interface WalkInput { move: number; turn: number; wake: () => void }

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const SERIF = '"DM Sans Variable", sans-serif';
const SANS = '"DM Sans Variable", sans-serif';
if (campaign.centralModel.url) useGLTF.preload(campaign.centralModel.url);

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
function imageSilhouetteTexture(image: CanvasImageSource, color: string, width = 1408, height = 572) {
  return canvasTexture(width, height, ctx => {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  });
}
function centeredTextTexture(text: string, color: string, width = 1600, height = 220) {
  return canvasTexture(width, height, ctx => {
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `600 76px ${SERIF}`; ctx.fillStyle = color;
    ctx.fillText(text, width / 2, height / 2, width - 40);
  });
}
function polishedStoneTexture() {
  const texture = canvasTexture(1024, 1024, ctx => {
    let seed = 19; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = "#dfe3e2"; ctx.fillRect(0, 0, 1024, 1024);
    // Broad, low-contrast mineral clouds keep the large porcelain slabs from reading as a flat colour.
    for (let i = 0; i < 34; i++) {
      const x = rand() * 1024, y = rand() * 1024, radius = 90 + rand() * 250;
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const pale = rand() > .45;
      cloud.addColorStop(0, pale ? `rgba(255,255,255,${.025 + rand() * .05})` : `rgba(116,128,127,${.012 + rand() * .022})`);
      cloud.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = cloud; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    // Hairline grout and a soft bevel define a large-format polished tile without competing with the mural.
    ctx.fillStyle = "rgba(126,137,136,.28)"; ctx.fillRect(0, 0, 4, 1024); ctx.fillRect(0, 0, 1024, 4);
    ctx.fillStyle = "rgba(255,255,255,.42)"; ctx.fillRect(4, 4, 3, 1017); ctx.fillRect(4, 4, 1017, 3);
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(HALL.halfWidth * 2 / 3.2, (HALL.front - HALL.back) / 3.2); return texture;
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

type PlaqueLine = { text: string; size: number; color?: string; weight?: number; italic?: boolean };
// Blue "papel picado" tag: scalloped lower edge, punched dots and corner flowers, text on top.
function papelPicado(lines: PlaqueLine[], width: number, height: number, tone: "blue" | "pink" = "blue") {
  return canvasTexture(width, height, ctx => {
    const r = height * .04, scallop = height * .055, bodyBottom = height - scallop;
    ctx.clearRect(0, 0, width, height);
    const fill = ctx.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, tone === "pink" ? "#ff3f82" : "#132b6e");
    fill.addColorStop(1, tone === "pink" ? "#d92164" : "#0d1f52");
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(width - r, 0); ctx.quadraticCurveTo(width, 0, width, r); ctx.lineTo(width, bodyBottom);
    const count = Math.round(width / (scallop * 2.1)), step = width / count;
    for (let k = count - 1; k >= 0; k--) ctx.arc(k * step + step / 2, bodyBottom, step / 2, 0, Math.PI, false);
    ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    const dot = height * .011, inset = height * .05;
    for (let x = width * .3; x <= width * .7; x += dot * 5.4) { ctx.beginPath(); ctx.arc(x, inset * .75, dot, 0, 7); ctx.fill(); }
    for (let y = inset * 3; y < bodyBottom - inset * 1.4; y += dot * 5.4) for (const x of [inset * .62, width - inset * .62]) { ctx.beginPath(); ctx.arc(x, y, dot, 0, 7); ctx.fill(); }
    for (let k = 0; k < count; k++) { ctx.beginPath(); ctx.arc(k * step + step / 2, bodyBottom - inset * .5, dot * 1.25, 0, 7); ctx.fill(); }
    // Teardrop petals fanning from each top corner.
    for (const [cx, dir] of [[inset * .55, 1], [width - inset * .55, -1]] as const) for (const angle of [.12, .62, 1.12]) {
      ctx.save(); ctx.translate(cx, inset * .55); ctx.rotate(dir > 0 ? angle : Math.PI - angle); ctx.beginPath();
      const len = inset * 2.1, wid = inset * .42; ctx.moveTo(inset * .35, 0); ctx.quadraticCurveTo(len * .55, -wid, len, 0); ctx.quadraticCurveTo(len * .55, wid, inset * .35, 0); ctx.fill(); ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const font = (l: PlaqueLine) => `${l.italic ? "italic " : ""}${l.weight ?? 500} ${l.size}px ${SANS}`;
    const maxWidth = width - inset * 4.4;
    const blocks = lines.map(line => {
      ctx.font = font(line); const rows: string[] = []; let row = "";
      for (const word of line.text.split(/\s+/)) { if (ctx.measureText(`${row} ${word}`).width > maxWidth && row) { rows.push(row); row = word; } else row += (row ? " " : "") + word; }
      if (row) rows.push(row); return { line, rows: rows.slice(0, 2) };
    });
    const gap = height * .035, lineHeight = (l: PlaqueLine) => l.size * 1.12;
    const total = blocks.reduce((sum, b) => sum + b.rows.length * lineHeight(b.line), 0) + gap * (blocks.length - 1);
    let y = inset * 1.6 + (bodyBottom - inset * 2.8 - total) / 2;
    ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1;
    for (const { line, rows } of blocks) {
      ctx.font = font(line); ctx.fillStyle = line.color || "#fbf7ee";
      for (const text of rows) { ctx.fillText(text, width / 2, y + lineHeight(line) / 2, maxWidth); y += lineHeight(line); }
      y += gap;
    }
  });
}
function Plaque({ lines, position, size, pixels, focused = false, tone = "blue" }: { lines: PlaqueLine[]; position: Vec3; size: [number, number]; pixels: [number, number]; focused?: boolean; tone?: "blue" | "pink" }) {
  const fonts = useFontsReady();
  const texture = useMemo(() => papelPicado(lines, ...pixels, tone), [lines, fonts, tone]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => texture.dispose(), [texture]);
  // A little self-illumination keeps the lettering readable where the spotlight falls off.
  return <mesh position={position}><planeGeometry args={size} /><meshStandardMaterial map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={focused ? .4 : .2} transparent alphaTest={.04} roughness={.85} /></mesh>;
}
// Soft vertical falloff (top → bottom) multiplied into a surface's colour: a cheap stand-in for bounce light and contact shadow.
const gradients = new Map<string, THREE.CanvasTexture>();
function verticalGradient(stops: [number, string][]) {
  const key = JSON.stringify(stops); let texture = gradients.get(key);
  if (!texture) { texture = canvasTexture(4, 256, ctx => { const g = ctx.createLinearGradient(0, 0, 0, 256); stops.forEach(([at, color]) => g.addColorStop(at, color)); ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256); }); gradients.set(key, texture); }
  return texture;
}
const PLINTH_SHADE: [number, string][] = [[0, "#ffffff"], [.5, "#f2efe9"], [.9, "#d9d3c9"], [1, "#bdb4a8"]];
const WALL_SHADE: [number, string][] = [[0, "#dededb"], [.16, "#f5f5f2"], [.52, "#ffffff"], [.9, "#f4f4f1"], [1, "#d8d8d4"]];

// A small cempasúchil (marigold): orange petal clusters on a short stem, a Día de Muertos touch beside the frames.
function Cempasuchil({ position }: { position: Vec3 }) {
  const petals = useMemo(() => Array.from({ length: 14 }, (_, i) => { const a = i * 2.4, r = .018 + (i % 3) * .009; return [Math.cos(a) * r, .012 + (i % 4) * .006, Math.sin(a) * r] as Vec3; }), []);
  return <group position={position} raycast={() => null}>
    {petals.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[.017, 10, 8]} /><meshStandardMaterial color={i % 2 ? "#e2781f" : "#f0952e"} roughness={.9} /></mesh>)}
    <mesh position={[0, .03, 0]}><sphereGeometry args={[.02, 10, 8]} /><meshStandardMaterial color="#d8661a" roughness={.9} /></mesh>
    <mesh position={[.04, .006, .02]} rotation={[0, .6, 1.3]}><capsuleGeometry args={[.006, .05, 3, 6]} /><meshStandardMaterial color="#5f7a3a" roughness={.9} /></mesh>
  </group>;
}
// Glass case resting directly on the plinth top, inset from its edges: a faint hazy pane, no frame or cap.
function Vitrine() {
  const w = .56, d = .54, h = .62, cy = 1.4 + h / 2, e = .006;
  const edges: [Vec3, Vec3][] = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) edges.push([[sx * w / 2, cy, sz * d / 2], [e, h, e]]);
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) edges.push([[0, cy + sy * h / 2, sz * d / 2], [w, e, e]]);
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) edges.push([[sx * w / 2, cy + sy * h / 2, 0], [e, e, d]]);
  return <group>
    <mesh position={[0, cy, 0]} renderOrder={2}><boxGeometry args={[w, h, d]} /><meshPhysicalMaterial color="#e8f0f1" transparent opacity={.13} roughness={.12} metalness={0} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    {edges.map(([position, size], i) => <mesh key={i} position={position} raycast={() => null}><boxGeometry args={size} /><meshBasicMaterial color="#f6f8f7" transparent opacity={.2} depthWrite={false} /></mesh>)}
  </group>;
}
function Plinth({ children }: { children?: ReactNode }) {
  return <>
    <mesh position={[0, .05, 0]} castShadow receiveShadow><boxGeometry args={[.82, .1, .8]} /><meshStandardMaterial color="#9d7651" roughness={.78} /></mesh>
    <mesh position={[0, .75, 0]} castShadow receiveShadow><boxGeometry args={[.64, 1.3, .62]} /><meshStandardMaterial map={verticalGradient(PLINTH_SHADE)} color="#f1eee8" roughness={1} /></mesh>
    {children}
    <Vitrine />
  </>;
}

// The plaque's third line: the story's first sentence when it is short, otherwise a gentle default.
function plaqueNote(description: string) { const first = description.split(/(?<=[.!?…])\s/)[0]?.trim() ?? ""; return first && first.length <= 52 ? first : "Un amor que permanece."; }

function Pedestal({ artwork, index, selected, onSelect, onAdd }: { artwork: Artwork | null; index: number; selected: boolean; onSelect: (id: string) => void; onAdd: () => void }) {
  const { position, rotation } = pedestalPositions[index]; const open = () => (artwork ? onSelect(artwork.id) : onAdd());
  const lines = useMemo(() => artwork
    ? [{ text: artwork.title, size: 98, weight: 600 }, { text: `${artwork.petName}, ${artwork.age} años.`, size: 70, weight: 600 }, { text: plaqueNote(artwork.description), size: 50, weight: 400, italic: true, color: "#dfe5f7" }]
    : [{ text: "Exhibe aquí su historia", size: 92, weight: 600 }, { text: "Toca para crear su obra", size: 54, weight: 400, italic: true, color: "#dfe5f7" }], [artwork]);
  return <group position={position} rotation={[0, rotation, 0]} scale={1.15}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .004, 0]} raycast={() => null}><planeGeometry args={[1.9, 1.8]} /><meshBasicMaterial map={shadowBlob()} transparent depthWrite={false} /></mesh>
    <group onClick={e => clicked(e, open)} onPointerOver={pointerOver} onPointerOut={pointerOut}>
      <Plinth><Plaque lines={lines} position={[0, 1.15, .313]} size={[.47, .4]} pixels={[1024, 872]} focused={selected} tone="pink" /></Plinth>
      {artwork && <>
        <SceneBoundary fallback={<PhotoFallback {...PET_FRAME} />} key={`pet-${artwork.id}`}><Suspense fallback={<PhotoFallback {...PET_FRAME} />}><Photo url={artwork.petImage} {...PET_FRAME} /></Suspense></SceneBoundary>
        <Cempasuchil position={[-.235, 1.4, .19]} />
        <SceneBoundary fallback={<PhotoFallback {...OBJECT_FRAME} />} key={`object-${artwork.id}`}><Suspense fallback={<PhotoFallback {...OBJECT_FRAME} />}><Photo url={artwork.objectImage} {...OBJECT_FRAME} /></Suspense></SceneBoundary>
      </>}
    </group>
  </group>;
}

let blob: THREE.CanvasTexture | null = null;
function shadowBlob() { return blob ??= radial([[0, "rgba(25,12,2,.62)"], [.35, "rgba(25,12,2,.38)"], [.7, "rgba(25,12,2,.12)"], [1, "rgba(25,12,2,0)"]], 256); }
let contactBlob: THREE.CanvasTexture | null = null;
function contactShadowBlob() { return contactBlob ??= radial([[0, "rgba(45,29,18,.58)"], [.28, "rgba(45,29,18,.42)"], [.68, "rgba(45,29,18,.14)"], [1, "rgba(45,29,18,0)"]], 384, .53); }

function LoadedFigure({ model, onReady }: { model: CentralModel; onReady: () => void }) {
  const gltf = useGLTF(model.url);
  const { object, scale } = useMemo(() => {
    const object = gltf.scene.clone(true);
    object.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = false;
      child.receiveShadow = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const copies = materials.map(material => {
        const copy = material.clone();
        if (copy instanceof THREE.MeshStandardMaterial) {
          if (!model.preserveMaterials) {
            copy.metalness = 0;
            copy.roughness = Math.max(copy.roughness, .72);
            copy.envMapIntensity = .45;
          }
        }
        return copy;
      });
      child.material = Array.isArray(child.material) ? copies : copies[0];
    });
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    return { object, scale: Math.min(model.height / Math.max(size.y, .01), model.maxFootprint / Math.max(size.x, size.z, .01)) };
  }, [gltf, model.height, model.maxFootprint, model.preserveMaterials]);
  useEffect(() => { onReady(); }, [object, onReady]);
  return <group position={[0, .846, 0]} rotation={[0, model.rotationY, 0]}><Center top><primitive object={object} scale={scale} /></Center></group>;
}
function ModelLoadFailure({ onFailure }: { onFailure: () => void }) { useEffect(() => { onFailure(); }, [onFailure]); return null; }

function CentralExhibit({ model, work, interactive, selected, onSelect, onModelReady, onModelFailure }: { model: CentralModel | null; work: CentralWork | null; interactive: boolean; selected: boolean; onSelect: (id: string) => void; onModelReady: () => void; onModelFailure: () => void }) {
  const lines = useMemo(() => work ? [{ text: work.title, size: 62, weight: 600 }, { text: work.productName, size: 50, weight: 600 }, { text: "Toca para conocer más", size: 38, weight: 400, italic: true, color: "#d6dcf2" }] : [], [work]);
  const open = () => onSelect(CENTRAL_ID);
  return <group position={HERO.position}>
    {model?.preserveMaterials && <>
      <Spot position={[-2.4, 4.8, 2.8]} target={[0, 2.35, 0]} intensity={58} angle={.52} penumbra={.9} color="#eef5ff" />
      <Spot position={[2.2, 4.2, -2.1]} target={[0, 2.2, 0]} intensity={32} angle={.56} penumbra={.94} color="#f8fbff" />
    </>}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .004, 0]} raycast={() => null}><planeGeometry args={[7.4, 6.5]} /><meshBasicMaterial map={shadowBlob()} transparent depthWrite={false} /></mesh>
    <group onClick={interactive ? e => clicked(e, open) : undefined} onPointerOver={interactive ? pointerOver : undefined} onPointerOut={interactive ? pointerOut : undefined}>
      <mesh position={[0, .07, 0]} castShadow receiveShadow><boxGeometry args={[5.35, .14, 4.75]} /><meshStandardMaterial color="#98714d" roughness={.8} /></mesh>
      <mesh position={[0, .47, 0]} castShadow receiveShadow><boxGeometry args={[5.02, .68, 4.42]} /><meshStandardMaterial map={verticalGradient(PLINTH_SHADE)} color="#ebe7df" roughness={1} /></mesh>
      <mesh position={[0, .825, 0]} receiveShadow><boxGeometry args={[5.1, .03, 4.5]} /><meshStandardMaterial color="#f1eee7" roughness={1} /></mesh>
      {model && <>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .844, .02]} raycast={() => null} renderOrder={1}><planeGeometry args={[4.55, 3.4]} /><meshBasicMaterial map={contactShadowBlob()} transparent opacity={.72} depthWrite={false} /></mesh>
        {interactive && <Plaque lines={lines} position={[0, .46, 2.216]} size={[2.05, .56]} pixels={[1200, 352]} focused={selected} />}
        <SceneBoundary key={model.url} fallback={<ModelLoadFailure onFailure={onModelFailure} />}><Suspense fallback={null}><LoadedFigure model={model} onReady={onModelReady} /></Suspense></SceneBoundary>
      </>}
    </group>
    
  </group>;
}

function Spot({ position, target, intensity = 46, angle = .54, penumbra = .9, color = "#ffe4c2", shadows = false }: { position: Vec3; target: Vec3; intensity?: number; angle?: number; penumbra?: number; color?: string; shadows?: boolean }) {
  const aim = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => { aim.position.set(...target); aim.updateMatrixWorld(); }, [aim, target]);
  return <><primitive object={aim} /><spotLight position={position} target={aim} intensity={intensity} angle={angle} penumbra={penumbra} decay={2} color={color} castShadow={shadows} shadow-mapSize-width={512} shadow-mapSize-height={512} shadow-bias={-.00035} shadow-normalBias={.025} shadow-radius={4} shadow-camera-near={.3} shadow-camera-far={12} /></>;
}

function CeilingFixture({ position, glow }: { position: Vec3; glow: THREE.Texture }) {
  return <group position={position}>
    <mesh position={[0, -.016, 0]} raycast={() => null}>
      <cylinderGeometry args={[.19, .19, .032, 32]} />
      <meshStandardMaterial color="#e8eae7" roughness={.38} metalness={.08} />
    </mesh>
    <mesh position={[0, -.033, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null} renderOrder={2}>
      <circleGeometry args={[.145, 32]} />
      <meshBasicMaterial color="#fff3d7" toneMapped={false} />
    </mesh>
    <mesh position={[0, -.038, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null} renderOrder={1}>
      <circleGeometry args={[.38, 32]} />
      <meshBasicMaterial map={glow} color="#fff1cd" transparent opacity={.42} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>;
}

function Architecture() {
  const fonts = useFontsReady();
  const floor = useMemo(polishedStoneTexture, []);
  const ceilingGlow = useMemo(() => radial([[0, "rgba(255,246,220,.75)"], [.34, "rgba(255,241,204,.24)"], [1, "rgba(255,241,204,0)"]]), []);
  const logoSource = useTexture("/home/Grupo%202.svg");
  const muralSource = useTexture("/images/mural-bbf-galeria.webp");
  const sign = useMemo(() => imageSilhouetteTexture(logoSource.image as CanvasImageSource, "#003568"), [logoSource]);
  const [muralLeft, muralFront, muralRight] = useMemo(() => [
    { offset: 0, width: .3766 },
    { offset: .3766, width: .2468 },
    { offset: .6234, width: .3766 },
  ].map(({ offset, width }) => {
    const texture = muralSource.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(width, 1);
    texture.offset.set(offset, 0);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }) as [THREE.Texture, THREE.Texture, THREE.Texture], [muralSource]);
  const tagline = useMemo(() => centeredTextTexture("Donde el amor que no termina se convierte en arte.", "#003568"), [fonts]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { floor.dispose(); ceilingGlow.dispose(); }, [floor, ceilingGlow]);
  useEffect(() => () => { sign.dispose(); tagline.dispose(); muralLeft.dispose(); muralFront.dispose(); muralRight.dispose(); }, [sign, tagline, muralLeft, muralFront, muralRight]);
  const { halfWidth: hw, front, back, height } = HALL; const length = front - back, cz = (front + back) / 2;
  const wall = <meshStandardMaterial map={verticalGradient(WALL_SHADE)} color="#ffffff" roughness={1} metalness={0} />;
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, cz]} receiveShadow><planeGeometry args={[hw * 2, length]} />
      {/* Polished porcelain: cool-neutral mineral variation with a restrained museum-floor reflection. */}
      <MeshReflectorMaterial map={floor} color="#f3f5f4" roughness={.34} metalness={0} blur={[360, 100]} resolution={384} mixBlur={.75} mixStrength={.46} mirror={.28} depthScale={.3} minDepthThreshold={.25} maxDepthThreshold={1.15} />
    </mesh>
    <mesh position={[0, height, cz]} receiveShadow><boxGeometry args={[hw * 2 + .4, .2, length + .4]} /><meshStandardMaterial color="#f2f2ef" roughness={1} /></mesh>
    {[-2.1, 2.1].flatMap(x => [-6.6, -4.4, -2.2, 0, 2.2, 4.4, 6.6].map(z => <CeilingFixture key={`${x}-${z}`} position={[x, height - .105, z]} glow={ceilingGlow} />))}
    <mesh position={[0, height / 2, back - .1]} receiveShadow><boxGeometry args={[hw * 2 + .4, height, .2]} />{wall}</mesh>
    <mesh position={[0, height / 2, back + .006]} receiveShadow>
      <planeGeometry args={[hw * 2, height]} />
      <meshStandardMaterial map={muralFront} roughness={1} metalness={0} />
    </mesh>
    <mesh position={[0, height / 2, front + .1]} receiveShadow><boxGeometry args={[hw * 2 + .4, height, .2]} />{wall}</mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * (hw + .1), height / 2, cz]} receiveShadow><boxGeometry args={[.2, height, length]} />{wall}</mesh>
      <mesh position={[side * (hw - .006), height / 2, cz]} rotation={[0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial map={side < 0 ? muralLeft : muralRight} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[side * (hw - .04), .08, cz]}><boxGeometry args={[.08, .16, length]} /><meshStandardMaterial color="#c8cecc" roughness={.58} /></mesh>
      <mesh position={[side * (hw - .12), height - .08, cz]}><boxGeometry args={[.24, .16, length]} /><meshStandardMaterial color="#e4e5e2" roughness={1} /></mesh>
    </group>)}
    <mesh position={[0, .12, back + .05]}><boxGeometry args={[hw * 2, .16, .1]} /><meshStandardMaterial color="#c8cecc" roughness={.58} /></mesh>
    <group position={[0, 0, front - .01]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 3.85, 0]}><planeGeometry args={[4.35, 1.77]} /><meshBasicMaterial map={sign} transparent opacity={.92} alphaTest={.02} depthWrite={false} /></mesh>
      <mesh position={[0, 2.72, 0]}><planeGeometry args={[4.8, .66]} /><meshBasicMaterial map={tagline} transparent opacity={.82} alphaTest={.02} depthWrite={false} /></mesh>
    </group>
    {[1, -1].flatMap(side => PEDESTAL_ROWS.map(z => <group key={`${side}-${z}`}>
      <Spot position={[side * 4.05, height - .24, z + .18]} target={[side * 5.2, 1.7, z]} intensity={42 + ((Math.abs(z) * 7) % 5)} angle={.52} penumbra={.94} />
    </group>))}
    {BACK_X.map(x => <group key={`back-${x}`}>
      <Spot position={[x, height - .24, BACK_Z + 2.15]} target={[x, 1.7, BACK_Z]} intensity={40 + (Math.abs(x) % 2) * 2} angle={.5} penumbra={.94} />
    </group>)}
    <Spot position={[-1.65, height - .28, HERO.position[2] + 2.7]} target={[0, 1.35, HERO.position[2]]} intensity={52} angle={.62} penumbra={.92} shadows />
    <Spot position={[1.45, height - .28, HERO.position[2] - 2.4]} target={[0, 1.45, HERO.position[2]]} intensity={30} angle={.58} penumbra={.94} />
    <Spot position={[0, height - .3, front - 2.5]} target={[0, 3.25, front - .08]} intensity={20} angle={.64} penumbra={.96} shadows={false} />
    
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
    if (layer) {
      const elements = Array.from(layer.querySelectorAll<HTMLElement>("[data-hotspot]"));
      let nearestHotspot: HTMLElement | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      elements.forEach(el => {
        const world = hotspotPosition(el.dataset.hotspot!); if (!world) return;
        probe.set(...world); const distance = probe.distanceTo(camera.position); probe.project(camera);
        const visible = probe.z < 1 && Math.abs(probe.x) < 1.08 && Math.abs(probe.y) < 1.08;
        // "+" markers only appear when the visitor is close; info buttons shrink with distance.
        const add = el.classList.contains("hotspot-add");
        const presence = add ? clamp((8 - distance) / 3, 0, 1) : clamp(1.35 - distance / 32, .5, 1), scale = add ? .75 + presence * .25 : clamp(1.2 - distance / 22, .5, 1);
        el.style.visibility = visible && presence > 0 ? "visible" : "hidden"; el.style.opacity = String(presence); el.style.pointerEvents = presence > .25 ? "auto" : "none";
        el.style.transform = `translate3d(${(probe.x + 1) / 2 * size.width}px, ${(1 - probe.y) / 2 * size.height}px, 0) translate(-50%, -50%) scale(${scale})`;

        if (!add && visible && presence > .25 && distance < 5.4 && distance < nearestDistance) {
          nearestHotspot = el;
          nearestDistance = distance;
        }
      });

      elements.forEach(el => el.classList.toggle("hotspot-near", el === nearestHotspot));
    }
    if (active) invalidate();
  });
  return null;
}

export default function MuseumScene({ artworks, selection, roomKey, centralModel, centralWork, centralInteractive, reducedMotion, input, hotspots, onSelect, onAdd, onFailure, onReady, onFirstMove }: { artworks: Artwork[]; selection: string | null; roomKey: number; centralModel: CentralModel | null; centralWork: CentralWork | null; centralInteractive: boolean; reducedMotion: boolean; input: MutableRefObject<WalkInput>; hotspots: RefObject<HTMLElement | null>; onSelect: (id: string) => void; onAdd: () => void; onFailure: () => void; onReady: () => void; onFirstMove: () => void }) {
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  // Unmounting the Canvas (e.g. switching to the card view) makes three.js force a context loss; only a loss while mounted is a real failure.
  const detachLoss = useRef<(() => void) | null>(null);
  useEffect(() => () => { detachLoss.current?.(); detachLoss.current = null; }, []);
  return <Canvas shadows={{ type: THREE.PCFSoftShadowMap }} dpr={[1, 1.25]} camera={{ position: [START.x, EYE_HEIGHT, START.z], fov: 56, near: .1, far: 90 }} frameloop="demand" gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12, outputColorSpace: THREE.SRGBColorSpace }} onCreated={({ gl }) => { gl.setClearColor("#c9c8c3"); gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.outputColorSpace = THREE.SRGBColorSpace; const canvas = gl.domElement; detachLoss.current?.(); const handleLoss = () => window.setTimeout(() => { if (canvas.isConnected) onFailure(); }, 0); canvas.addEventListener("webglcontextlost", handleLoss, { once: true }); detachLoss.current = () => canvas.removeEventListener("webglcontextlost", handleLoss); }} fallback={<div className="scene-loading"><p>La vista 3D no está disponible.</p><button onClick={onFailure}>Ver las obras en tarjetas</button></div>}>
    <fog attach="fog" args={["#c9c8c3", 20, 46]} />
    <ambientLight intensity={.4} color="#fff4e8" /><hemisphereLight args={["#fffdf8", "#9a948d", .46]} />
    <Architecture /><CentralExhibit model={centralModel} work={centralWork} interactive={centralInteractive} selected={selection === CENTRAL_ID} onSelect={onSelect} onModelReady={onReady} onModelFailure={onFailure} />
    {pedestalPositions.slice(0, ROOM_SIZE).map((_, index) => <Pedestal key={index} artwork={artworks[index] ?? null} index={index} selected={!!artworks[index] && selection === artworks[index].id} onSelect={onSelect} onAdd={onAdd} />)}
    <WalkRig artworks={artworks} selection={selection} roomKey={roomKey} reducedMotion={reducedMotion} input={input} hotspots={hotspots} onFirstMove={onFirstMove} />
  </Canvas>;
}
