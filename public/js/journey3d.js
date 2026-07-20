/* CarthaBot — the REAL 3D robot (same GLB as the hero) rides the journey line.
   A contained, transparent WebGL canvas inside #roadBot; journey.js moves and
   rotates that element along the road, while this module renders the model from
   a top-3/4 angle (both wheels visible) and SPINS the wheels with scroll
   progress. If WebGL or the model is unavailable, the still photo stays. */
import * as THREE from 'three';
import { GLTFLoader } from '/lib/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/lib/jsm/loaders/DRACOLoader.js';

let renderer, scene, camera, model, canvas, boxEl, fallbackImg;
let wheels = [];
let ready = false, spin = 0, pending = true;

export function start() {
  canvas = document.getElementById('roadBotCanvas');
  boxEl = document.getElementById('roadBot');
  if (!canvas || !boxEl || !window.WebGLRenderingContext) return;
  fallbackImg = boxEl.querySelector('.road-bot-fallback');

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) { return; }              // no WebGL → keep the fallback photo
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.up.set(0, 0, -1);             // so the robot's front (+Z) reads toward the bottom
  camera.position.set(0, 20, 0.001);   // straight top-down plan view (top, both wheels, line-follow reads true)
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(5, 12, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc7d2fe, 0.8); fill.position.set(-6, 5, -5); scene.add(fill);

  const draco = new DRACOLoader(); draco.setDecoderPath('/lib/draco/');
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  loader.load('/assets/carthabot.glb?v=6', (gltf) => {
    model = gltf.scene;
    const b = new THREE.Box3().setFromObject(model);
    const sz = b.getSize(new THREE.Vector3());
    const c = b.getCenter(new THREE.Vector3());
    const s = 9.6 / Math.max(sz.x, sz.y, sz.z);
    model.position.sub(c).multiplyScalar(s);
    model.scale.setScalar(s);
    model.rotation.y = Math.PI;          // face the front (sensors/caster) toward the travel direction
    scene.add(model);
    model.updateMatrixWorld(true);
    setupWheels();

    resize();
    ready = true;
    render();
    if (fallbackImg) fallbackImg.style.opacity = '0';   // hand over from photo to 3D
  }, undefined, () => { /* load failed — the fallback photo stays visible */ });

  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(boxEl);

  // hook used by journey.js to drive wheel roll from scroll progress
  window.__roadBot3d = {
    update: function (p) { spin = p; pending = true; render(); },
    render: function () { pending = true; render(); }
  };
}

// group each wheel's meshes onto a pivot at the wheel centre so they can spin
function setupWheels() {
  try {
    var byside = { _L: [], _R: [] };
    model.traverse(function (o) {
      if (o.isMesh && /^(Tyre|Rim)_/.test(o.name)) {
        (o.name.slice(-2) === '_L' ? byside._L : byside._R).push(o);
      }
    });
    ['_L', '_R'].forEach(function (side) {
      var meshes = byside[side];
      if (!meshes.length) return;
      var bb = new THREE.Box3();
      meshes.forEach(function (m) { bb.expandByObject(m); });   // world-space bounds
      var centreWorld = bb.getCenter(new THREE.Vector3());
      var pivot = new THREE.Group();
      pivot.position.copy(model.worldToLocal(centreWorld.clone()));
      model.add(pivot);
      meshes.forEach(function (m) { pivot.attach(m); });        // keep world transform
      wheels.push(pivot);
    });
  } catch (e) { /* wheels simply won't spin */ }
}

function render() {
  if (!ready || !renderer || !pending) return;
  pending = false;
  for (var i = 0; i < wheels.length; i++) wheels[i].rotation.x = spin * 42;  // roll ~6.7 turns over the run
  renderer.render(scene, camera);
}

function resize() {
  if (!renderer || !boxEl) return;
  var w = boxEl.clientWidth || 300, h = boxEl.clientHeight || 300;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  pending = true;
  render();
}
