(() => {
  const links = Array.from(document.querySelectorAll(".parts-nav__item"));
  const panels = Array.from(document.querySelectorAll(".parts-panel"));

  const showSystem = (moveFocus) => {
    const target = document.getElementById(window.location.hash.slice(1));
    const selected = (target && target.closest(".parts-panel")) || panels[0];

    panels.forEach((panel) => {
      const active = panel === selected;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    links.forEach((link) => {
      const active = link.hash === "#" + selected.id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    if (target && selected.contains(target)) {
      if (moveFocus) {
        const heading = target.querySelector("[tabindex]") || selected.querySelector(".parts-panel__title");
        heading.focus({ preventScroll: true });
      }
      if (target !== selected) target.scrollIntoView({ block: "start" });
    }
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (window.location.hash !== link.hash) {
        window.history.pushState(null, "", link.hash);
      }
      showSystem(false);
    });
  });

  window.addEventListener("hashchange", () => showSystem(true));
  showSystem(false);

  document.querySelectorAll(".shop-gallery").forEach((gallery) => {
    const photo = gallery.querySelector(".shop-gallery__stage img");
    const thumbnails = Array.from(gallery.querySelectorAll(".shop-gallery__thumbnail"));

    thumbnails.forEach((button) => {
      button.addEventListener("click", () => {
        const image = button.querySelector("img");
        photo.src = image.src;
        photo.alt = image.alt;
        thumbnails.forEach((thumbnail) => {
          thumbnail.setAttribute("aria-pressed", String(thumbnail === button));
        });
      });
    });
  });
})();
