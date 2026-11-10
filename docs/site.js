(() => {
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (menu && nav) {
    const closeMenu = () => {
      menu.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    };

    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menu.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-header")) closeMenu();
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", closeMenu);
  }

  const video = document.querySelector(".landing-video");
  const control = document.querySelector(".hero-motion");
  if (!video || !control) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let userPaused = false;
  let pageHidden = document.hidden;

  const updateControl = () => {
    control.textContent = video.paused ? "Play film" : "Pause film";
    control.setAttribute("aria-label", video.paused ? "Play background flight film" : "Pause background flight film");
  };

  const playVideo = () => {
    video.play().catch((error) => {
      if (error.name !== "NotAllowedError" && error.name !== "AbortError") {
        console.error("Unable to play the background flight film.", error);
      }
      updateControl();
    });
  };

  control.hidden = false;
  control.addEventListener("click", () => {
    if (video.paused) {
      userPaused = false;
      playVideo();
    } else {
      userPaused = true;
      video.pause();
    }
  });
  video.addEventListener("play", updateControl);
  video.addEventListener("pause", updateControl);
  video.addEventListener("error", () => {
    console.error("The background flight film could not be loaded. Showing its still image.");
    video.hidden = true;
    control.hidden = true;
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) video.pause();
    else if (!userPaused && !pageHidden) playVideo();
  });
  document.addEventListener("visibilitychange", () => {
    pageHidden = document.hidden;
    if (pageHidden) video.pause();
    else if (!userPaused && !reducedMotion.matches) playVideo();
  });

  updateControl();
  if (!reducedMotion.matches && !pageHidden) playVideo();
})();
