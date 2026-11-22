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

  const carousel = document.querySelector(".video-carousel");
  if (carousel) {
    const corner = carousel.closest(".video-corner");
    const controls = corner.querySelector(".video-corner__controls");
    const buttons = controls.querySelectorAll("button");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateControls = () => {
      buttons[0].disabled = carousel.scrollLeft <= 1;
      buttons[1].disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
    };
    controls.hidden = false;
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        carousel.scrollBy({
          left: Number(button.dataset.direction) * carousel.clientWidth * 0.8,
          behavior: reducedMotion.matches ? "instant" : "smooth"
        });
      });
    });
    carousel.addEventListener("scroll", updateControls, { passive: true });
    new ResizeObserver(updateControls).observe(carousel);
    updateControls();

    const dialog = corner.querySelector(".video-dialog");
    const player = dialog.querySelector(".video-dialog__player");
    const title = dialog.querySelector("#video-dialog-title");
    const youtubeLink = dialog.querySelector(".video-dialog__youtube");
    let activeLink;

    if (typeof dialog.showModal === "function") {
      carousel.querySelectorAll(".video-card__link").forEach((link) => {
        link.addEventListener("click", (event) => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          activeLink = link;
          title.textContent = link.querySelector("h3").textContent;
          youtubeLink.href = link.href;
          dialog.classList.toggle("video-dialog--short", link.dataset.format === "short");

          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube-nocookie.com/embed/${link.dataset.videoId}?autoplay=1&playsinline=1&rel=0`;
          iframe.title = title.textContent;
          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          iframe.referrerPolicy = "strict-origin-when-cross-origin";
          iframe.allowFullscreen = true;
          player.replaceChildren(iframe);
          dialog.showModal();
        });
      });
      dialog.querySelector(".video-dialog__close").addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) {
          dialog.close();
        }
      });
      dialog.addEventListener("close", () => {
        player.replaceChildren();
        activeLink.focus({ preventScroll: true });
      });
    }
  }

  const video = document.querySelector(".landing-video");
  if (!video) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let pageHidden = document.hidden;

  const playVideo = () => {
    video.play().catch((error) => {
      if (error.name !== "NotAllowedError" && error.name !== "AbortError") {
        console.error("Unable to play the background flight film.", error);
      }
    });
  };

  video.addEventListener("error", () => {
    console.error("The background flight film could not be loaded. Showing its still image.");
    video.hidden = true;
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) video.pause();
    else if (!pageHidden) playVideo();
  });
  document.addEventListener("visibilitychange", () => {
    pageHidden = document.hidden;
    if (pageHidden) video.pause();
    else if (!reducedMotion.matches) playVideo();
  });

  if (!reducedMotion.matches && !pageHidden) playVideo();
})();
