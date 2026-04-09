/* TechKurejai — main.js */
"use strict";

// ─── THEME ─────────────────────────────────────────────────────────────────
const ThemeManager = (() => {
  const html = document.documentElement;
  const btn  = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");

  const apply = (theme) => {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("tk-theme", theme);
    if (icon) {
      icon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
  };

  const init = () => {
    const saved = localStorage.getItem("tk-theme") ||
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    apply(saved);
    btn?.addEventListener("click", () =>
      apply(html.getAttribute("data-theme") === "dark" ? "light" : "dark")
    );
  };

  return { init };
})();

// ─── READING PROGRESS ───────────────────────────────────────────────────────
const ReadingProgress = (() => {
  const bar = document.getElementById("reading-progress");

  const update = () => {
    if (!bar) return;
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : "0%";
  };

  return {
    init: () => window.addEventListener("scroll", update, { passive: true })
  };
})();

// ─── HEADER SCROLL ──────────────────────────────────────────────────────────
const HeaderScroll = (() => ({
  init: () => {
    const header = document.getElementById("site-header");
    if (!header) return;
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    }, { passive: true });
  }
}))();

// ─── MATRIX RAIN ────────────────────────────────────────────────────────────
const MatrixRain = (() => {
  let animId;
  const CHARS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

  const init = () => {
    const canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let cols, drops;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      cols  = Math.floor(canvas.width / 18);
      drops = Array(cols).fill(1);
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#63b3ed";
      ctx.font = "13px JetBrains Mono, monospace";

      drops.forEach((y, i) => {
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * 18, y * 18);
        if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw();
  };

  return { init };
})();

// ─── FLOATING PARTICLES ─────────────────────────────────────────────────────
const Particles = (() => ({
  init: () => {
    const container = document.getElementById("particles");
    if (!container) return;

    const count = window.innerWidth < 640 ? 15 : 30;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      const size = Math.random() * 3 + 1;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px; height: ${size}px;
        animation-duration: ${Math.random() * 15 + 10}s;
        animation-delay: ${Math.random() * -20}s;
        opacity: ${Math.random() * 0.5};
      `;
      container.appendChild(p);
    }
  }
}))();

// ─── TYPED TEXT HERO ────────────────────────────────────────────────────────
const TypedHero = (() => {
  const phrases = [
    "cat blog.md | grep wisdom",
    "git commit -m 'level up'",
    "npm run make-something-cool",
    "grep -r 'good-code' ./world",
    "ssh into the future",
  ];

  const init = () => {
    const el = document.querySelector(".typed-text");
    if (!el) return;
    let pi = 0, ci = 0, deleting = false;

    const tick = () => {
      const phrase = phrases[pi];
      el.textContent = deleting ? phrase.slice(0, --ci) : phrase.slice(0, ++ci);

      if (!deleting && ci === phrase.length) {
        setTimeout(() => (deleting = true), 1800);
        setTimeout(tick, 1900);
      } else if (deleting && ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, 400);
      } else {
        setTimeout(tick, deleting ? 40 : 80);
      }
    };

    tick();
  };

  return { init };
})();

// ─── POST FILTER ────────────────────────────────────────────────────────────
const PostFilter = (() => ({
  init: () => {
    const btns  = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".post-card");
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        cards.forEach(card => {
          const cats = (card.dataset.categories || "").split(" ");
          const show = filter === "all" || cats.includes(filter);
          card.classList.toggle("filtered-out", !show);
        });
      });
    });
  }
}))();

// ─── SEARCH ─────────────────────────────────────────────────────────────────
const Search = (() => {
  let overlay, input, results, activeIdx = -1;
  const posts = window.SITE_DATA?.posts || [];

  const open = () => {
    overlay.hidden = false;
    input.focus();
    input.value = "";
    results.innerHTML = "";
    activeIdx = -1;
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    overlay.hidden = true;
    document.body.style.overflow = "";
  };

  const highlight = (text, q) => {
    if (!q) return text;
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(re, "<mark>$1</mark>");
  };

  const search = (q) => {
    if (!q.trim()) { results.innerHTML = ""; return; }
    const matches = posts.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(q.toLowerCase()) ||
      p.categories.join(" ").toLowerCase().includes(q.toLowerCase()) ||
      p.tags.join(" ").toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8);

    if (!matches.length) {
      results.innerHTML = `<div class="search-empty"><i class="fa-solid fa-face-meh"></i>No results for "<strong>${q}</strong>"</div>`;
      return;
    }

    results.innerHTML = matches.map((p, i) => `
      <a href="${p.url}" class="search-result" data-idx="${i}">
        <div class="sr-title">${highlight(p.title, q)}</div>
        <div class="sr-excerpt">${highlight(p.excerpt.slice(0, 120), q)}…</div>
        <div class="sr-meta">
          ${p.categories.map(c => `<span class="cat-badge cat-${c.toLowerCase()}">${c}</span>`).join("")}
          <span style="margin-left:auto;font-family:monospace;font-size:0.7rem;color:var(--text-muted)">${p.date}</span>
        </div>
      </a>
    `).join("");

    activeIdx = -1;
  };

  const navigate = (dir) => {
    const items = results.querySelectorAll(".search-result");
    if (!items.length) return;
    items[activeIdx]?.classList.remove("active");
    activeIdx = (activeIdx + dir + items.length) % items.length;
    items[activeIdx]?.classList.add("active");
    items[activeIdx]?.scrollIntoView({ block: "nearest" });
  };

  const init = () => {
    overlay = document.getElementById("search-overlay");
    input   = document.getElementById("search-input");
    results = document.getElementById("search-results");
    if (!overlay) return;

    document.getElementById("search-trigger")?.addEventListener("click", open);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    input.addEventListener("input",   e => search(e.target.value));

    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); navigate(1); }
      if (e.key === "ArrowUp")   { e.preventDefault(); navigate(-1); }
      if (e.key === "Enter") {
        const active = results.querySelector(".search-result.active");
        if (active) active.click();
      }
    });

    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); open(); }
      if (e.key === "Escape") close();
    });
  };

  return { init };
})();

// ─── TABLE OF CONTENTS ──────────────────────────────────────────────────────
const TOC = (() => ({
  init: () => {
    const toc    = document.getElementById("toc");
    const content = document.querySelector(".post-content");
    if (!toc || !content) return;

    const headings = content.querySelectorAll("h2, h3");
    if (headings.length < 2) {
      document.getElementById("toc-sidebar")?.remove();
      return;
    }

    toc.innerHTML = Array.from(headings).map(h => {
      if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^\w]+/g, "-");
      const cls = h.tagName === "H3" ? " toc-h3" : "";
      return `<a href="#${h.id}" class="${cls.trim()}">${h.textContent}</a>`;
    }).join("");

    // Highlight active
    const links = toc.querySelectorAll("a");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove("active"));
          const link = toc.querySelector(`a[href="#${e.target.id}"]`);
          link?.classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -75% 0px" });

    headings.forEach(h => observer.observe(h));
  }
}))();

// ─── COPY CODE BUTTONS ──────────────────────────────────────────────────────
const CopyCode = (() => ({
  init: () => {
    document.querySelectorAll(".post-content pre, .post-content .highlight").forEach(block => {
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
      btn.addEventListener("click", () => {
        const code = block.querySelector("code")?.innerText || block.innerText;
        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => { btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'; }, 2000);
        });
      });
      block.style.position = "relative";
      block.appendChild(btn);
    });
  }
}))();

// ─── SHARE BAR ──────────────────────────────────────────────────────────────
const ShareBar = (() => ({
  init: () => {
    document.querySelectorAll(".copy-link").forEach(btn => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.dataset.url).then(() => {
          btn.classList.add("copied");
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => {
            btn.classList.remove("copied");
            btn.innerHTML = '<i class="fa-solid fa-link"></i> Copy link';
          }, 2000);
        });
      });
    });
  }
}))();

// ─── CARD GLOW (pointer tracking) ───────────────────────────────────────────
const CardGlow = (() => ({
  init: () => {
    document.querySelectorAll(".post-card-inner").forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
        card.style.setProperty("--mouse-x", `${x}%`);
        card.style.setProperty("--mouse-y", `${y}%`);
      });
    });
  }
}))();

// ─── MOBILE MENU ────────────────────────────────────────────────────────────
const MobileMenu = (() => ({
  init: () => {
    const toggle = document.getElementById("mobile-menu-toggle");
    const menu   = document.getElementById("mobile-menu");
    const icon   = document.getElementById("mobile-menu-icon");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });
  }
}))();

// ─── ANIMATE ON SCROLL ──────────────────────────────────────────────────────
const AOS = (() => ({
  init: () => {
    const els = document.querySelectorAll(".post-card, .stat, .sidebar-widget, .archive-item");
    if (!els.length || !("IntersectionObserver" in window)) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(0)";
          }, i * 60);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      obs.observe(el);
    });
  }
}))();

// ─── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  ReadingProgress.init();
  HeaderScroll.init();
  MatrixRain.init();
  Particles.init();
  TypedHero.init();
  PostFilter.init();
  Search.init();
  TOC.init();
  CopyCode.init();
  ShareBar.init();
  CardGlow.init();
  MobileMenu.init();

  // Defer AOS slightly for smoothest render
  requestAnimationFrame(() => AOS.init());
});
