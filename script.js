(function () {
  const root = document.documentElement;
  let storage;

  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    const themeToggle = document.querySelector("[data-theme-toggle]");
    const themeLabel = document.querySelector("[data-theme-label]");
    if (themeLabel) {
      themeLabel.textContent = theme === "dark" ? "日间模式" : "深夜模式";
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  function mountNav() {
    const slot = document.querySelector("[data-site-nav-slot]");
    if (!slot || typeof window.SITE_NAV_HTML !== "string") {
      return;
    }
    slot.innerHTML = window.SITE_NAV_HTML;
  }

  mountNav();

  const savedTheme = storage?.getItem("site-theme");
  const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(initialTheme);

  const themeToggle = document.querySelector("[data-theme-toggle]");
  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    storage?.setItem("site-theme", nextTheme);
    setTheme(nextTheme);
  });

  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const submenuButton = document.querySelector(".has-submenu > button");
  const submenuParent = document.querySelector(".has-submenu");

  const currentPage = document.body.dataset.page || "";
  const aboutGroup = ["about", "mascot", "members"];
  document.querySelectorAll("[data-page-target]").forEach((item) => {
    const target = item.dataset.pageTarget;
    const active = target === currentPage || (target === "about" && aboutGroup.includes(currentPage));
    item.classList.toggle("is-current", active);
    if (item.tagName === "A") {
      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    }
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.addEventListener("click", (event) => {
      if (event.target.matches("a")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (submenuButton && submenuParent) {
    submenuButton.addEventListener("click", () => {
      const isOpen = submenuParent.classList.toggle("is-open");
      submenuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-dot]"));
  const prev = carousel.querySelector("[data-prev]");
  const next = carousel.querySelector("[data-next]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let timerId = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  function startAutoPlay() {
    if (prefersReducedMotion || timerId) {
      return;
    }
    timerId = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  }

  function stopAutoPlay() {
    if (!timerId) {
      return;
    }
    window.clearInterval(timerId);
    timerId = null;
  }

  prev?.addEventListener("click", () => {
    stopAutoPlay();
    showSlide(activeIndex - 1);
    startAutoPlay();
  });

  next?.addEventListener("click", () => {
    stopAutoPlay();
    showSlide(activeIndex + 1);
    startAutoPlay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stopAutoPlay();
      showSlide(Number(dot.dataset.dot));
      startAutoPlay();
    });
  });

  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);
  carousel.addEventListener("focusin", stopAutoPlay);
  carousel.addEventListener("focusout", startAutoPlay);

  showSlide(0);
  startAutoPlay();
})();
