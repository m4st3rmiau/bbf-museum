export interface Artwork {
  id: string;
  petName: string;
  age: string;
  title: string;
  description: string;
  petImage: string;
  objectImage: string;
  createdAt: string;
  demo?: boolean;
}
export type ArtworkDraft = Pick<Artwork, "petName" | "age" | "title" | "description"> & { petImage: Blob | null; objectImage: Blob | null };
export interface StoredArtwork extends Omit<Artwork, "petImage" | "objectImage"> { petImage: Blob; objectImage: Blob }
export type FocusTarget = "pedestal" | "plaque" | "pet" | "object";
export interface Selection { id: string; target: FocusTarget }
