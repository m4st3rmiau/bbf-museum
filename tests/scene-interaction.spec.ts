import { expect, test } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
import { focusPose } from "../src/lib/museum-layout";

test("clicking the actual 3D plaque and photo selects the correct detail through glass", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/galeria?obra=demo-milo", { waitUntil: "networkidle" });
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.getByRole("button", { name: "Leer su historia" })).toBeVisible();
  await expect.poll(async () => (await canvas.boundingBox())?.width).toBe(page.viewportSize()!.width);
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Canvas missing");
  const pose = focusPose(0, "pedestal", bounds.width / bounds.height);
  const camera = new PerspectiveCamera(bounds.width < 700 ? 65 : 51, bounds.width / bounds.height, .1, 60);
  camera.position.set(...pose.position); camera.lookAt(...pose.lookAt); camera.updateMatrixWorld();
  const point = (position: [number, number, number]) => { const vector = new Vector3(...position).project(camera); return { x: (vector.x + 1) / 2 * bounds.width, y: (1 - vector.y) / 2 * bounds.height }; };
  await page.screenshot({ path: test.info().outputPath("before-plaque.png") });
  await canvas.click({ position: point([-4.709, 1.06, 2.8]) });
  await expect(page.getByRole("dialog")).toContainText("Una pelota, mil aventuras");
  await expect(page.getByRole("dialog")).toContainText("Vista cercana de la placa.");
  await page.getByRole("button", { name: "Cerrar detalle" }).click();
  await canvas.click({ position: point([-5.267, 2.41, 3.23]) });
  await expect(page.getByRole("dialog")).toContainText("Vista cercana de la fotografía.");
  await page.screenshot({ path: test.info().outputPath("photo-focus.png") });
});
