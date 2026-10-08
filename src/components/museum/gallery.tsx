"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Plus, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Box, Grid2X2, House, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtworkDetail, type DetailContent } from "./artwork-detail";
import type { WalkInput } from "./scene";
import { useArtworks } from "@/hooks/use-artworks";
import { campaign } from "@/lib/campaign";
import { CENTRAL_ID, ROOM_SIZE } from "@/lib/museum-layout";
const Scene = dynamic(() => import("./scene"), { ssr: false, loading: () => <LoadingScene /> });
function LoadingScene() { return <div className="scene-loading" role="status"><Loader2 size={26} className="spin" /><p>Preparando los recuerdos…</p></div>; }
class CanvasBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> { state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; } componentDidCatch() { this.props.onFailure(); } render() { return this.state.failed ? null : this.props.children; } }
// Film grain for a nostalgic, photographic finish: per-pixel noise drawn once into a tiling image.
function FilmGrain() {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const size = 256, canvas = document.createElement("canvas"); canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const image = ctx.createImageData(size, size);
    for (let i = 0; i < image.data.length; i += 4) { const v = Math.random() * 255; image.data[i] = image.data[i + 1] = image.data[i + 2] = v; image.data[i + 3] = 255; }
    ctx.putImageData(image, 0, 0); setUrl(canvas.toDataURL("image/png"));
  }, []);
  return <div className="scene-grain" aria-hidden="true" style={url ? { backgroundImage: `url(${url})` } : undefined} />;
}
const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es");

function WalkButton({ label, input, axis, value, className, children }: { label: string; input: React.MutableRefObject<WalkInput>; axis: "move" | "turn"; value: number; className: string; children: ReactNode }) {
  const set = (v: number) => { input.current[axis] = v; input.current.wake(); };
  const press = (e: ReactPointerEvent<HTMLButtonElement>) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); set(value); };
  return <button type="button" className={`walk-button ${className}`} aria-label={label} onPointerDown={press} onPointerUp={() => set(0)} onPointerCancel={() => set(0)} onLostPointerCapture={() => set(0)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(value); } }} onKeyUp={() => set(0)} onBlur={() => set(0)}>{children}</button>;
}

export default function Gallery() {
  const router = useRouter(); const params = useSearchParams(); const requested = params.get("obra"); const { artworks, loading, error, retry } = useArtworks();
  const [view, setView] = useState<"3d" | "cards">("3d"); const [unsupported, setUnsupported] = useState(false); const [ready, setReady] = useState(false); const [query, setQuery] = useState(""); const [searchOpen, setSearchOpen] = useState(false); const [room, setRoom] = useState(0); const [selection, setSelection] = useState<string | null>(null); const [reducedMotion, setReducedMotion] = useState(false); const [missing, setMissing] = useState(false); const [moved, setMoved] = useState(false);
  const hotspotLayer = useRef<HTMLDivElement>(null); const cardRail = useRef<HTMLDivElement>(null); const handledRequest = useRef<string | null>(null); const input = useRef<WalkInput>({ move: 0, turn: 0, wake: () => undefined });
  const rooms = Math.max(1, Math.ceil(artworks.length / ROOM_SIZE)); const currentRoom = Math.min(room, rooms - 1);
  const visible = useMemo(() => artworks.slice(currentRoom * ROOM_SIZE, (currentRoom + 1) * ROOM_SIZE), [artworks, currentRoom]);
  const needle = normalize(query.trim());
  const matches = useMemo(() => needle ? artworks.filter(a => normalize(`${a.petName} ${a.title}`).includes(needle)) : [], [needle, artworks]);
  const centralMatches = !!needle && normalize(`${campaign.centralInfo.title} ${campaign.name}`).includes(needle);
  const focused = selection !== null;
  const detail = useMemo<DetailContent | null>(() => {
    if (selection === CENTRAL_ID) return { eyebrow: campaign.centralInfo.eyebrow, title: campaign.centralInfo.title, description: campaign.centralInfo.description };
    const art = artworks.find(a => a.id === selection); if (!art) return null;
    return { eyebrow: "CADA OBJETO CUENTA UNA HISTORIA", title: art.title, description: art.description, petName: art.petName, age: art.age, petImage: art.petImage, objectImage: art.objectImage };
  }, [selection, artworks]);
  const onFailure = useCallback(() => { setUnsupported(true); setView("cards"); }, []); const onReady = useCallback(() => setReady(true), []); const onFirstMove = useCallback(() => setMoved(true), []);
  useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"); setReducedMotion(media.matches); const update = () => setReducedMotion(media.matches); media.addEventListener("change", update); const canvas = document.createElement("canvas"); const context = canvas.getContext("webgl2"); if (!context) onFailure(); else context.getExtension("WEBGL_lose_context")?.loseContext(); return () => media.removeEventListener("change", update); }, [onFailure]);
  const focusArtwork = useCallback((id: string) => { const index = artworks.findIndex(a => a.id === id); if (index >= 0) setRoom(Math.floor(index / ROOM_SIZE)); setView("3d"); setQuery(""); setSearchOpen(false); (document.activeElement as HTMLElement | null)?.blur(); setSelection(id); }, [artworks]);
  useEffect(() => { if (!requested || loading || handledRequest.current === requested) return; handledRequest.current = requested; if (!artworks.some(a => a.id === requested)) { setMissing(true); return; } focusArtwork(requested); }, [requested, artworks, loading, focusArtwork]);
  function changeRoom(next: number) { setRoom(next); setSelection(null); input.current.move = 0; input.current.turn = 0; }
  function scrollCards(direction: -1 | 1) { const rail = cardRail.current; if (rail) rail.scrollBy({ left: direction * rail.clientWidth * .7, behavior: reducedMotion ? "auto" : "smooth" }); }
  const hasResults = matches.length > 0 || centralMatches;
  const cards = view === "cards" ? (needle ? matches : artworks) : [];
  return <div className="gallery-page"><main className="gallery-surface" aria-label="Museo interactivo">
    {view === "3d" && <div className="scene-container" id="museum-scene" tabIndex={-1} aria-label="Sala tridimensional. Usa las flechas del teclado para caminar y girar."><CanvasBoundary onFailure={onFailure}><Scene artworks={visible} selection={selection} roomKey={currentRoom} reducedMotion={reducedMotion} input={input} hotspots={hotspotLayer} onSelect={setSelection} onAdd={() => router.push("/exhibir")} onFailure={onFailure} onReady={onReady} onFirstMove={onFirstMove} /></CanvasBoundary>{!ready && <LoadingScene />}<div className="scene-vignette" /><FilmGrain />{!focused && <div className="hotspot-layer" ref={hotspotLayer}>{visible.map((art, index) => <button key={art.id} type="button" className="hotspot" data-hotspot={`slot-${index}`} aria-label={`Ver historia de ${art.petName}: ${art.title}`} onClick={() => setSelection(art.id)}><span>i</span></button>)}{Array.from({ length: ROOM_SIZE - visible.length }, (_, k) => <Link key={`add-${k}`} href="/exhibir" className="hotspot hotspot-add" data-hotspot={`slot-${visible.length + k}`} aria-label="Exhibir tu obra en este pedestal"><Plus size={15} strokeWidth={2.6} /></Link>)}<button type="button" className="hotspot" data-hotspot={CENTRAL_ID} aria-label={`Ver información: ${campaign.centralInfo.title}`} onClick={() => setSelection(CENTRAL_ID)}><span>i</span></button></div>}</div>}
    {!focused && <>
      <div className="gallery-toolbar">
        <Link className="round-button" href="/" aria-label="Volver al inicio"><House size={17} /></Link>
        <div className="search-wrap" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
          <form className="search-box" role="search" onSubmit={event => { event.preventDefault(); if (view !== "3d") return; if (matches[0]) focusArtwork(matches[0].id); else if (centralMatches) { setQuery(""); setSelection(CENTRAL_ID); } }}><Search size={17} /><input aria-label="Buscar por obra o mascota" placeholder="Buscar por obra o mascota…" value={query} onFocus={() => setSearchOpen(true)} onChange={event => { setQuery(event.target.value); setSearchOpen(true); }} onKeyDown={event => { if (event.key === "Escape") { setQuery(""); event.currentTarget.blur(); } }} />{query && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQuery("")}><X size={15} /></button>}</form>
          {view === "3d" && searchOpen && needle && <ul className="search-results" aria-label="Resultados de búsqueda">{hasResults ? <>{matches.map(art => <li key={art.id}><button type="button" onClick={() => focusArtwork(art.id)}><img src={art.petImage} alt="" /><span><strong>{art.title}</strong><small>En memoria de {art.petName}</small></span></button></li>)}{centralMatches && <li><button type="button" onClick={() => { setQuery(""); setSelection(CENTRAL_ID); }}><span className="search-central">★</span><span><strong>{campaign.centralInfo.title}</strong><small>Figura central</small></span></button></li>}</> : <li className="search-empty">No encontramos obras para “{query}”.</li>}</ul>}
        </div>
        <div className="view-switch" role="group" aria-label="Vista de galería"><button aria-label="Vista 3D" aria-pressed={view === "3d"} disabled={unsupported} onClick={() => setView("3d")}><Box size={15} /><span>Sala 3D</span></button><button aria-label="Vista de tarjetas" aria-pressed={view === "cards"} onClick={() => setView("cards")}><Grid2X2 size={15} /><span>Obras</span></button></div>
      </div>
      {view === "3d" && <>
        {!moved && <div className="gallery-hint" role="note">Camina con las flechas del teclado · arrastra para mirar · toca una obra para acercarte</div>}
        <div className="walk-controls" role="group" aria-label="Recorrer la sala"><WalkButton label="Girar a la izquierda" input={input} axis="turn" value={1} className="walk-side"><ChevronLeft size={44} strokeWidth={3.2} /></WalkButton><div className="walk-center"><WalkButton label="Caminar hacia adelante" input={input} axis="move" value={1} className="walk-forward"><ChevronUp size={68} strokeWidth={3.2} /></WalkButton><WalkButton label="Caminar hacia atrás" input={input} axis="move" value={-1} className="walk-back"><ChevronDown size={30} strokeWidth={3.2} /></WalkButton></div><WalkButton label="Girar a la derecha" input={input} axis="turn" value={-1} className="walk-side"><ChevronRight size={44} strokeWidth={3.2} /></WalkButton></div>
        <nav className="room-strip" aria-label="Salas">{Array.from({ length: rooms }, (_, index) => <button key={index} type="button" className="room-tab" aria-current={index === currentRoom ? "true" : undefined} aria-label={`Sala ${index + 1}`} onClick={() => changeRoom(index)}><img src="/images/museum.jpg" alt="" /><span>Sala {index + 1}</span></button>)}</nav>
      </>}
    </>}
    {(error || missing || unsupported) && !focused && <div className="gallery-notice" role="status">{error ? <>{error}<button onClick={retry}>Reintentar</button></> : missing ? <>No encontramos esta obra.<button onClick={() => setMissing(false)}>Ver la colección</button></> : "La sala 3D no está disponible. Todas las historias están disponibles en tarjetas."}</div>}
    {view === "cards" && <div className="gallery-cards">{!cards.length ? <div className="empty-state"><Search size={30} /><h2>Cada historia es única.</h2><p>No encontramos obras para “{query}”. Prueba con otro nombre.</p><Button variant="outline" onClick={() => setQuery("")}>Ver todas las obras</Button></div> : <div className="cards-carousel"><button type="button" className="cards-arrow cards-arrow-left" aria-label="Ver obras anteriores" onClick={() => scrollCards(-1)}><ChevronLeft size={30} /></button><div className="cards-grid" ref={cardRail} tabIndex={0} aria-label="Obras de la galería. Desplázate horizontalmente para ver más.">{cards.map(art => <article className="art-card" key={art.id}><div className="art-card-images"><img src={art.petImage} alt={art.petName} /><img src={art.objectImage} alt={`Objeto de ${art.petName}`} /></div><div className="art-card-plinth"><div className="art-card-copy"><span>EN MEMORIA DE {art.petName}</span><h2>{art.title}</h2><p>{art.age} años de amor</p></div></div></article>)}</div><button type="button" className="cards-arrow cards-arrow-right" aria-label="Ver más obras" onClick={() => scrollCards(1)}><ChevronRight size={30} /></button></div>}</div>}
    <ArtworkDetail detail={detail} onClose={() => setSelection(null)} />
  </main></div>;
}
