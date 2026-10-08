import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function fillArtwork(page: Page) {
  await page.goto("/exhibir");
  await page.getByLabel("Archivo: Tu mejor amigo", { exact: true }).setInputFiles(path.join(process.cwd(), "public/images/dog-1.jpg"));
  await page.getByLabel("Archivo: Su objeto especial", { exact: true }).setInputFiles(path.join(process.cwd(), "public/images/ball.jpg"));
  await page.getByLabel("Nombre de tu mejor amigo").fill("Coco");
  await page.getByLabel("Edad cuando partió").fill("12");
  await page.getByLabel("¿Cómo llamarías a su obra?").fill("La pelota de Coco");
  await page.getByLabel("La historia detrás del objeto").fill("Su pelota nos acompañó cada tarde al parque. Siempre estará con nosotros.");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page).toHaveURL(/exhibir\/datos/);
}

test("register, go back, save locally, focus work, reload and protect contact data", async ({ page }) => {
  await fillArtwork(page);
  await page.getByLabel("Tu nombre", { exact: true }).fill("Ana Pérez");
  await page.getByLabel("Correo electrónico").fill("ana@example.com");
  await page.getByRole("link", { name: "Volver", exact: true }).click();
  await expect(page.getByLabel("Nombre de tu mejor amigo")).toHaveValue("Coco");
  await expect(page.getByAltText("Vista previa de tu mascota")).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByLabel("Tu nombre", { exact: true })).toHaveValue("Ana Pérez");
  await page.getByRole("button", { name: "Exhibir su obra", exact: true }).click();
  await expect(page).toHaveURL(/\/gracias\/[a-f0-9-]+/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Coco");
  const record = await page.evaluate(async () => new Promise<Record<string, unknown>[]>((resolve, reject) => { const req = indexedDB.open("bbf-museum", 1); req.onerror = () => reject(req.error); req.onsuccess = () => { const db = req.result; const get = db.transaction("artworks").objectStore("artworks").getAll(); get.onsuccess = () => { resolve(get.result.map(({ petImage, objectImage, ...rest }) => ({ ...rest, blobs: petImage instanceof Blob && objectImage instanceof Blob }))); db.close(); }; }; }));
  expect(record).toHaveLength(1); expect(record[0].blobs).toBe(true); expect(JSON.stringify(record)).not.toContain("ana@example.com"); expect(JSON.stringify(record)).not.toContain("Ana Pérez");
  await page.reload(); await expect(page.getByRole("heading", { level: 1 })).toContainText("Coco");
  await page.getByRole("link", { name: "Ver mi obra", exact: true }).click();
  await expect(page).toHaveURL(/galeria\?obra=/);
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Leer su historia", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("La pelota de Coco");
  await page.getByRole("button", { name: "Ampliar foto de Coco" }).click();
  await expect(page.getByRole("dialog").last().getByAltText("Coco")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Cerrar detalle" }).click();
  await expect(page.getByRole("button", { name: "Leer su historia", exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Vista de tarjetas" }).click();
  await expect(page.getByRole("button", { name: "Ver obra: La pelota de Coco" })).toBeVisible();
});

test("required fields, invalid images, and contact validation", async ({ page }) => {
  await page.goto("/exhibir");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByText("Escribe el nombre de tu mejor amigo.")).toBeVisible();
  await expect(page.getByText("Agrega esta fotografía.")).toHaveCount(2);
  await page.getByLabel("Archivo: Tu mejor amigo", { exact: true }).setInputFiles({ name: "broken.jpg", mimeType: "image/jpeg", buffer: Buffer.from("not an image") });
  await expect(page.getByText("No pudimos abrir esta imagen. Intenta con otra fotografía.")).toBeVisible();
  await page.getByLabel("Archivo: Tu mejor amigo", { exact: true }).setInputFiles({ name: "large.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await expect(page.getByText("La fotografía debe pesar menos de 10 MB.")).toBeVisible();
  await page.getByLabel("Archivo: Tu mejor amigo", { exact: true }).setInputFiles({ name: "file.txt", mimeType: "text/plain", buffer: Buffer.from("text") });
  await expect(page.getByText("Elige una imagen JPG, PNG o WebP.")).toBeVisible();
  await fillArtwork(page);
  await page.getByRole("button", { name: "Exhibir su obra", exact: true }).click();
  await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
  await expect(page.getByText("Escribe un correo electrónico válido.")).toBeVisible();
});

test("search, detail, navigation and missing work", async ({ page }) => {
  await page.goto("/galeria");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Posición siguiente" }).click();
  await expect(page.getByText("Ala izquierda", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Vista de tarjetas" }).click();
  await expect(page.getByRole("button", { name: /^Ver obra:/ })).toHaveCount(6);
  await page.getByLabel("Buscar por mascota o título").fill("miló");
  await expect(page.getByRole("button", { name: /^Ver obra:/ })).toHaveCount(1);
  await page.getByRole("button", { name: "Ver obra: Una pelota, mil aventuras" }).click();
  await expect(page.getByRole("dialog")).toContainText("12 años de amor");
  await page.getByRole("button", { name: "Cerrar detalle" }).click();
  await page.getByLabel("Buscar por mascota o título").fill("xxxxxxxx");
  await expect(page.getByText("No encontramos obras para", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Ver todas las obras" }).click();
  await expect(page.getByRole("button", { name: /^Ver obra:/ })).toHaveCount(6);
  await page.goto("/galeria?obra=missing");
  await expect(page.getByText("Esta obra no está en este navegador.", { exact: false })).toBeVisible();
  await page.goto("/gracias/missing");
  await expect(page.getByRole("heading", { name: "No encontramos esta obra." })).toBeVisible();
});

test("fallback without WebGL, unavailable storage and safe direct access", async ({ page }) => {
  await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) { if (type.startsWith("webgl")) return null; return original.apply(this, [type, ...args] as Parameters<typeof original>); } as typeof original; });
  await page.goto("/galeria");
  await expect(page.getByRole("button", { name: /^Ver obra:/ })).toHaveCount(6);
  await expect(page.getByText("Tu navegador no puede mostrar la sala 3D.", { exact: false })).toBeVisible();
  await page.goto("/exhibir/datos");
  await expect(page.getByRole("link", { name: "Crear su obra" })).toBeVisible();
  await page.addInitScript(() => { indexedDB.open = () => { throw new Error("blocked"); }; });
  await fillArtwork(page);
  await page.getByLabel("Tu nombre", { exact: true }).fill("Ana");
  await page.getByLabel("Correo electrónico").fill("ana@example.com");
  await page.getByRole("button", { name: "Exhibir su obra", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "No pudimos guardar" })).toBeVisible();
  await expect(page.getByLabel("Tu nombre", { exact: true })).toHaveValue("Ana");
});

test("groups beyond eight and direct-link selection in a later group", async ({ page }) => {
  await page.goto("/galeria");
  await expect(page.getByText("6 historias · Grupo 1/1")).toBeVisible();
  await page.evaluate(async () => {
    const image = await (await fetch("/images/dog-1.jpg")).blob();
    await new Promise<void>((resolve, reject) => { const req = indexedDB.open("bbf-museum", 1); req.onerror = () => reject(req.error); req.onsuccess = () => { const db = req.result; const tx = db.transaction("artworks", "readwrite"); for (let i = 0; i < 10; i++) tx.objectStore("artworks").put({ id: `local-${i}`, petName: `Amigo ${i}`, age: "10", title: `Historia ${i}`, description: "Un recuerdo para siempre.", petImage: image, objectImage: image, createdAt: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z` }); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error); }; });
  });
  await page.goto("/galeria?obra=local-0");
  await expect(page.getByText("16 historias · Grupo 2/2")).toBeVisible();
  await page.getByRole("button", { name: "Leer su historia", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Historia 0");
  await page.getByRole("button", { name: "Cerrar detalle" }).click();
  await page.getByRole("button", { name: "Grupo anterior" }).click();
  await expect(page.getByText("16 historias · Grupo 1/2")).toBeVisible();
});

test("no horizontal overflow on key screens", async ({ page }) => {
  for (const route of ["/", "/exhibir", "/galeria", "/gracias/missing", "/creditos"]) {
    await page.goto(route); await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});
