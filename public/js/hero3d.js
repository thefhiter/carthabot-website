/* CarthaBot 3D stage — the REAL robot model (exported from the Companion app's
   Blender pipeline, Draco-compressed) lives on a fixed transparent canvas and
   travels with the page: big in the hero, parks beside the mode cards, then
   pops away. The LED halo mirrors the mode the child picks.
   Loaded lazily after first paint; the SVG mascot covers the gap. */
import * as THREE from 'three';
import { GLTFLoader } from '/lib/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/lib/jsm/loaders/DRACOLoader.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CAM_DIST = 30;
const FOV = 35;

let renderer, scene, camera, robot, halo, haloMat, glow, particles;
let heroEl, modesEl, placeholderEl;
let mouseX = 0, mouseY = 0;
let hopT = 1;            // 1 = hop finished
let spinKick = 0;        // extra yaw from a mode change
let running = false;

export function start() {
  const canvas = document.getElementById('stage');
  if (!canvas || !window.WebGLRenderingContext) return;

  heroEl = document.querySelector('.hero-stage');
  modesEl = document.querySelector('.modes-stage');
  placeholderEl = document.getElementById('stagePlaceholder');

  // antialias off + DPR cap: the clay look hides jaggies and integrated GPUs
  // must keep the full-window canvas cheap (A-grade perf on modest laptops)
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, CAM_DIST);

  scene.add(new THREE.AmbientLight(0xffffff, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(6, 10, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc7d2fe, 0.9);
  fill.position.set(-8, -4, 6);
  scene.add(fill);
  glow = new THREE.PointLight(0xf7941c, 0, 26);
  scene.add(glow);

  const draco = new DRACOLoader();
  draco.setDecoderPath('/lib/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  // bump ?v= whenever the model changes — /assets/ is cached immutable
  loader.load('/assets/carthabot.glb?v=4', (gltf) => {
    const model = gltf.scene;

    // normalise: centre the robot and scale it to a friendly world size
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const s = 10 / Math.max(size.x, size.y, size.z);
    model.position.sub(centre).multiplyScalar(s);
    model.scale.setScalar(s);

    robot = new THREE.Group();
    robot.add(model);
    // three-quarter hero pose (the raw model faces away by default)
    model.rotation.y = Math.PI * 0.82;

    // LED halo — the glowing ring kids recolour with the mode cards
    haloMat = new THREE.MeshBasicMaterial({
      color: 0xf7941c, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
    });
    halo = new THREE.Mesh(new THREE.RingGeometry(4.6, 6.4, 48), haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -4.4;
    robot.add(halo);
    glow.color.set(0xf7941c);
    glow.intensity = 60;

    scene.add(robot);
    window.__cartha = { get robot() { return robot; }, get renderer() { return renderer; }, reduced };
    if (placeholderEl) placeholderEl.classList.add('is-hidden');
    if (!reduced && window.matchMedia('(min-width: 900px)').matches) addParticles();
    running = true;
    // paint the first frame immediately — even in a hidden/background tab —
    // so the robot is there the moment the tab is shown
    placeRobot(1);
    renderer.render(scene, camera);
    if (!reduced) requestAnimationFrame(tick);
  }, undefined, (err) => console.warn('CarthaBot model failed to load', err));

  window.addEventListener('resize', onResize);
  if (!reduced) {
    window.addEventListener('pointermove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }
  window.addEventListener('cartha-mode', (e) => {
    if (!haloMat) return;
    const c = new THREE.Color(e.detail.color);
    haloMat.color.copy(c);
    glow.color.copy(c);
    hopT = 0;                       // happy hop
    spinKick = 0.9;                 // and a joyful twirl
    if (reduced && renderer) { placeRobot(1); renderer.render(scene, camera); }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && running && !reduced) requestAnimationFrame(tick);
  });
}

/* soft pastel confetti drifting up behind the robot */
function addParticles() {
  const N = 110;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const palette = [0xc4b5fd, 0xfdba74, 0x86efac, 0xf9a8d4, 0x93c5fd].map(h => new THREE.Color(h));
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 70;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 44;
    pos[i * 3 + 2] = -14 - Math.random() * 16;
    palette[i % palette.length].toArray(col, i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const cv = document.createElement('canvas');
  cv.width = cv.height = 32;
  const ctx = cv.getContext('2d');
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  const mat = new THREE.PointsMaterial({
    size: 1.15, map: new THREE.CanvasTexture(cv), vertexColors: true,
    transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending
  });
  particles = new THREE.Points(g, mat);
  scene.add(particles);
}

/* world units per CSS pixel at the robot's depth plane */
function worldPerPixel() {
  return (2 * Math.tan((FOV * Math.PI) / 360) * CAM_DIST) / window.innerHeight;
}

/* rect centre (viewport px) -> world x/y on the z=0 plane */
function rectToWorld(rect) {
  const wpp = worldPerPixel();
  return {
    x: (rect.left + rect.width / 2 - window.innerWidth / 2) * wpp,
    y: -(rect.top + rect.height / 2 - window.innerHeight / 2) * wpp,
    s: Math.min(1.25, Math.max(0.45, rect.height / 480))
  };
}

/* choreography: hero anchor -> modes anchor -> shrink away */
function placeRobot(dt) {
  if (!robot) return;
  const hero = heroEl ? heroEl.getBoundingClientRect() : null;
  const modes = modesEl ? modesEl.getBoundingClientRect() : null;
  const vh = window.innerHeight;

  let target = null, scale = 1;
  if (hero && hero.bottom > vh * 0.12) {
    target = rectToWorld(hero); target.y += 0.6; scale = target.s;
  } else if (modes && modes.top < vh && modes.bottom > 0) {
    // park a little high and small so the whole robot stays in view
    target = rectToWorld(modes); target.y += 2.4; scale = target.s * 0.82;
  } else if (modes && modes.bottom <= 0) {
    // past the modes section: tuck away bottom-right, tiny
    target = { x: 16, y: -14 }; scale = 0.001;
  } else if (hero && modes) {
    // travelling between the two anchors
    const a = rectToWorld(hero), b = rectToWorld(modes);
    const span = modes.top - hero.bottom || 1;
    const t = Math.min(1, Math.max(0, (vh * 0.5 - hero.bottom) / span));
    target = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    scale = a.s + (b.s - a.s) * t;
  }
  if (!target) return;

  const k = reduced ? 1 : Math.min(1, dt * 5);
  robot.position.x += (target.x - robot.position.x) * k;
  robot.position.y += (target.y - robot.position.y) * k;
  const cur = robot.scale.x;
  const ns = cur + (scale - cur) * k;
  robot.scale.setScalar(Math.max(0.001, ns));
}

let last = 0;
let clearedAway = false;
function tick(now) {
  if (document.hidden) return;             // resumes on visibilitychange
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;

  placeRobot(dt);

  // robot tucked away (below the modes section)? clear once and idle cheaply
  if (robot && robot.scale.x <= 0.0015) {
    if (!clearedAway) { renderer.clear(); clearedAway = true; }
    requestAnimationFrame(tick);
    return;
  }
  clearedAway = false;

  if (robot) {
    // idle float + gentle spin + mouse parallax
    robot.rotation.y += dt * (0.35 + spinKick * 3.4);
    spinKick = Math.max(0, spinKick - dt * 1.4);
    robot.rotation.x = mouseY * 0.08;
    robot.position.y += Math.sin(now / 900) * 0.012;
    robot.rotation.z = mouseX * 0.04;

    // happy hop on mode change (parabolic, ~0.55 s)
    if (hopT < 1) {
      hopT = Math.min(1, hopT + dt / 0.55);
      robot.position.y += Math.sin(hopT * Math.PI) * 1.6;
    }
    // halo breathing
    if (haloMat) haloMat.opacity = 0.45 + Math.sin(now / 420) * 0.12;
  }
  if (particles) {
    particles.rotation.y += dt * 0.02;
    particles.position.y = Math.sin(now / 2400) * 0.8;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function onResize() {
  if (!renderer) return;
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  if (reduced && running) { placeRobot(1); renderer.render(scene, camera); }
}
