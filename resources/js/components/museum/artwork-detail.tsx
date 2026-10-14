"use client";
import { useState } from "react";
import { ExternalLink, Expand, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export interface DetailContent {
  eyebrow: string;
  title: string;
  description: string;
  productName?: string;
  moreInfoUrl?: string;
  petName?: string;
  age?: string;
  petImage?: string;
  objectImage?: string;
  note?: string;
}

export function ArtworkDetail({ detail, onClose }: { detail: DetailContent | null; onClose: () => void }) {
  const [expanded, setExpanded] = useState<"pet" | "object" | null>(null);
  const images = detail ? ([['pet', detail.petImage], ['object', detail.objectImage]] as const).filter((entry): entry is ["pet" | "object", string] => !!entry[1]) : [];
  const subject = detail?.petName ?? detail?.productName ?? detail?.title ?? "la obra";

  return <>
    <Sheet open={!!detail} onOpenChange={open => { if (!open) { setExpanded(null); onClose(); } }}>
      {detail && <SheetContent
        onEscapeKeyDown={event => { if (expanded) { event.preventDefault(); setExpanded(null); } }}
        onInteractOutside={event => { if (expanded) event.preventDefault(); }}
        onCloseAutoFocus={event => { event.preventDefault(); document.getElementById("museum-scene")?.focus(); }}
      >
        <span className="eyebrow">{detail.eyebrow}</span>
        <SheetTitle className="detail-heading">{detail.title}</SheetTitle>
        {detail.productName && <p className="detail-product-name">{detail.productName}</p>}
        {images.length > 0 && <div className="detail-images">{images.map(([kind, src]) => <button key={kind} type="button" onClick={() => setExpanded(kind)} aria-label={`Ampliar ${kind === "pet" ? "imagen de " + subject : "detalle de " + subject}`}><img src={src} alt={kind === "pet" ? subject : `Detalle de ${subject}`} /><span><Expand size={11} />{detail.productName ? (kind === "pet" ? "La obra" : "Su detalle") : (kind === "pet" ? "Su retrato" : "Su recuerdo")}</span></button>)}</div>}
        <SheetDescription className="detail-description">{detail.description}</SheetDescription>
        {detail.moreInfoUrl && <a className="detail-more-link" href={detail.moreInfoUrl} target="_blank" rel="noreferrer">Más información <ExternalLink size={14} /></a>}
        {detail.petName && <div className="detail-meta"><Heart size={16} /><strong>{detail.petName}</strong><span>{detail.age} años de amor</span></div>}
        {detail.note && <p className="detail-demo">{detail.note}</p>}
      </SheetContent>}
    </Sheet>
    <Dialog open={!!expanded && !!detail} onOpenChange={open => { if (!open) setExpanded(null); }}>
      <DialogContent className="lightbox" onEscapeKeyDown={event => { event.preventDefault(); event.stopPropagation(); setExpanded(null); }} onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>('[aria-label="Cerrar detalle"]')?.focus(); }}>
        <DialogTitle className="dialog-heading">{expanded === "pet" ? subject : detail?.title}</DialogTitle>
        <DialogDescription className="sr-only">Fotografía completa, sin recortes.</DialogDescription>
        {detail && expanded && <img src={expanded === "pet" ? detail.petImage : detail.objectImage} alt={expanded === "pet" ? subject : `Detalle de ${subject}`} />}
      </DialogContent>
    </Dialog>
  </>;
}
