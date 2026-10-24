import * as THREE from './vendor/three.module.min.js';
import { TABLES } from './data.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ *
 *  textures (all generated locally — nothing is fetched at runtime)
 * ------------------------------------------------------------------ */
function texture(w, h, draw, { repeat = [1, 1], srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const woodTex = texture(512, 512, (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#a97b4c');
  grad.addColorStop(0.5, '#95673c');
  grad.addColorStop(1, '#a3743f');
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 190; i++) {
    const y = Math.random() * h;
    g.strokeStyle = `rgba(58,34,14,${0.02 + Math.random() * 0.07})`;
    g.lineWidth = 0.6 + Math.random() * 2.2;
    g.beginPath();
    for (let x = 0; x <= w; x += 24) {
      g.lineTo(x, y + Math.sin((x + i * 31) / 55) * 2.4 + Math.sin(x / 13) * 0.6);
    }
    g.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 4 + Math.random() * 9;
    for (let k = 0; k < 4; k++) {
      g.strokeStyle = 'rgba(56,32,12,0.16)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.ellipse(x, y, r + k * 3, (r + k * 3) * 0.55, 0.6, 0, TAU);
      g.stroke();
    }
  }
}, { repeat: [1, 1] });

const floorTex = texture(1024, 1024, (g, w, h) => {
  g.fillStyle = '#efe9de'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    g.strokeStyle = `rgba(150,148,136,${0.05 + Math.random() * 0.07})`;
    g.lineWidth = 0.6 + Math.random() * 1.6;
    g.beginPath();
    let x = Math.random() * w, y = Math.random() * h;
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += (Math.random() - 0.4) * 130;
      y += (Math.random() - 0.5) * 90;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(120,115,100,${Math.random() * 0.05})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
  }
}, { repeat: [2, 1.6] });

const plasterTex = texture(256, 256, (g, w, h) => {
  g.fillStyle = '#f1e8d7'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2400; i++) {
    g.fillStyle = `rgba(${170 + Math.random() * 40},${160 + Math.random() * 35},${140 + Math.random() * 30},${Math.random() * 0.14})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1.3, 1.3);
  }
}, { repeat: [2, 1] });

const leafTex = texture(128, 256, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#9fb85e');
  grd.addColorStop(0.55, '#7c9b45');
  grd.addColorStop(1, '#5c7a34');
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(w / 2, 2);
  g.bezierCurveTo(w * 1.02, h * 0.18, w * 0.94, h * 0.72, w / 2, h - 2);
  g.bezierCurveTo(w * 0.06, h * 0.72, w * -0.02, h * 0.18, w / 2, 2);
  g.fill();
  g.strokeStyle = 'rgba(240,245,215,0.32)';
  g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(w / 2, 8); g.lineTo(w / 2, h - 6); g.stroke();
  for (let i = 1; i < 9; i++) {
    const y = (h / 10) * i;
    g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w / 2 + (i % 2 ? 20 : -20), y + 14); g.stroke();
  }
});

const signTex = texture(1024, 300, (g, w, h) => {
  g.fillStyle = '#82963f'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, w, 12);
  g.fillStyle = '#f7f1e2';
  g.textAlign = 'center';
  g.font = '600 96px Georgia, serif';
  g.fillText('Z E N   Z O N E', w / 2, 132);
  g.font = '400 30px Helvetica, Arial, sans-serif';
  g.letterSpacing = '8px';
  g.fillText('CAFÉ  &  RESTAURANT', w / 2, 186);
  g.font = '400 30px Georgia, serif';
  g.fillText('झेन झोन', w / 2, 238);
  g.beginPath(); g.arc(w - 92, 74, 20, 0, TAU); g.fillStyle = '#1e7a44'; g.fill();
  g.beginPath(); g.arc(w - 92, 136, 20, 0, TAU); g.fillStyle = '#b03a2e'; g.fill();
  g.font = '600 17px Helvetica, Arial, sans-serif';
  g.fillStyle = '#f7f1e2'; g.fillText('VEG', w - 92, 80);
  g.fillText('NON', w - 92, 142);
});

/* ------------------------------------------------------------------ *
 *  materials
 * ------------------------------------------------------------------ */
const M = {
  floor: new THREE.MeshStandardMaterial({ map: floorTex, color: 0xf5e9d4, roughness: 0.5, metalness: 0.02 }),
  wall: new THREE.MeshStandardMaterial({ map: plasterTex, color: 0xf6eddc, roughness: 0.94 }),
  wallWarm: new THREE.MeshStandardMaterial({ color: 0xe9dcc4, roughness: 0.95 }),
  ceilingWood: new THREE.MeshStandardMaterial({ map: woodTex, color: 0xd8b184, roughness: 0.72 }),
  beam: new THREE.MeshStandardMaterial({ color: 0x7d512c, roughness: 0.8 }),
  wood: new THREE.MeshStandardMaterial({ map: woodTex, color: 0xe0b98d, roughness: 0.55 }),
  woodDark: new THREE.MeshStandardMaterial({ map: woodTex, color: 0x9c6a3d, roughness: 0.62 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x241f1a, roughness: 0.42, metalness: 0.55 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x77462b, roughness: 0.66 }),
  leatherLight: new THREE.MeshStandardMaterial({ color: 0x8d5836, roughness: 0.68 }),
  olive: new THREE.MeshStandardMaterial({ color: 0x8d9b45, roughness: 0.6 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xf1e8d8, roughness: 0.6 }),
  linen: new THREE.MeshStandardMaterial({ color: 0xcbb894, roughness: 0.95 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xbdd0c2, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.18 }),
  leaf: new THREE.MeshStandardMaterial({ map: leafTex, transparent: true, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.85 }),
  pot: new THREE.MeshStandardMaterial({ color: 0xb9784e, roughness: 0.85 }),
  potCream: new THREE.MeshStandardMaterial({ color: 0xe3d6bf, roughness: 0.9 }),
  soil: new THREE.MeshStandardMaterial({ color: 0x3a2b1e, roughness: 1 }),
};

/* ------------------------------------------------------------------ *
 *  scene
 * ------------------------------------------------------------------ */
export class CafeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xe7ddc4, 30, 100);

    this.camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 220);
    this.camera.position.set(13, 4.4, 18);

    this.target = new THREE.Vector3(0.2, 1.5, -1.4);
    this.hoverId = null;
    this.selectedId = null;

    this.clock = new THREE.Clock();
    this.time = 0;
    this.intro = this.reduced ? 1 : 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.mouseS = new THREE.Vector2(0, 0);
    this.lift = 0;
    this.roofY = 3.62;

    this.buildSky();
    this.buildEnvironment();
    this.buildLandscape();
    this.buildShell();
    this.buildRoof();
    this.buildCounter();
    this.buildTables();
    this.buildPlants();
    this.buildTerrace();
    this.buildLights();
    this.buildDust();

    this.camStates = [
      { p: [8.9, 3.15, 12.9], t: [0.15, 1.5, -1.8], fov: 36 },
      { p: [4.5, 2.25, 6.2], t: [-1.7, 1.25, -2.6], fov: 38 },
      { p: [-5.2, 2.4, 5.6], t: [1.4, 1.15, -3.1], fov: 40 },
      { p: [1.9, 8.8, 3.4], t: [1.9, 0.3, -2.2], fov: 48 },
      { p: [7.4, 2.6, 10.4], t: [0.1, 1.45, -1.1], fov: 38 },
    ];
    this.curP = new THREE.Vector3(...this.camStates[0].p);
    this.curT = new THREE.Vector3(...this.camStates[0].t);

    this.sections = ['top', 'space', 'menu', 'reserve', 'visit']
      .map(id => document.getElementById(id)).filter(Boolean);
    this.anchors = [];

    addEventListener('resize', () => this.resize(), { passive: true });
    addEventListener('pointermove', e => {
      this.mouse.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    }, { passive: true });

    this.resize();
    this.measure();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  /* ---------- sky / land ---------- */
  buildEnvironment() {
    const faces = [];
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      if (i === 2) {
        const grd = g.createLinearGradient(0, 0, 0, 64);
        grd.addColorStop(0, '#9fbccb'); grd.addColorStop(1, '#d8e2d8');
        g.fillStyle = grd;
      } else if (i === 3) {
        g.fillStyle = '#8a7a5e';
      } else {
        const grd = g.createLinearGradient(0, 0, 0, 64);
        grd.addColorStop(0, '#d6e0d4');
        grd.addColorStop(0.55, '#efe6cd');
        grd.addColorStop(1, '#9d8a6b');
        g.fillStyle = grd;
      }
      g.fillRect(0, 0, 64, 64);
      faces.push(c);
    }
    try {
      const cube = new THREE.CubeTexture(faces);
      cube.needsUpdate = true;
      cube.colorSpace = THREE.SRGBColorSpace;
      this.scene.environment = cube;
    } catch (err) {
      console.warn('environment map unavailable', err);
    }
  }

  buildSky() {
    const skyTex = texture(32, 512, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#8fb0c2');
      grd.addColorStop(0.32, '#cdd8c9');
      grd.addColorStop(0.56, '#eddfbe');
      grd.addColorStop(0.74, '#f7dcae');
      grd.addColorStop(1, '#e6cfa6');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
    });
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(140, 32, 24),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, toneMapped: false })
    );
    sky.rotation.y = 0.6;
    this.scene.add(sky);

    const glowTex = texture(256, 256, (g, w, h) => {
      const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      grd.addColorStop(0, 'rgba(255,244,214,0.95)');
      grd.addColorStop(0.35, 'rgba(255,228,170,0.35)');
      grd.addColorStop(1, 'rgba(255,228,170,0)');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
    });
    const sun = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false })
    );
    sun.position.set(26, 24, -70);
    this.scene.add(sun);

    this.sunSprite = sun;
  }

  buildLandscape() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      new THREE.MeshStandardMaterial({ color: 0x8b9a6b, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.32, -20);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // layered ridge lines — soft, hazy, drawn as silhouettes
    const ridges = [
      { c: 0x9aa98b, z: -74, base: 1.2, amp: 7.0, seed: 1.7, op: 0.55 },
      { c: 0x849776, z: -58, base: 0.4, amp: 6.2, seed: 4.1, op: 0.7 },
      { c: 0x6d8562, z: -44, base: -0.6, amp: 5.2, seed: 2.3, op: 0.85 },
      { c: 0x5d7554, z: -32, base: -1.6, amp: 4.0, seed: 6.8, op: 0.95 },
    ];
    ridges.forEach(r => {
      const shape = new THREE.Shape();
      const w = 200, n = 64;
      shape.moveTo(-w / 2, -24);
      for (let i = 0; i <= n; i++) {
        const x = -w / 2 + (i / n) * w;
        const y = r.base
          + Math.sin(i * 0.38 + r.seed) * r.amp * 0.45
          + Math.sin(i * 0.11 + r.seed * 2.2) * r.amp * 0.7
          + Math.sin(i * 1.3 + r.seed) * r.amp * 0.08;
        shape.lineTo(x, y);
      }
      shape.lineTo(w / 2, -24);
      shape.closePath();
      const mesh = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshBasicMaterial({ color: r.c, transparent: true, opacity: r.op, fog: true, toneMapped: false })
      );
      mesh.position.z = r.z;
      this.scene.add(mesh);
    });

    // distant tree line
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x4f6647, roughness: 1 });
    const treeMat2 = new THREE.MeshStandardMaterial({ color: 0x607954, roughness: 1 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4630, roughness: 1 });
    for (let i = 0; i < 22; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = -16 - Math.random() * 12;
      const s = 1.2 + Math.random() * 2.2;
      const crown = new THREE.Group();
      for (let k = 0; k < 3; k++) {
        const lobe = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 8), k % 2 ? treeMat2 : treeMat);
        const ls = s * (0.65 + Math.random() * 0.4);
        lobe.scale.set(ls, ls * 1.05, ls);
        lobe.position.set((Math.random() - 0.5) * s * 0.8, (Math.random() - 0.2) * s * 0.6, (Math.random() - 0.5) * s * 0.6);
        crown.add(lobe);
      }
      crown.position.set(x, 0.4 + s * 1.0, z);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, s * 1.2, 6), trunkMat);
      trunk.position.set(x, s * 0.4, z);
      this.scene.add(crown, trunk);
    }
  }

  /* ---------- building ---------- */
  addBox(w, h, d, mat, x, y, z, { cast = false, receive = true, rotY = 0, parent = this.scene } = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    m.castShadow = cast; m.receiveShadow = receive;
    parent.add(m);
    return m;
  }

  buildShell() {
    const H = 3.5;

    // interior floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(13.2, 8.1), M.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -1.95);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // back wall with a window opening (x -2.7..-0.1, y 1.25..2.55)
    const zBack = -6;
    this.addBox(4.3, H, 0.18, M.wall, -4.85, H / 2, zBack, { cast: true });
    this.addBox(7.1, H, 0.18, M.wall, 3.45, H / 2, zBack, { cast: true });
    this.addBox(2.6, 1.25, 0.18, M.wall, -1.4, 0.625, zBack, { cast: true });
    this.addBox(2.6, H - 2.55, 0.18, M.wall, -1.4, 2.55 + (H - 2.55) / 2, zBack, { cast: true });

    // window frame + glass
    this.addBox(2.9, 0.08, 0.26, M.woodDark, -1.4, 1.25, zBack);
    this.addBox(2.9, 0.08, 0.26, M.woodDark, -1.4, 2.56, zBack);
    this.addBox(0.08, 1.35, 0.26, M.woodDark, -2.74, 1.9, zBack);
    this.addBox(0.08, 1.35, 0.26, M.woodDark, -0.06, 1.9, zBack);
    this.addBox(0.06, 1.3, 0.2, M.woodDark, -1.4, 1.9, zBack);
    this.addBox(0.05, 1.3, 0.02, M.glass, -1.4, 1.9, zBack + 0.12);

    // view through the window: layered greenery
    const view = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 3.4),
      new THREE.MeshStandardMaterial({ map: this.greenViewTexture(), roughness: 1, emissive: 0x2c3a24, emissiveIntensity: 0.25 })
    );
    view.position.set(-1.4, 1.6, zBack - 1.1);
    this.scene.add(view);

    // left wall
    this.addBox(0.18, H, 8.1, M.wall, -6.6, H / 2, -1.95, { cast: true });
    // right wall
    this.addBox(0.18, H, 8.1, M.wall, 6.6, H / 2, -1.95, { cast: true });

    // outer face of the right wall gets the same timber screen
    const outerScreen = new THREE.MeshStandardMaterial({ color: 0xb0663c, roughness: 0.75 });
    this.addBox(0.02, 3.35, 8.0, new THREE.MeshStandardMaterial({ color: 0x3a2c20, roughness: 0.95 }), 6.705, 1.68, -2.0);
    for (let i = 0; i < 34; i++) {
      this.addBox(0.08, 3.3, 0.09, outerScreen, 6.72, 1.65, 1.65 - i * 0.22, { cast: true });
    }

    // terracotta screen wrapping the right wall
    const screenMat = new THREE.MeshStandardMaterial({ color: 0xb0663c, roughness: 0.75 });
    for (let i = 0; i < 38; i++) {
      this.addBox(0.08, 3.35, 0.09, screenMat, 6.44, 1.68, 1.7 - i * 0.2, { cast: true });
    }
    this.addBox(0.1, 0.1, 7.7, screenMat, 6.44, 3.34, -2.1);

    // front header + shutter pocket
    this.addBox(13.2, 0.52, 0.34, M.wallWarm, 0, 3.18, 2.0, { cast: true });
    this.addBox(13.2, 0.22, 0.3, new THREE.MeshStandardMaterial({ color: 0x3a3229, roughness: 0.6 }), 0, 3.5, 2.04);
    this.addBox(0.28, 3.2, 0.28, M.metal, -6.36, 1.6, 2.02, { cast: true });
    this.addBox(0.28, 3.2, 0.28, M.metal, 6.36, 1.6, 2.02, { cast: true });

    // parapet above the opening (the green board sits on this)
    this.addBox(13.2, 1.3, 0.22, M.wallWarm, 0, 4.09, 2.04, { cast: true });

    // terracotta screen on the right of the facade — as on the real building
    const terra = new THREE.MeshStandardMaterial({ color: 0xb4693e, roughness: 0.72 });
    for (let i = 0; i < 19; i++) {
      this.addBox(0.09, 1.26, 0.12, terra, 2.55 + i * 0.2, 4.09, 2.17, { cast: true });
    }
    this.addBox(0.16, 1.3, 0.16, terra, 2.35, 4.09, 2.14);
    this.addBox(3.9, 0.08, 0.16, terra, 4.35, 3.48, 2.14);

    // timber soffit visible at the top of the opening
    this.addBox(12.9, 0.26, 0.6, M.ceilingWood, 0, 3.04, 1.86, { cast: true });

    // signage on the fascia
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 1.24),
      new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false })
    );
    sign.position.set(0, 4.06, 2.17);
    sign.rotation.x = 0.02;
    this.scene.add(sign);
    const signBack = this.addBox(5.16, 1.4, 0.1, new THREE.MeshStandardMaterial({ color: 0x6f8036, roughness: 0.7 }), 0, 4.06, 2.12);
    signBack.castShadow = true;

    // skirting
    this.addBox(13.0, 0.1, 0.06, M.cream, 0, 0.05, -5.9);

    // jute rug in the middle of the room
    const rugTex = texture(256, 256, (g, w, h) => {
      g.fillStyle = '#c9b18b'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1200; i++) {
        g.fillStyle = `rgba(${120 + Math.random() * 60},${100 + Math.random() * 50},${70 + Math.random() * 40},${Math.random() * 0.25})`;
        g.fillRect(Math.random() * w, Math.random() * h, 2, 1);
      }
      g.strokeStyle = 'rgba(90,74,50,0.18)';
      g.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        g.beginPath(); g.moveTo(0, 20 + i * 40); g.lineTo(w, 20 + i * 40); g.stroke();
      }
    }, { repeat: [2, 2] });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.4), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.5, 0.007, -1.1);
    rug.receiveShadow = true;
    this.scene.add(rug);

    // wall art / shelf on left wall
    const art = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.5), new THREE.MeshStandardMaterial({ color: 0xdfd2b8, roughness: 0.9 }));
    art.position.set(-6.5, 2.05, -3.4);
    art.rotation.y = Math.PI / 2;
    this.scene.add(art);
    const artIn = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.26), new THREE.MeshStandardMaterial({ color: 0x7f8d55, roughness: 0.9 }));
    artIn.position.set(-6.44, 2.05, -3.4);
    artIn.rotation.y = Math.PI / 2;
    this.scene.add(artIn);

    // chalkboard menu on the back wall
    const boardTex = texture(512, 384, (g, w, h) => {
      g.fillStyle = '#1d2a22'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(240,238,220,${Math.random() * 0.03})`;
        g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
      }
      g.fillStyle = '#efe6cd';
      g.textAlign = 'center';
      g.font = 'italic 600 38px Georgia, serif';
      g.fillText('Zen Zone', w / 2, 64);
      g.strokeStyle = 'rgba(239,230,205,0.4)';
      g.beginPath(); g.moveTo(120, 82); g.lineTo(w - 120, 82); g.stroke();
      g.font = '400 22px Georgia, serif';
      g.fillText('today', w / 2, 120);
      g.font = '400 21px Helvetica, Arial, sans-serif';
      ['wood-fired pizza', 'pesto pasta', 'paneer burger', 'cardamom chai'].forEach((t, i) => {
        g.fillText(t, w / 2, 162 + i * 40);
      });
      g.font = 'italic 400 18px Georgia, serif';
      g.fillText('— all vegetarian —', w / 2, h - 28);
    });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.28), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.92 }));
    board.position.set(-4.1, 2.15, -5.86);
    this.scene.add(board);
    this.addBox(1.82, 1.4, 0.06, M.woodDark, -4.1, 2.15, -5.9);

    // warm wash at the back
    const wash = new THREE.PointLight(0xffca8a, 9, 9, 2);
    wash.position.set(-1.5, 2.7, -5.2);
    this.scene.add(wash);
  }

  greenViewTexture() {
    return texture(512, 384, (g, w, h) => {
      const grd = g.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#cfdcc4');
      grd.addColorStop(0.45, '#8fa878');
      grd.addColorStop(1, '#4d6640');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) {
        const r = 18 + Math.random() * 60;
        g.fillStyle = `rgba(${40 + Math.random() * 50},${70 + Math.random() * 60},${40 + Math.random() * 40},${0.16 + Math.random() * 0.25})`;
        g.beginPath();
        g.arc(Math.random() * w, h * 0.3 + Math.random() * h * 0.7, r, 0, TAU);
        g.fill();
      }
    }, { repeat: [1, 1] });
  }

  buildRoof() {
    this.roof = new THREE.Group();
    this.scene.add(this.roof);

    // solid roof over the back two-thirds, slatted pergola over the front
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xe4d7bd, roughness: 0.92 });
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.14, 5.8), roofMat);
    roofSlab.position.set(0, 3.8, -3.15);
    roofSlab.castShadow = true;
    roofSlab.receiveShadow = true;
    this.roof.add(roofSlab);
    this.addBox(13.5, 0.34, 0.12, roofMat, 0, 3.74, -6.02, { parent: this.roof, cast: true });
    this.addBox(13.5, 0.3, 0.12, roofMat, 0, 3.72, -0.28, { parent: this.roof, cast: true });
    this.addBox(0.12, 0.3, 5.8, roofMat, -6.7, 3.72, -3.15, { parent: this.roof, cast: true });
    this.addBox(0.12, 0.3, 5.8, roofMat, 6.7, 3.72, -3.15, { parent: this.roof, cast: true });

    const slatGeo = new THREE.BoxGeometry(0.15, 0.055, 8.25);
    const count = 62;
    const slats = new THREE.InstancedMesh(slatGeo, M.ceilingWood, count);
    slats.castShadow = true;
    slats.receiveShadow = false;
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const x = -6.3 + i * 0.205;
      m.makeTranslation(x, 3.6, -1.95);
      slats.setMatrixAt(i, m);
      const v = 0.82 + Math.random() * 0.2;
      col.setRGB(v, v * 0.93, v * 0.82);
      slats.setColorAt(i, col);
    }
    slats.instanceMatrix.needsUpdate = true;
    if (slats.instanceColor) slats.instanceColor.needsUpdate = true;
    this.roof.add(slats);
    this.roofSlats = slats;

    // structural beams
    [-5.85, -3.4, -1.0, 1.7].forEach(z => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(13.3, 0.14, 0.16), M.beam);
      beam.position.set(0, 3.52, z);
      beam.castShadow = true;
      this.roof.add(beam);
    });

    // ceiling fans
    this.fans = [];
    [-3.2, 1.1, 4.2].forEach((x, i) => {
      const fan = this.makeFan();
      fan.position.set(x, 3.32, [-4.3, -3.6, 0.3][i]);
      this.roof.add(fan);
      this.fans.push(fan);
    });

    // pendant lamps
    [[-3.9, -2.0], [0.2, -2.3], [3.2, -3.9]].forEach(([x, z]) => {
      this.roof.add(this.makePendant(x, z));
    });
  }

  makeFan() {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 8), M.metal);
    stem.position.y = -0.12;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 16), M.metal);
    hub.position.y = -0.28;
    g.add(stem, hub);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.55 });
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.018, 0.19), bladeMat);
      blade.position.x = 0.55;
      blade.rotation.z = 0.04;
      const pivot = new THREE.Group();
      pivot.add(blade);
      pivot.rotation.y = (i / 3) * TAU;
      pivot.position.y = -0.3;
      g.add(pivot);
    }
    return g;
  }

  makePendant(x, z) {
    const g = new THREE.Group();
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.85, 5), M.metal);
    cord.position.y = -0.42;
    g.add(cord);

    const pts = [];
    pts.push(new THREE.Vector2(0.02, 0.02));
    pts.push(new THREE.Vector2(0.07, 0.0));
    pts.push(new THREE.Vector2(0.19, -0.1));
    pts.push(new THREE.Vector2(0.31, -0.25));
    pts.push(new THREE.Vector2(0.34, -0.32));
    pts.push(new THREE.Vector2(0.27, -0.32));
    pts.push(new THREE.Vector2(0.22, -0.25));
    const shade = new THREE.Mesh(new THREE.LatheGeometry(pts, 22), new THREE.MeshStandardMaterial({
      color: 0x2c2319, roughness: 0.6, metalness: 0.25, side: THREE.DoubleSide
    }));
    shade.position.y = -0.86;
    shade.castShadow = true;
    g.add(shade);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffd9a2, toneMapped: false })
    );
    glow.position.y = -1.02;
    g.add(glow);

    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(0.38, 20),
      new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -1.13;
    g.add(halo);

    g.position.set(x, 3.55, z);
    return g;
  }

  buildCounter() {
    const cx = 4.75, cz = -4.45;
    const body = this.addBox(2.7, 1.02, 1.75, M.olive, cx, 0.51, cz, { cast: true });
    body.receiveShadow = true;
    this.addBox(2.9, 0.09, 1.95, M.cream, cx, 1.06, cz, { cast: true });

    // three white slats on the front
    for (let i = 0; i < 3; i++) {
      const slat = this.addBox(2.55, 0.1, 0.04, M.cream, cx, 0.3 + i * 0.22, cz + 0.89);
      slat.rotation.z = -0.035;
    }

    // back shelf + bottles
    this.addBox(2.6, 0.08, 0.3, M.woodDark, cx, 2.05, -5.86);
    this.addBox(2.6, 0.08, 0.3, M.woodDark, cx, 2.5, -5.86);
    const bottleMat = new THREE.MeshStandardMaterial({ color: 0x3d5a43, roughness: 0.25, metalness: 0.1 });
    for (let i = 0; i < 7; i++) {
      const h = 0.32 + Math.random() * 0.14;
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, h, 10), bottleMat);
      b.position.set(cx - 1.0 + i * 0.29, 2.09 + h / 2, -5.84);
      this.scene.add(b);
    }

    // coffee machine
    this.addBox(0.55, 0.42, 0.42, M.metal, cx - 0.55, 1.31, cz - 0.2, { cast: true });
    this.addBox(0.5, 0.14, 0.36, M.cream, cx - 0.55, 1.55, cz - 0.2);

    // little plant on the counter
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 12), M.potCream);
    pot.position.set(cx + 0.9, 1.18, cz + 0.5);
    this.scene.add(pot);
    this.scatterLeaves(cx + 0.9, 1.25, cz + 0.5, 7, 0.16, 0.28);

    // menu stand
    const menu = this.addBox(0.26, 0.36, 0.02, M.cream, cx + 0.2, 1.29, cz + 0.8);
    menu.rotation.x = -0.16;
  }

  /* ---------- tables ---------- */
  makeChair() {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.055, 0.42), Math.random() > 0.5 ? M.leather : M.leatherLight);
    seat.position.y = 0.45;
    seat.castShadow = true;
    seat.receiveShadow = true;
    g.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.4, 0.045), seat.material);
    back.position.set(0, 0.71, -0.19);
    back.rotation.x = -0.07;
    back.castShadow = true;
    g.add(back);

    const legGeo = new THREE.CylinderGeometry(0.014, 0.017, 0.46, 6);
    [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, M.metal);
      leg.position.set(x, 0.225, z);
      leg.castShadow = true;
      g.add(leg);
    });
    return g;
  }

  buildTables() {
    this.tableGroups = new Map();
    this.pickMeshes = [];

    const shadowTex = texture(128, 128, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const grd = g.createRadialGradient(64, 64, 3, 64, 64, 62);
      grd.addColorStop(0, 'rgba(24,18,12,0.55)');
      grd.addColorStop(0.55, 'rgba(24,18,12,0.24)');
      grd.addColorStop(1, 'rgba(24,18,12,0)');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
    }, { repeat: [1, 1] });
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false
    });

    TABLES.forEach(t => {
      const g = new THREE.Group();
      g.position.set(t.x, 0, t.z);
      g.rotation.y = t.rot || 0;

      const w = t.seats >= 6 ? 2.15 : t.seats === 4 ? 1.05 : 0.82;
      const d = t.seats >= 6 ? 0.98 : t.seats === 4 ? 1.05 : 0.82;
      const topH = 0.055;
      const topGeo = new THREE.ExtrudeGeometry(this.roundedRect(w, d, 0.07), {
        depth: topH, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 5
      });
      topGeo.rotateX(-Math.PI / 2);
      const topMat = M.wood.clone();
      topMat.color.setHSL(0.08, 0.3, 0.44 + Math.random() * 0.08);
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = 0.74 - topH;
      top.castShadow = true; top.receiveShadow = true;
      g.add(top);

      const contact = new THREE.Mesh(new THREE.PlaneGeometry(t.seats >= 6 ? 3.1 : 2.05, t.seats >= 6 ? 2.0 : 2.05), shadowMat);
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = 0.004;
      contact.renderOrder = 1;
      g.add(contact);

      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.7, 10), M.metal);
      column.position.y = 0.38;
      column.castShadow = true;
      g.add(column);
      const footA = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 0.07), M.metal);
      footA.position.y = 0.02;
      const footB = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.62), M.metal);
      footB.position.y = 0.02;
      g.add(footA, footB);

      // table setting
      const matCount = t.seats >= 6 ? 4 : t.seats === 4 ? 2 : 2;
      for (let i = 0; i < matCount; i++) {
        const mat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.006, 0.24), M.linen);
        if (t.seats >= 6) {
          mat.position.set(-0.62 + i * 0.42, 0.745, i % 2 ? 0.24 : -0.24);
        } else {
          mat.position.set(i % 2 ? 0.2 : -0.2, 0.745, 0.16);
        }
        g.add(mat);
      }

      // cup + vase
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.034, 0.07, 12), M.cream);
      cup.position.set(w * 0.22, 0.78, -d * 0.2);
      cup.castShadow = true;
      g.add(cup);
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.12, 10), M.potCream);
      vase.position.set(-w * 0.24, 0.8, d * 0.16);
      g.add(vase);
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.19), M.leaf);
        const a = (i / 3) * TAU;
        leaf.position.set(-w * 0.24 + Math.cos(a) * 0.03, 0.88, d * 0.16 + Math.sin(a) * 0.03);
        leaf.rotation.set(-0.5, a, 0.3);
        g.add(leaf);
      }

      // chairs
      const seatPositions = this.seatLayout(t.seats, w, d);
      seatPositions.forEach(s => {
        const chair = this.makeChair();
        chair.position.set(s.x, 0, s.z);
        chair.rotation.y = s.rot + (Math.random() - 0.5) * 0.14;
        g.add(chair);
      });

      // pick target
      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.95, 1.0, d + 0.95),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hit.position.y = 0.55;
      hit.userData.tableId = t.id;
      g.add(hit);
      this.pickMeshes.push(hit);

      this.scene.add(g);
      this.tableGroups.set(t.id, g);
    });

    // highlight ring
    const ringGeo = new THREE.RingGeometry(0.52, 0.6, 48);
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0xf3ecdd, transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false, depthWrite: false });
    this.ring = new THREE.Mesh(ringGeo, this.ringMat);
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.012;
    this.scene.add(this.ring);
    this.ring2Mat = new THREE.MeshBasicMaterial({ color: 0x8d9b45, transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false, depthWrite: false });
    this.ring2 = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.7, 48), this.ring2Mat);
    this.ring2.rotation.x = -Math.PI / 2;
    this.ring2.position.y = 0.01;
    this.scene.add(this.ring2);
  }

  roundedRect(w, d, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  seatLayout(seats, w, d) {
    const out = [];
    if (seats >= 6) {
      [-0.66, 0, 0.66].forEach(off => {
        out.push({ x: off, z: d / 2 + 0.36, rot: Math.PI });
        out.push({ x: off, z: -d / 2 - 0.36, rot: 0 });
      });
      return out;
    }
    if (seats === 4) {
      out.push({ x: 0, z: d / 2 + 0.36, rot: Math.PI });
      out.push({ x: 0, z: -d / 2 - 0.36, rot: 0 });
      out.push({ x: w / 2 + 0.36, z: 0, rot: -Math.PI / 2 });
      out.push({ x: -w / 2 - 0.36, z: 0, rot: Math.PI / 2 });
      return out;
    }
    out.push({ x: w / 2 + 0.34, z: 0, rot: -Math.PI / 2 });
    out.push({ x: -w / 2 - 0.34, z: 0, rot: Math.PI / 2 });
    return out;
  }

  /* ---------- greenery ---------- */
  scatterLeaves(x, y, z, n, scale = 0.22, height = 0.4, addToScene = true) {
    const geo = new THREE.PlaneGeometry(0.16 * scale / 0.22, 0.3 * scale / 0.22);
    const group = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const leaf = new THREE.Mesh(geo, M.leaf);
      const a = (i / n) * TAU + Math.random() * 0.6;
      leaf.position.set(Math.cos(a) * 0.04, height * (0.35 + Math.random() * 0.65), Math.sin(a) * 0.04);
      leaf.rotation.set(-0.4 - Math.random() * 0.5, a, (Math.random() - 0.5) * 0.6);
      leaf.scale.setScalar(0.8 + Math.random() * 0.5);
      group.add(leaf);
    }
    group.position.set(x, y, z);
    if (addToScene) this.scene.add(group);
    return group;
  }

  buildPlants() {
    // hanging curtain along the front beam
    const leafGeo = new THREE.PlaneGeometry(0.14, 0.26);
    const positions = [];
    const strands = [];
    for (let s = 0; s < 34; s++) {
      const side = s < 22 ? -1 : 1;
      const idx = s < 22 ? s : s - 22;
      const x = side < 0 ? -6.1 + idx * 0.275 : 2.55 + idx * 0.3;
      const z = 1.55 + Math.random() * 0.5;
      const len = 0.45 + Math.random() * 0.85;
      strands.push({ x, z, len, phase: Math.random() * TAU });
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        for (let k = 0; k < 2; k++) {
          positions.push({
            x: x + Math.sin(t * 4 + s) * 0.09 + (k ? 0.055 : -0.045),
            y: 2.9 - t * len + (k ? 0.03 : 0),
            z: z + Math.cos(t * 3 + s) * 0.07 + (k ? 0.03 : -0.03),
            ry: Math.random() * TAU,
            rz: (Math.random() - 0.5) * 1.35,
            sc: 0.75 + Math.random() * 0.6,
            hue: 0.62 + Math.random() * 0.3,
          });
        }
      }
    }

    const inst = new THREE.InstancedMesh(leafGeo, M.leaf, positions.length);
    inst.castShadow = true;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const col = new THREE.Color();
    positions.forEach((p, i) => {
      e.set(0.15, p.ry, p.rz);
      q.setFromEuler(e);
      v.set(p.x, p.y, p.z);
      sc.setScalar(p.sc);
      m.compose(v, q, sc);
      inst.setMatrixAt(i, m);
      col.setRGB(p.hue * 0.8, p.hue, p.hue * 0.55);
      inst.setColorAt(i, col);
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    this.scene.add(inst);
    this.hanging = inst;

    // thin stems
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x5d7538, roughness: 1 });
    strands.forEach(s => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, s.len, 4), stemMat);
      stem.position.set(s.x, 2.9 - s.len / 2, s.z);
      this.scene.add(stem);
    });

    // floor plants
    const plantSpots = [
      { x: -5.9, z: 1.0, s: 1.25 },
      { x: 5.9, z: 1.1, s: 1.1 },
      { x: -5.9, z: -5.2, s: 1.0 },
      { x: 1.4, z: -5.4, s: 0.95 },
    ];
    plantSpots.forEach(p => this.makePottedPlant(p.x, p.z, p.s));

    // small herbs on counter
    this.makePottedPlant(5.85, -2.95, 0.45, true);
  }

  makePottedPlant(x, z, scale = 1, onCounter = false) {
    const g = new THREE.Group();
    const potH = 0.42 * scale;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.26 * scale, 0.2 * scale, potH, 14), M.pot);
    pot.position.y = potH / 2;
    pot.castShadow = true;
    g.add(pot);
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * scale, 0.24 * scale, 0.03, 14), M.soil);
    soil.position.y = potH;
    g.add(soil);

    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + Math.random() * 0.4;
      const tilt = 0.55 + Math.random() * 0.5;
      const h = (0.8 + Math.random() * 0.7) * scale;
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.2 * scale, 0.78 * scale), M.leaf);
      leaf.position.set(Math.cos(a) * 0.06 * scale, potH + h * 0.45, Math.sin(a) * 0.06 * scale);
      leaf.rotation.set(0, a, tilt);
      leaf.position.x += Math.sin(tilt) * h * 0.4 * Math.cos(a);
      leaf.position.z += Math.sin(tilt) * h * 0.4 * Math.sin(a);
      leaf.castShadow = true;
      g.add(leaf);
    }
    g.position.set(x, onCounter ? 1.1 : 0, z);
    this.scene.add(g);
    return g;
  }

  /* ---------- terrace ---------- */
  buildTerrace() {
    const deckTex = woodTex.clone();
    deckTex.needsUpdate = true;
    deckTex.repeat.set(3, 2);
    const deckMat = new THREE.MeshStandardMaterial({ map: deckTex, color: 0xb98a5c, roughness: 0.66 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.14, 5.6), deckMat);
    deck.position.set(0, -0.08, 4.7);
    deck.receiveShadow = true;
    this.scene.add(deck);

    // granite steps down at the centre front
    const granite = new THREE.MeshStandardMaterial({ color: 0xa89583, roughness: 0.88 });
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.16, 0.44), granite);
      step.position.set(0, -0.16 - i * 0.16, 7.62 + i * 0.44);
      step.receiveShadow = true;
      this.scene.add(step);
    }

    // planters at the entrance
    this.makePottedPlant(-3.3, 3.1, 0.9);
    this.makePottedPlant(3.3, 3.2, 0.9);

    // festoon lights across the deck
    const pts = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      pts.push(new THREE.Vector3(-6.8 + t * 13.6, 2.55 - Math.sin(t * Math.PI) * 0.38, 5.95));
    }
    const wire = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x2b241b })
    );
    this.scene.add(wire);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false });
    for (let i = 1; i < 16; i++) {
      const p = pts[Math.round((i / 16) * 32)];
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 7), bulbMat);
      bulb.position.set(p.x, p.y - 0.055, p.z);
      this.scene.add(bulb);
    }

    // low planters at the deck edge
    [-6.4, 6.4].forEach(x => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.5), M.pot);
      box.position.set(x, 0.17, 6.9);
      box.castShadow = true;
      this.scene.add(box);
      for (let i = 0; i < 4; i++) this.scatterLeaves(x - 0.45 + i * 0.3, 0.34, 6.9, 4, 0.3, 0.35);
    });

    // doormat + a bench on the deck
    const mat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.02, 0.9), new THREE.MeshStandardMaterial({ color: 0x6f6446, roughness: 1 }));
    mat.position.set(0, 0.012, 2.85);
    this.scene.add(mat);

    const benchMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xc59a6a, roughness: 0.7 });
    const bench = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.5), benchMat);
    seat.position.y = 0.45; seat.castShadow = true;
    bench.add(seat);
    for (let i = -1; i <= 1; i += 2) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.45), M.metal);
      leg.position.set(i * 0.8, 0.22, 0);
      leg.castShadow = true;
      bench.add(leg);
    }
    bench.position.set(-4.55, 0, 6.25);
    this.scene.add(bench);
  }

  makeHighTable(x, z) {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.62), M.wood);
    top.position.y = 1.02;
    top.castShadow = true;
    g.add(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.0, 10), M.metal);
    leg.position.y = 0.51;
    leg.castShadow = true;
    g.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.5), M.metal);
    foot.position.y = 0.02;
    g.add(foot);
    for (let i = 0; i < 2; i++) {
      const stool = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 18), M.leather);
      seat.position.y = 0.68;
      seat.castShadow = true;
      stool.add(seat);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.68, 8), M.metal);
      post.position.y = 0.34;
      stool.add(post);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16), M.metal);
      base.position.y = 0.015;
      stool.add(base);
      stool.position.set(i ? 0.55 : -0.55, 0, 0.05);
      g.add(stool);
    }
    g.position.set(x, 0, z);
    g.rotation.y = x > 0 ? -0.25 : 0.25;
    this.scene.add(g);
  }

  /* ---------- lights / dust ---------- */
  buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xfff1d8, 0x6f6550, 0.8));

    const sun = new THREE.DirectionalLight(0xffd0a0, 3.35);
    sun.position.set(-14, 9.5, 13);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -16;
    sun.shadow.camera.right = 16;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -12;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 46;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);
    this.sun = sun;

    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.26);
    fill.position.set(-8, 6, 10);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffe9c0, 0.5);
    rim.position.set(7, 3.5, 9);
    this.scene.add(rim);

    // warm interior points at the pendants (fixed height, independent of roof lift)
    [[-3.9, -2.0], [0.2, -2.3], [3.2, -3.9]].forEach(([x, z]) => {
      const p = new THREE.PointLight(0xffb978, 9, 7.5, 2);
      p.position.set(x, 2.45, z);
      this.scene.add(p);
    });

    const bounce = new THREE.PointLight(0xffe6c2, 4.2, 9, 2);
    bounce.position.set(0, 1.2, 0.4);
    this.scene.add(bounce);

    const roomGlow = new THREE.PointLight(0xffc78e, 9, 12, 2);
    roomGlow.position.set(0, 2.8, -2.6);
    this.scene.add(roomGlow);

    [[-2.6, -2.0], [2.8, -3.2]].forEach(([x, z]) => {
      const spot = new THREE.SpotLight(0xffc98c, 55, 8, 0.82, 0.9, 1.7);
      spot.position.set(x, 3.32, z);
      spot.target.position.set(x * 0.5, 0, z + 0.4);
      this.scene.add(spot, spot.target);
    });
  }

  buildDust() {
    const n = 220;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = 0.3 + Math.random() * 3.1;
      pos[i * 3 + 2] = -5.5 + Math.random() * 9;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffe7c4, size: 0.022, transparent: true, opacity: 0.55,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    this.dust = new THREE.Points(geo, mat);
    this.scene.add(this.dust);
  }

  /* ---------- measurement / camera ---------- */
  measure() {
    this.anchors = this.sections.map(s => {
      const r = s.getBoundingClientRect();
      return r.top + scrollY + r.height / 2;
    });
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.measure();
  }

  updateCamera(dt) {
    const vh = innerHeight;
    const center = scrollY + vh * 0.5;
    let idx = 0;
    for (let i = 0; i < this.anchors.length; i++) {
      if (center >= this.anchors[i]) idx = i;
    }
    const next = Math.min(idx + 1, this.camStates.length - 1);
    let t = 0;
    if (this.anchors[idx] !== undefined && this.anchors[next] !== undefined && next !== idx) {
      t = smooth(clamp((center - this.anchors[idx]) / (this.anchors[next] - this.anchors[idx]), 0, 1));
    }

    const a = this.camStates[idx], b = this.camStates[next];
    const px = lerp(a.p[0], b.p[0], t);
    const py = lerp(a.p[1], b.p[1], t);
    const pz = lerp(a.p[2], b.p[2], t);
    const tx = lerp(a.t[0], b.t[0], t);
    const ty = lerp(a.t[1], b.t[1], t);
    const tz = lerp(a.t[2], b.t[2], t);
    const baseFov = lerp(a.fov || 38, b.fov || 38, t);
    const fov = innerWidth < 720 ? baseFov + 12 : baseFov;
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }

    this.mouseS.lerp(this.mouse, 1 - Math.pow(0.001, dt));
    const par = this.reduced ? 0 : 1;
    const mx = this.mouseS.x * 0.28 * par;
    const my = this.mouseS.y * 0.14 * par;

    const introEase = this.reduced ? 1 : smooth(clamp(this.intro, 0, 1));
    const startX = 12.5, startY = 4.3, startZ = 16.5;
    const goalP = new THREE.Vector3(px + mx, py + my + (1 - introEase) * 1.6, pz);
    const goalT = new THREE.Vector3(tx, ty, tz);
    if (this.intro < 1) {
      goalP.x = lerp(startX, goalP.x, introEase);
      goalP.y = lerp(startY, goalP.y, introEase);
      goalP.z = lerp(startZ, goalP.z, introEase);
    }

    const k = 1 - Math.pow(0.0001, dt);
    this.curP.lerp(goalP, k);
    this.curT.lerp(goalT, k);

    this.camera.position.copy(this.curP);
    this.camera.lookAt(this.curT);

    // roof lift while booking
    const reserve = document.getElementById('reserve');
    let wantLift = 0;
    if (reserve) {
      const r = reserve.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > vh * 0.45) wantLift = 1;
    }
    this.lift = lerp(this.lift, wantLift, 1 - Math.pow(0.003, dt));
    this.roof.position.y = this.lift * 1.1;
    const fade = clamp(1 - this.lift / 0.55, 0, 1);
    [M.ceilingWood, M.beam].forEach(m => {
      m.transparent = this.lift > 0.012;
      m.opacity = fade;
    });
    this.roof.traverse(o => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        if (m === M.ceilingWood || m === M.beam) return;
        if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
        if (this.lift > 0.01) {
          m.transparent = true;
          m.opacity = m.userData.baseOpacity * fade;
        } else if (m.userData.baseOpacity === 1) {
          m.transparent = false;
          m.opacity = 1;
        }
      });
    });
    this.roof.visible = this.lift < 0.56;
    if (this.roofSlats) this.roofSlats.castShadow = this.lift < 0.4;
  }

  frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    this.intro = Math.min(1, this.intro + dt / 2.6);

    this.updateCamera(dt);
    this.fans.forEach((f, i) => { f.rotation.y += dt * (2.2 + i * 0.15); });

    if (this.dust) {
      const arr = this.dust.geometry.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += dt * 0.05;
        arr[i] += Math.sin(this.time * 0.3 + i) * dt * 0.02;
        if (arr[i + 1] > 3.5) arr[i + 1] = 0.2;
      }
      this.dust.geometry.attributes.position.needsUpdate = true;
      this.dust.material.opacity = 0.35 + Math.sin(this.time * 0.5) * 0.08;
    }

    // highlight rings
    const sel = this.selectedId ? TABLES.find(t => t.id === this.selectedId) : null;
    const hov = this.hoverId ? TABLES.find(t => t.id === this.hoverId) : null;
    const active = sel || hov;
    if (active) {
      this.ring.position.x = active.x;
      this.ring.position.z = active.z;
      this.ring2.position.x = active.x;
      this.ring2.position.z = active.z;
      const rs = active.seats >= 6 ? 1.75 : active.seats === 4 ? 1.32 : 1.0;
      this.ring.scale.setScalar(rs);
      this.ringMat.opacity = lerp(this.ringMat.opacity, hov ? 0.5 : 0, dt * 8);
      this.ring2Mat.opacity = lerp(this.ring2Mat.opacity, sel ? 0.65 : 0, dt * 8);
      const s = 1 + Math.sin(this.time * 2.4) * 0.03;
      this.ring2.scale.setScalar(rs * (sel ? s : 1));
    } else {
      this.ringMat.opacity = lerp(this.ringMat.opacity, 0, dt * 8);
      this.ring2Mat.opacity = lerp(this.ring2Mat.opacity, 0, dt * 8);
    }

    this.sunSprite.lookAt(this.camera.position);
    this.renderer.render(this.scene, this.camera);
  }

  /* ---------- public ---------- */
  setSelected(id) {
    this.selectedId = id;
    const t = TABLES.find(x => x.id === id);
    if (t) {
      this.ring.position.set(t.x, 0.012, t.z);
      this.ring2.position.set(t.x, 0.01, t.z);
    }
  }

  pickAt(cx, cy) {
    const ndc = new THREE.Vector2((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hits = ray.intersectObjects(this.pickMeshes, false);
    if (hits.length) return hits[0].object.userData.tableId;
    return null;
  }

  screenPos(id) {
    const t = TABLES.find(x => x.id === id);
    if (!t) return null;
    const v = new THREE.Vector3(t.x, 1.15, t.z).project(this.camera);
    return {
      x: (v.x * 0.5 + 0.5) * innerWidth,
      y: (-v.y * 0.5 + 0.5) * innerHeight,
      visible: v.z < 1
    };
  }
}
