import { Link } from "@inertiajs/react";
import { CampaignHeader } from "./site-chrome";
import { Button } from "./ui/button";
import type { Artwork } from "@/lib/types";

export function ThankYou({ artwork }: { artwork: Artwork }) {
  return <div className="campaign-page success-page"><img className="campaign-background" src="/home/bbf-background-1280.webp" srcSet="/home/bbf-background-1280.webp 1280w, /home/bbf-background-2560.webp 2560w" sizes="100vw" fetchPriority="high" decoding="async" alt="" aria-hidden="true" /><img className="campaign-petals campaign-petals-left" src="/home/petalos-izquierda.webp" decoding="async" alt="" aria-hidden="true" /><img className="campaign-petals campaign-petals-right" src="/home/petalo-derecha.webp" decoding="async" alt="" aria-hidden="true" /><CampaignHeader /><main className="success-main"><img className="success-logo" src="/home/Grupo%202.svg" alt="Galería de los recuerdos" /><span className="eyebrow">GRACIAS POR COMPARTIR SU HISTORIA</span><h1>¡Su objeto ya forma parte<br />de nuestra galería!</h1><p>La historia de {artwork.petName} ya tiene un lugar especial.</p><div className="success-actions"><Button asChild><Link href={`/galeria?obra=${artwork.id}`}>Ver mi obra</Link></Button></div></main></div>;
}
