export const IMAGE_LIMIT = 10 * 1024 * 1024;
export async function prepareImage(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Elige una imagen JPG, PNG o WebP.");
  if (file.size > IMAGE_LIMIT) throw new Error("La fotografía debe pesar menos de 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url;
    try { await image.decode(); } catch { throw new Error("No pudimos abrir esta imagen. Intenta con otra fotografía."); }
    const factor = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * factor)); canvas.height = Math.max(1, Math.round(image.naturalHeight * factor));
    const context = canvas.getContext("2d"); if (!context) throw new Error("No pudimos preparar la imagen. Intenta de nuevo.");
    context.fillStyle = "#faf7f2"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("No pudimos preparar la imagen.")), "image/jpeg", 0.88));
  } finally { URL.revokeObjectURL(url); }
}
