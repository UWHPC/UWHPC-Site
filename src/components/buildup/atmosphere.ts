import * as THREE from "three";
import { SERVER_FLOOR_Y } from "./poses";

export function buildAtmosphere(scene: THREE.Scene, sweepPosition: THREE.Vector3, mobile: boolean) {
  function floorPool(width: number, length: number, y: number, z: number, color: string) {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { color: { value: new THREE.Color(color) }, strength: { value: 0 } },
      vertexShader: `
        varying vec2 floorUv;
        void main() {
          floorUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 color;
        uniform float strength;
        varying vec2 floorUv;
        void main() {
          vec2 center = (floorUv - 0.5) * 2.0;
          float falloff = 1.0 - smoothstep(0.0, 1.0, dot(center, center));
          gl_FragColor = vec4(color, falloff * falloff * strength);
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, length), material);
    mesh.position.set(0, y, z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = -2;
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  }

  const boardPool = floorPool(580, 710, -10, -22, "#607487");
  const serverPool = floorPool(1920, 1880, SERVER_FLOOR_Y - 4, 22, "#596c84");

  const particles = new Float32Array((mobile ? 92 : 180) * 3);
  for (let i = 0; i < particles.length / 3; i++) {
    particles[i * 3] = (((i + 1) * 0.618034) % 1 - 0.5) * 1160;
    particles[i * 3 + 1] = (((i + 1) * 0.754878) % 1) * 340 + SERVER_FLOOR_Y + 45;
    particles[i * 3 + 2] = (((i + 1) * 0.569840) % 1) * 480 + 190;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(particles, 3));
  const dustMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      sweepPosition: { value: sweepPosition },
      strength: { value: 0 },
      time: { value: 0 },
      pixelRatio: { value: 1 },
    },
    vertexShader: `
      uniform vec3 sweepPosition;
      uniform float strength;
      uniform float time;
      uniform float pixelRatio;
      varying float brightness;
      void main() {
        vec3 drift = vec3(9.0 * sin(position.y + time * 0.17), 6.0 * cos(position.x + time * 0.2), 0.0);
        vec3 point = position + drift;
        vec3 delta = (point - sweepPosition) / vec3(300.0, 225.0, 305.0);
        brightness = strength * exp(-2.4 * dot(delta, delta));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
        gl_PointSize = pixelRatio * (1.6 + fract(position.x * 0.13));
      }`,
    fragmentShader: `
      varying float brightness;
      void main() {
        float edge = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5));
        gl_FragColor = vec4(0.81, 0.86, 0.95, brightness * edge);
      }`,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.visible = false;
  scene.add(dust);

  return {
    update(board: number, server: number, sweep: number, time: number, pixelRatio: number) {
      boardPool.visible = board > 0.01;
      boardPool.material.uniforms.strength.value = board * 0.24;
      serverPool.visible = server > 0.01;
      serverPool.material.uniforms.strength.value = server * 0.32;
      dust.visible = sweep > 0.01;
      dustMaterial.uniforms.strength.value = sweep * 0.36;
      dustMaterial.uniforms.time.value = time;
      dustMaterial.uniforms.pixelRatio.value = pixelRatio;
    },
    dispose() {
      boardPool.material.dispose();
      serverPool.material.dispose();
      dustMaterial.dispose();
    },
  };
}
