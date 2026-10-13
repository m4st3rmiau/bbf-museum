"use client";
import { createContext, useContext, useEffect, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import type { ArtworkDraft } from "@/lib/types";
import type { ContactFields } from "@/lib/validation";
const emptyDraft: ArtworkDraft = { petName: "", age: "", title: "", description: "", petImage: null, objectImage: null };
const emptyContact: ContactFields = { name: "", email: "", phone: "", interest: "" };
interface DraftContextType { draft: ArtworkDraft; setDraft: Dispatch<SetStateAction<ArtworkDraft>>; contact: ContactFields; setContact: Dispatch<SetStateAction<ContactFields>>; demoMode: boolean; clear: () => void }
const DraftContext = createContext<DraftContextType | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(emptyDraft); const [contact, setContact] = useState(emptyContact);
  const [demoMode] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1");
  useEffect(() => {
    if (!demoMode) return;
    let active = true;
    setContact({ name: "Ana Pérez", email: "ana.perez@example.com", phone: "55 5651 8029", interest: "gallery" });
    Promise.all([
      fetch("/images/dog-1.webp").then(response => response.blob()),
      fetch("/images/ball.webp").then(response => response.blob()),
    ]).then(([petImage, objectImage]) => {
      if (!active) return;
      setDraft({
        petName: "Milo",
        age: "12",
        title: "Una pelota, mil aventuras",
        description: "Nunca necesitó mucho para ser feliz. Su pelota, un poco de sol y nosotros a su lado. La guardamos para recordar que las mejores cosas siempre fueron las más sencillas.",
        petImage: new File([petImage], "milo.webp", { type: petImage.type || "image/webp" }),
        objectImage: new File([objectImage], "pelota.webp", { type: objectImage.type || "image/webp" }),
      });
    });
    return () => { active = false; };
  }, [demoMode]);
  return <DraftContext.Provider value={{ draft, setDraft, contact, setContact, demoMode, clear: () => { setDraft(emptyDraft); setContact(emptyContact); } }}>{children}</DraftContext.Provider>;
}
export function useDraft() { const ctx = useContext(DraftContext); if (!ctx) throw new Error("Missing Providers"); return ctx; }
