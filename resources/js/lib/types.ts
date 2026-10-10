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
export type ArtworkDraft = Pick<Artwork, "petName" | "age" | "title" | "description"> & { petImage: File | null; objectImage: File | null };
