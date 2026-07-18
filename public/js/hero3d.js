/* CarthaBot 3D viewer — the REAL robot model (from the Companion app's Blender
   pipeline, Draco-compressed) lives in a CONTAINED, interactive stage in the
   hero: it gently auto-rotates and kids can DRAG to spin it. The LED halo under
   it recolours when a mode is picked. Loaded lazily; the SVG mascot covers the
   gap. Robust — no scroll coupling, no full-window canvas. */
import * as THREE from 'three';
import { GLTFLoader } from '/lib/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/lib/jsm/loaders/DRACOLoader.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FOV = 35;

let renderer, scene, camera, robot, halo, haloMat, glow, viewer, canvas, placeholderEl, hintEl;
let running = false;

// interaction
let dragging = false, lastX = 0, lastY = 0;
let velYaw = 0;                 // spin momentum from a drag
let yaw = 0, pitch = 0.05;      // current orientation (added to the model's base pose)
let interacted = false;

export function start() {
  canvas = document.getElementById('stage');
  viewer = document.getElementById('viewer');
  placeholderEl = document.getElementById('stagePlaceholder');
  hintEl = document.getElementById('viewerHint');
  if (!canvas || !viewer || !window.WebGLRenderingContext) return;

  const w = viewer.clientWidth || 480;
  const h = viewer.clientHeight || 380;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 200);
  camera.position.set(0, 7, 20);      // raised product-shot angle: shows the top + sides
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(6, 10, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc7d2fe, 0.9);
  fill.position.set(-8, -2, 6);
  scene.add(fill);
  glow = new THREE.PointLight(0xf7941c, 0, 26);
  glow.position.set(0, -3, 4);
  scene.add(glow);

  const draco = new DRACOLoader();
  draco.setDecoderPath('/lib/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  // bump ?v= whenever the model changes — /assets/ is cached immutable
  loader.load('/assets/carthabot.glb?v=6', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const s = 11 / Math.max(size.x, size.y, size.z);
    model.position.sub(centre).multiplyScalar(s);
    model.scale.setScalar(s);
    model.rotation.y = -0.6;                     // start on a front corner; group yaw = turntable

    robot = new THREE.Group();
    robot.add(model);

    haloMat = new THREE.MeshBasicMaterial({
      color: 0xf7941c, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
    });
    halo = new THREE.Mesh(new THREE.RingGeometry(5.0, 7.0, 56), haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -4.8;
    robot.add(halo);
    glow.color.set(0xf7941c);
    glow.intensity = 55;

    scene.add(robot);
    window.__cartha = { get robot() { return robot; }, get renderer() { return renderer; }, reduced };
    if (placeholderEl) placeholderEl.classList.add('is-hidden');
    running = true;
    render();
    if (!reduced) requestAnimationFrame(tick);
  }, undefined, (err) => console.warn('CarthaBot model failed to load', err));

  bindDrag();
  window.addEventListener('resize', onResize);
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(viewer);
  window.addEventListener('cartha-mode', (e) => {
    if (!haloMat) return;
    const c = new THREE.Color(e.detail.color);
    haloMat.color.copy(c);
    glow.color.copy(c);
    velYaw += 0.12;                              // a little happy spin
    if (reduced) render();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && running && !reduced) requestAnimationFrame(tick);
  });
}

function bindDrag() {
  const dampHint = () => {
    if (interacted) return;
    interacted = true;
    if (hintEl) hintEl.classList.add('is-gone');
  };
  const down = (e) => {
    dragging = true; velYaw = 0;
    lastX = (e.touches ? e.touches[0].clientX : e.clientX);
    lastY = (e.touches ? e.touches[0].clientY : e.clientY);
    dampHint();
    viewer.classList.add('is-grabbing');
  };
  const move = (e) => {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    const dx = x - lastX, dy = y - lastY;
    lastX = x; lastY = y;
    yaw += dx * 0.01;
    pitch = Math.max(-0.6, Math.min(0.6, pitch + dy * 0.006));
    velYaw = dx * 0.01;
    render();                        // respond instantly, independent of the idle loop
  };
  const up = () => { dragging = false; viewer.classList.remove('is-grabbing'); };

  canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture?.(e.pointerId); down(e); });
  canvas.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  // hover hint
  viewer.addEventListener('mouseenter', () => { if (!interacted && hintEl) hintEl.classList.add('is-pulse'); });
}

function render() {
  if (robot) {
    robot.rotation.y = yaw + Math.PI * 0.0;   // yaw drives the group; base pose is on the model
    robot.rotation.x = pitch;
  }
  renderer.render(scene, camera);
}

let last = 0;
function tick(now) {
  if (document.hidden) return;
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;

  if (robot) {
    if (!dragging) {
      yaw += velYaw;                    // momentum from the last drag
      velYaw *= 0.94;                   // decays
      if (Math.abs(velYaw) < 0.0016) {  // then idle auto-spin
        yaw += dt * 0.35;
        velYaw = 0;
      }
    }
    robot.rotation.y = yaw;
    robot.rotation.x += (pitch - robot.rotation.x) * Math.min(1, dt * 6);
    robot.position.y = Math.sin(now / 1100) * 0.18;   // gentle float
    if (haloMat) haloMat.opacity = 0.42 + Math.sin(now / 480) * 0.12;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function onResize() {
  if (!renderer || !viewer) return;
  const w = viewer.clientWidth || 480;
  const h = viewer.clientHeight || 380;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (reduced && running) render();
}
