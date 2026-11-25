import * as THREE from "three";

const Y = new THREE.Vector3(0, 1, 0);

function randomSource(seed) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function addSky(scene) {
  const horizon = new THREE.Color(0xd8e9dc);
  scene.fog = new THREE.Fog(horizon, 15, 58);
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(90, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        horizon: { value: horizon },
        zenith: { value: new THREE.Color(0x5ca7dc) }
      },
      vertexShader: `
        varying vec3 direction;
        void main() {
          direction = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 horizon;
        uniform vec3 zenith;
        varying vec3 direction;
        void main() {
          float elevation = normalize(direction).y;
          gl_FragColor = vec4(mix(horizon, zenith, smoothstep(-0.02, 0.62, elevation)), 1.0);
          #include <colorspace_fragment>
        }
      `
    })
  ));

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  for (const [x, y, radius] of [[47, 58, 31], [81, 46, 40], [119, 39, 38], [153, 55, 33], [186, 61, 29], [211, 63, 23]]) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0.35, "rgba(255, 253, 243, .87)");
    glow.addColorStop(0.7, "rgba(255, 255, 255, .35)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map, opacity: 0.8, depthWrite: false, fog: false, toneMapped: false });
  for (const [x, y, z, width] of [[-21, 7, -39, 19], [6, 9.5, -46, 23], [28, 8, -39, 16], [37, 10, 9, 17], [-31, 8, 19, 20], [3, 10, 36, 15]]) {
    const cloud = new THREE.Sprite(material);
    cloud.position.set(x, y, z);
    cloud.scale.set(width, width * 0.32, 1);
    scene.add(cloud);
  }
}

function addMeadow(scene, random) {
  const ground = new THREE.PlaneGeometry(136, 136, 96, 96).rotateX(-Math.PI / 2);
  const positions = ground.getAttribute("position");
  const colors = [];
  const lawn = new THREE.Color(0x739449);
  const meadow = new THREE.Color(0xa6b968);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const variation = 0.48 + 0.19 * Math.sin(x * 0.47 + Math.cos(z * 0.39))
      + 0.16 * Math.cos(z * 0.75 - x * 0.19) + random() * 0.17;
    const color = lawn.clone().lerp(meadow, variation);
    colors.push(color.r, color.g, color.b);
  }
  ground.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(ground, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  mesh.receiveShadow = true;
  scene.add(mesh);

  const trail = (x) => -7.45 + Math.sin(x * 0.17) * 2.1 - x * 0.06;
  const path = new THREE.BufferGeometry();
  const vertices = [];
  const pathColors = [];
  const indices = [];
  const gravel = new THREE.Color(0xc9ae87);
  for (let i = 0; i <= 144; i++) {
    const x = i * 0.64 - 46;
    const center = trail(x);
    const halfWidth = 0.84 + Math.cos(x * 0.7) * 0.07 + random() * 0.09;
    for (const edge of [-1, -0.75, 0, 0.75, 1]) {
      vertices.push(x, 0.013, center + halfWidth * edge);
      const color = gravel.clone().multiplyScalar(0.86 + random() * 0.15 - Math.abs(edge) * 0.08);
      pathColors.push(color.r, color.g, color.b);
    }
    if (i < 144) {
      for (let j = 0; j < 4; j++) {
        const k = i * 5 + j;
        indices.push(k, k + 1, k + 5, k + 1, k + 6, k + 5);
      }
    }
  }
  path.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  path.setAttribute("color", new THREE.Float32BufferAttribute(pathColors, 3));
  path.setIndex(indices);
  path.computeVertexNormals();
  const walkway = new THREE.Mesh(path, mesh.material);
  walkway.receiveShadow = true;
  scene.add(walkway);

  const blades = new THREE.BufferGeometry();
  blades.setAttribute("position", new THREE.Float32BufferAttribute([
    -0.025, 0, 0, 0.022, 0, 0, -0.045, 0.18, 0.014,
    -0.004, 0, -0.023, -0.004, 0, 0.026, 0.032, 0.24, 0.038,
    0.016, 0, 0.023, 0.052, 0, 0.008, 0.085, 0.13, 0.051
  ], 3));
  blades.computeVertexNormals();
  const plantMaterial = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 1 });
  const grass = new THREE.InstancedMesh(blades, plantMaterial, 1900);
  const flowers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.02), plantMaterial, 140);
  const stems = new THREE.InstancedMesh(blades, plantMaterial, 140);
  const clump = new THREE.Object3D();
  let flower = 0;
  for (let i = 0; i < grass.count; i++) {
    const x = (random() - 0.5) * 19;
    let z = 5.2 - random() * 18;
    if (Math.abs(z - trail(x)) < 1.03) z = trail(x) + 1.06 + random() * 0.65;
    let size = 0.34 + random() * 0.62;
    if (Math.abs(x + 1.15) < 1.75 && Math.abs(z - 1.15) < 1.5) size *= 0.32;
    clump.position.set(x, 0, z);
    clump.rotation.y = random() * Math.PI * 2;
    clump.scale.setScalar(size);
    clump.updateMatrix();
    grass.setMatrixAt(i, clump.matrix);
    grass.setColorAt(i, new THREE.Color([0x708e42, 0x93aa50, 0xb9c674][i % 3]));
    if (flower < flowers.count && (x < -3.1 || x > 2.5) && z > -5.8 && size > 0.6) {
      stems.setMatrixAt(flower, clump.matrix);
      stems.setColorAt(flower, new THREE.Color(0x67864d));
      clump.position.add(new THREE.Vector3(0.032, 0.24, 0.038).multiplyScalar(size).applyAxisAngle(Y, clump.rotation.y));
      clump.updateMatrix();
      flowers.setMatrixAt(flower, clump.matrix);
      flowers.setColorAt(flower++, new THREE.Color(i % 4 ? 0xf6ebdf : 0xf0bf54));
    }
  }
  stems.count = flowers.count = flower;
  scene.add(grass, stems, flowers);
}

function addTrees(scene, random) {
  const trees = [
    [-6.4, 2.8, 4.7], [-6.8, -4.4, 5.1], [6.8, -3.5, 5.3], [8.9, 4.2, 4.8],
    [6.0, -11.9, 4.2], [-5.0, -11.8, 4.3], [-9.7, -10.9, 4.7], [10.5, -10.2, 5.3],
    [2.4, 10.2, 4.4], [-7.3, 10.5, 5.0], [9.5, 11.8, 5.2]
  ];
  for (let i = 0; i < 53; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 15 + random() * 25;
    trees.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 2.6 + random() * 4.9]);
  }
  const bark = new THREE.MeshStandardMaterial({ color: 0x7d6048, roughness: 1 });
  const leaves = new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true });
  const colors = [0x6f934d, 0x8aac52, 0x95ac56, 0x638d52, 0xa2b961].map((c) => new THREE.Color(c));
  const branches = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 1, 1, 8), bark, trees.length * 3);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), leaves, trees.length * 7);
  const shadowBranches = new THREE.InstancedMesh(branches.geometry, bark, 24);
  const shadowCrowns = new THREE.InstancedMesh(crowns.geometry, leaves, 56);
  shadowBranches.castShadow = shadowCrowns.castShadow = true;
  shadowBranches.receiveShadow = shadowCrowns.receiveShadow = true;
  const form = new THREE.Object3D();
  let nearBranch = 0, farBranch = 0, nearCrown = 0, farCrown = 0;
  for (const [treeIndex, [x, z, height]] of trees.entries()) {
    const near = treeIndex < 8;
    const turn = random() * Math.PI * 2;
    const width = height * (0.25 + random() * 0.09);
    const base = new THREE.Vector3(x, 0, z);
    for (const [dx, dy, dz, length, radius, tilt] of [
      [0, 0.34, 0, 0.68, 0.035, 0.035], [0.09, 0.54, 0, 0.36, 0.022, -0.54], [-0.08, 0.52, 0.045, 0.35, 0.02, 0.57]
    ]) {
      form.position.set(dx * height, dy * height, dz * height).applyAxisAngle(Y, turn).add(base);
      form.rotation.set(0, 0, tilt);
      form.rotateOnWorldAxis(Y, turn);
      form.scale.set(radius * height, length * height, radius * height);
      form.updateMatrix();
      if (near) shadowBranches.setMatrixAt(nearBranch++, form.matrix);
      else branches.setMatrixAt(farBranch++, form.matrix);
    }
    const canopy = [[0, 0.85, 0, 1], [0.67, 0.74, 0.38, 0.8], [-0.68, 0.76, 0.25, 0.82],
      [0.2, 0.72, -0.73, 0.85], [-0.39, 0.92, -0.49, 0.71], [0.34, 0.95, 0.28, 0.71], [-0.08, 0.7, 0.71, 0.74]];
    for (const [dx, dy, dz, scale] of canopy) {
      form.position.set(dx * width, dy * height, dz * width).applyAxisAngle(Y, turn).add(base);
      form.rotation.set(random(), random() * 6, random());
      form.scale.set(width * scale, height * 0.25 * scale, width * scale * 0.92);
      form.updateMatrix();
      const target = near ? shadowCrowns : crowns;
      const index = near ? nearCrown++ : farCrown++;
      target.setMatrixAt(index, form.matrix);
      target.setColorAt(index, colors[Math.floor(random() * colors.length)]);
    }
  }
  branches.count = farBranch;
  crowns.count = farCrown;
  scene.add(branches, crowns, shadowBranches, shadowCrowns);
}

export function createPark(scene) {
  const random = randomSource(12617);
  addSky(scene);
  addMeadow(scene, random);
  addTrees(scene, random);

  scene.add(new THREE.HemisphereLight(0xe4f3ff, 0xb6a27d, 1.55));
  const sunlight = new THREE.DirectionalLight(0xffefd0, 2.35);
  sunlight.position.set(-7, 12, 4);
  sunlight.target.position.set(0, 0, -2);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = sunlight.shadow.camera.bottom = -10;
  sunlight.shadow.camera.right = sunlight.shadow.camera.top = 10;
  sunlight.shadow.camera.far = 34;
  sunlight.shadow.normalBias = 0.015;
  sunlight.shadow.bias = -0.00015;
  scene.add(sunlight, sunlight.target);
}
