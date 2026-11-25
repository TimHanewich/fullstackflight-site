import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createPark } from "./park.js";
import { createRadioSignal } from "./radio.js";

const point = (x, y, z) => new THREE.Vector3(x, y, z);
const matte = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.88 });
const Y = point(0, 1, 0);
const sphere = new THREE.SphereGeometry(1, 20, 12);
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
  const object = shape(parent, new THREE.CapsuleGeometry(radius, delta.length(), 4, 10), material, ...center);
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
  shape(head, sphere, cap, 0, 0.048, 0.006, 0.104, 0.073, 0.101);
  shape(head, sphere, cap, 0, 0.035, -0.087, 0.095, 0.012, 0.077);
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
  const shirt = matte(0x2d687e);
  const sleeve = matte(0x376f83);
  const jeans = matte(0x374b62);
  const shoes = matte(0x343b3e);
  const sole = matte(0xc9bea8);
  shape(pilot, sphere, jeans, 0.045, 0.53, 0.57, 0.158, 0.102, 0.094);
  shape(pilot, sphere, shirt, 0.045, 0.811, 0.56, 0.176, 0.265, 0.12).rotation.x = 0.12;
  shape(pilot, sphere, shirt, 0.045, 0.924, 0.621, 0.134, 0.13, 0.073);
  limb(pilot, point(0.045, 1.02, 0.545), point(0.045, 1.115, 0.54), 0.048, skin);
  const head = buildHead(pilot, point(0.045, 1.165, 0.535), skin, matte(0x503428), matte(0xdac7a3));

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
  const shirt = matte(0xc16744);
  const trousers = matte(0x4d5650);
  const shoes = matte(0x393631);
  shape(observer, sphere, trousers, 0, 0.84, 0.023, 0.153, 0.14, 0.104);
  shape(observer, sphere, shirt, 0, 1.12, 0, 0.176, 0.293, 0.104);
  limb(observer, point(0, 1.34, -0.004), point(0, 1.48, -0.005), 0.047, skin);
  const head = buildHead(observer, point(0, 1.545, -0.01), skin, matte(0x302c28), matte(0x5c6645));
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
  const backButton = document.getElementById("demo-overview");
  const caption = document.getElementById("demo-view-caption");
  const overviewCaption = caption.textContent;
  const motionButton = document.getElementById("demo-motion");
  const details = document.getElementById("demo-details");
  const detailsTitle = document.getElementById("demo-details-title");
  const detailsClose = document.getElementById("demo-details-close");
  const detailsSections = [...details.querySelectorAll("[data-details]")];
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
    const laptop = group(station, "Centauri transmitter", 0.045, 0.778, -0.028);
    laptop.scale.setScalar(1.18);
    const controller = group(station, "Wired Xbox controller", ...laptop.position);
    controller.scale.copy(laptop.scale);
    batchModel(transmitter.scene, (object) => object.name.startsWith("Gamepad_") ? controller : laptop);
    const { aircraft, rotors } = buildAircraft(scene, quadcopter.scene);
    const { observer, monitor } = buildObserver(scene, link.scene);
    const radio = createRadioSignal(scene,
      { subject: laptop, model: transmitter.scene },
      { subject: aircraft, model: quadcopter.scene }
    );

    const camera = new THREE.PerspectiveCamera(34, 1, 0.025, 135);
    const cameraTarget = point();
    const views = {
      overview: { eye: point(2.65, 2.6, 6.6), target: point(0, 0.66, -2.15), fov: 38, fit: 1.82 },
      transmitter: {
        eye: station.localToWorld(point(-0.64, 1.43, 0.54)),
        target: station.localToWorld(point(-0.08, 0.885, -0.055)),
        fov: 36, fit: 1.35, label: "Centauri transmitter"
      },
      quadcopter: {
        eye: point(1.66, 2.52, -1.34), target: point(1.02, 2.075, -2.27),
        fov: 34, fit: 1.3, label: "Centauri quadcopter"
      },
      radio: {
        eye: point(3.65, 2.65, 2.13), target: point(-0.04, 1.58, -0.70),
        fov: 36, fit: 1.65, label: "Radio communication protocol",
        caption: "The green pulses show pilot commands traveling by radio from the transmitter to the quadcopter."
      },
      link: {
        eye: observer.localToWorld(point(0.16, 1.56, -0.14)),
        target: monitor.localToWorld(point(0, 0.016, -0.008)),
        fov: 37, fit: 1.05, label: "Centauri Link"
      }
    };
    const subjects = { transmitter: laptop, quadcopter: aircraft, radio: radio.hotspot, link: monitor };
    const hotspots = [...hotspotLayer.querySelectorAll("[data-view]")].map((button) => {
      const subject = subjects[button.dataset.view];
      return { button, subject, corners: subject === radio.hotspot ? [point()] : hotspotCorners(subject) };
    });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let playing = !reducedMotion.matches;
    let viewName = "overview";
    let transition = null;
    let returnFocus = null;
    let stageWidth = 0;
    let stageHeight = 0;
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
      for (const { button, subject, corners } of hotspots) {
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
        button.style.setProperty("--halo-width", `${Math.max(28, (maxX - minX) * 1.27 + 8)}px`);
        button.style.setProperty("--halo-height", `${Math.max(24, (maxY - minY) * 1.27 + 8)}px`);
      }
      if (hotspotLayer.hidden) {
        hotspotLayer.hidden = false;
        caption.textContent = overviewCaption;
        returnFocus?.focus({ preventScroll: true });
        returnFocus = null;
        backButton.hidden = true;
      }
    }

    function placeCamera(amount = 1) {
      const view = views[viewName];
      const halfFov = THREE.MathUtils.degToRad(view.fov / 2);
      const fittedFov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfFov) * Math.max(1, view.fit / camera.aspect)));
      if (transition) {
        camera.position.lerpVectors(transition.eye, view.eye, amount);
        cameraTarget.lerpVectors(transition.target, view.target, amount);
        camera.fov = THREE.MathUtils.lerp(transition.fov, fittedFov, amount);
      } else {
        camera.position.copy(view.eye);
        cameraTarget.copy(view.target);
        camera.fov = fittedFov;
      }
      camera.lookAt(cameraTarget);
      camera.updateProjectionMatrix();
    }

    function renderScene() {
      updateAircraft();
      radio.group.visible = viewName === "overview" || viewName === "radio";
      if (radio.group.visible) radio.update(elapsed, camera);
      renderer.render(scene, camera);
      if (viewName === "overview" && !transition) updateHotspots();
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
      stageWidth = width;
      stageHeight = height;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      if (!transition) placeCamera();
      scheduleRender();
    }

    function selectView(name, button) {
      if (viewName === name) return;
      viewName = name;
      if (button) {
        returnFocus = button;
        backButton.hidden = false;
        const view = views[name];
        detailsTitle.textContent = view.label;
        details.dataset.view = name;
        detailsSections.forEach((section) => { section.hidden = section.dataset.details !== name; });
        details.show();
        caption.textContent = view.caption ?? `${view.label} close-up`;
      } else {
        details.close();
        backButton.focus({ preventScroll: true });
      }
      hotspotLayer.hidden = true;
      transition = reducedMotion.matches ? null : {
        start: performance.now(), eye: camera.position.clone(), target: cameraTarget.clone(), fov: camera.fov
      };
      if (!transition) placeCamera();
      scheduleRender();
    }

    function setPlaying(value) {
      playing = value;
      previousTime = undefined;
      motionButton.textContent = playing ? "Pause motion" : "Resume motion";
      scheduleRender();
    }

    hotspots.forEach(({ button }) => {
      button.addEventListener("click", () => selectView(button.dataset.view, button));
    });
    backButton.addEventListener("click", () => selectView("overview"));
    detailsClose.addEventListener("click", () => selectView("overview"));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && viewName !== "overview" && !stopped) {
        event.preventDefault();
        selectView("overview");
      }
    });
    motionButton.addEventListener("click", () => setPlaying(!playing));
    reducedMotion.addEventListener("change", (event) => setPlaying(!event.matches));
    document.addEventListener("visibilitychange", () => {
      previousTime = undefined;
      scheduleRender();
    });
    new ResizeObserver(resize).observe(stage);
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
