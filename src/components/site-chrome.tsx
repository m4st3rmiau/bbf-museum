"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, PawPrint } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";

export function Brand() { return <Link href="/" className="brand" aria-label="Bye Bye Friend · Inicio"><PawPrint className="brand-paw" fill="currentColor" strokeWidth={1.3} /><span>bye bye<span className="brand-bottom">friend<span className="brand-dot">.</span></span></span></Link>; }
export function Header({ gallery = false }: { gallery?: boolean }) {
  const pathname = usePathname();
  return <header className={`site-header ${gallery ? "gallery-header" : ""}`}><Brand /><Link href="/" className="header-title">EL MUSEO DE LAS HUELLAS</Link><nav aria-label="Navegación principal"><Link className={`nav-link ${pathname === "/galeria" ? "active" : ""}`} href="/galeria">La galería</Link><Button asChild variant="outline" size="sm"><Link href="/exhibir">Exhibir su obra <Heart size={15} /></Link></Button></nav></header>;
}
export function LocalNotice() { return <span className="local-notice">Una experiencia de demostración. Tus obras se guardan en este navegador.</span>; }
export function Footer() { return <footer className="site-footer"><span>Un homenaje de <strong>Bye Bye Friend</strong></span><span className="footer-center">El amor deja huellas.</span><div><Dialog><DialogTrigger className="text-link">Privacidad</DialogTrigger><DialogContent><DialogTitle className="dialog-heading">Sobre tus datos</DialogTitle><DialogDescription className="dialog-copy">Esta es una demostración local. Las fotografías y la historia de tu obra se guardan en este navegador y no se publican para otras personas. Tu nombre, correo, teléfono e interés solo se usan para demostrar el formulario; se descartan al terminar. Borrar los datos del sitio elimina tus obras. Este texto no sustituye el aviso de privacidad de una futura campaña pública.</DialogDescription></DialogContent></Dialog><Link className="text-link" href="/creditos">Créditos</Link><span>© {new Date().getFullYear()}</span></div></footer>; }
export function StepIndicator({ step }: { step: number }) { return <ol className="steps" aria-label="Pasos del registro"><li className={step >= 1 ? "current" : ""} aria-current={step === 1 ? "step" : undefined}><span>01</span> Su historia</li><li className="step-line" aria-hidden="true" /><li className={step >= 2 ? "current" : ""} aria-current={step === 2 ? "step" : undefined}><span>02</span> Tus datos</li><li className="step-line" aria-hidden="true" /><li className={step >= 3 ? "current" : ""} aria-current={step === 3 ? "step" : undefined}><span>03</span> Su huella</li></ol>; }
