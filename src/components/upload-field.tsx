"use client";
import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Loader2 } from "lucide-react";
import { prepareImage } from "@/lib/images";
import { useBlobUrl } from "@/hooks/use-blob-url";
export function UploadField({ label, hint, value, onChange, onBusyChange, missing }: { label: string; hint: string; value: Blob | null; onChange: (blob: Blob) => void; onBusyChange: (busy: boolean) => void; missing: boolean }) {
  const url = useBlobUrl(value); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const input = useRef<HTMLInputElement>(null);
  async function read(file?: File) { if (!file || busy) return; setBusy(true); onBusyChange(true); setError(""); try { onChange(await prepareImage(file)); } catch (e) { setError((e as Error).message); } finally { setBusy(false); onBusyChange(false); if (input.current) input.current.value = ""; } }
  return <div className="upload-field"><label className="field-label">{label}</label><button type="button" className={`upload-area ${url ? "has-image" : ""} ${missing ? "invalid" : ""}`} onClick={() => input.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void read(e.dataTransfer.files[0]); }} disabled={busy} aria-label={label}>{url ? <><img src={url} alt={label} /><span className="replace-image"><RefreshCw size={14} /> Cambiar foto</span></> : <><span className="upload-icon">{busy ? <Loader2 className="spin" /> : <ImagePlus size={25} />}</span><strong>{busy ? "Preparando…" : "Subir fotografía"}</strong><span>{hint}</span></>}</button><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void read(e.target.files?.[0])} className="sr-only" aria-label={`Archivo: ${label}`} tabIndex={-1} />{(error || missing) && <p className="field-error" role="alert">{error || "Agrega esta fotografía."}</p>}</div>;
}
