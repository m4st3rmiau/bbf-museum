"use client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CampaignHeader } from "./site-chrome";
import { Button } from "./ui/button";
import { useArtworks } from "@/hooks/use-artworks";
export function ThankYou({ id }: { id: string }) {
  const { artworks, loading, error, retry } = useArtworks(); const artwork = artworks.find(a => a.id === id);
  return <div className="campaign-page success-page"><img className="campaign-background" src="/home/BBF%20Web%20BG@2x.png" alt="" aria-hidden="true" /><img className="campaign-petals campaign-petals-left" src="/home/Petalos%20izquierda.png" alt="" aria-hidden="true" /><img className="campaign-petals campaign-petals-right" src="/home/Petalo%20Derecha.png" alt="" aria-hidden="true" /><CampaignHeader />{loading ? <main className="empty-state"><Loader2 className="spin" /><p>Buscando su historia…</p></main> : error ? <main className="empty-state"><h1>Su historia nos espera.</h1><p>{error}</p><Button onClick={retry}>Reintentar</Button></main> : !artwork ? <main className="empty-state"><h1>No encontramos esta obra.</h1><p>Esta obra ya no está disponible.</p><Button asChild><Link href="/galeria">Ver galería</Link></Button></main> : <main className="success-main"><img className="success-logo" src="/home/Grupo%202.svg" alt="Galería de los recuerdos" /><span className="eyebrow">GRACIAS POR COMPARTIR SU HISTORIA</span><h1>¡Su objeto ya forma parte<br />de nuestra galería!</h1><p>La historia de {artwork.petName} ya tiene un lugar especial.</p><div className="success-actions"><Button asChild><Link href={`/galeria?obra=${artwork.id}`}>Ver mi obra</Link></Button></div></main>}</div>;
}
