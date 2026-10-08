import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/cormorant-garamond";
import "./globals.css";
import { Providers } from "@/components/providers";
export const metadata: Metadata = { title: { default: "El museo de las huellas · Bye Bye Friend", template: "%s · Bye Bye Friend" }, description: "Un lugar para honrar a tu mejor amigo a través de los objetos que cuentan su historia.", icons: { icon: "/favicon.svg" } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><body><Providers>{children}</Providers></body></html>; }
