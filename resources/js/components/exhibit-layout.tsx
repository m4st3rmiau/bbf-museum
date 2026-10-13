import type { ReactNode } from "react";
import { CampaignBackground, CampaignHeader } from "@/components/site-chrome";

export function ExhibitLayout({ children }: { children: ReactNode }) {
  return <div className="campaign-page form-page"><CampaignBackground /><CampaignHeader /><main><img className="form-brandmark" src="/home/Grupo%202.svg" alt="Galería de los recuerdos" />{children}</main></div>;
}
