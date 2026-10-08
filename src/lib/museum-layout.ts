import type { FocusTarget } from "./types";
export type Vec3 = [number, number, number];
export const ROOM_SIZE = 8;
export const pedestalPositions: { position: Vec3; rotation: number }[] = [
  { position: [-5.4, 0, 2.8], rotation: Math.PI / 2 },
  { position: [5.4, 0, 2.8], rotation: -Math.PI / 2 },
  { position: [-5.4, 0, -.5], rotation: Math.PI / 2 },
  { position: [5.4, 0, -.5], rotation: -Math.PI / 2 },
  { position: [-5.4, 0, -3.8], rotation: Math.PI / 2 },
  { position: [5.4, 0, -3.8], rotation: -Math.PI / 2 },
  { position: [-2.7, 0, -5.5], rotation: 0 },
  { position: [2.7, 0, -5.5], rotation: 0 },
];
// All waypoints follow the visitor aisle outside the central exhibit's radius.
export const tourStops: { position: Vec3; lookAt: Vec3; label: string }[] = [
  { position: [0, 3.3, 9.3], lookAt: [0, 1.3, -1.5], label: "La sala" },
  { position: [-3.05, 2.3, 4.7], lookAt: [-5.4, 1.65, 1], label: "Ala izquierda" },
  { position: [-3.05, 2.3, -1.4], lookAt: [-5.4, 1.65, -3.8], label: "Los recuerdos" },
  { position: [0, 2.5, -4.1], lookAt: [0, 1.65, -.7], label: "La huella" },
  { position: [3.05, 2.3, -1.4], lookAt: [5.4, 1.65, -3.8], label: "Las historias" },
  { position: [3.05, 2.3, 4.7], lookAt: [5.4, 1.65, 1], label: "Ala derecha" },
];
export function focusPose(index: number, target: FocusTarget, aspect: number) {
  const { position: [x, , z], rotation } = pedestalPositions[index];
  const forward: Vec3 = [Math.sin(rotation), 0, Math.cos(rotation)];
  const right: Vec3 = [Math.cos(rotation), 0, -Math.sin(rotation)];
  const y = target === "plaque" ? 1.06 : target === "pedestal" ? 1.6 : 2.4;
  const lateral = target === "pet" ? -.44 : target === "object" ? .44 : 0;
  const offset = target === "plaque" ? .69 : .12;
  const lookAt: Vec3 = [x + right[0] * lateral + forward[0] * offset, y, z + right[2] * lateral + forward[2] * offset];
  const distance = target === "pedestal" ? 3.1 : target === "plaque" ? Math.min(2.7, Math.max(1.8, 1.2 / aspect)) : Math.min(2.7, Math.max(1.85, 1.1 / aspect));
  const position: Vec3 = [lookAt[0] + forward[0] * distance, y + (target === "pedestal" ? .55 : .12), lookAt[2] + forward[2] * distance];
  return { position, lookAt };
}
// Route through safe front/side/rear aisles instead of crossing the center.
export function aisleRoute(from: Vec3, to: Vec3): Vec3[] {
  const segmentNearCenter = (a: Vec3, b: Vec3) => {
    const ax = a[0], az = a[2] + .7, dx = b[0] - ax, dz = b[2] - a[2];
    const t = Math.max(0, Math.min(1, -(ax * dx + az * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(ax + dx * t, az + dz * t) < 2.35;
  };
  if (!segmentNearCenter(from, to)) return [to];
  const side = from[0] < -.4 ? -3.05 : from[0] > .4 ? 3.05 : to[0] < 0 ? -3.05 : 3.05;
  const nearBack = from[2] < -2.7 && to[2] < 1;
  const z = nearBack ? -4.1 : 4.7;
  const route: Vec3[] = [[side, Math.max(from[1], 2.3), from[2]], [side, 2.5, z]];
  if (Math.sign(to[0]) !== Math.sign(side) && Math.abs(to[0]) > .4) route.push([to[0] < 0 ? -3.05 : 3.05, 2.5, z]);
  route.push([to[0], Math.max(to[1], 2.3), z], to);
  return route;
}
