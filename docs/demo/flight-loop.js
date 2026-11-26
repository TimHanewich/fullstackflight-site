const secondsPerStep = 0.3;

export function createFlightLoop(root) {
  const steps = [...root.querySelectorAll("[data-step]")];
  const title = root.querySelector("[data-step-title]");
  const description = root.querySelector("[data-step-description]");
  let active = -1;
  let inspected = -1;
  let selected = 0;
  let hovered = null;
  let focused = null;
  let start;

  function showExplanation() {
    const index = hovered ?? focused ?? selected;
    if (index === inspected) return;
    inspected = index;
    title.textContent = steps[index].textContent;
    description.textContent = steps[index].dataset.step;
  }

  steps.forEach((step, index) => {
    step.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      hovered = index;
      showExplanation();
    });
    step.addEventListener("pointerleave", () => {
      if (hovered !== index) return;
      hovered = null;
      showExplanation();
    });
    step.addEventListener("focus", () => {
      focused = index;
      hovered = null;
      showExplanation();
    });
    step.addEventListener("blur", () => {
      focused = null;
      showExplanation();
    });
    step.addEventListener("click", () => {
      selected = index;
      showExplanation();
    });
  });

  return {
    reset() {
      start = undefined;
      selected = 0;
      hovered = focused = null;
      showExplanation();
    },
    update(elapsed) {
      start ??= elapsed;
      const index = Math.floor((elapsed - start) / secondsPerStep) % steps.length;
      if (index === active) return;
      steps[active]?.classList.remove("is-active");
      steps[index].classList.add("is-active");
      active = index;
    }
  };
}
