import { z } from "zod";
export const artworkSchema = z.object({
  petName: z.string().trim().min(1, "Escribe el nombre de tu mejor amigo.").max(60, "Usa hasta 60 caracteres."),
  age: z.string().trim().min(1, "Escribe su edad.").refine(value => /^\d{1,2}([.,]\d)?$/.test(value) && Number(value.replace(",", ".")) <= 50, "Escribe una edad entre 0 y 50 años."),
  title: z.string().trim().min(1, "Dale un nombre a su obra.").max(80, "Usa hasta 80 caracteres."),
  description: z.string().trim().min(1, "Cuéntanos la historia de este objeto.").max(800, "Usa hasta 800 caracteres."),
});
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre.").max(100),
  email: z.email("Escribe un correo electrónico válido."),
  phone: z.string().refine(value => !value || /^[+\d\s()-]{7,25}$/.test(value), "Revisa el número de teléfono."),
  interest: z.enum(["yes", "later", "gallery"], { error: "Selecciona una opción." }),
});
export type ArtworkFields = z.infer<typeof artworkSchema>;
export type ContactFields = z.infer<typeof contactSchema>;
