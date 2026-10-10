import { Head, Link } from "@inertiajs/react";
import { Heart, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "../../css/home.module.css";

export default function Home() {
  return <><Head title="Galería de los recuerdos" /><div className={styles.home}>
    <img src="/home/bbf-background-1280.webp" srcSet="/home/bbf-background-1280.webp 1280w, /home/bbf-background-2560.webp 2560w" sizes="100vw" fetchPriority="high" decoding="async" alt="" aria-hidden="true" className={styles.background} />
    <header className={styles.header}><Link href="/" aria-label="Bye Bye Friend, una marca de Grupo Funerario J. García López · Inicio"><img src="/home/Grupo%2044.svg" alt="Bye Bye Friend · Una marca de Grupo Funerario J. García López" className={styles.brand} /></Link><img src="/home/Grupo%2041.svg" alt="Su huella sigue presente" className={styles.campaignMark} /></header>
    <main><section className={styles.hero} aria-labelledby="campaign-title">
      <img src="/home/petalos-izquierda.webp" decoding="async" alt="" aria-hidden="true" className={`${styles.petals} ${styles.petalsLeft}`} />
      <img src="/home/petalo-derecha.webp" decoding="async" alt="" aria-hidden="true" className={`${styles.petals} ${styles.petalsRight}`} />
      <h1 id="campaign-title" className={styles.title}><img src="/home/Grupo%202.svg" alt="Galería de los recuerdos" className={styles.galleryMark} /></h1>
      <p className={styles.tagline}>Donde el amor que no termina se convierte en arte.</p>
      <div className={styles.story}><p><strong>Hay piezas</strong> cuyo valor no está en lo que son, <strong>sino en la historia que resguardan.</strong><br className={styles.desktopBreak} /> <strong>Un juguete, una pelota o una manta</strong> pueden convertirse en la materialización de años de juegos,<br className={styles.desktopBreak} /> <strong>compañía y amor</strong> junto a <strong>nuestros mejores amig@s.</strong></p><p><strong>Este Día de Muertos,</strong> queremos <strong>exhibir esas piezas como lo que realmente representan:</strong><br className={styles.desktopBreak} /> <strong>obras cargadas de memorias. Te invitamos</strong> a sumar la de tu <strong>BFF a nuestra galería digital</strong><br className={styles.desktopBreak} /> y a recorrer las historias que <strong>otras personas han decidido compartir.</strong></p></div>
      <nav className={styles.actions} aria-label="Explora la galería o participa"><Button asChild className={styles.exhibitButton}><Link href="/exhibir"><Heart size={20} strokeWidth={1.7} />Exhibe su obra</Link></Button><Button asChild variant="outline" className={styles.galleryButton}><Link href="/galeria"><View size={20} strokeWidth={1.7} />Ver galería</Link></Button></nav>
    </section></main>
  </div></>;
}
