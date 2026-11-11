import * as THREE from "three";

/**
 * The clay look: matte, softly lit, almost no metal. One red accent, used
 * sparingly. Edges get a faint light outline so parts stay crisp against
 * the dark page.
 */

export const PALETTE = {
  body: "#2b2c30",
  deep: "#1d1e21",
  mid: "#3a3b40",
  light: "#8e9096",
  red: "#cd393c",
  silicon: "#24233a",
};

export function clay(color: string, opts: { roughness?: number } = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.82, metalness: 0.02 });
}

const edgeMaterials = new Map<number, THREE.LineBasicMaterial>();

/** Faint light edge lines on a mesh (30° crease threshold); added to it. */
export function outline(mesh: THREE.Mesh, opacity = 0.18): THREE.LineSegments {
  const key = Math.round(opacity * 1000);
  let mat = edgeMaterials.get(key);
  if (!mat) {
    mat = new THREE.LineBasicMaterial({ color: "#c8c8c8", transparent: true, opacity, depthWrite: false });
    edgeMaterials.set(key, mat);
  }
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), mat);
  lines.renderOrder = 1;
  mesh.add(lines);
  return lines;
}
