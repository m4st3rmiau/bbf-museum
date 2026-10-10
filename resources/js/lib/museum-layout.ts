export type Vec3 = [number, number, number];
export interface Pose { x: number; z: number; yaw: number; pitch: number }

export const ROOM_SIZE = 8;
export const CENTRAL_ID = "central";
export const EYE_HEIGHT = 1.65;

// Entrance at +z. The hero exhibit sits in the middle of the room and the four-per-wall pedestals flank it.
export const HALL = { halfWidth: 5.9, front: 9, back: -9, height: 5.9 };
export const PEDESTAL_X = 5.2;
export const PEDESTAL_ROWS = [2.1, -.3, -2.7, -5.1];
export const HERO = { position: [0, 0, -1.5] as Vec3, halfWidth: 2.68, halfDepth: 2.38 };
export const WALK = { minX: -3.9, maxX: 3.9, minZ: -6.3, maxZ: 7.8 };
export const START: Pose = { x: 0, z: 7.4, yaw: 0, pitch: -0.03 };

// Keep the visitor outside the hero platform (plus a margin); pushes out along the shallowest axis.
export function avoidHero(x: number, z: number, margin = .45): [number, number] {
  const hx = HERO.halfWidth + margin, hz = HERO.halfDepth + margin, dz = z - HERO.position[2];
  if (Math.abs(x) >= hx || Math.abs(dz) >= hz) return [x, z];
  return hx - Math.abs(x) < hz - Math.abs(dz) ? [(x < 0 ? -1 : 1) * hx, z] : [x, HERO.position[2] + (dz < 0 ? -1 : 1) * hz];
}
// Straight path unless it would cross the hero platform; then detour along the nearer side aisle.
export function walkPath(from: Pose, to: Pose): [number, number][] {
  const crosses = Array.from({ length: 25 }, (_, i) => i / 24).some(t => { const x = from.x + (to.x - from.x) * t, z = from.z + (to.z - from.z) * t; return Math.abs(x) < HERO.halfWidth + .6 && Math.abs(z - HERO.position[2]) < HERO.halfDepth + .6; });
  if (!crosses) return [[from.x, from.z], [to.x, to.z]];
  const side = (from.x || to.x) < 0 ? -1 : 1, lane = side * Math.min(WALK.maxX - .25, HERO.halfWidth + .75);
  return [[from.x, from.z], [lane, from.z], [lane, to.z], [to.x, to.z]];
}

export const BACK_X = [-2.7, -.9, .9, 2.7];
export const BACK_Z = HALL.back + 1.1;
// Each room presents eight works: four along each side wall.
export const pedestalPositions: { position: Vec3; rotation: number }[] = Array.from({ length: ROOM_SIZE }, (_, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  return { position: [side * PEDESTAL_X, 0, PEDESTAL_ROWS[Math.floor(i / 2)]], rotation: side < 0 ? Math.PI / 2 : -Math.PI / 2 };
});

function poseLooking(x: number, z: number, target: Vec3): Pose {
  const dx = target[0] - x, dz = target[2] - z;
  return { x, z, yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(target[1] - EYE_HEIGHT, Math.hypot(dx, dz)) };
}
export function focusPose(index: number): Pose {
  const { position: [x, , z], rotation } = pedestalPositions[index];
  return poseLooking(x + Math.sin(rotation) * 2.5, z + Math.cos(rotation) * 2.5, [x, 1.5, z]);
}
export function heroPose(): Pose { return poseLooking(0, HERO.position[2] + 6.8, [0, 2.85, HERO.position[2]]); }
// World position of an info button: "central" or "slot-<pedestal index>".
export function hotspotPosition(key: string): Vec3 | null {
  if (key === CENTRAL_ID) return [HERO.position[0], 5.35, HERO.position[2]];
  const slot = pedestalPositions[Number(key.replace("slot-", ""))];
  return slot ? [slot.position[0], 2.7, slot.position[2]] : null;
}
