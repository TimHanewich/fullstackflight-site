import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createPark } from "./park.js";
import { createRadioSignal } from "./radio.js";

const point = (x, y, z) => new THREE.Vector3(x, y, z);
const matte = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.88 });
const Y = point(0, 1, 0);
// Broad planes keep faces and clothing readable at park-scene scale.
const sphere = new THREE.SphereGeometry(1, 9, 6).toNonIndexed();
sphere.computeVertexNormals();
const jacketPanel = new THREE.CylinderGeometry(1, 1, 1, 8);
const shoulderPanel = new THREE.CylinderGeometry(0.72, 1, 1, 8);

function jacket(parent, x, y, z, height, body, stripe, collar) {
  const coat = group(parent, "Color-block jacket", x, y, z);
  shape(coat, jacketPanel, body, 0, height * 0.35, 0, 0.163, height * 0.70, 0.112);
  shape(coat, jacketPanel, stripe, 0, height * 0.75, 0, 0.163, height * 0.10, 0.112);
  shape(coat, shoulderPanel, collar, 0, height * 0.90, 0, 0.163, height * 0.20, 0.112);
  shape(coat, cube, stripe, 0, height * 0.40, -0.111, 0.009, height * 0.80, 0.006);
  return coat;
}
const cube = new THREE.BoxGeometry(1, 1, 1);
const woods = [0xa66d45, 0xb77e51, 0xbd8558, 0xb0764c].map(matte);
const frameWood = matte(0x865b40);
const hardware = matte(0x41494b);

function group(parent, name, x = 0, y = 0, z = 0) {
  const object = new THREE.Group();
  object.name = name;
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

function shape(parent, geometry, material, x, y, z, width = 1, height = 1, depth = 1) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.scale.set(width, height, depth);
  object.castShadow = object.receiveShadow = true;
  parent.add(object);
  return object;
}

function bar(parent, start, end, width, depth, material) {
  const delta = end.clone().sub(start);
  const center = start.clone().lerp(end, 0.5);
  const object = shape(parent, cube, material, ...center, width, delta.length(), depth);
  object.quaternion.setFromUnitVectors(Y, delta.normalize());
}

function limb(parent, start, end, radius, material) {
  const delta = end.clone().sub(start);
  const center = start.clone().lerp(end, 0.5);
  const object = shape(parent, new THREE.CapsuleGeometry(radius, delta.length(), 2, 7), material, ...center);
  object.quaternion.setFromUnitVectors(Y, delta.normalize());
}

function buildTable(station) {
  const table = new THREE.Group();
  const bolt = new THREE.CylinderGeometry(0.009, 0.009, 0.003, 8);
  for (let i = 0; i < 4; i++) {
    const z = i * 0.184 - 0.3;
    shape(table, cube, woods[i], 0, 0.752, z, 1.91, 0.051, 0.179);
    for (const x of [-0.665, 0.665]) shape(table, bolt, hardware, x, 0.779, z);
  }
  for (const side of [-1, 1]) {
    for (const [i, offset] of [0.51, 0.65].entries()) {
      shape(table, cube, woods[i + 1], 0, 0.428, side * offset, 1.91, 0.047, 0.131);
    }
    for (const x of [-0.68, 0.68]) {
      bar(table, point(x, 0.016, side * 0.62), point(x, 0.73, side * 0.25), 0.088, 0.069, frameWood);
    }
  }
  for (const x of [-0.68, 0.68]) {
    shape(table, cube, frameWood, x, 0.373, 0, 0.087, 0.065, 1.45);
    shape(table, cube, frameWood, x, 0.7, -0.018, 0.086, 0.06, 0.72);
    bar(table, point(x, 0.395, 0), point(x * 0.29, 0.685, 0), 0.06, 0.06, frameWood);
  }
  const bench = group(station, "Picnic table");
  batchModel(table, () => bench);
}

function buildHead(person, center, skin, hair, cap) {
  const head = group(person, "Head", ...center);
  const eyes = matte(0x302a2c);
  shape(head, sphere, skin, 0, -0.005, -0.008, 0.091, 0.115, 0.088);
  shape(head, sphere, hair, 0, 0.022, 0.027, 0.093, 0.089, 0.062);
  for (const side of [-1, 1]) {
    shape(head, sphere, skin, side * 0.088, -0.017, 0.002, 0.017, 0.029, 0.022);
    shape(head, sphere, eyes, side * 0.033, 0.001, -0.089, 0.008, 0.006, 0.004);
  }
  shape(head, sphere, skin, 0, -0.02, -0.091, 0.016, 0.021, 0.022);
  shape(head, sphere, eyes, 0, -0.052, -0.085, 0.018, 0.003, 0.004);
  head.scale.setScalar(1.09);
  if (cap) {
    // A knitted watch cap with a broad turned-up cuff.
    shape(head, sphere, cap, 0, 0.060, 0.004, 0.106, 0.09, 0.099);
    shape(head, jacketPanel, cap, 0, 0.043, 0, 0.106, 0.032, 0.099);
  } else {
    // A sculpted puff, swept fringe, and two small gold earrings.
    shape(head, sphere, hair, 0, 0.065, 0.015, 0.103, 0.079, 0.091);
    shape(head, sphere, hair, -0.026, 0.143, 0.066, 0.077, 0.074, 0.078);
    shape(head, sphere, hair, -0.040, 0.052, -0.065, 0.060, 0.032, 0.031).rotation.z = 0.38;
    const gold = matte(0xffbe39);
    for (const side of [-1, 1]) shape(head, sphere, gold, side * 0.097, -0.038, 0, 0.009, 0.012, 0.009);
  }
  return head;
}

function aimHead(head, target) {
  const { x, y, z } = target.clone().sub(head.position);
  head.rotation.order = "YXZ";
  head.rotation.y = Math.atan2(-x, -z);
  head.rotation.x = Math.atan2(y, Math.hypot(x, z));
}

function buildPilot(station) {
  const pilot = group(station, "Pilot");
  const skin = matte(0xcf8e63);
  const shirt = matte(0x087f82);
  const sleeve = matte(0x174963);
  const jeans = matte(0x224074);
  const shoes = matte(0xffad29);
  const sole = matte(0xf8edd2);
  shape(pilot, sphere, jeans, 0.045, 0.53, 0.57, 0.158, 0.102, 0.094);
  jacket(pilot, 0.045, 0.575, 0.58, 0.465, shirt, sole, sleeve).rotation.x = -0.10;
  limb(pilot, point(0.045, 1.02, 0.545), point(0.045, 1.115, 0.54), 0.048, skin);
  const head = buildHead(pilot, point(0.045, 1.165, 0.535), skin, matte(0x503428), shoes);

  for (const side of [-1, 1]) {
    const x = 0.045 + side * 0.108;
    const knee = point(x + side * 0.038, 0.438, 0.24);
    limb(pilot, point(x, 0.527, 0.55), knee, 0.072, jeans);
    limb(pilot, knee, point(x + side * 0.045, 0.14, 0.27), 0.058, jeans);
    shape(pilot, sphere, sole, x + side * 0.045, 0.027, 0.22, 0.061, 0.022, 0.119);
    shape(pilot, sphere, shoes, x + side * 0.045, 0.07, 0.223, 0.058, 0.06, 0.11);

    const shoulder = point(0.045 + side * 0.158, 0.966, 0.525);
    const elbow = point(0.045 + side * 0.197, 0.789, 0.43);
    const sleeveEnd = shoulder.clone().lerp(elbow, 0.48);
    const grip = point(0.045 + side * 0.078, 0.817, 0.24);
    limb(pilot, shoulder, sleeveEnd, 0.066, sleeve);
    limb(pilot, sleeveEnd, elbow, 0.043, skin);
    limb(pilot, elbow, grip, 0.032, skin);
    shape(pilot, sphere, skin, ...grip, 0.033, 0.025, 0.04);
    const stick = point(0.045 + (side < 0 ? -0.039 : 0.019) * 1.18, 0.829, -0.028 + (side < 0 ? 0.185 : 0.208) * 1.18);
    limb(pilot, grip.clone().add(point(0, 0.016, -0.012)), stick, 0.013, skin);
  }
  return head;
}

function buildObserver(scene, device) {
  const observer = group(scene, "Link observer", 3.05, 0, -7.25);
  observer.rotation.y = 2.52;
  const skin = matte(0x996145);
  const shirt = matte(0xec5265);
  const cream = matte(0xffefd7);
  const trousers = matte(0x284f9b);
  const shoes = matte(0x263249);
  shape(observer, sphere, trousers, 0, 0.84, 0.023, 0.153, 0.14, 0.104);
  jacket(observer, 0, 0.89, 0, 0.48, shirt, cream, matte(0xcc3859));
  limb(observer, point(0, 1.34, -0.004), point(0, 1.48, -0.005), 0.047, skin);
  const head = buildHead(observer, point(0, 1.545, -0.01), skin, matte(0x392725), null);
  const mount = group(observer, "Centauri Link", 0.025, 1.17, -0.315);
  mount.rotation.x = 0.28;
  mount.scale.setScalar(1.3);
  const shell = group(mount, "Link enclosure", -0.005, -0.081, -0.005);
  batchModel(device, () => shell);
  aimHead(head, mount.position);

  for (const side of [-1, 1]) {
    const hip = point(side * 0.091, 0.845, 0.008);
    const knee = point(side * 0.119, 0.46, side * 0.036);
    const ankle = point(side * 0.141, 0.118, side * 0.055);
    limb(observer, hip, knee, 0.072, trousers);
    limb(observer, knee, ankle, 0.055, trousers);
    shape(observer, sphere, cream, ankle.x, 0.026, ankle.z - 0.045, 0.067, 0.024, 0.124);
    shape(observer, sphere, shoes, ankle.x, 0.07, ankle.z - 0.044, 0.064, 0.062, 0.12);

    const shoulder = point(side * 0.159, 1.291, 0.011);
    const elbow = point(side * 0.193, 1.035, -0.09);
    const sleeveEnd = shoulder.clone().lerp(elbow, 0.43);
    const grip = point(mount.position.x + side * 0.083, 1.155, -0.308);
    limb(observer, shoulder, sleeveEnd, 0.061, shirt);
    limb(observer, sleeveEnd, elbow, 0.043, skin);
    limb(observer, elbow, grip, 0.033, skin);
    shape(observer, sphere, skin, ...grip, 0.032, 0.029, 0.038);
    limb(observer, grip.clone().add(point(0, 0.013, -0.013)), grip.clone().add(point(-side * 0.027, 0.033, -0.013)), 0.013, skin);
  }
  return { observer, monitor: mount };
}

function batchModel(model, destination) {
  model.updateMatrixWorld(true);
  const batches = new Map();
  // The GLBs contain hundreds of separate details. Batch by material within each movable part.
  model.traverse((object) => {
    if (!object.isMesh) return;
    const parent = destination(object);
    const { geometry, material } = object;
    const layout = Object.keys(geometry.attributes).sort().join(",");
    const key = `${parent.id}:${material.id}:${Boolean(geometry.index)}:${layout}`;
    if (!batches.has(key)) batches.set(key, { parent, material, geometries: [] });
    const baked = geometry.clone().applyMatrix4(object.matrixWorld);
    if (parent.userData.pivot) baked.translate(...parent.userData.pivot.clone().negate());
    batches.get(key).geometries.push(baked);
  });
  for (const { parent, material, geometries } of batches.values()) {
    const geometry = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries);
    if (!geometry) throw new Error(`Could not combine ${parent.name} model geometry.`);
    shape(parent, geometry, material, 0, 0, 0);
  }
}

function buildAircraft(scene, model) {
  const aircraft = group(scene, "Centauri quadcopter");
  aircraft.scale.setScalar(1.65);
  model.updateMatrixWorld(true);
  const blur = new THREE.MeshBasicMaterial({
    color: 0x5b625e, side: THREE.DoubleSide, transparent: true, opacity: 0.12, depthWrite: false
  });
  const rotors = Array.from({ length: 4 }, (_, index) => {
    const number = index + 1;
    const bell = model.getObjectByName(`Motor_${number}_prop_central_hub`);
    if (!bell) throw new Error(`Missing Centauri rotor ${number}.`);
    const pivot = bell.getWorldPosition(point());
    const rotor = group(aircraft, `Propeller ${number}`, ...pivot);
    rotor.userData.pivot = pivot;
    const disc = new THREE.Mesh(new THREE.RingGeometry(0.017, 0.065, 32), blur);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -0.0007;
    rotor.add(disc);
    return rotor;
  });
  batchModel(model, (object) => {
    const blade = /^Motor_(\d)_smoked_prop_blade_/.exec(object.name);
    return blade ? rotors[Number(blade[1]) - 1] : aircraft;
  });
  return { aircraft, rotors };
}

function hotspotCorners(subject) {
  subject.updateWorldMatrix(true, true);
  const toLocal = subject.matrixWorld.clone().invert();
  const bounds = new THREE.Box3();
  const transform = new THREE.Matrix4();
  const meshBounds = new THREE.Box3();
  subject.traverse((object) => {
    if (!object.isMesh) return;
    if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
    transform.multiplyMatrices(toLocal, object.matrixWorld);
    bounds.union(meshBounds.copy(object.geometry.boundingBox).applyMatrix4(transform));
  });
  const { min, max } = bounds;
  return [min.x, max.x].flatMap((x) =>
    [min.y, max.y].flatMap((y) => [min.z, max.z].map((z) => point(x, y, z)))
  );
}

export async function startDemo() {
  const canvas = document.getElementById("park");
  const stage = canvas.parentElement;
  const status = document.getElementById("demo-status");
  const toolbar = document.getElementById("demo-toolbar");
  const hotspotLayer = document.getElementById("demo-hotspots");
  const overviewHotspotLabel = hotspotLayer.getAttribute("aria-label");
  const backButton = document.getElementById("demo-overview");
  const caption = document.getElementById("demo-view-caption");
  const overviewCaption = caption.textContent;
  const transmitterCaption = "Select the laptop or the transceiver platform to learn more.";
  const motionButton = document.getElementById("demo-motion");
  const details = document.getElementById("demo-details");
  const detailsTitle = document.getElementById("demo-details-title");
  const detailsClose = document.getElementById("demo-details-close");
  const detailsSections = new Map([...details.querySelectorAll("[data-details]")].map((section) => [section.dataset.details, section]));
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  try {
    const loader = new GLTFLoader();
    const [transmitter, quadcopter, link] = await Promise.all(
      ["transmitter", "quadcopter", "link"].map((name) => loader.loadAsync(`../models/${name}.glb`))
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.03;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    createPark(scene);

    const station = group(scene, "Pilot station", -1.15, 0, 1.15);
    station.rotation.y = -0.52;
    buildTable(station);
    const pilotHead = buildPilot(station);
    const assembly = group(station, "Centauri transmitter", 0.045, 0.778, -0.028);
    assembly.scale.setScalar(1.18);
    const laptop = group(assembly, "Transmitter laptop");
    const transceiver = group(assembly, "Transceiver platform");
    const controller = group(station, "Wired Xbox controller", ...assembly.position);
    controller.scale.copy(assembly.scale);
    const platformNames = /^(Transmitter_platform_|Antenna_|USB_(serial|plug|activity)|Continuous_platform_to_USB_wire|Pico_HC12_jumper_|Jumper_socket)/;
    batchModel(transmitter.scene, (object) => {
      if (object.name.startsWith("Gamepad_")) return controller;
      for (let node = object; node !== transmitter.scene; node = node.parent) {
        if (platformNames.test(node.name)) return transceiver;
      }
      return laptop;
    });
    const { aircraft, rotors } = buildAircraft(scene, quadcopter.scene);
    const { observer, monitor } = buildObserver(scene, link.scene);
    const radio = createRadioSignal(scene,
      { subject: transceiver, model: transmitter.scene },
      { subject: aircraft, model: quadcopter.scene }
    );

    const camera = new THREE.PerspectiveCamera(34, 1, 0.025, 135);
    const cameraTarget = point();
    const views = {
      overview: { eye: point(2.65, 2.6, 6.6), target: point(0, 0.66, -2.15), fov: 38, fit: 1.82 },
      transmitter: {
        eye: station.localToWorld(point(-0.21, 1.57, 0.65)),
        target: station.localToWorld(point(-0.075, 0.884, -0.055)),
        fov: 45, fit: 1.65
      },
      quadcopter: {
        eye: point(1.66, 2.52, -1.34), target: point(1.02, 1.995, -2.27),
        fov: 48, fit: 1.3
      },
      radio: {
        eye: point(3.65, 2.65, 2.13), target: point(-0.04, 1.58, -0.70),
        fov: 36, fit: 1.65,
        caption: "The green pulses show pilot commands traveling by radio from the transmitter to the quadcopter."
      },
      link: {
        eye: observer.localToWorld(point(0.16, 1.56, -0.14)),
        target: monitor.localToWorld(point(0, 0.016, -0.008)),
        fov: 37, fit: 1.05
      }
    };
    const subjects = { transmitter: assembly, laptop, transceiver, quadcopter: aircraft, radio: radio.hotspot, link: monitor };
    const hotspots = [...hotspotLayer.querySelectorAll("[data-view]")].map((button) => {
      const subject = subjects[button.dataset.view];
      return {
        button, subject, scope: button.dataset.hotspotScope ?? "overview",
        corners: subject === radio.hotspot ? [point()] : hotspotCorners(subject)
      };
    });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let playing = !reducedMotion.matches;
    let viewName = "overview";
    let transition = null;
    let returnFocus = null;
    let partFocus = null;
    let stageWidth = 0;
    let stageHeight = 0;
    let frameWidth = 0;
    let frameHeight = 0;
    let shiftX = 0;
    let shiftY = 0;
    let visible = true;
    let stopped = false;
    let frameId = 0;
    let previousTime;
    let elapsed = 0;
    const pilotTarget = point();
    const projected = point();

    function updateAircraft() {
      aircraft.position.set(
        1.02 + 0.15 * Math.sin(elapsed * 0.71),
        2.03 + 0.072 * Math.sin(elapsed * 1.75),
        -2.27 + 0.13 * Math.sin(elapsed * 0.86)
      );
      aircraft.rotation.set(0.044 * Math.sin(elapsed * 1.25), -0.34 + 0.1 * Math.sin(elapsed * 0.61), -0.061 * Math.cos(elapsed));
      for (const [index, rotor] of rotors.entries()) {
        rotor.rotation.y = elapsed * 22 * ([0, 3].includes(index) ? 1 : -1);
      }
      aimHead(pilotHead, station.worldToLocal(pilotTarget.copy(aircraft.position)));
    }

    function scheduleRender() {
      if (!frameId && !stopped && visible && !document.hidden) frameId = requestAnimationFrame(renderFrame);
    }

    function updateHotspots() {
      for (const { button, subject, scope, corners } of hotspots) {
        if (scope !== viewName) continue;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const corner of corners) {
          projected.copy(corner).applyMatrix4(subject.matrixWorld).project(camera);
          const x = (1 + projected.x) * stageWidth / 2;
          const y = (1 - projected.y) * stageHeight / 2;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
        button.style.left = `${(minX + maxX) / 2}px`;
        button.style.top = `${(minY + maxY) / 2}px`;
        const padding = scope === "transmitter" ? 1.05 : 1.27;
        button.style.setProperty("--halo-width", `${Math.max(28, (maxX - minX) * padding + 8)}px`);
        button.style.setProperty("--halo-height", `${Math.max(24, (maxY - minY) * padding + 8)}px`);
      }
      if (hotspotLayer.hidden) {
        hotspotLayer.hidden = false;
        if (viewName === "overview") {
          caption.textContent = overviewCaption;
          returnFocus?.focus({ preventScroll: true });
          returnFocus = null;
          backButton.hidden = true;
        } else if (document.activeElement === backButton) {
          hotspots.find(({ scope }) => scope === viewName).button.focus({ preventScroll: true });
        }
      }
    }

    function measureFraming() {
      frameWidth = stageWidth;
      frameHeight = stageHeight;
      if (!details.open) return;
      const bounds = stage.getBoundingClientRect();
      const panel = details.getBoundingClientRect();
      const dock = getComputedStyle(details).getPropertyValue("--details-dock").trim();
      if (dock === "bottom") frameHeight = panel.top - bounds.top - 10;
      else frameWidth = panel.left - bounds.left - 10;
    }

    function placeCamera(amount = 1) {
      const view = views[viewName];
      const halfFov = THREE.MathUtils.degToRad(view.fov / 2);
      // Fit the close-up in the uncovered part of the canvas, then shift the full projection into place.
      const zoom = Math.max(1, view.fit / (frameWidth / frameHeight)) * stageHeight / frameHeight;
      const fittedFov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfFov) * zoom));
      const offsetX = (1 - frameWidth / stageWidth) / 2;
      const offsetY = (1 - frameHeight / stageHeight) / 2;
      if (transition) {
        camera.position.lerpVectors(transition.eye, view.eye, amount);
        cameraTarget.lerpVectors(transition.target, view.target, amount);
        camera.fov = THREE.MathUtils.lerp(transition.fov, fittedFov, amount);
        shiftX = THREE.MathUtils.lerp(transition.shiftX, offsetX, amount);
        shiftY = THREE.MathUtils.lerp(transition.shiftY, offsetY, amount);
      } else {
        camera.position.copy(view.eye);
        cameraTarget.copy(view.target);
        camera.fov = fittedFov;
        shiftX = offsetX;
        shiftY = offsetY;
      }
      camera.lookAt(cameraTarget);
      if (shiftX || shiftY) {
        camera.setViewOffset(stageWidth, stageHeight, shiftX * stageWidth, shiftY * stageHeight, stageWidth, stageHeight);
      } else {
        camera.clearViewOffset();
      }
    }

    function renderScene() {
      updateAircraft();
      radio.group.visible = viewName === "overview" || viewName === "radio";
      if (radio.group.visible) radio.update(elapsed, camera);
      renderer.render(scene, camera);
      if ((viewName === "overview" || viewName === "transmitter") && (!transition || !hotspotLayer.hidden)) updateHotspots();
    }

    function renderFrame(time) {
      frameId = 0;
      if (stopped || !visible || document.hidden) return;
      if (playing && previousTime !== undefined) elapsed += Math.min((time - previousTime) / 1000, 0.05);
      previousTime = playing ? time : undefined;
      if (transition) {
        const progress = reducedMotion.matches ? 1 : THREE.MathUtils.clamp((time - transition.start) / 650, 0, 1);
        placeCamera(progress * progress * (3 - 2 * progress));
        if (progress === 1) transition = null;
      }
      renderScene();
      if (playing || transition) scheduleRender();
    }

    function resize() {
      const { clientWidth: width, clientHeight: height } = stage;
      if (!width || !height) return;
      if (stageWidth !== width || stageHeight !== height) {
        stageWidth = width;
        stageHeight = height;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
      }
      measureFraming();
      if (!transition) placeCamera();
      scheduleRender();
    }

    function reframe() {
      transition = reducedMotion.matches ? null : {
        start: performance.now(), eye: camera.position.clone(), target: cameraTarget.clone(), fov: camera.fov, shiftX, shiftY
      };
      resize();
    }

    function showDetails(name) {
      const section = detailsSections.get(name);
      detailsTitle.textContent = section.dataset.title;
      details.dataset.view = name;
      detailsSections.forEach((item) => { item.hidden = item !== section; });
      section.scrollTop = 0;
      if (details.open) detailsClose.focus({ preventScroll: true });
      else details.show();
    }

    function selectView(name, button) {
      if (viewName === name) return;
      viewName = name;
      if (button) {
        returnFocus = button;
        backButton.hidden = false;
        if (name === "transmitter") {
          caption.textContent = transmitterCaption;
          backButton.focus({ preventScroll: true });
        } else {
          showDetails(name);
          caption.textContent = views[name].caption ?? `${detailsTitle.textContent} close-up`;
        }
      } else {
        details.close();
        partFocus = null;
        backButton.focus({ preventScroll: true });
      }
      hotspotLayer.hidden = true;
      hotspotLayer.setAttribute("aria-label", name === "transmitter" ? "Explore the transmitter assembly" : overviewHotspotLabel);
      hotspots.forEach(({ button: hotspot, scope }) => { hotspot.hidden = scope !== name; });
      reframe();
    }

    function selectTransmitterPart(button) {
      partFocus = button;
      showDetails(button.dataset.view);
      reframe();
    }

    function closeDetails() {
      if (viewName !== "transmitter") {
        selectView("overview");
      } else if (details.open) {
        details.close();
        partFocus?.focus({ preventScroll: true });
        partFocus = null;
        reframe();
      } else {
        selectView("overview");
      }
    }

    function setPlaying(value) {
      playing = value;
      previousTime = undefined;
      motionButton.textContent = playing ? "Pause motion" : "Resume motion";
      scheduleRender();
    }

    hotspots.forEach(({ button, scope }) => {
      button.addEventListener("click", () => {
        if (scope === "transmitter") selectTransmitterPart(button);
        else selectView(button.dataset.view, button);
      });
    });
    backButton.addEventListener("click", () => selectView("overview"));
    detailsClose.addEventListener("click", closeDetails);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && viewName !== "overview" && !stopped) {
        event.preventDefault();
        closeDetails();
      }
    });
    motionButton.addEventListener("click", () => setPlaying(!playing));
    reducedMotion.addEventListener("change", (event) => setPlaying(!event.matches));
    document.addEventListener("visibilitychange", () => {
      previousTime = undefined;
      scheduleRender();
    });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resizeObserver.observe(details);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previousTime = undefined;
      scheduleRender();
    }).observe(stage);
    canvas.addEventListener("webglcontextlost", () => {
      stopped = true;
      details.close();
      hotspotLayer.hidden = true;
      backButton.hidden = true;
      toolbar.hidden = true;
      status.textContent = "The 3D view was interrupted. Reload the page to try again.";
      status.hidden = false;
    });
    resize();
    setPlaying(playing);
    renderScene();
    status.hidden = true;
    toolbar.hidden = false;
  } catch (error) {
    renderer.dispose();
    throw error;
  }
}
