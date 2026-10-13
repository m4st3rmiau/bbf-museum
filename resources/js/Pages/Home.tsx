import { Head, Link } from "@inertiajs/react";
import { Heart, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "../../css/home.module.css";

export default function Home() {
  return <><Head title="Galería de los recuerdos" /><div className={styles.home}>
    <picture>
      <source media="(max-width: 800px)" srcSet="/home/memorial-displays-mobile.webp" />
      <img src="/home/background-2-1280.webp" srcSet="/home/background-2-1280.webp 1280w, /home/background-2-1672.webp 1672w" sizes="100vw" fetchPriority="high" decoding="async" alt="" aria-hidden="true" className={styles.background} />
    </picture>
    <header className={styles.header}><Link href="/" aria-label="Bye Bye Friend, una marca de Grupo Funerario J. García López · Inicio"><img src="/home/Grupo%2044.svg" alt="Bye Bye Friend · Una marca de Grupo Funerario J. García López" className={styles.brand} /></Link><img src="/home/Grupo%2041.svg" alt="Su huella sigue presente" className={styles.campaignMark} /></header>
    <main><section className={styles.hero} aria-labelledby="campaign-title">
      <h1 id="campaign-title" className={styles.title}><img src="/home/Grupo%202.svg" alt="Galería de los recuerdos" className={styles.galleryMark} /></h1>
      <p className={styles.tagline}>Donde el amor que no termina <span className={styles.accent}>se convierte en arte.</span></p>
      <div className={styles.story}>
        <p>Un juguete, una manta o su accesorio favorito guardan años de vida compartida. <strong><span className={styles.accent}>Este Día de Muertos,</span> transformamos esos recuerdos en obras de arte.</strong></p>
        <p><strong><span className={styles.accent}>Suma la historia de tu mejor amigo</span> a nuestra galería digital</strong> y descubre las memorias que otros han compartido.</p>
      </div>
      <nav className={styles.actions} aria-label="Explora la galería o participa"><Button asChild className={styles.exhibitButton}><Link href="/exhibir"><Heart size={20} strokeWidth={1.7} />Exhibe su obra</Link></Button><Button asChild variant="outline" className={styles.galleryButton}><Link href="/galeria"><View size={20} strokeWidth={1.7} />Ver galería</Link></Button></nav>
    </section></main>
  </div></>;
}
