"use client";
import { useCallback, useEffect, useState } from "react";
import { artworkRepository } from "@/lib/storage";
import { demoArtworks } from "@/lib/demo-artworks";
import type { Artwork } from "@/lib/types";
export function useArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>(demoArtworks); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false; const urls: string[] = []; setLoading(true); setError("");
    artworkRepository.list().then(records => {
      if (cancelled) return;
      const local = records.map(record => { const petImage = URL.createObjectURL(record.petImage); const objectImage = URL.createObjectURL(record.objectImage); urls.push(petImage, objectImage); return { ...record, petImage, objectImage }; });
      setArtworks([...local, ...demoArtworks]);
    }).catch(() => { if (!cancelled) setError("No pudimos leer tus obras guardadas. Puedes recorrer las obras de ejemplo o intentar de nuevo."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [revision]);
  return { artworks, loading, error, retry: useCallback(() => setRevision(value => value + 1), []) };
}
