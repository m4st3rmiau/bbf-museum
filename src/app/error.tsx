"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="empty-state"><h1>Un momento para volver a empezar.</h1><p>No pudimos abrir esta página. Intenta de nuevo.</p><Button onClick={reset}>Reintentar</Button></main>; }
