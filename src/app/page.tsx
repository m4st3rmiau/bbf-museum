import Link from "next/link";
import Image from "next/image";
import { Heart, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./home.module.css";

export const metadata = { title: "Galería de los recuerdos" };

export default function Home() {
  return (
    <div className={styles.home}>
      <Image src="/home/BBF Web BG@2x.png" alt="" aria-hidden="true" width={3840} height={4190} sizes="(max-width: 800px) 1200px, 100vw" className={styles.background} priority />
      <header className={styles.header}>
        <Link href="/" aria-label="Bye Bye Friend, una marca de Grupo Funerario J. García López · Inicio">
          <img src="/home/Grupo%2044.svg" alt="Bye Bye Friend · Una marca de Grupo Funerario J. García López" width={529} height={115} className={styles.brand} />
        </Link>
        <img src="/home/Grupo%2041.svg" alt="Su huella sigue presente" width={224} height={142} className={styles.campaignMark} />
      </header>
      <main>
        <section className={styles.hero} aria-labelledby="campaign-title">
          <Image src="/home/Petalos izquierda.png" alt="" aria-hidden="true" width={288} height={288} className={`${styles.petals} ${styles.petalsLeft}`} />
          <Image src="/home/Petalo Derecha.png" alt="" aria-hidden="true" width={288} height={288} className={`${styles.petals} ${styles.petalsRight}`} />
          <h1 id="campaign-title" className={styles.title}>
            <img src="/home/Grupo%202.svg" alt="Galería de los recuerdos" width={704} height={286} className={styles.galleryMark} fetchPriority="high" />
          </h1>
          <p className={styles.tagline}>Donde el amor que no termina se convierte en arte.</p>
          <div className={styles.story}>
            <p>
              <strong>Hay piezas</strong> cuyo valor no está en lo que son, <strong>sino en la historia que resguardan.</strong><br className={styles.desktopBreak} />{" "}
              <strong>Un juguete, una pelota o una manta</strong> pueden convertirse en la materialización de años de juegos,<br className={styles.desktopBreak} />{" "}
              <strong>compañía y amor</strong> junto a <strong>nuestros mejores amig@s.</strong>
            </p>
            <p>
              <strong>Este Día de Muertos,</strong> queremos <strong>exhibir esas piezas como lo que realmente representan:</strong><br className={styles.desktopBreak} />{" "}
              <strong>obras cargadas de memorias. Te invitamos</strong> a sumar la de tu <strong>BFF a nuestra galería digital</strong><br className={styles.desktopBreak} />{" "}
              y a recorrer las historias que <strong>otras personas han decidido compartir.</strong>
            </p>
          </div>
          <nav className={styles.actions} aria-label="Explora la galería o participa">
            <Button asChild className={styles.exhibitButton}>
              <Link href="/exhibir"><Heart size={20} strokeWidth={1.7} />Exhibe su obra</Link>
            </Button>
            <Button asChild variant="outline" className={styles.galleryButton}>
              <Link href="/galeria"><View size={20} strokeWidth={1.7} />Ver galería</Link>
            </Button>
          </nav>
        </section>
      </main>
    </div>
  );
}
