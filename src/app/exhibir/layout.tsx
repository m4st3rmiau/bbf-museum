import { Header, Footer, LocalNotice } from "@/components/site-chrome";
export default function ExhibitLayout({ children }: { children: React.ReactNode }) { return <div className="form-page"><Header /><main>{children}</main><div className="local-line"><LocalNotice /></div><Footer /></div>; }
