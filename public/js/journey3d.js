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
  camera.position.set(0, 18, 6);       // near top-down with a slight tilt — glossy keys + both wheels read
  camera.lookAt(0, 0, 0);

  // same rig as the hero so the model reads crisp (glossy keys, red logo, warm glow)
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(6, 10, 8); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc7d2fe, 0.9); fill.position.set(-8, -2, 6); scene.add(fill);
  const glow = new THREE.PointLight(0xf7941c, 55, 26); glow.position.set(0, -3, 4); scene.add(glow);

  // soft studio "softbox" environment → glossy highlights on the keys/cover
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xededf2);
    const s1 = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    s1.position.set(3, 18, 9); s1.lookAt(0, 0, 0); envScene.add(s1);
    const s2 = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    s2.position.set(-11, 9, -3); s2.lookAt(0, 0, 0); envScene.add(s2);
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  } catch (e) { /* env is a nicety; lights already cover the basics */ }

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
    // hide the underside caster (not part of a clean top view) + make the
    // keycaps glossier so they catch highlights like the product shot
    model.traverse(function (o) {
      if (!o.isMesh) return;
      if (o.name === 'CasterDome') { o.visible = false; return; }
      var m = o.material;
      if (!m || m.roughness === undefined) return;
      if (m.name === 'Keycap') { m.roughness = 0.28; m.metalness = 0.0; }
      else if (m.name === 'Cover') { m.roughness = 0.45; }
    });
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
