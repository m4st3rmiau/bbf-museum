"use client";
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Center, Html, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Artwork, FocusTarget, Selection } from "@/lib/types";
import { campaign } from "@/lib/campaign";
import { aisleRoute, focusPose, pedestalPositions, tourStops, type Vec3 } from "@/lib/museum-layout";

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function textTexture(lines: { text: string; size: number; color?: string; font?: string }[], background: string, width = 1024, height = 640) {
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d")!; ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#a7ac9650"; ctx.lineWidth = 3; ctx.strokeRect(17, 17, width - 34, height - 34);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  let y = 65;
  for (const line of lines) {
    ctx.font = `${line.size}px ${line.font || '"DM Sans Variable", sans-serif'}`; ctx.fillStyle = line.color || "#fcf7e9";
    const words = line.text.split(/\s+/); let row = ""; const rows: string[] = [];
    for (const word of words) { if (ctx.measureText(`${row} ${word}`).width > width - 100 && row) { rows.push(row); row = word; } else row += (row ? " " : "") + word; }
    if (row) rows.push(row);
    for (const rowText of rows.slice(0, 3)) { ctx.fillText(rowText, width / 2, y, width - 90); y += line.size * 1.22; }
    y += 24;
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

function Plaque({ art, onSelect }: { art: Artwork; onSelect: (target: FocusTarget) => void }) {
  const texture = useMemo(() => textTexture([
    { text: `EN MEMORIA DE ${art.petName.toLocaleUpperCase("es")}`, size: 25, color: "#d3c9b1" },
    { text: art.title, size: 74, font: '"Cormorant Garamond Variable", Georgia, serif' },
    { text: `${art.age} años de amor incondicional`, size: 27 },
    { text: art.description.length > 115 ? `${art.description.slice(0, 112)}…` : art.description, size: 26, color: "#cfdbd2" },
  ], "#203e4b"), [art]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, 1.06, .691]} onClick={e => { e.stopPropagation(); onSelect("plaque"); }} onPointerOver={pointerOver} onPointerOut={pointerOut} name={`plaque-${art.id}`}><planeGeometry args={[1.07, .67]} /><meshStandardMaterial map={texture} roughness={.75} /></mesh>;
}
function pointerOver(e: ThreeEvent<PointerEvent>) { e.stopPropagation(); document.body.style.cursor = "pointer"; }
function pointerOut() { document.body.style.cursor = ""; }

function Photo({ url, x, target, onSelect }: { url: string; x: number; target: FocusTarget; onSelect: (target: FocusTarget) => void }) {
  const source = useTexture(url); const texture = useMemo(() => { const clone = source.clone(); clone.colorSpace = THREE.SRGBColorSpace; clone.anisotropy = 4; clone.needsUpdate = true; return clone; }, [source]);
  useEffect(() => () => texture.dispose(), [texture]);
  const image = texture.image as HTMLImageElement; const ratio = image.width / image.height; const maxWidth = .71, maxHeight = 1.01;
  const width = Math.min(maxWidth, maxHeight * ratio), height = width / ratio;
  return <group position={[x, 2.41, .1]} onClick={e => { e.stopPropagation(); onSelect(target); }} onPointerOver={pointerOver} onPointerOut={pointerOut}>
    <mesh castShadow><boxGeometry args={[.79, 1.11, .05]} /><meshStandardMaterial color="#eee6d3" roughness={.7} /></mesh>
    <mesh position={[0, 0, .03]}><planeGeometry args={[.73, 1.05]} /><meshStandardMaterial color="#fffdf5" roughness={.8} /></mesh>
    <mesh position={[0, 0, .033]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <mesh position={[0, -.57, 0]}><boxGeometry args={[.36, .05, .28]} /><meshStandardMaterial color="#b9a685" /></mesh>
  </group>;
}

function PhotoFallback({ x }: { x: number }) { return <mesh position={[x, 2.41, .1]}><boxGeometry args={[.79, 1.11, .05]} /><meshStandardMaterial color="#d6cbb8" /></mesh>; }
function Pedestal({ artwork, index, onSelect }: { artwork: Artwork; index: number; onSelect: (id: string, target: FocusTarget) => void }) {
  const { position, rotation } = pedestalPositions[index]; const choose = (target: FocusTarget) => onSelect(artwork.id, target);
  return <group position={position} rotation={[0, rotation, 0]}>
    <group onClick={e => { e.stopPropagation(); choose("pedestal"); }} onPointerOver={pointerOver} onPointerOut={pointerOut}>
      <mesh position={[0, .065, 0]} receiveShadow castShadow><boxGeometry args={[2.06, .13, 1.5]} /><meshStandardMaterial color="#b39774" roughness={.8} /></mesh>
      <mesh position={[0, .99, 0]} castShadow receiveShadow><boxGeometry args={[1.85, 1.85, 1.35]} /><meshStandardMaterial color="#f5f1e5" roughness={.82} /></mesh>
      <mesh position={[0, 1.94, 0]} receiveShadow><boxGeometry args={[1.93, .06, 1.43]} /><meshStandardMaterial color="#fffcf3" /></mesh>
    </group>
    <Plaque art={artwork} onSelect={choose} />
    <SceneBoundary fallback={<PhotoFallback x={-.43} />} key={`pet-${artwork.id}`}><Suspense fallback={<PhotoFallback x={-.43} />}><Photo url={artwork.petImage} x={-.43} target="pet" onSelect={choose} /></Suspense></SceneBoundary>
    <SceneBoundary fallback={<PhotoFallback x={.43} />} key={`object-${artwork.id}`}><Suspense fallback={<PhotoFallback x={.43} />}><Photo url={artwork.objectImage} x={.43} target="object" onSelect={choose} /></Suspense></SceneBoundary>
    <mesh position={[0, 2.62, 0]} raycast={() => null} renderOrder={2}><boxGeometry args={[1.91, 1.34, 1.4]} /><meshPhysicalMaterial color="#e8f2ed" transparent opacity={.065} roughness={.08} metalness={.1} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    {[-.96, .96].flatMap(x => [-.71, .71].map(z => <mesh key={`${x}-${z}`} position={[x, 2.62, z]} raycast={() => null}><boxGeometry args={[.014, 1.34, .014]} /><meshStandardMaterial color="#e4e9de" transparent opacity={.65} /></mesh>))}
    <mesh position={[0, 3.29, 0]} raycast={() => null}><boxGeometry args={[1.94, .022, 1.44]} /><meshStandardMaterial color="#e1e6da" transparent opacity={.28} /></mesh>
  </group>;
}

function PlaceholderFigure() {
  return <group position={[0, 1.93, -.7]} rotation={[0, -.4, .15]}>
    <mesh castShadow><torusKnotGeometry args={[.75, .23, 160, 24, 2, 3]} /><meshStandardMaterial color="#d1b992" metalness={.32} roughness={.4} /></mesh>
    <mesh position={[0, -.78, 0]} castShadow><cylinderGeometry args={[.17, .25, .65, 32]} /><meshStandardMaterial color="#c5ae8d" metalness={.25} roughness={.5} /></mesh>
  </group>;
}
function LoadedFigure() {
  const gltf = useGLTF(campaign.centralModel.url!);
  const { object, scale } = useMemo(() => { const object = gltf.scene.clone(true); object.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; } }); const box = new THREE.Box3().setFromObject(object); const size = box.getSize(new THREE.Vector3()); return { object, scale: Math.min(campaign.centralModel.height / Math.max(size.y, .01), 2.6 / Math.max(size.x, size.z, .01)) }; }, [gltf]);
  return <group position={[0, .6, -.7]} rotation={[0, campaign.centralModel.rotationY, 0]}><Center top><primitive object={object} scale={scale} /></Center></group>;
}
function ModelLoading() { return <><PlaceholderFigure /><Html center position={[0, 3.3, -.7]}><span className="image-tag" role="status">Cargando figura…</span></Html></>; }
function ModelFailed() { return <><PlaceholderFigure /><Html center position={[0, 3.3, -.7]}><span className="image-tag" role="status">Figura provisional · modelo no disponible</span></Html></>; }
function CentralExhibit() {
  const texture = useMemo(() => textTexture([{ text: "EL AMOR DEJA HUELLAS", size: 39, color: "#f1e6cf" }, { text: "Un vínculo que permanece", size: 45, font: '"Cormorant Garamond Variable", Georgia, serif' }], "#29424c", 900, 240), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group>
    <mesh position={[0, .1, -.7]} receiveShadow><cylinderGeometry args={[1.62, 1.72, .2, 80]} /><meshStandardMaterial color="#b49a75" roughness={.8} /></mesh>
    <mesh position={[0, .4, -.7]} receiveShadow castShadow><cylinderGeometry args={[1.48, 1.48, .48, 80]} /><meshStandardMaterial color="#e6decd" roughness={.7} /></mesh>
    <mesh position={[0, .44, .786]}><planeGeometry args={[1.02, .272]} /><meshStandardMaterial map={texture} /></mesh>
    {campaign.centralModel.url ? <SceneBoundary fallback={<ModelFailed />}><Suspense fallback={<ModelLoading />}><LoadedFigure /></Suspense></SceneBoundary> : <PlaceholderFigure />}
  </group>;
}

function Architecture() {
  const wallTexture = useMemo(() => textTexture([{ text: "EL MUSEO", size: 88, color: "#6d766a", font: '"Cormorant Garamond Variable", Georgia, serif' }, { text: "DE LAS HUELLAS", size: 68, color: "#6d766a", font: '"Cormorant Garamond Variable", Georgia, serif' }, { text: "LOS OBJETOS QUE CUENTAN SU HISTORIA", size: 19, color: "#939784" }], "#e3ddcf", 1024, 380), []);
  useEffect(() => () => wallTexture.dispose(), [wallTexture]);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.025, 1]} receiveShadow><planeGeometry args={[16, 22]} /><meshStandardMaterial color="#b69d7e" roughness={.78} /></mesh>
    {Array.from({ length: 40 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-7.8 + i * .4, -.018, 1]} receiveShadow><planeGeometry args={[.392, 22]} /><meshStandardMaterial color={['#b8a083', '#b29a7d', '#bda589', '#b59c7f', '#c0a88c'][i % 5]} roughness={.67} /></mesh>)}
    {Array.from({ length: 10 }, (_, i) => <mesh key={`seam-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.014, -8 + i * 2.1]}><planeGeometry args={[16, .009]} /><meshStandardMaterial color="#9f876b" /></mesh>)}
    <mesh position={[0, 3, -6.9]} receiveShadow><boxGeometry args={[16, 6, .2]} /><meshStandardMaterial color="#e3ddcf" roughness={1} /></mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * 7.65, 3, 1]} receiveShadow><boxGeometry args={[.3, 6, 16]} /><meshStandardMaterial color="#ede7da" roughness={1} /></mesh>
      <mesh position={[side * 7.43, .11, 1]}><boxGeometry args={[.09, .22, 16]} /><meshStandardMaterial color="#c1b291" /></mesh>
      {[-4, 0, 4].map(z => <mesh key={z} position={[side * 7.38, 2.7, z]}><boxGeometry args={[.15, 5.4, .28]} /><meshStandardMaterial color="#e7e0d2" /></mesh>)}
    </group>)}
    <mesh position={[0, .11, -6.72]}><boxGeometry args={[15, .22, .1]} /><meshStandardMaterial color="#c1b291" /></mesh>
    <mesh position={[0, 5.55, 0]} receiveShadow><boxGeometry args={[16, .2, 18]} /><meshStandardMaterial color="#eae4d7" /></mesh>
    {[-5.7, -1.8, 2.1, 6].map(z => <mesh key={z} position={[0, 5.2, z]}><boxGeometry args={[15.5, .42, .2]} /><meshStandardMaterial color="#e0d7c5" /></mesh>)}
    <mesh position={[0, 3.45, -6.78]}><planeGeometry args={[4.65, 1.73]} /><meshStandardMaterial map={wallTexture} roughness={1} /></mesh>
    {[-5.4, 5.4].flatMap(x => [-3.8, -.5, 2.8].map(z => <group key={`${x}-${z}`}>
      <mesh position={[x, 5.25, z]}><cylinderGeometry args={[.16, .12, .2, 16]} /><meshStandardMaterial color="#45504a" /></mesh>
      <pointLight position={[x, 4.6, z]} intensity={7} distance={6.4} decay={2} color="#ffedd1" />
    </group>))}
  </group>;
}

function CameraRig({ selection, artworks, tourIndex, reducedMotion }: { selection: Selection | null; artworks: Artwork[]; tourIndex: number; reducedMotion: boolean }) {
  const { camera, size, invalidate } = useThree(); const currentLook = useRef(new THREE.Vector3(...tourStops[0].lookAt));
  const route = useRef<THREE.Vector3[]>([]); const targetLook = useRef(new THREE.Vector3(...tourStops[0].lookAt)); const offset = useRef(new THREE.Vector2());
  useEffect(() => {
    const index = selection ? artworks.findIndex(a => a.id === selection.id) : -1;
    const pose = index >= 0 ? focusPose(index, selection!.target, size.width / size.height) : tourStops[tourIndex];
    const from: Vec3 = [camera.position.x, camera.position.y, camera.position.z];
    route.current = aisleRoute(from, pose.position).map(p => new THREE.Vector3(...p)); targetLook.current.set(...pose.lookAt);
    const withPanel = selection && selection.target !== "pedestal";
    offset.current.set(withPanel && size.width >= 700 ? 185 : 0, withPanel && size.width < 700 ? size.height * .24 : 0);
    if (reducedMotion) { camera.position.set(...pose.position); currentLook.current.set(...pose.lookAt); route.current = []; }
    invalidate();
  }, [selection, artworks, tourIndex, camera, size.width, size.height, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    const target = route.current[0]; const alpha = 1 - Math.exp(-Math.min(delta, .05) * 4.2);
    if (target) { camera.position.lerp(target, alpha); if (camera.position.distanceTo(target) < .045) { camera.position.copy(target); route.current.shift(); } }
    currentLook.current.lerp(targetLook.current, alpha); camera.lookAt(currentLook.current);
    if (camera instanceof THREE.PerspectiveCamera) { camera.fov = size.width < 700 ? 65 : 51; camera.setViewOffset(size.width, size.height, offset.current.x, offset.current.y, size.width, size.height); camera.updateProjectionMatrix(); }
    if (target || currentLook.current.distanceTo(targetLook.current) > .002) invalidate();
  });
  return null;
}

function SceneReady({ onReady }: { onReady: () => void }) { useEffect(() => { onReady(); }, [onReady]); return null; }
export default function MuseumScene({ artworks, selection, tourIndex, reducedMotion, onSelect, onFailure, onReady }: { artworks: Artwork[]; selection: Selection | null; tourIndex: number; reducedMotion: boolean; onSelect: (id: string, target: FocusTarget) => void; onFailure: () => void; onReady: () => void }) {
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: tourStops[0].position, fov: 51, near: .1, far: 60 }} frameloop="demand" gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }} onCreated={({ gl }) => { gl.setClearColor("#e4dccd"); gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true }); }} fallback={<div className="scene-loading"><p>La vista 3D no está disponible.</p><button onClick={onFailure}>Ver las obras en tarjetas</button></div>}>
    <fog attach="fog" args={["#e1d7c5", 20, 45]} />
    <ambientLight intensity={1.3} color="#fff4dd" /><hemisphereLight args={["#fff9ec", "#a79878", 1.1]} />
    <directionalLight position={[-3, 7, 6]} intensity={2.7} color="#fff0d4" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-.0007} shadow-normalBias={.03} />
    <pointLight position={[0, 4.9, -.7]} intensity={15} color="#ffead0" distance={9} />
    <Architecture /><CentralExhibit />
    {artworks.map((art, index) => <Pedestal key={art.id} artwork={art} index={index} onSelect={onSelect} />)}
    <CameraRig artworks={artworks} selection={selection} tourIndex={tourIndex} reducedMotion={reducedMotion} /><SceneReady onReady={onReady} />
  </Canvas>;
}
