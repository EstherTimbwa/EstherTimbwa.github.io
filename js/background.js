/*
  Fixed WebGL background: a perspective grid floor drifting toward the camera
  and a rotating wireframe sphere. The camera and sphere move between one
  keyframe per scene, driven by setProgress(), so the space never cuts.
*/
import * as THREE from 'three';

const ACCENT = 0x7de3f4;
const MUTED = 0xb4becb;
const BG = 0x07090d;

/*
  One keyframe per scene, in scene order. Units are world units; the sphere has
  radius ~1.6 at scale 1. rot is an extra orientation layered on the constant spin.
*/
const KEYFRAMES = [
  // 01 intro: sphere sits right of the headline
  { cam: [0, 1.2, 8], look: [0, 1.0, 0], pos: [3.7, 1.6, -0.8], scale: 1.0, rot: [0, 0, 0] },
  // 02 work: camera lifts, sphere drifts up and back behind the heading
  { cam: [-1.4, 2.4, 9], look: [0, 0.5, 0], pos: [3.4, 2.6, -3.5], scale: 0.75, rot: [0.7, 1.4, 0] },
  // 03 experience: camera swings right, sphere crosses to the left and grows
  { cam: [1.6, 0.9, 7.2], look: [0, 0.6, 0], pos: [-3.6, 1.9, -4], scale: 1.35, rot: [1.3, 2.6, 0.3] },
  // 04 skills: high wide shot, large sphere centred far back like a horizon object
  { cam: [0, 3.4, 9.5], look: [0, 0.4, -2], pos: [0, 1.6, -8], scale: 2.6, rot: [0.4, 3.6, 0.6] },
  // 05 education: low and close, sphere returns to the right
  { cam: [-2, 0.7, 7.4], look: [0, 0.8, 0], pos: [4.6, 2.5, -3.5], scale: 0.85, rot: [1.8, 4.4, 0] },
  // 06 contact: settle in, sphere large and calm on the right
  { cam: [0, 0.8, 6.6], look: [0, 1, 0], pos: [2.6, 1.3, -1], scale: 1.45, rot: [0.2, 5.6, 0] },
];

const QUALITY = {
  full: { dpr: 2, gridStep: 2, gridHalfWidth: 60, gridDepth: 90, particles: 700, detail: 3, parallax: true },
  light: { dpr: 1.5, gridStep: 3.2, gridHalfWidth: 40, gridDepth: 60, particles: 220, detail: 2, parallax: false },
};

const smooth = (t) => t * t * (3 - 2 * t);
const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export function initBackground({ container, quality = 'full', onFallback }) {
  let q = QUALITY[quality] ?? QUALITY.full;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (err) {
    onFallback?.('webgl-init');
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.dpr));
  renderer.setClearColor(BG, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 6, 42);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);

  /* ---------- grid floor ---------- */
  const grid = buildGrid(q);
  scene.add(grid);

  /* ---------- sphere group ---------- */
  const sphere = new THREE.Group();
  const spin = new THREE.Group(); // constant rotation lives here
  sphere.add(spin);

  const outer = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.6, q.detail)),
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.5 })
  );
  const inner = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(1.05, 18, 12)),
    new THREE.LineBasicMaterial({ color: MUTED, transparent: true, opacity: 0.16 })
  );
  spin.add(outer, inner);

  const ringCurve = new THREE.EllipseCurve(0, 0, 2.5, 2.5, 0, Math.PI * 2);
  const ring = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(ringCurve.getPoints(160)),
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.28 })
  );
  ring.rotation.x = Math.PI * 0.42;
  ring.rotation.y = 0.25;
  sphere.add(ring);

  // a small node that travels around the ring
  const node = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 10, 8),
    new THREE.MeshBasicMaterial({ color: ACCENT })
  );
  ring.add(node);

  scene.add(sphere);

  /* ---------- dust ---------- */
  const dust = buildDust(q.particles);
  scene.add(dust);

  /* ---------- state ---------- */
  const current = fromKeyframe(KEYFRAMES[0]);
  const target = fromKeyframe(KEYFRAMES[0]);
  const lookAt = new THREE.Vector3();
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  let progress = 0;
  let running = false;
  let rafId = 0;
  let last = performance.now();
  let elapsed = 0;

  /* ---------- sizing ---------- */
  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // narrow screens: pull the camera back so the sphere stays in frame
    camera.fov = camera.aspect < 0.8 ? 64 : 50;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- mouse parallax (fine pointers only) ---------- */
  const fine = window.matchMedia('(pointer: fine)').matches;
  function onPointer(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }
  if (q.parallax && fine) window.addEventListener('pointermove', onPointer, { passive: true });

  /* ---------- keyframe interpolation ---------- */
  function computeTarget() {
    const max = KEYFRAMES.length - 1;
    const p = Math.min(Math.max(progress, 0), max);
    const i = Math.min(Math.floor(p), max - 1);
    const t = smooth(p - i);
    const a = KEYFRAMES[i];
    const b = KEYFRAMES[i + 1];
    for (const key of ['cam', 'look', 'pos', 'rot']) {
      for (let k = 0; k < 3; k++) target[key][k] = a[key][k] + (b[key][k] - a[key][k]) * t;
    }
    target.scale = a.scale + (b.scale - a.scale) * t;
  }

  /* ---------- performance probe ---------- */
  // After a short warm-up, average ~90 frames. Too slow on full: drop to light.
  // Still too slow on light: hand over to the static CSS background.
  const probe = { frames: 0, time: 0, warm: 0, done: false };
  function checkPerformance(dt) {
    if (probe.done) return;
    if (probe.warm < 1) { probe.warm += dt; return; }
    probe.frames++;
    probe.time += dt;
    if (probe.frames < 90) return;
    const fps = probe.frames / probe.time;
    if (q === QUALITY.full && fps < 45) {
      q = QUALITY.light;
      renderer.setPixelRatio(1);
      dust.visible = false;
      Object.assign(probe, { frames: 0, time: 0, warm: 0 });
    } else if (fps < 28) {
      probe.done = true;
      onFallback?.('slow');
    } else {
      probe.done = true;
    }
  }

  /* ---------- loop ---------- */
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    update(dt);
    checkPerformance(dt);
  }

  function update(dt) {
    elapsed += dt;

    computeTarget();
    for (const key of ['cam', 'look', 'pos', 'rot']) {
      for (let k = 0; k < 3; k++) current[key][k] = damp(current[key][k], target[key][k], 3.2, dt);
    }
    current.scale = damp(current.scale, target.scale, 3.2, dt);

    mouse.sx = damp(mouse.sx, mouse.x, 2.5, dt);
    mouse.sy = damp(mouse.sy, mouse.y, 2.5, dt);

    camera.position.set(current.cam[0] + mouse.sx * 0.45, current.cam[1] - mouse.sy * 0.3, current.cam[2]);
    lookAt.set(current.look[0], current.look[1], current.look[2]);
    camera.lookAt(lookAt);

    sphere.position.set(current.pos[0], current.pos[1], current.pos[2]);
    sphere.scale.setScalar(current.scale);
    sphere.rotation.set(current.rot[0], current.rot[1], current.rot[2]);

    spin.rotation.y = elapsed * 0.16;
    spin.rotation.x = elapsed * 0.05;
    inner.rotation.y = -elapsed * 0.22;
    ring.rotation.z = elapsed * 0.08;
    const a = elapsed * 0.7;
    node.position.set(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0);

    // grid drifts toward the camera; wrap by one cell so it is seamless
    grid.position.z = (elapsed * 0.6) % q.gridStep;
    dust.rotation.y = elapsed * 0.01;

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }
  document.addEventListener('visibilitychange', onVisibility);

  function dispose() {
    stop();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
    scene.traverse((obj) => {
      obj.geometry?.dispose();
      obj.material?.dispose();
    });
    renderer.dispose();
    renderer.domElement.remove();
  }

  // snap to the starting keyframe, render once, then run
  computeTarget();
  if (!document.hidden) start();

  return {
    /** progress: continuous scene index, 0 = first scene, 1 = second, ... */
    setProgress(value) { progress = value; },
    /** jump without easing (e.g. on load mid-page) */
    snap() {
      computeTarget();
      for (const key of ['cam', 'look', 'pos', 'rot']) current[key] = [...target[key]];
      current.scale = target.scale;
    },
    /** step the scene manually (debugging, e.g. when the tab is hidden) */
    advance(seconds = 1) {
      for (let s = 0; s < seconds; s += 1 / 60) update(1 / 60);
    },
    canvas: renderer.domElement,
    dispose,
  };
}

/* ---------- builders ---------- */

function fromKeyframe(k) {
  return { cam: [...k.cam], look: [...k.look], pos: [...k.pos], rot: [...k.rot], scale: k.scale };
}

function buildGrid({ gridStep: step, gridHalfWidth: half, gridDepth: depth }) {
  const y = -2.2;
  const near = 14; // extends past the camera so wrapping never shows an edge
  const points = [];
  // lines across the view (these appear to move toward the camera)
  for (let z = near; z >= -depth; z -= step) points.push(-half, y, z, half, y, z);
  // lines running into the distance
  for (let x = -half; x <= half; x += step) points.push(x, y, near, x, y, -depth);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.15 })
  );
}

function buildDust(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 14 - 1.4;
    positions[i * 3 + 2] = -Math.random() * 40 + 6;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: MUTED, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false })
  );
}
