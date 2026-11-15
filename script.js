document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".primary-nav");
  const toTop = document.getElementById("to-top");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > 20);
    toTop.classList.toggle("show", y > 700);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      const isOpen = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeNav();
      navToggle.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (
      document.body.classList.contains("nav-open") &&
      e.target instanceof Element &&
      !e.target.closest(".site-header")
    ) {
      closeNav();
    }
  });

  window.addEventListener(
    "resize",
    function () {
      if (window.innerWidth > 960) {
        closeNav();
      }
    },
    { passive: true }
  );

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (link.classList.contains("skip-link")) {
        return;
      }

      const hash = link.getAttribute("href");
      if (hash === "#" || hash.length < 2) {
        return;
      }

      const target = document.querySelector(hash);
      if (!target) {
        return;
      }

      e.preventDefault();
      const offset = header.offsetHeight + 10;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });

      if (document.body.classList.contains("nav-open")) {
        closeNav();
      }
    });
  });

  const spyLinks = Array.from(nav ? nav.querySelectorAll("a") : []);
  const spySections = document.querySelectorAll("main section[id]");

  function setActive(id) {
    spyLinks.forEach(function (link) {
      const isCurrent = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && spySections.length) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    spySections.forEach(function (section) {
      spy.observe(section);
    });
  }

  const revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      reveal.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  const countdown = document.querySelector("[data-countdown]");

  if (countdown) {
    const target = new Date(countdown.dataset.countdown).getTime();
    const daysEl = countdown.querySelector('[data-cd="days"]');
    const hoursEl = countdown.querySelector('[data-cd="hours"]');
    const minutesEl = countdown.querySelector('[data-cd="minutes"]');
    const secondsEl = countdown.querySelector('[data-cd="seconds"]');

    function pad(value) {
      return String(value).padStart(2, "0");
    }

    function tick() {
      if (!Number.isFinite(target)) {
        return;
      }

      const diff = target - Date.now();

      if (diff <= 0) {
        [daysEl, hoursEl, minutesEl, secondsEl].forEach(function (el) {
          if (el) el.textContent = "00";
        });
        countdown.setAttribute("aria-label", "El partido ya ha comenzado");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor(diff / 3600000) % 24;
      const minutes = Math.floor(diff / 60000) % 60;
      const seconds = Math.floor(diff / 1000) % 60;

      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    }

    tick();
    const timer = setInterval(tick, 1000);
  }

  const filters = document.querySelectorAll("[data-filter]");
  const players = document.querySelectorAll("[data-position]");
  const filterStatus = document.querySelector(".filter-status");

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.dataset.filter;

      filters.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });

      let visible = 0;

      players.forEach(function (player) {
        const show = filter === "todos" || player.dataset.position === filter;
        player.hidden = !show;
        if (show) {
          player.classList.add("is-visible");
          visible += 1;
        }
      });

      if (filterStatus) {
        filterStatus.textContent =
          "Mostrando " + visible + (visible === 1 ? " jugador" : " jugadores");
      }
    });
  });

  const form = document.getElementById("contact-form");

  if (form) {
    const statusEl = form.querySelector(".form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const honeypot = form.elements.empresa;
      if (honeypot && honeypot.value) {
        return;
      }

      const nombre = form.elements.nombre.value.trim();
      const email = form.elements.email.value.trim();
      const mensaje = form.elements.mensaje.value.trim();
      const privacidad = form.elements.privacidad.checked;

      let error = "";

      if (nombre.length < 2) {
        error = "Escribe tu nombre.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error = "Revisa el correo electrónico.";
      } else if (mensaje.length < 10) {
        error = "Cuéntanos un poco más (mínimo 10 caracteres).";
      } else if (!privacidad) {
        error = "Debes aceptar la política de privacidad.";
      }

      if (!statusEl) {
        return;
      }

      if (error) {
        statusEl.textContent = error;
        statusEl.className = "form-status err";
        return;
      }

      statusEl.textContent = "Mensaje enviado. Te responderemos muy pronto.";
      statusEl.className = "form-status ok";
      form.reset();
    });
  }
});
