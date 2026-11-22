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

  document.querySelectorAll(".eco-pane[data-photo-gallery]").forEach((pane) => {
    const photos = pane.querySelector(".eco-photos");
    const images = Array.from(photos.querySelectorAll(".eco-photo"));
    const arrows = photos.querySelectorAll(".eco-photo-arrow");
    const preview = pane.querySelector(".eco-preview");
    const status = photos.querySelector(".eco-photo-status");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let visible = false;
    let index = 0;
    let timer;

    const updateStatus = () => {
      const image = images[index];
      status.hidden = image.complete && image.naturalWidth > 0;
      status.textContent = image.complete ? "Photo unavailable." : "Loading photo...";
    };
    const showPhoto = (nextIndex) => {
      index = (nextIndex + images.length) % images.length;
      images.forEach((image, i) => { image.hidden = i !== index; });
      updateStatus();
    };
    const updateTimer = () => {
      clearInterval(timer);
      if (active && visible && !document.hidden && !reducedMotion.matches) {
        timer = setInterval(() => showPhoto((index + 1) % images.length), 3000);
      }
    };
    const showPhotos = (show) => {
      active = show;
      photos.hidden = !show;
      pane.classList.toggle("is-showing-photos", show);
      const model = pane.querySelector(".eco-canvas, .model-status");
      if (model) model.setAttribute("aria-hidden", String(show));
      if (show) {
        images.forEach((image) => { image.loading = "eager"; });
        showPhoto(0);
      }
      updateTimer();
    };

    images.forEach((image) => {
      image.addEventListener("load", updateStatus);
      image.addEventListener("error", () => {
        console.error("Unable to load quadcopter photo: " + image.src);
        updateStatus();
      });
    });
    const stepPhoto = (direction) => {
      showPhoto(index + direction);
      updateTimer();
    };
    arrows.forEach((arrow) => {
      arrow.addEventListener("click", () => stepPhoto(Number(arrow.dataset.direction)));
    });
    preview.tabIndex = 0;
    preview.setAttribute("role", "group");
    preview.setAttribute("aria-label", "Centauri quadcopter preview. Focus or tap to view photos.");
    preview.addEventListener("focus", () => {
      if (!active && preview.matches(":focus-visible")) showPhotos(true);
    });
    preview.addEventListener("click", (event) => {
      if (!event.target.closest("button")) showPhotos(!active);
    });
    pane.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") showPhotos(true);
    });
    pane.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") {
        if (photos.contains(document.activeElement)) preview.focus({ preventScroll: true });
        showPhotos(false);
      }
    });
    pane.addEventListener("focusout", (event) => {
      if (!pane.contains(event.relatedTarget)) showPhotos(false);
    });
    pane.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && active) {
        preview.focus({ preventScroll: true });
        showPhotos(false);
      } else if (active && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        stepPhoto(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateTimer();
    }).observe(pane);
    document.addEventListener("visibilitychange", updateTimer);
    reducedMotion.addEventListener("change", updateTimer);
  });

  const carousel = document.querySelector(".video-carousel");
  if (carousel) {
    const corner = carousel.closest(".video-corner");
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
