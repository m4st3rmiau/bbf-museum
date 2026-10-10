import type { ReactNode } from "react";
import { CampaignHeader } from "@/components/site-chrome";

export function ExhibitLayout({ children }: { children: ReactNode }) {
  return <div className="campaign-page form-page"><img className="campaign-background" src="/home/bbf-background-1280.webp" srcSet="/home/bbf-background-1280.webp 1280w, /home/bbf-background-2560.webp 2560w" sizes="100vw" fetchPriority="high" decoding="async" alt="" aria-hidden="true" /><img className="campaign-petals campaign-petals-left" src="/home/petalos-izquierda.webp" decoding="async" alt="" aria-hidden="true" /><img className="campaign-petals campaign-petals-right" src="/home/petalo-derecha.webp" decoding="async" alt="" aria-hidden="true" /><CampaignHeader /><main><img className="form-brandmark" src="/home/Grupo%202.svg" alt="Galería de los recuerdos" />{children}</main></div>;
}
