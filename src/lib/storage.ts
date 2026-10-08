import { openDB, type DBSchema } from "idb";
import type { ArtworkDraft, StoredArtwork } from "./types";
interface MuseumDB extends DBSchema { artworks: { key: string; value: StoredArtwork } }
function database() { return openDB<MuseumDB>("bbf-museum", 1, { upgrade(db) { if (!db.objectStoreNames.contains("artworks")) db.createObjectStore("artworks", { keyPath: "id" }); } }); }
export const artworkRepository = {
  async list(): Promise<StoredArtwork[]> { const db = await database(); try { return (await db.getAll("artworks")).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); } finally { db.close(); } },
  async get(id: string) { const db = await database(); try { return await db.get("artworks", id); } finally { db.close(); } },
  async save(draft: ArtworkDraft, id: string): Promise<StoredArtwork> {
    if (!draft.petImage || !draft.objectImage) throw new Error("Agrega las dos fotografías para continuar.");
    const artwork: StoredArtwork = { id, petName: draft.petName.trim(), age: draft.age, title: draft.title.trim(), description: draft.description.trim(), petImage: draft.petImage, objectImage: draft.objectImage, createdAt: new Date().toISOString() };
    const db = await database(); try { await db.put("artworks", artwork); } finally { db.close(); } return artwork;
  },
};
