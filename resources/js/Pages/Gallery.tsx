import { Head } from "@inertiajs/react";
import GalleryView from "@/components/museum/gallery";
import type { Artwork } from "@/lib/types";

export default function Gallery({ artworks }: { artworks: Artwork[] }) { return <><Head title="La galería de los recuerdos" /><GalleryView artworks={artworks} /></>; }
