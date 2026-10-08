import { Suspense } from "react";
import Gallery from "@/components/museum/gallery";
export const metadata = { title: "La galería de los recuerdos" };
export default function GalleryPage() { return <Suspense fallback={<div className="empty-state"><p>Abriendo el museo…</p></div>}><Gallery /></Suspense>; }
