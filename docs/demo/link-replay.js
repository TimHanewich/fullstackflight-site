// One-second samples from the recording: [time since last packet in ms, packet count].
const samples = [
  [75539, 0], [76552, 0], [77523, 0], [78542, 0], [79552, 0], [80526, 0],
  [78, 2], [78, 4], [38, 6], [39, 8], [39, 10], [0, 11], [89, 14], [0, 16],
  [489, 17], [466, 19], [467, 21], [488, 23], [428, 25], [428, 27], [389, 29],
  [389, 31], [390, 33], [389, 35], [380, 37], [388, 39],
  [0, 55], [0, 75], [0, 93], [0, 111], [39, 129], [0, 147], [0, 166], [0, 183], [38, 201]
];

// Approximate arrivals between snapshots, keeping the last arrival in each sample anchored.
const arrivals = [];
for (let i = 1; i < samples.length; i++) {
  const [age, count] = samples[i];
  const added = count - samples[i - 1][1];
  if (!added) continue;
  const end = i * 1000 - age;
  const start = Math.max((i - 1) * 1000, arrivals[arrivals.length - 1] ?? 0);
  for (let n = 1; n <= added; n++) arrivals.push(start + (end - start) * n / added);
}

const cycleMs = 34500; // Leaves about six seconds of silence between packet streams.

export function createLinkReplay(root) {
  const age = root.querySelector("[data-link-age]");
  const count = root.querySelector("[data-link-count]");
  const bar = root.querySelector("[data-link-bar]");
  const activity = root.querySelector("[data-link-activity]");
  let start;
  let lastTick = -1;

  function show(milliseconds, packets, symbol) {
    age.textContent = milliseconds;
    count.textContent = packets;
    bar.setAttribute("width", Math.round(238 * Math.min(1, milliseconds / 2500)));
    activity.textContent = symbol;
  }

  return {
    reset(still) {
      start = undefined;
      lastTick = -1;
      show(...(still ? samples[22] : [0, 0]), "/");
    },
    update(elapsed, still) {
      if (still) {
        if (lastTick !== -2) show(...samples[22], "/");
        lastTick = -2;
        return;
      }
      start ??= elapsed;
      const elapsedMs = (elapsed - start) * 1000;
      const tick = Math.floor(elapsedMs / 40);
      if (tick === lastTick) return;
      lastTick = tick;
      const cycle = Math.floor(elapsedMs / cycleMs);
      const time = elapsedMs % cycleMs;
      const next = arrivals.findIndex((arrival) => arrival > time);
      const packets = next === -1 ? arrivals.length : next;
      const previousCycleArrival = arrivals[arrivals.length - 1] - cycleMs;
      const lastArrival = arrivals[packets - 1] ?? (cycle ? previousCycleArrival : 0);
      const milliseconds = Math.floor(time - lastArrival);
      show(milliseconds, cycle * arrivals.length + packets, Math.floor(elapsedMs / 1000) % 2 === 0 ? "/" : "\\");
    }
  };
}
