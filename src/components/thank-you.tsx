"use client";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { Header, Footer, LocalNotice, StepIndicator } from "./site-chrome";
import { Button } from "./ui/button";
import { useArtworks } from "@/hooks/use-artworks";
export function ThankYou({ id }: { id: string }) {
  const { artworks, loading, error, retry } = useArtworks(); const artwork = artworks.find(a => a.id === id);
  return <div><Header />{loading ? <main className="empty-state"><Loader2 className="spin" /><p>Buscando su historia…</p></main> : error ? <main className="empty-state"><h1>Su historia nos espera.</h1><p>{error}</p><Button onClick={retry}>Reintentar</Button></main> : !artwork ? <main className="empty-state"><h1>No encontramos esta obra.</h1><p>Quizá se creó en otro navegador o se borraron los datos del sitio.</p><Button asChild><Link href="/galeria">Ver galería</Link></Button></main> : <main className="success-main"><StepIndicator step={3} /><div className="success-emblem"><Heart size={33} strokeWidth={1.2} /></div><span className="eyebrow">GRACIAS POR COMPARTIR SU HISTORIA</span><h1>La huella de {artwork.petName}<br /><em>ya tiene un lugar.</em></h1><p>Su objeto ya forma parte de nuestra galería.<br />Un pequeño homenaje a todo lo que vivieron juntos.</p><div className="success-art"><img src={artwork.petImage} alt={artwork.petName} /><img src={artwork.objectImage} alt={`Objeto de ${artwork.petName}`} /></div><div className="success-title">“{artwork.title}”</div><div className="success-actions"><Button asChild><Link href={`/galeria?obra=${artwork.id}`}>Ver mi obra</Link></Button><Button asChild variant="outline"><Link href="/galeria">Recorrer la galería</Link></Button></div></main>}<div className="local-line"><LocalNotice /></div><Footer /></div>;
}
