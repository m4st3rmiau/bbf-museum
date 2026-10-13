import { Link } from "@inertiajs/react";
import { CampaignBackground, CampaignHeader } from "./site-chrome";
import { Button } from "./ui/button";
import type { Artwork } from "@/lib/types";

export function ThankYou({ artwork }: { artwork: Artwork }) {
  return <div className="campaign-page success-page"><CampaignBackground /><CampaignHeader /><main className="success-main"><img className="success-logo" src="/home/Grupo%202.svg" alt="Galería de los recuerdos" /><span className="eyebrow">Gracias por compartir su historia</span><h1>¡Su objeto ya forma parte de nuestra galería!</h1><p>La historia de {artwork.petName} ya tiene un lugar especial.</p><div className="success-actions"><Button asChild><Link href={`/galeria?obra=${artwork.id}`}>Ver mi obra</Link></Button></div></main></div>;
}
