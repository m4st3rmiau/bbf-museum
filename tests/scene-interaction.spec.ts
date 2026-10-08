import { expect, test, type Page } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
import { START } from "../src/lib/museum-layout";

const hotspot = (page: Page, key: string) => page.locator(`[data-hotspot="${key}"]`).evaluate(el => (el as HTMLElement).style.transform);

test("arrow keys walk and turn through the hall, wheel walks too", async ({ page }) => {
  await page.goto("/galeria", { waitUntil: "networkidle" });
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByText("Camina con las flechas", { exact: false })).toBeVisible();
  await page.waitForTimeout(800);
  const start = await hotspot(page, "slot-0");
  await page.keyboard.down("ArrowUp"); await page.waitForTimeout(900); await page.keyboard.up("ArrowUp");
  await expect.poll(() => hotspot(page, "slot-0")).not.toBe(start);
  await expect(page.getByText("Camina con las flechas", { exact: false })).toBeHidden();
  const walked = await hotspot(page, "slot-0");
  await page.keyboard.down("ArrowLeft"); await page.waitForTimeout(500); await page.keyboard.up("ArrowLeft");
  await expect.poll(() => hotspot(page, "slot-0")).not.toBe(walked);
  const turned = await hotspot(page, "slot-0");
  await page.locator("canvas").hover(); await page.mouse.wheel(0, -400);
  await expect.poll(() => hotspot(page, "slot-0")).not.toBe(turned);
});

test("clicking the actual 3D pedestal focuses it and its info panel opens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/galeria", { waitUntil: "networkidle" });
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect.poll(async () => (await canvas.boundingBox())?.width).toBe(page.viewportSize()!.width);
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Canvas missing");
  const camera = new PerspectiveCamera(bounds.width < 700 ? 70 : 58, bounds.width / bounds.height, .1, 90);
  camera.position.set(START.x, 1.65, START.z); camera.rotation.order = "YXZ"; camera.rotation.set(START.pitch, START.yaw, 0); camera.updateMatrixWorld();
  // Front face of the first pedestal (left wall, nearest the entrance), at plaque height near its top.
  const vector = new Vector3(-4.83, 1.32, 2.1).project(camera);
  await page.waitForTimeout(800);
  await canvas.click({ position: { x: (vector.x + 1) / 2 * bounds.width, y: (1 - vector.y) / 2 * bounds.height } });
  await expect(page.getByRole("dialog")).toContainText("Una pelota, mil aventuras");
  await page.screenshot({ path: test.info().outputPath("pedestal-focus.png") });
  await page.getByRole("button", { name: "Cerrar detalle" }).click();
  await expect(page.getByLabel("Buscar por obra o mascota")).toBeVisible();
});

test("empty pedestals invite the visitor to exhibit their own work", async ({ page }) => {
  await page.goto("/galeria", { waitUntil: "networkidle" });
  await expect(page.locator("canvas")).toBeVisible();
  const add = page.getByRole("link", { name: "Exhibir tu obra en este pedestal" });
  await expect(add).toHaveCount(6);
  await add.first().evaluate(el => (el as HTMLElement).click());
  await expect(page).toHaveURL(/\/exhibir$/);
});
