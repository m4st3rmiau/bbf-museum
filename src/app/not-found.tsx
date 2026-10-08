import Link from "next/link";
import { Header, Footer } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <><Header /><main className="empty-state"><h1>Esta sala no existe.</h1><p>Volvamos a las historias que nos esperan.</p><Button asChild><Link href="/galeria">Ver galería</Link></Button></main><Footer /></>; }
