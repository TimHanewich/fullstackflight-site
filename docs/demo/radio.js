import * as THREE from "three";

function antennaTip(model, namePrefix) {
  let antenna;
  model.traverse((object) => {
    if (!antenna && object.name.startsWith(namePrefix)) antenna = object;
  });
  if (!antenna) throw new Error(`Missing antenna in ${namePrefix}.`);
  const bounds = new THREE.Box3().setFromObject(antenna);
  const tip = bounds.getCenter(new THREE.Vector3());
  tip.y = bounds.max.y;
  return tip;
}

function makePulseTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(20, 15);
  ctx.lineTo(47, 32);
  ctx.lineTo(20, 49);
  ctx.lineTo(20, 38);
  ctx.lineTo(30, 32);
  ctx.lineTo(20, 26);
  ctx.closePath();
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#163d37";
  ctx.stroke();
  ctx.fillStyle = "#91ffd0";
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRadioSignal(scene, transmitter, receiver) {
  const sourceTip = antennaTip(transmitter.model, "Antenna_tip_core_");
  const receiverTip = antennaTip(receiver.model, "Actual_antenna_");
  const group = new THREE.Group();
  group.name = "Radio communication";
  scene.add(group);
  const hotspot = new THREE.Object3D();
  group.add(hotspot);

  const curve = new THREE.QuadraticBezierCurve3();
  const vertexCount = 33;
  const positions = new THREE.Float32BufferAttribute(vertexCount * 3, 3).setUsage(THREE.DynamicDrawUsage);
  const path = new THREE.BufferGeometry().setAttribute("position", positions);
  const trail = new THREE.Line(path, new THREE.LineBasicMaterial({
    color: 0x7afac0, transparent: true, opacity: 0.78, depthWrite: false, toneMapped: false
  }));
  trail.frustumCulled = false;
  group.add(trail);

  const texture = makePulseTexture();
  const pulses = Array.from({ length: 6 }, () => {
    const pulse = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false, toneMapped: false }));
    pulse.scale.setScalar(0.19);
    group.add(pulse);
    return pulse;
  });
  const endpointGeometry = new THREE.SphereGeometry(0.021, 12, 8);
  const endpointMaterial = new THREE.MeshBasicMaterial({ color: 0x9bffd5, toneMapped: false });
  const endpoints = [new THREE.Mesh(endpointGeometry, endpointMaterial), new THREE.Mesh(endpointGeometry, endpointMaterial)];
  group.add(...endpoints);

  const sample = new THREE.Vector3();
  const direction = new THREE.Vector3();
  function update(elapsed, camera) {
    transmitter.subject.localToWorld(curve.v0.copy(sourceTip));
    receiver.subject.localToWorld(curve.v2.copy(receiverTip));
    curve.v1.copy(curve.v0).lerp(curve.v2, 0.5);
    curve.v1.y += 1.48;
    curve.getPoint(0.46, hotspot.position);
    endpoints[0].position.copy(curve.v0);
    endpoints[1].position.copy(curve.v2);
    for (let i = 0; i < vertexCount; i++) {
      curve.getPoint(i / (vertexCount - 1), sample);
      positions.setXYZ(i, sample.x, sample.y, sample.z);
    }
    positions.needsUpdate = true;

    camera.updateMatrixWorld();
    pulses.forEach((pulse, index) => {
      const progress = (0.08 + index / pulses.length + elapsed * 0.52) % 1;
      curve.getPoint(progress, pulse.position);
      curve.getTangent(progress, direction).transformDirection(camera.matrixWorldInverse);
      pulse.material.rotation = Math.atan2(direction.y, direction.x);
      pulse.material.opacity = Math.min(1, progress * 18, (1 - progress) * 18);
    });
  }

  return { group, hotspot, update };
}
