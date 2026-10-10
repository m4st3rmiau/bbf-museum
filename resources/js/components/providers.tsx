"use client";
import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import type { ArtworkDraft } from "@/lib/types";
import type { ContactFields } from "@/lib/validation";
const emptyDraft: ArtworkDraft = { petName: "", age: "", title: "", description: "", petImage: null, objectImage: null };
const emptyContact: ContactFields = { name: "", email: "", phone: "", interest: "" };
interface DraftContextType { draft: ArtworkDraft; setDraft: Dispatch<SetStateAction<ArtworkDraft>>; contact: ContactFields; setContact: Dispatch<SetStateAction<ContactFields>>; clear: () => void }
const DraftContext = createContext<DraftContextType | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(emptyDraft); const [contact, setContact] = useState(emptyContact);
  return <DraftContext.Provider value={{ draft, setDraft, contact, setContact, clear: () => { setDraft(emptyDraft); setContact(emptyContact); } }}>{children}</DraftContext.Provider>;
}
export function useDraft() { const ctx = useContext(DraftContext); if (!ctx) throw new Error("Missing Providers"); return ctx; }
