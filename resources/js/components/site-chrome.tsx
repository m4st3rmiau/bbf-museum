import { Link, usePage } from "@inertiajs/react";
import { Heart, PawPrint } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";

export function Brand() { return <Link href="/" className="brand" aria-label="Bye Bye Friend · Inicio"><PawPrint className="brand-paw" fill="currentColor" strokeWidth={1.3} /><span>bye bye<span className="brand-bottom">friend<span className="brand-dot">.</span></span></span></Link>; }
export function Header({ gallery = false }: { gallery?: boolean }) {
  const pathname = usePage().url.split("?")[0];
  return <header className={`site-header ${gallery ? "gallery-header" : ""}`}><Brand /><Link href="/" className="header-title">EL MUSEO DE LAS HUELLAS</Link><nav aria-label="Navegación principal"><Link className={`nav-link ${pathname === "/galeria" ? "active" : ""}`} href="/galeria">La galería</Link><Button asChild variant="outline" size="sm"><Link href="/exhibir">Exhibir su obra <Heart size={15} /></Link></Button></nav></header>;
}
export function CampaignHeader() {
  return <header className="campaign-header"><Link href="/" aria-label="Bye Bye Friend, una marca de Grupo Funerario J. García López · Inicio"><img src="/home/Grupo%2044.svg" alt="Bye Bye Friend · Una marca de Grupo Funerario J. García López" /></Link><img src="/home/Grupo%2041.svg" alt="Su huella sigue presente" /></header>;
}
export function CampaignBackground() {
  return <picture><source media="(max-width: 800px)" srcSet="/home/memorial-displays-mobile.webp" /><img className="campaign-background" src="/home/background-2-1280.webp" srcSet="/home/background-2-1280.webp 1280w, /home/background-2-1672.webp 1672w" sizes="100vw" fetchPriority="high" decoding="async" alt="" aria-hidden="true" /></picture>;
}
export function LocalNotice() { return null; }
export function Footer() { return <footer className="site-footer"><span>Un homenaje de <strong>Bye Bye Friend</strong></span><span className="footer-center">El amor deja huellas.</span><div><Dialog><DialogTrigger className="text-link">Privacidad</DialogTrigger><DialogContent><DialogTitle className="dialog-heading">Aviso de privacidad</DialogTitle><DialogDescription className="dialog-copy">Consulta el aviso de privacidad de la campaña para conocer el tratamiento y protección de tus datos personales.</DialogDescription></DialogContent></Dialog><Link className="text-link" href="/creditos">Créditos</Link><span>© {new Date().getFullYear()}</span></div></footer>; }
