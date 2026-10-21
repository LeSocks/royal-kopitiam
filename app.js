/**
 * ============================================================================
 * ROYAL KOPITIAM (KEDAI KOPITIAM • 东方皇家 • ROYAL ORIENTAL)
 * Interactive Application Controller & Full Header-to-Footer Live Renderer
 * ============================================================================
 */

(function () {
  "use strict";

  if (!window.ROYAL_KOPITIAM_DATA) {
    console.error("ROYAL_KOPITIAM_DATA not found. Make sure siteData.js is loaded first.");
    return;
  }

  // Keep an immutable factory copy for one-click reset in CMS
  window.ROYAL_KOPITIAM_FACTORY_DATA = JSON.parse(
    JSON.stringify(window.ROYAL_KOPITIAM_DATA)
  );

  // Load saved CMS override from localStorage if available
  const CMS_STORAGE_KEY = "ROYAL_KOPITIAM_CMS_DATA_V1";
  try {
    const savedRaw = localStorage.getItem(CMS_STORAGE_KEY);
    if (savedRaw) {
      const parsed = JSON.parse(savedRaw);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.menuItems)) {
        window.ROYAL_KOPITIAM_DATA = Object.assign(
          {},
          window.ROYAL_KOPITIAM_DATA,
          parsed
        );
      }
    }
  } catch (err) {
    console.warn("Could not read saved CMS data from localStorage:", err);
  }

  let DATA = window.ROYAL_KOPITIAM_DATA;

  // Application State
  const state = {
    menuViewMode: "cards", // 'cards' | 'board'
    activeCategory: "all",
    activeQuickFilter: "all",
    searchQuery: "",
    activeRitualId: (DATA.kopiRitualGuide && DATA.kopiRitualGuide[0]?.id) || "kopi-o",
    activeGalleryZone: "all",
    lightboxIndex: 0,
    filteredGallery: [...(DATA.galleryPhotos || [])]
  };

  function floretHTML(colorClass = "floret-4--cream") {
    return `<span class="floret-4 ${colorClass}" aria-hidden="true"><span></span><span></span><span></span><span></span></span>`;
  }

  function formatPriceK(priceK) {
    return `${priceK} K`;
  }

  function formatPriceIDR(priceK) {
    return `Rp ${(Number(priceK || 0) * 1000).toLocaleString("id-ID")}`;
  }

  function resolveImgSrc(src, cacheSuffix = "") {
    if (!src) return "assets/brand/logo_royal_kopitiam.png";
    if (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("http")) {
      return src;
    }
    return cacheSuffix ? `${src}${src.includes("?") ? "&" : "?"}${cacheSuffix}` : src;
  }

  // ==========================================================================
  // 0. THEME CSS VARIABLES & SECTION VISIBILITY
  // ==========================================================================
  function renderThemeAndVisibility() {
    DATA = window.ROYAL_KOPITIAM_DATA;
    const t = DATA.themeConfig || {};
    const root = document.documentElement;
    if (t.royalGreen) root.style.setProperty("--royal-green", t.royalGreen);
    if (t.royalGreenDeep) root.style.setProperty("--royal-green-deep", t.royalGreenDeep);
    if (t.royalRed) root.style.setProperty("--royal-red", t.royalRed);
    if (t.royalGold) root.style.setProperty("--royal-gold", t.royalGold);
    if (t.royalCream) root.style.setProperty("--royal-cream", t.royalCream);
    if (t.royalCreamLight) root.style.setProperty("--royal-cream-light", t.royalCreamLight);

    const vis = t.sectionVisibility || {};
    const sectionMap = {
      hero: ".hero",
      story: "#story",
      packages: ".curated-combos-strip",
      menu: "#menu",
      ritual: "#ritual",
      vibes: "#vibes",
      faq: "#faq",
      visit: "#visit",
      footer: ".site-footer"
    };

    Object.entries(sectionMap).forEach(([key, selector]) => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.display = vis[key] === false ? "none" : "";
      }
    });
  }

  // ==========================================================================
  // 1. HEADER, HERO, STORY, FAQ, VISIT & FOOTER RENDERERS
  // ==========================================================================
  function renderHeaderSection() {
    const h = DATA.headerConfig || {};
    const headerEl = document.querySelector(".site-header");
    if (headerEl) headerEl.setAttribute("data-cms-section", "header");

    const logoEl = document.querySelector(".brand-lockup__logo");
    if (logoEl && h.logo) {
      logoEl.src = resolveImgSrc(h.logo);
      if (h.logoAlt) logoEl.alt = h.logoAlt;
    }

    const titleEl = document.querySelector(".brand-lockup__title");
    if (titleEl && h.brandTitle !== undefined) titleEl.textContent = h.brandTitle;

    const subEl = document.querySelector(".brand-lockup__chinese");
    if (subEl && h.brandSubtitle !== undefined) subEl.textContent = h.brandSubtitle;

    const navEl = document.getElementById("mainNavLinks");
    if (navEl && Array.isArray(h.navLinks)) {
      navEl.innerHTML = h.navLinks
        .map(
          (link) =>
            `<a href="${link.href || "#"}" class="main-nav__link">${link.label || ""}</a>`
        )
        .join("");
      navEl.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => navEl.classList.remove("is-open"));
      });
    }

    const ctaBtn = document.querySelector(".header-actions .btn--nav");
    if (ctaBtn) {
      if (h.ctaText !== undefined) ctaBtn.textContent = h.ctaText;
      if (h.ctaHref !== undefined) ctaBtn.setAttribute("href", h.ctaHref);
    }
  }

  function renderHeroSection() {
    const hero = DATA.heroSection;
    const heroEl = document.querySelector(".hero");
    if (!hero || !heroEl) return;
    heroEl.setAttribute("data-cms-section", "hero");

    const sealTag = heroEl.querySelector(".seal-tag");
    if (sealTag) {
      sealTag.innerHTML = `
        <span class="seal-tag__zh">${hero.sealChinese || ""}</span>
        <span>${hero.sealText || ""}</span>
      `;
    }

    const noPorkChip = heroEl.querySelector(".no-pork-chip");
    if (noPorkChip && hero.assuranceChip !== undefined) {
      noPorkChip.innerHTML = hero.assuranceChip;
    }

    const heroLogo = heroEl.querySelector(".hero__logo-img");
    if (heroLogo && hero.logoImage) heroLogo.src = resolveImgSrc(hero.logoImage);

    const heroSeal = heroEl.querySelector(".hero__seal-img");
    if (heroSeal && hero.sealImage) heroSeal.src = resolveImgSrc(hero.sealImage);

    const heroTitle = heroEl.querySelector(".hero__title");
    if (heroTitle) {
      heroTitle.innerHTML = `
        ${hero.titlePrefix || ""} <em>${hero.titleItalic || ""}</em> ${hero.titleMiddle || ""}
        <span class="text-green">${hero.titleHighlight || ""}</span>
      `;
    }

    const heroSubtitle = heroEl.querySelector(".hero__subtitle");
    if (heroSubtitle && hero.subtitle !== undefined) {
      heroSubtitle.innerHTML = hero.subtitle;
    }

    const ctaRow = heroEl.querySelector(".hero__cta-row");
    if (ctaRow) {
      ctaRow.innerHTML = `
        <a href="${hero.primaryCtaHref || "#menu"}" class="btn btn--primary">
          ${hero.primaryCtaText || "Explore Menu →"}
        </a>
        <button type="button" class="btn btn--green" data-open-reservation>
          ${hero.reserveCtaText || "📅 Reserve a Table"}
        </button>
        <a href="${hero.secondaryCtaHref || "#vibes"}" class="btn btn--outline">
          ${hero.secondaryCtaText || "See Restaurant Vibes"}
        </a>
      `;
    }

    const statsEl = heroEl.querySelector(".hero__stats");
    if (statsEl && Array.isArray(hero.stats)) {
      statsEl.innerHTML = hero.stats
        .map(
          (st) => `
          <div class="stat-item">
            <div class="stat-item__val">${st.value || ""}</div>
            <div class="stat-item__label">${st.label || ""}</div>
          </div>
        `
        )
        .join("");
    }

    const stageEl = heroEl.querySelector(".hero__visual-stage");
    if (stageEl && Array.isArray(hero.visualPanels)) {
      const posClasses = [
        "hero-bleed-panel--top",
        "hero-bleed-panel--bottom-left",
        "hero-bleed-panel--bottom-right"
      ];
      stageEl.innerHTML = hero.visualPanels
        .slice(0, 3)
        .map(
          (panel, idx) => `
          <div
            class="hero-bleed-panel ${posClasses[idx] || ""}"
            data-open-dish="${panel.dishNumber || "02"}"
          >
            <img
              src="${resolveImgSrc(panel.image)}"
              alt="${panel.alt || panel.title || ""}"
              ${idx === 0 ? 'fetchpriority="high"' : ""}
            />
            <div class="hero-bleed-panel__overlay">
              <div>
                <strong>${panel.title || ""}</strong>
                <span>${panel.subtitle || ""}</span>
              </div>
              <span class="hero-bleed-panel__tag">${panel.tag || ""}</span>
            </div>
          </div>
        `
        )
        .join("");

      stageEl.querySelectorAll("[data-open-dish]").forEach((el) => {
        el.addEventListener("click", () => {
          openDishModal(el.getAttribute("data-open-dish"));
        });
      });
    }

    const stripEl = heroEl.querySelector(".hero__signature-strip");
    if (stripEl && Array.isArray(hero.signatureStrip)) {
      stripEl.innerHTML = hero.signatureStrip
        .map(
          (item) => `
          <div class="signature-strip__item">
            ${floretHTML("floret-4--cream")}
            <strong>${item.label || ""}</strong> ${item.text || ""}
          </div>
        `
        )
        .join("");
    }
  }

  function renderStorySection() {
    const s = DATA.storySection;
    const sec = document.getElementById("story");
    if (!s || !sec) return;
    sec.setAttribute("data-cms-section", "story");

    const collage = sec.querySelector(".story-collage");
    if (collage) {
      collage.innerHTML = `
        <div class="story-collage__main">
          <img
            src="${resolveImgSrc(s.mainPhoto)}"
            alt="${s.mainPhotoAlt || "Royal Kopitiam Table"}"
            loading="lazy"
          />
        </div>
        <div class="story-collage__sub">
          <img
            src="${resolveImgSrc(s.subPhoto)}"
            alt="${s.subPhotoAlt || "Kopi Pour"}"
            loading="lazy"
          />
        </div>
        <div class="story-collage__crest-panel">
          <img
            src="${resolveImgSrc(s.crestImage)}"
            alt="Kedai Kopitiam Royal Oriental Official Crest"
            style="border-radius: 10px; width: 100%;"
            loading="lazy"
          />
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
            <img
              src="${resolveImgSrc(s.noPorkImage)}"
              alt="No Pork No Lard"
              style="height: 36px; width: auto;"
              loading="lazy"
            />
            <img
              src="${resolveImgSrc(s.lineartImage)}"
              alt="Kopitiam Lineart"
              style="height: 52px; width: auto;"
              loading="lazy"
            />
          </div>
        </div>
      `;
    }

    const editorial = sec.querySelector(".story-editorial");
    if (editorial) {
      editorial.innerHTML = `
        <div class="story-editorial__eyebrow">
          ${floretHTML("floret-4--red")}
          ${s.eyebrow || "OUR HERITAGE • 东方皇家"}
        </div>
        <h2 class="story-editorial__title">${s.title || ""}</h2>
        <p class="story-editorial__lead">${s.leadParagraph || ""}</p>
        <p style="font-size: 1rem; color: var(--ink-muted); line-height: 1.65;">
          ${s.bodyParagraph || ""}
        </p>
        <div class="story-pillars-wide">
          ${(s.pillars || [])
            .map(
              (p) => `
              <div class="pillar-cell">
                <h3>${p.title || ""}</h3>
                <p>${p.description || ""}</p>
              </div>
            `
            )
            .join("")}
        </div>
      `;
    }
  }

  function renderMenuSectionHeaderAndPackages() {
    const menuSec = document.getElementById("menu");
    if (!menuSec) return;
    menuSec.setAttribute("data-cms-section", "menu");

    const cfg = DATA.menuSectionConfig || {};
    const headEl = menuSec.querySelector(".widescreen-section-head");
    if (headEl) {
      headEl.innerHTML = `
        <div class="widescreen-section-head__left">
          <span class="royal-plaque-pill">
            ${floretHTML("floret-4--cream")}
            ${cfg.plaqueText || "OFFICIAL ROYAL ORIENTAL MENU (01 – 61)"}
            ${floretHTML("floret-4--cream")}
          </span>
          <h2 class="widescreen-section-head__title">
            ${cfg.title || "All 61 Authentic Dishes, Toasts & Beverages"}
          </h2>
        </div>
        <p class="widescreen-section-head__desc">
          ${cfg.description || ""}
        </p>
      `;
    }

    const searchInput = document.getElementById("menuSearchInput");
    if (searchInput && cfg.searchPlaceholder) {
      searchInput.placeholder = cfg.searchPlaceholder;
    }

    const combosStrip = menuSec.querySelector(".curated-combos-strip");
    if (combosStrip && Array.isArray(DATA.curatedPackages)) {
      combosStrip.setAttribute("data-cms-section", "packages");
      combosStrip.innerHTML = DATA.curatedPackages
        .map((pkg, pkgIdx) => {
          const resolvedItems = (pkg.items || [])
            .map((num) => DATA.menuItems.find((m) => m.number === num))
            .filter(Boolean);

          const computedPriceK = pkg.autoPrice
            ? resolvedItems.reduce((sum, item) => sum + Number(item.priceK || 0), 0)
            : Number(pkg.priceK || 0);

          const mosaicItems = resolvedItems.slice(0, 4);
          const mosaicCount = Math.max(1, Math.min(4, mosaicItems.length));
          const extraCount = resolvedItems.length - 4;

          const mosaicHTML = mosaicItems
            .map((dish, idx) => {
              const mainClass =
                mosaicCount === 3 && idx === 0 ? "combo-mosaic-tile--main" : "";
              const badgeExtra =
                idx === 3 && extraCount > 0 ? ` +${extraCount}` : "";
              const shortName =
                dish.name.length > 20 ? dish.name.slice(0, 18) + "…" : dish.name;
              return `
                <button
                  type="button"
                  class="combo-mosaic-tile ${mainClass}"
                  data-open-dish="${dish.number}"
                  aria-label="Inspect #${dish.number} ${dish.name}"
                >
                  <img
                    src="${resolveImgSrc(dish.image, "v=20261021")}"
                    alt="#${dish.number} ${dish.name}"
                    loading="lazy"
                    decoding="async"
                  />
                  <span class="combo-mosaic-badge">#${dish.number} ${shortName}${badgeExtra}</span>
                </button>
              `;
            })
            .join("");

          const pillsHTML = resolvedItems
            .map(
              (dish) => `
              <button type="button" class="combo-item-pill" data-open-dish="${dish.number}">
                <img
                  src="${resolveImgSrc(dish.image, "v=20261021")}"
                  alt=""
                  class="combo-item-pill__thumb"
                  loading="lazy"
                />
                <strong>#${dish.number}</strong> ${dish.name} <span>${formatPriceK(dish.priceK)}</span>
              </button>
            `
            )
            .join("");

          return `
            <article class="combo-card ${pkg.featured ? "combo-card--featured" : ""}" data-cms-package-index="${pkgIdx}">
              <div class="combo-card__mosaic combo-card__mosaic--${mosaicCount}" aria-label="${pkg.title} dish photos">
                ${mosaicHTML}
              </div>
              <div class="combo-card__body">
                <div class="combo-card__top">
                  <span class="combo-card__eyebrow">${pkg.eyebrow || ""}</span>
                  <span class="combo-card__price">${formatPriceK(computedPriceK)} <small>(${formatPriceIDR(computedPriceK)})</small></span>
                </div>
                <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <h3 class="combo-card__title">${pkg.title || ""}</h3>
                  ${
                    pkg.showReserveBtn
                      ? `<button type="button" class="combo-reserve-link" data-open-reservation="${pkg.reservePax || 4}">${pkg.reserveBtnText || "Book Table →"}</button>`
                      : ""
                  }
                </div>
                <p class="combo-card__desc">${pkg.description || ""}</p>
                <div class="combo-card__items" aria-label="Included dishes in ${pkg.title}">
                  ${pillsHTML}
                </div>
              </div>
            </article>
          `;
        })
        .join("");

      combosStrip.querySelectorAll("[data-open-dish]").forEach((el) => {
        el.addEventListener("click", () => {
          openDishModal(el.getAttribute("data-open-dish"));
        });
      });
    }
  }

  function renderFaqSection() {
    const f = DATA.faqSection;
    const sec = document.getElementById("faq");
    if (!f || !sec) return;
    sec.setAttribute("data-cms-section", "faq");

    const headEl = sec.querySelector(".widescreen-section-head");
    if (headEl) {
      headEl.innerHTML = `
        <div class="widescreen-section-head__left">
          <span class="royal-plaque-pill">
            ${floretHTML("floret-4--cream")}
            ${f.plaqueText || "QUICK FACTS & GUEST FAQ"}
            ${floretHTML("floret-4--cream")}
          </span>
          <h2 class="widescreen-section-head__title" id="faqSectionTitle">
            ${f.title || "Everything You Need to Know Before Visiting"}
          </h2>
        </div>
        <p class="widescreen-section-head__desc">${f.description || ""}</p>
      `;
    }

    const factCard = sec.querySelector(".geo-fact-card");
    if (factCard && f.factCard) {
      factCard.innerHTML = `
        <div class="geo-fact-card__header">
          <div>
            <span class="geo-fact-card__eyebrow">${f.factCard.eyebrow || ""}</span>
            <h3>${f.factCard.title || ""}</h3>
          </div>
          <span class="halal-pill">${f.factCard.badge || "<strong>NO PORK</strong> • NO LARD"}</span>
        </div>
        <dl class="geo-fact-list">
          ${(f.factCard.facts || [])
            .map(
              (row) => `
              <div class="geo-fact-row">
                <dt>${row.label || ""}</dt>
                <dd>${row.value || ""}</dd>
              </div>
            `
            )
            .join("")}
        </dl>
      `;
    }

    const faqList = sec.querySelector(".faq-accordion-list");
    if (faqList && Array.isArray(f.faqs)) {
      faqList.innerHTML = f.faqs
        .map(
          (item) => `
          <details class="faq-item" ${item.open ? "open" : ""}>
            <summary class="faq-item__question">
              <span>${item.question || ""}</span>
              <span class="faq-item__icon" aria-hidden="true">+</span>
            </summary>
            <div class="faq-item__answer">
              <p>${item.answer || ""}</p>
            </div>
          </details>
        `
        )
        .join("");
    }
  }

  function renderVisitSection() {
    const v = DATA.visitSectionConfig || {};
    const info = DATA.restaurantInfo || {};
    const sec = document.getElementById("visit");
    if (!sec) return;
    sec.setAttribute("data-cms-section", "visit");

    const leftCol = sec.querySelector(".visit-bleed-left");
    if (leftCol) {
      const plaqueEl = leftCol.querySelector(".royal-plaque-pill");
      if (plaqueEl && v.plaqueText) {
        plaqueEl.innerHTML = `${floretHTML("floret-4--cream")} ${v.plaqueText} ${floretHTML("floret-4--cream")}`;
      }
      const h2El = leftCol.querySelector("h2");
      if (h2El && v.title !== undefined) h2El.textContent = v.title;

      const descEl = leftCol.querySelector("h2 + p");
      if (descEl && v.description !== undefined) descEl.textContent = v.description;

      const amenitiesGrid = leftCol.querySelector(".amenities-grid");
      if (amenitiesGrid && Array.isArray(v.amenities)) {
        amenitiesGrid.innerHTML = v.amenities
          .map(
            (am) => `
            <div class="amenity-card">
              <h4>${am.title || ""}</h4>
              <p>${am.description || ""}</p>
            </div>
          `
          )
          .join("");
      }

      const reserveBtn = leftCol.querySelector("[data-open-reservation]");
      if (reserveBtn && v.reserveBtnText) reserveBtn.textContent = v.reserveBtnText;

      const mapsBtn = leftCol.querySelector("[data-maps-link]");
      if (mapsBtn && v.mapsBtnText) mapsBtn.textContent = v.mapsBtnText;

      const waBtn = leftCol.querySelector("[data-whatsapp-link]");
      if (waBtn && v.whatsappBtnText) waBtn.textContent = v.whatsappBtnText;
    }

    const iframeEl = sec.querySelector(".visit-bleed-right iframe");
    if (iframeEl && info.address?.mapEmbedUrl) {
      if (iframeEl.getAttribute("src") !== info.address.mapEmbedUrl) {
        iframeEl.setAttribute("src", info.address.mapEmbedUrl);
      }
    }
  }

  function renderFooterSection() {
    const f = DATA.footerConfig;
    const footerEl = document.querySelector(".site-footer");
    if (!f || !footerEl) return;
    footerEl.setAttribute("data-cms-section", "footer");

    const gridEl = footerEl.querySelector(".footer-grid");
    if (gridEl) {
      gridEl.innerHTML = `
        <div>
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <img
              src="${resolveImgSrc(f.logo)}"
              alt="${f.title || "Royal Kopitiam"}"
              style="height: 60px; width: auto; background: var(--royal-cream-light); padding: 0.35rem 0.65rem; border-radius: 12px;"
            />
            <div>
              <div style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 800; color: #fff;">
                ${f.title || "Royal Kopitiam"}
              </div>
              <div style="font-family: var(--font-chinese); font-size: 0.95rem; color: var(--royal-gold-light); letter-spacing: 0.12em;">
                ${f.subtitle || ""}
              </div>
            </div>
          </div>
          <p style="font-size: 0.92rem; opacity: 0.86; max-width: 52ch; margin-bottom: 1rem;">
            ${f.description || ""}
          </p>
          <span class="halal-pill">${f.badgeText || "NO PORK • NO LARD"}</span>
        </div>

        <div>
          <h4 style="font-family: var(--font-display); font-size: 1.1rem; color: var(--royal-gold-light); margin-bottom: 0.85rem;">
            ${f.navColumnTitle || "Quick Navigation"}
          </h4>
          <ul style="list-style: none; display: grid; gap: 0.5rem; font-size: 0.9rem;">
            ${(f.navLinks || [])
              .map((l) => `<li><a href="${l.href || "#"}">${l.label || ""}</a></li>`)
              .join("")}
          </ul>
        </div>

        <div>
          <h4 style="font-family: var(--font-display); font-size: 1.1rem; color: var(--royal-gold-light); margin-bottom: 0.85rem;">
            ${f.highlightsColumnTitle || "Signature Highlights"}
          </h4>
          <ul style="list-style: none; display: grid; gap: 0.45rem; font-size: 0.88rem; opacity: 0.92;">
            ${(f.highlights || []).map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    const bottomEl = footerEl.querySelector(".footer-bottom");
    if (bottomEl) {
      bottomEl.innerHTML = `
        <span>${f.copyrightText || ""}</span>
        <span>${f.bottomRightText || "100% No Pork • No Lard"} • <a href="cms.html" style="text-decoration: underline; opacity: 0.9;">CMS Studio</a> • <a href="llms.txt" style="text-decoration: underline; opacity: 0.85;">AI/LLM Index</a></span>
      `;
    }
  }

  function initLiveStatusAndInfo() {
    const info = DATA.restaurantInfo;
    const h = DATA.headerConfig || {};
    const now = new Date();
    const hour = now.getHours();
    const isOpen = hour >= info.hours.openHour24 && hour < info.hours.closeHour24;

    document.querySelectorAll("[data-live-status]").forEach((el) => {
      const dot = el.querySelector(".status-dot");
      const text = el.querySelector(".status-text");
      if (dot) dot.classList.toggle("is-closed", !isOpen);
      if (text) {
        if (h.customStatusText && h.customStatusText.trim()) {
          text.textContent = h.customStatusText.trim();
        } else {
          text.textContent = isOpen
            ? `Open Today • Serving Until ${info.hours.closeHour24}:00 WIB`
            : `Opens Daily at 0${info.hours.openHour24}:00 WIB • Morning Kopi & Toast`;
        }
      }
    });

    const bindMap = {
      "[data-info-street]": `${info.address.street}, ${info.address.district}`,
      "[data-info-city]": `${info.address.city} ${info.address.postalCode}`,
      "[data-info-landmark]": info.address.landmark,
      "[data-info-weekday]": info.hours.weekdayLabel,
      "[data-info-weekend]": info.hours.weekendLabel,
      "[data-info-breakfast]": info.hours.breakfastNote,
      "[data-info-whatsapp]": info.contact.whatsappDisplay,
      "[data-info-instagram]": info.contact.instagramHandle,
      "[data-info-email]": info.contact.email
    };

    Object.entries(bindMap).forEach(([selector, val]) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.textContent = val;
      });
    });

    document.querySelectorAll("[data-whatsapp-link]").forEach((a) => {
      const msg = encodeURIComponent(
        `Hello ${info.name}! I would like to ask about visiting / your menu.`
      );
      a.setAttribute("href", `https://wa.me/${info.contact.whatsappNumber}?text=${msg}`);
    });

    document.querySelectorAll("[data-maps-link]").forEach((a) => {
      a.setAttribute("href", info.address.googleMapsUrl);
    });
  }

  // ==========================================================================
  // 2. COMPLETE 61-ITEM INTERACTIVE MENU EXPLORER & DIETARY HELPERS
  // ==========================================================================
  const KID_FRIENDLY_NUMBERS = new Set([
    "02", "03", "04", "08", "09", "12", "23", "24", "25", "27", "28", "29",
    "30", "33", "34", "35", "40", "51", "52", "54", "55", "56", "57", "58",
    "59", "60", "61"
  ]);

  const PRAWN_SEAFOOD_NUMBERS = new Set([
    "01", "05", "07", "08", "11", "14", "17", "21", "24", "25", "26"
  ]);

  function isKidFriendly(item) {
    if (typeof item.kidFriendly === "boolean") {
      return item.kidFriendly;
    }
    return !item.spicy && KID_FRIENDLY_NUMBERS.has(item.number);
  }

  function getSeafoodLabel(item) {
    if (typeof item.seafoodLabel === "string") {
      return item.seafoodLabel;
    }
    if (item.number === "53") return "🐟 Contains Tuna";
    if (PRAWN_SEAFOOD_NUMBERS.has(item.number)) return "🦐 Contains Prawn/Seafood";
    return "";
  }

  function getFilteredMenuItems() {
    const q = state.searchQuery.trim().toLowerCase();

    return DATA.menuItems.filter((item) => {
      if (state.activeCategory !== "all" && item.category !== state.activeCategory) {
        return false;
      }

      const badges = item.badges || [];
      if (state.activeQuickFilter === "signature") {
        const isSig =
          item.category === "signature" ||
          badges.includes("Signature") ||
          badges.includes("Best Seller") ||
          badges.includes("Chef's Pick");
        if (!isSig) return false;
      } else if (state.activeQuickFilter === "spicy") {
        if (!item.spicy) return false;
      } else if (state.activeQuickFilter === "wokhei") {
        if (!badges.includes("Wok Hei")) return false;
      } else if (state.activeQuickFilter === "kidfriendly") {
        if (!isKidFriendly(item)) return false;
      } else if (state.activeQuickFilter === "seafood") {
        if (!getSeafoodLabel(item)) return false;
      } else if (state.activeQuickFilter === "morning") {
        const isMorning =
          item.category === "toast" ||
          badges.includes("Morning Ritual") ||
          badges.includes("Kopitiam Kopi") ||
          ["36", "37", "38", "39"].includes(item.number);
        if (!isMorning) return false;
      }

      if (q) {
        const dietarySearch = [
          isKidFriendly(item) ? "kid friendly non spicy" : "",
          getSeafoodLabel(item)
        ].join(" ");
        const hay = `${item.number} ${item.name} ${item.categoryLabel} ${item.description} ${badges.join(" ")} ${dietarySearch}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }

  function renderCategoryTabs() {
    const container = document.getElementById("menuCategoryTabs");
    if (!container) return;

    const allQuickChip = document.querySelector('[data-quick-filter="all"]');
    if (allQuickChip) {
      allQuickChip.textContent = `All Items (${DATA.menuItems.length})`;
    }

    container.innerHTML = DATA.menuCategories
      .map((cat) => {
        const count =
          cat.id === "all"
            ? DATA.menuItems.length
            : DATA.menuItems.filter((i) => i.category === cat.id).length;
        const activeClass = state.activeCategory === cat.id ? "is-active" : "";
        return `
          <button type="button" class="category-tab ${activeClass}" data-cat-id="${cat.id}">
            <span>${cat.name}</span>
            <span class="category-tab__count">${count}</span>
          </button>
        `;
      })
      .join("");

    container.querySelectorAll("[data-cat-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCategory = btn.getAttribute("data-cat-id");
        renderCategoryTabs();
        renderCategorySpotlight();
        renderMenuContent();
      });
    });
  }

  function renderCategorySpotlight() {
    const spotlightEl = document.getElementById("menuCategorySpotlight");
    if (!spotlightEl) return;

    spotlightEl.style.display = "grid";
    const cat =
      DATA.menuCategories.find((c) => c.id === state.activeCategory) || DATA.menuCategories[0];
    if (!cat) return;

    spotlightEl.innerHTML = `
      <div class="category-spotlight__info">
        <div class="category-spotlight__head">
          <span class="category-spotlight__range">Menu Nos. ${cat.rangeLabel || ""}</span>
          <span class="category-spotlight__zh">${cat.chinese || ""}</span>
        </div>
        <h3 class="category-spotlight__title">${cat.name || ""}</h3>
        <p style="font-size: 0.96rem; color: var(--ink-body);">${cat.description || ""}</p>
      </div>
      <img
        class="category-spotlight__img"
        src="${resolveImgSrc(cat.bannerImage, "v=20261021")}"
        alt="${cat.name} preview"
        loading="lazy"
        decoding="async"
      />
    `;
  }

  function renderMenuContent() {
    const container = document.getElementById("menuDisplayContainer");
    const summaryEl = document.getElementById("menuResultSummary");
    if (!container) return;

    const items = getFilteredMenuItems();
    if (summaryEl) {
      summaryEl.textContent = `Showing ${items.length} of ${DATA.menuItems.length} authentic dishes & beverages (All prices in IDR • 100% No Pork No Lard)`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1.5rem; background: var(--royal-cream-light); border-radius: 20px; border: 2px dashed var(--border-warm);">
          <p style="font-family: var(--font-display); font-size: 1.4rem; color: var(--royal-red); font-weight: 800; margin-bottom: 0.5rem;">
            No menu items matched your filter
          </p>
          <p style="color: var(--ink-muted); margin-bottom: 1.25rem;">
            Try clearing your search or switching back to "All Menu" to view all ${DATA.menuItems.length} Royal Kopitiam items.
          </p>
          <button type="button" class="btn btn--green" id="resetMenuFiltersBtn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetMenuFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.activeCategory = "all";
          state.activeQuickFilter = "all";
          state.searchQuery = "";
          const searchInput = document.getElementById("menuSearchInput");
          if (searchInput) searchInput.value = "";
          updateQuickChipsUI();
          renderCategoryTabs();
          renderCategorySpotlight();
          renderMenuContent();
        });
      }
      return;
    }

    // Classic Kopitiam Board List View
    if (state.menuViewMode === "board") {
      const categoriesToRender = DATA.menuCategories.filter(
        (c) => c.id !== "all" && items.some((i) => i.category === c.id)
      );

      container.innerHTML = `
        <div class="classic-board-grid">
          ${categoriesToRender
            .map((cat) => {
              const catItems = items.filter((i) => i.category === cat.id);
              return `
                <div class="classic-cat-block">
                  <div class="classic-cat-block__header">
                    <span class="royal-plaque-pill">${floretHTML()} ${cat.name} ${floretHTML()}</span>
                  </div>
                  <img class="classic-cat-block__photo" src="${resolveImgSrc(cat.bannerImage, "v=20261021")}" alt="${cat.name}" loading="lazy" />
                  <div>
                    ${catItems
                      .map(
                        (item) => `
                        <div class="classic-item-row" data-dish-num="${item.number}" tabindex="0" role="button" aria-label="View details for ${item.number}. ${item.name}">
                          <span class="classic-item-row__num">${item.number}.</span>
                          <span class="classic-item-row__name">
                            ${item.name}
                            ${item.spicy ? '<span title="Spicy" style="color: var(--royal-red); font-size: 0.78rem;">🌶</span>' : ""}
                            ${getSeafoodLabel(item) ? '<span title="' + getSeafoodLabel(item) + '" style="font-size: 0.76rem;">🦐</span>' : ""}
                            ${isKidFriendly(item) ? '<span title="Kid-Friendly (Non-Spicy)" style="font-size: 0.74rem;">👶</span>' : ""}
                          </span>
                          <span class="classic-item-row__price">${formatPriceK(item.priceK)}</span>
                        </div>
                      `
                      )
                      .join("")}
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      bindDishOpenTriggers(container);
      return;
    }

    // Default Interactive Photo Cards View
    container.innerHTML = `
      <div class="menu-grid">
        ${items
          .map((item) => {
            const seafoodLabel = getSeafoodLabel(item);
            const kidFriendly = isKidFriendly(item);
            const badges = item.badges || [];
            const badgesHTML = [
              ...badges.slice(0, 2).map((b) => `<span class="dish-badge">${b}</span>`),
              item.spicy ? `<span class="dish-badge dish-badge--spicy">🌶 Spicy</span>` : ""
            ].join("");

            const dietaryRowHTML = [
              kidFriendly ? `<span class="dietary-tag dietary-tag--kid">👶 Kid-Friendly</span>` : "",
              seafoodLabel ? `<span class="dietary-tag dietary-tag--seafood">${seafoodLabel}</span>` : "",
              item.spicy ? `<span class="dietary-tag dietary-tag--spicy">🌶 Spicy</span>` : ""
            ]
              .filter(Boolean)
              .join("");

            return `
              <article class="dish-card" data-dish-num="${item.number}" data-cms-dish="${item.number}" tabindex="0" role="button" aria-label="Inspect dish ${item.number}: ${item.name}">
                <div class="dish-card__media">
                  <span class="dish-num-badge">${item.number}</span>
                  <div class="dish-card__badges">${badgesHTML}</div>
                  <img
                    src="${resolveImgSrc(item.image, "v=20261021")}"
                    alt="${item.number}. ${item.name}"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="dish-card__body">
                  <div class="dish-card__cat">${item.categoryLabel || ""}</div>
                  <div class="dish-card__head">
                    <h4 class="dish-card__title">${item.name}</h4>
                    <span class="dish-card__price">${formatPriceK(item.priceK)}</span>
                  </div>
                  ${dietaryRowHTML ? `<div class="dish-dietary-row">${dietaryRowHTML}</div>` : ""}
                  <p class="dish-card__desc">${item.description || ""}</p>
                  <div class="dish-card__footer">
                    <span style="color: var(--royal-green);">${formatPriceIDR(item.priceK)}</span>
                    <span>View Dish & Pairings →</span>
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;

    bindDishOpenTriggers(container);
  }

  function bindDishOpenTriggers(root) {
    root.querySelectorAll("[data-dish-num]").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (document.body.classList.contains("cms-inspect-mode")) return;
        openDishModal(el.getAttribute("data-dish-num"));
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDishModal(el.getAttribute("data-dish-num"));
        }
      });
    });
  }

  function updateQuickChipsUI() {
    document.querySelectorAll("[data-quick-filter]").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        btn.getAttribute("data-quick-filter") === state.activeQuickFilter
      );
    });
  }

  // ==========================================================================
  // 3. DISH DETAIL MODAL (<dialog>)
  // ==========================================================================
  function openDishModal(dishNumber) {
    if (document.body.classList.contains("cms-inspect-mode")) return;
    const item = DATA.menuItems.find((i) => i.number === dishNumber);
    if (!item) return;

    const modal = document.getElementById("dishDetailModal");
    const content = document.getElementById("dishDetailModalContent");
    if (!modal || !content) return;

    const pairingItems = (item.pairings || [])
      .map((num) => DATA.menuItems.find((m) => m.number === num))
      .filter(Boolean);

    content.innerHTML = `
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <span class="dish-num-badge" style="position: static; width: 34px; height: 34px;">${item.number}</span>
          <div>
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--royal-green);">
              ${item.categoryLabel || ""}
            </span>
            <h3 style="font-family: var(--font-display); font-size: 1.25rem; color: var(--ink-dark); line-height: 1.15;">
              ${item.name}
            </h3>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button type="button" class="btn btn--outline" data-cms-edit-dish="${item.number}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
            ✏️ Edit in CMS
          </button>
          <button type="button" class="modal-close-btn" data-close-modal aria-label="Close modal">✕</button>
        </div>
      </div>
      <div class="modal-body">
        <div class="dish-modal-grid">
          <div class="dish-modal-photo">
            <img src="${resolveImgSrc(item.image, "v=20261021")}" alt="${item.name}" style="width: 100%; height: auto;" />
          </div>
          <div>
            <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; padding-bottom: 0.85rem; border-bottom: 2px dashed var(--border-warm); margin-bottom: 1rem;">
              <div>
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--ink-muted); text-transform: uppercase;">Official Menu Price</div>
                <div style="font-family: var(--font-display); font-size: 1.85rem; font-weight: 800; color: var(--royal-red);">
                  ${formatPriceK(item.priceK)}
                  <span style="font-size: 0.95rem; color: var(--royal-green); font-family: var(--font-body); font-weight: 700;">
                    (${formatPriceIDR(item.priceK)})
                  </span>
                </div>
              </div>
              <span class="halal-pill"><strong>NO PORK</strong> • NO LARD</span>
            </div>

            <p style="font-size: 0.98rem; color: var(--ink-body); margin-bottom: 1.15rem; line-height: 1.6;">
              ${item.description || ""}
            </p>

            <div style="display: flex; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 1.35rem;">
              ${(item.badges || [])
                .map(
                  (b) =>
                    `<span style="background: var(--royal-green-tint); color: var(--royal-green); font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.7rem; border-radius: 999px; border: 1px solid var(--royal-green);">${b}</span>`
                )
                .join("")}
              ${
                item.spicy
                  ? `<span style="background: var(--royal-red-tint); color: var(--royal-red); font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.7rem; border-radius: 999px; border: 1px solid var(--royal-red);">🌶 Spicy Profile</span>`
                  : ""
              }
              ${
                isKidFriendly(item)
                  ? `<span style="background: rgba(15, 89, 34, 0.09); color: var(--royal-green-deep); font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.7rem; border-radius: 999px; border: 1px solid rgba(15, 89, 34, 0.3);">👶 Kid-Friendly (Non-Spicy)</span>`
                  : ""
              }
              ${
                getSeafoodLabel(item)
                  ? `<span style="background: rgba(234, 88, 12, 0.12); color: #9a3412; font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.7rem; border-radius: 999px; border: 1px solid rgba(234, 88, 12, 0.35);">${getSeafoodLabel(item)}</span>`
                  : ""
              }
            </div>

            ${
              pairingItems.length > 0
                ? `
              <div style="background: var(--royal-cream); border: 1.5px solid var(--border-warm); border-radius: 14px; padding: 0.95rem;">
                <div style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--royal-green-deep); margin-bottom: 0.55rem;">
                  Recommended Royal Pairings
                </div>
                <div style="display: grid; gap: 0.45rem;">
                  ${pairingItems
                    .map(
                      (p) => `
                      <button type="button" data-dish-num="${p.number}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.65rem; background: #fff; border: 1px solid var(--border-warm); border-radius: 10px; text-align: left; font-size: 0.84rem; font-weight: 700;">
                        <span style="display: flex; align-items: center; gap: 0.5rem;">
                          <img src="${resolveImgSrc(p.image, "v=20261021")}" alt="" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--royal-green);" />
                          <span><strong style="color: var(--royal-red);">#${p.number}</strong> ${p.name}</span>
                        </span>
                        <span style="color: var(--royal-green); font-weight: 800;">${formatPriceK(p.priceK)} →</span>
                      </button>
                    `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;

    content.querySelector("[data-close-modal]")?.addEventListener("click", () => modal.close());
    content.querySelector("[data-cms-edit-dish]")?.addEventListener("click", () => {
      modal.close();
      if (window.openRoyalCMS) {
        window.openRoyalCMS("menu", item.number);
      }
    });
    bindDishOpenTriggers(content);

    if (!modal.open) {
      modal.showModal();
    }
  }

  // ==========================================================================
  // 4. INTERACTIVE ROYAL KOPITIAM DRINK BAR GUIDE (#36 – #45)
  // ==========================================================================
  function renderKopiRitualSection() {
    const ritualSec = document.getElementById("ritual");
    if (ritualSec) {
      ritualSec.setAttribute("data-cms-section", "ritual");
      const rCfg = DATA.ritualSectionConfig || {};
      const leftCol = ritualSec.querySelector(".ritual-left-col");
      if (leftCol) {
        const plaque = leftCol.querySelector(".royal-plaque-pill");
        if (plaque && rCfg.plaqueText) {
          plaque.innerHTML = `${floretHTML("floret-4--cream")} ${rCfg.plaqueText} ${floretHTML("floret-4--cream")}`;
        }
        const h2 = leftCol.querySelector("h2");
        if (h2 && rCfg.title !== undefined) h2.textContent = rCfg.title;
        const p = leftCol.querySelector("p");
        if (p && rCfg.description !== undefined) p.innerHTML = rCfg.description;
      }
    }

    const tabsEl = document.getElementById("kopiRitualTabs");
    const stageEl = document.getElementById("kopiRitualStage");
    if (!tabsEl || !stageEl || !Array.isArray(DATA.kopiRitualGuide) || !DATA.kopiRitualGuide.length) return;

    tabsEl.innerHTML = DATA.kopiRitualGuide
      .map((r) => {
        const active = r.id === state.activeRitualId ? "is-active" : "";
        return `
          <button type="button" class="ritual-tab-btn ${active}" data-ritual-id="${r.id}">
            <div class="ritual-tab-btn__left">
              <span class="ritual-tab-btn__num">#${r.menuNumber}</span>
              <div class="ritual-tab-btn__text">
                <span class="ritual-tab-btn__title">${r.name}</span>
                <span class="ritual-tab-btn__zh">${r.chinese}</span>
              </div>
            </div>
            <span class="ritual-tab-btn__price">${r.price}</span>
          </button>
        `;
      })
      .join("");

    tabsEl.querySelectorAll("[data-ritual-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeRitualId = btn.getAttribute("data-ritual-id");
        renderKopiRitualSection();
      });
    });

    const current =
      DATA.kopiRitualGuide.find((r) => r.id === state.activeRitualId) || DATA.kopiRitualGuide[0];

    stageEl.innerHTML = `
      <div class="cup-diagram">
        <div class="cup-vessel" aria-label="Cup proportion diagram for ${current.name}">
          ${(current.layers || [])
            .map((layer) => {
              const txtColor = layer.textColor || "#FFFDF8";
              const isLightText =
                txtColor.toUpperCase() === "#FFFDF8" || txtColor.toUpperCase() === "#FFFFFF";
              const shadowStyle = isLightText ? "0 1px 2px rgba(0, 0, 0, 0.55)" : "none";
              return `
                <div
                  class="cup-layer"
                  style="height: ${layer.pct}%; background: ${layer.color}; color: ${txtColor}; text-shadow: ${shadowStyle};"
                >
                  <span class="cup-layer__short">${layer.shortLabel || `${layer.pct}%`}</span>
                </div>
              `;
            })
            .join("")}
        </div>
        <div class="cup-saucer"></div>
        <span class="cup-diagram__meta">
          Menu #${current.menuNumber} • ${current.price}
        </span>
      </div>

      <div class="ritual-stage-details">
        <div class="ritual-stage-details__top">
          <span class="ritual-stage-details__tag">
            ${current.tagline || ""}
          </span>
          <span class="ritual-stage-details__pronounce">
            Say it: “${current.pronunciation || ""}”
          </span>
        </div>

        <div class="ritual-stage-details__heading">
          <h3>${current.name || ""}</h3>
          <span class="ritual-stage-details__zh">${current.chinese || ""}</span>
        </div>

        <p class="ritual-stage-details__notes">
          ${current.notes || ""}
        </p>

        <div class="cup-breakdown-list" aria-label="Cup layer breakdown">
          ${(current.layers || [])
            .map(
              (layer) => `
              <div class="cup-breakdown-chip">
                <span class="cup-breakdown-chip__swatch" style="background: ${layer.color};"></span>
                <span><strong>${layer.shortLabel ? layer.shortLabel.split(" ")[0] : `${layer.pct}%`}</strong> ${layer.label}</span>
              </div>
            `
            )
            .join("")}
        </div>

        <div class="ritual-stage-details__pairing">
          <div class="ritual-stage-details__pairing-label">
            Best Paired With
          </div>
          <div class="ritual-stage-details__pairing-val">
            ${current.pairWith || ""}
          </div>
        </div>

        <div>
          <button type="button" class="btn btn--outline" id="inspectRitualDrinkBtn" style="padding: 0.52rem 1.15rem; font-size: 0.84rem;">
            Inspect Drink #${current.menuNumber} in Menu →
          </button>
        </div>
      </div>
    `;

    const inspectBtn = document.getElementById("inspectRitualDrinkBtn");
    if (inspectBtn) {
      inspectBtn.addEventListener("click", () => {
        const firstNum = String(current.menuNumber || "36").split(" ")[0];
        openDishModal(firstNum);
      });
    }
  }

  // ==========================================================================
  // 5. 16-SLOT ATMOSPHERE & VIBES GALLERY + LIGHTBOX
  // ==========================================================================
  function renderGallery() {
    const vibesSec = document.getElementById("vibes");
    if (vibesSec) {
      vibesSec.setAttribute("data-cms-section", "vibes");
      const vCfg = DATA.vibesSectionConfig || {};
      const headEl = vibesSec.querySelector(".widescreen-section-head");
      if (headEl) {
        headEl.innerHTML = `
          <div class="widescreen-section-head__left">
            <span class="royal-plaque-pill">
              ${floretHTML("floret-4--cream")}
              ${vCfg.plaqueText || "ATMOSPHERE & VIBES GALLERY"}
              ${floretHTML("floret-4--cream")}
            </span>
            <h2 class="widescreen-section-head__title">
              ${vCfg.title || "Sunlit Mornings, Warm Timber & Shared Tables"}
            </h2>
          </div>
          <p class="widescreen-section-head__desc">
            ${vCfg.description || ""}
          </p>
        `;
      }
    }

    const pillsEl = document.getElementById("galleryZonePills");
    const gridEl = document.getElementById("bentoGalleryGrid");
    if (!pillsEl || !gridEl) return;

    pillsEl.innerHTML = (DATA.galleryZones || [])
      .map((z) => {
        const count =
          z.id === "all"
            ? DATA.galleryPhotos.length
            : DATA.galleryPhotos.filter((p) => p.zone === z.id).length;
        const active = z.id === state.activeGalleryZone ? "is-active" : "";
        return `
          <button type="button" class="zone-pill ${active}" data-zone-id="${z.id}">
            ${z.label} (${count})
          </button>
        `;
      })
      .join("");

    pillsEl.querySelectorAll("[data-zone-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeGalleryZone = btn.getAttribute("data-zone-id");
        renderGallery();
      });
    });

    state.filteredGallery =
      state.activeGalleryZone === "all"
        ? [...DATA.galleryPhotos]
        : DATA.galleryPhotos.filter((p) => p.zone === state.activeGalleryZone);

    gridEl.innerHTML = state.filteredGallery
      .map((item, idx) => {
        const spanClass =
          item.span === "wide-tall"
            ? "bento-tile--wide-tall"
            : item.span === "wide"
              ? "bento-tile--wide"
              : item.span === "tall"
                ? "bento-tile--tall"
                : "";

        return `
          <figure class="bento-tile ${spanClass}" data-gallery-idx="${idx}" tabindex="0" role="button" aria-label="Open photo ${idx + 1}: ${item.title}">
            <span class="bento-tile__slot-badge">${item.slotLabel || `Photo #${idx + 1}`}</span>
            <img
              src="${resolveImgSrc(item.image)}"
              alt="${item.title || ""}"
              loading="lazy"
              decoding="async"
            />
            <figcaption class="bento-tile__overlay">
              <div class="bento-tile__title">${item.title || ""}</div>
              <div class="bento-tile__caption">${item.caption || ""}</div>
            </figcaption>
          </figure>
        `;
      })
      .join("");

    gridEl.querySelectorAll("[data-gallery-idx]").forEach((tile) => {
      tile.addEventListener("click", () => {
        if (document.body.classList.contains("cms-inspect-mode")) return;
        openGalleryLightbox(parseInt(tile.getAttribute("data-gallery-idx"), 10));
      });
      tile.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openGalleryLightbox(parseInt(tile.getAttribute("data-gallery-idx"), 10));
        }
      });
    });
  }

  function openGalleryLightbox(index) {
    if (!state.filteredGallery.length) return;
    state.lightboxIndex =
      (index + state.filteredGallery.length) % state.filteredGallery.length;

    const item = state.filteredGallery[state.lightboxIndex];
    const modal = document.getElementById("galleryLightboxModal");
    const content = document.getElementById("galleryLightboxContent");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="modal-header">
        <div>
          <span style="font-size: 0.74rem; font-weight: 800; color: var(--royal-green); text-transform: uppercase; letter-spacing: 0.08em;">
            ${item.slotLabel || "Atmosphere Showcase"} • ${state.lightboxIndex + 1} of ${state.filteredGallery.length}
          </span>
          <h3 style="font-family: var(--font-display); font-size: 1.2rem; color: var(--ink-dark);">
            ${item.title}
          </h3>
        </div>
        <button type="button" class="modal-close-btn" data-close-lightbox aria-label="Close lightbox">✕</button>
      </div>
      <div class="modal-body" style="text-align: center;">
        <div style="position: relative; border-radius: 16px; overflow: hidden; border: 3px solid var(--royal-green); background: #14110f; max-height: 68vh; display: flex; align-items: center; justify-content: center;">
          <img src="${resolveImgSrc(item.image)}" alt="${item.title}" style="max-height: 66vh; width: auto; max-width: 100%; object-fit: contain;" />
        </div>
        <p style="margin-top: 0.9rem; font-size: 0.95rem; color: var(--ink-body); max-width: 65ch; margin-inline: auto;">
          ${item.caption}
        </p>
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.85rem; margin-top: 1.15rem;">
          <button type="button" class="btn btn--outline" id="lightboxPrevBtn" style="padding: 0.5rem 1.1rem;">← Previous Photo</button>
          <button type="button" class="btn btn--primary" id="lightboxNextBtn" style="padding: 0.5rem 1.1rem;">Next Photo →</button>
        </div>
      </div>
    `;

    content.querySelector("[data-close-lightbox]")?.addEventListener("click", () => modal.close());
    content.querySelector("#lightboxPrevBtn")?.addEventListener("click", () => {
      openGalleryLightbox(state.lightboxIndex - 1);
    });
    content.querySelector("#lightboxNextBtn")?.addEventListener("click", () => {
      openGalleryLightbox(state.lightboxIndex + 1);
    });

    if (!modal.open) modal.showModal();
  }

  // ==========================================================================
  // 6. INITIALIZATION & EVENT LISTENERS
  // ==========================================================================
  function initEventListeners() {
    document.querySelectorAll("[data-view-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.menuViewMode = btn.getAttribute("data-view-mode");
        document.querySelectorAll("[data-view-mode]").forEach((b) => {
          b.classList.toggle("is-active", b === btn);
        });
        renderCategorySpotlight();
        renderMenuContent();
      });
    });

    document.querySelectorAll("[data-quick-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeQuickFilter = btn.getAttribute("data-quick-filter");
        updateQuickChipsUI();
        renderCategorySpotlight();
        renderMenuContent();
      });
    });

    const searchInput = document.getElementById("menuSearchInput");
    const clearBtn = document.getElementById("menuSearchClear");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value;
        if (clearBtn) {
          clearBtn.classList.toggle("is-visible", state.searchQuery.length > 0);
        }
        renderCategorySpotlight();
        renderMenuContent();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        state.searchQuery = "";
        clearBtn.classList.remove("is-visible");
        renderMenuContent();
      });
    }

    const mobileBtn = document.getElementById("mobileMenuToggleBtn");
    const mainNav = document.getElementById("mainNavLinks");
    if (mobileBtn && mainNav) {
      mobileBtn.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("is-open");
        mobileBtn.setAttribute("aria-expanded", String(isOpen));
      });
    }

    // Close any <dialog> when clicking its backdrop
    document.querySelectorAll("dialog.royal-modal").forEach((dialog) => {
      dialog.addEventListener("click", (e) => {
        const rect = dialog.getBoundingClientRect();
        const clickedInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (!clickedInDialog) {
          dialog.close();
        }
      });
    });

    // Global delegated listener for [data-open-reservation] buttons anywhere on page
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-open-reservation]");
      if (!trigger) return;
      if (document.body.classList.contains("cms-inspect-mode")) return;
      if (window.__openRoyalReservationModal) {
        window.__openRoyalReservationModal(trigger.getAttribute("data-open-reservation"));
      }
    });
  }

  // ==========================================================================
  // 6B. 10-SECOND TABLE RESERVATION MINI-MODAL (DIRECT TO WHATSAPP)
  // ==========================================================================
  function initReservationModal() {
    const modal = document.getElementById("reservationModal");
    const form = document.getElementById("reservationForm");
    if (!modal || !form) return;

    const closeBtn = document.getElementById("closeReservationModalBtn");
    const paxInput = document.getElementById("resPaxInput");
    const paxMinusBtn = document.getElementById("resPaxMinusBtn");
    const paxPlusBtn = document.getElementById("resPaxPlusBtn");
    const paxUnitEl = form.querySelector(".res-stepper-unit");
    const dateInput = document.getElementById("resDateInput");
    const timeInput = document.getElementById("resTimeInput");
    const quickHourGroup = document.getElementById("resQuickHourGroup");
    const seatGroup = document.getElementById("resSeatGroup");
    const nameInput = document.getElementById("resNameInput");
    const notesInput = document.getElementById("resNotesInput");
    const previewEl = document.getElementById("resWhatsappPreviewText");

    const resState = {
      paxCount: 4,
      pax: "4 Guests",
      dateStr: "",
      time: "12:00 WIB",
      seat: "Indoor",
      name: "",
      notes: ""
    };

    function toISODate(d) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    function getTodayISO() {
      return toISODate(new Date());
    }

    function setGuestCount(rawVal, syncInput = true) {
      const cfg = DATA.reservationModalConfig || {};
      const minP = Number(cfg.minPax || 1);
      const maxP = Number(cfg.maxPax || 100);
      let count = parseInt(rawVal, 10);
      if (Number.isNaN(count) || count < minP) count = minP;
      if (count > maxP) count = maxP;
      resState.paxCount = count;
      resState.pax = `${count} ${count === 1 ? "Guest" : "Guests"}`;
      if (syncInput && paxInput) {
        paxInput.value = String(count);
      }
      if (paxUnitEl) {
        paxUnitEl.textContent = count === 1 ? "Guest" : "Guests";
      }
      updatePreview();
    }

    function setQuickDate(mode) {
      const todayISO = getTodayISO();
      if (dateInput) {
        dateInput.min = todayISO;
      }

      const targetDate = new Date();
      if (mode === "tomorrow") {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      resState.dateStr = toISODate(targetDate);
      if (dateInput) dateInput.value = resState.dateStr;

      form.querySelectorAll("[data-quick-date]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.getAttribute("data-quick-date") === mode);
      });
      updatePreview();
    }

    function setPreferredTime(hhmm) {
      if (!hhmm) return;
      resState.time = `${hhmm} WIB`;
      if (timeInput && timeInput.value !== hhmm) {
        timeInput.value = hhmm;
      }
      form.querySelectorAll("[data-quick-hour]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.getAttribute("data-quick-hour") === hhmm);
      });
      updatePreview();
    }

    function buildWhatsAppMessage() {
      const cfg = DATA.reservationModalConfig || {};
      const greeting =
        cfg.greetingLine ||
        `Hello ${DATA.restaurantInfo.name} (${DATA.restaurantInfo.chineseTitle})! I would like to reserve a table:`;
      const closing =
        cfg.closingLine || "Please let me know if this table is available. Thank you!";
      const guestLine = resState.name.trim() ? `• Guest Name: ${resState.name.trim()}\n` : "";
      const noteLine = resState.notes.trim() ? `• Special Notes: ${resState.notes.trim()}\n` : "";
      return (
        `${greeting}\n` +
        `${guestLine}` +
        `• Number of Guests: ${resState.pax}\n` +
        `• Visit Date: ${resState.dateStr}\n` +
        `• Preferred Time: ${resState.time}\n` +
        `• Seating Preference: ${resState.seat}\n` +
        `${noteLine}` +
        `${closing}`
      );
    }

    function updatePreview() {
      if (previewEl) {
        previewEl.textContent = buildWhatsAppMessage();
      }
    }

    function syncReservationModalFromConfig() {
      const cfg = DATA.reservationModalConfig || {};
      const headerDiv = modal.querySelector(".modal-header > div");
      if (headerDiv) {
        headerDiv.innerHTML = `
          <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--royal-red);">
            ${cfg.eyebrow || "INSTANT WHATSAPP TABLE BOOKING • 东方皇家"}
          </span>
          <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: var(--ink-dark); line-height: 1.15;">
            ${cfg.title || "Reserve Your Table at Royal Kopitiam"}
          </h3>
        `;
      }

      if (paxInput) {
        paxInput.min = String(cfg.minPax || 1);
        paxInput.max = String(cfg.maxPax || 100);
      }

      if (timeInput) {
        if (cfg.minTime) timeInput.min = cfg.minTime;
        if (cfg.maxTime) timeInput.max = cfg.maxTime;
      }

      if (quickHourGroup && Array.isArray(cfg.quickHours)) {
        const currentHHMM = resState.time.replace(" WIB", "");
        quickHourGroup.innerHTML = cfg.quickHours
          .map(
            (hr) =>
              `<button type="button" class="res-quick-date ${hr === currentHHMM ? "is-active" : ""}" data-quick-hour="${hr}">${hr}</button>`
          )
          .join("");
        quickHourGroup.querySelectorAll("[data-quick-hour]").forEach((btn) => {
          btn.addEventListener("click", () => {
            setPreferredTime(btn.getAttribute("data-quick-hour"));
          });
        });
      }

      if (seatGroup && Array.isArray(cfg.seatingOptions) && cfg.seatingOptions.length) {
        if (!cfg.seatingOptions.some((o) => o.value === resState.seat)) {
          resState.seat = cfg.seatingOptions[0].value;
        }
        seatGroup.innerHTML = cfg.seatingOptions
          .map(
            (opt) => `
            <button type="button" class="res-pill ${opt.value === resState.seat ? "is-active" : ""}" data-res-seat="${opt.value}">
              ${opt.label || opt.value}
            </button>
          `
          )
          .join("");
        seatGroup.querySelectorAll("[data-res-seat]").forEach((btn) => {
          btn.addEventListener("click", () => {
            resState.seat = btn.getAttribute("data-res-seat");
            seatGroup.querySelectorAll("[data-res-seat]").forEach((b) => {
              b.classList.toggle("is-active", b === btn);
            });
            updatePreview();
          });
        });
      }

      if (notesInput && cfg.notesPlaceholder) {
        notesInput.placeholder = cfg.notesPlaceholder;
      }

      updatePreview();
    }

    window.__syncRoyalReservationModal = syncReservationModalFromConfig;

    // Guest count stepper & free number input
    paxMinusBtn?.addEventListener("click", () => {
      setGuestCount(resState.paxCount - 1, true);
    });

    paxPlusBtn?.addEventListener("click", () => {
      setGuestCount(resState.paxCount + 1, true);
    });

    paxInput?.addEventListener("input", () => {
      if (paxInput.value === "") return;
      setGuestCount(paxInput.value, false);
    });

    paxInput?.addEventListener("blur", () => {
      setGuestCount(paxInput.value || 1, true);
    });

    // Quick date buttons & date picker (past dates disabled)
    form.querySelectorAll("[data-quick-date]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setQuickDate(btn.getAttribute("data-quick-date"));
      });
    });

    dateInput?.addEventListener("change", () => {
      const todayISO = getTodayISO();
      dateInput.min = todayISO;
      if (dateInput.value && dateInput.value < todayISO) {
        dateInput.value = todayISO;
      }
      resState.dateStr = dateInput.value || todayISO;

      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowISO = toISODate(tomorrowDate);

      form.querySelectorAll("[data-quick-date]").forEach((b) => {
        const mode = b.getAttribute("data-quick-date");
        const isMatch =
          (mode === "today" && resState.dateStr === todayISO) ||
          (mode === "tomorrow" && resState.dateStr === tomorrowISO);
        b.classList.toggle("is-active", isMatch);
      });
      updatePreview();
    });

    timeInput?.addEventListener("input", () => {
      setPreferredTime(timeInput.value);
    });

    timeInput?.addEventListener("change", () => {
      setPreferredTime(timeInput.value);
    });

    nameInput?.addEventListener("input", () => {
      resState.name = nameInput.value;
      updatePreview();
    });

    notesInput?.addEventListener("input", () => {
      resState.notes = notesInput.value;
      updatePreview();
    });

    closeBtn?.addEventListener("click", () => modal.close());

    window.__openRoyalReservationModal = function (presetPax) {
      const todayISO = getTodayISO();
      if (dateInput) {
        dateInput.min = todayISO;
        if (!dateInput.value || dateInput.value < todayISO) {
          setQuickDate("today");
        }
      }
      if (presetPax && String(presetPax).trim().length > 0) {
        const matchNum = String(presetPax).match(/\d+/);
        if (matchNum) {
          setGuestCount(parseInt(matchNum[0], 10), true);
        }
      }
      syncReservationModalFromConfig();
      if (!modal.open) modal.showModal();
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const waNum = DATA.restaurantInfo.contact.whatsappNumber;
      const encoded = encodeURIComponent(buildWhatsAppMessage());
      window.open(`https://wa.me/${waNum}?text=${encoded}`, "_blank", "noopener");
      modal.close();
    });

    const cfg = DATA.reservationModalConfig || {};
    setGuestCount(cfg.defaultPax || 4, true);
    setQuickDate("today");
    setPreferredTime(cfg.defaultTime || "12:00");
    syncReservationModalFromConfig();
  }

  // ==========================================================================
  // 7. DYNAMIC 61-ITEM SCHEMA.ORG MENU JSON-LD (SEO & GEO STRUCTURED DATA)
  // ==========================================================================
  function injectDynamicMenuJsonLd() {
    const baseUrl = "https://royalkopitiam.id";
    const menuSections = DATA.menuCategories
      .filter((cat) => cat.id !== "all")
      .map((cat) => {
        const catItems = DATA.menuItems.filter((item) => item.category === cat.id);
        return {
          "@type": "MenuSection",
          "@id": `${baseUrl}/#menu-section-${cat.id}`,
          "name": `${cat.name} (${cat.chinese})`,
          "description": cat.description,
          "image": `${baseUrl}/${cat.bannerImage}`,
          "hasMenuItem": catItems.map((item) => ({
            "@type": "MenuItem",
            "@id": `${baseUrl}/#menu-item-${item.number}`,
            "identifier": `#${item.number}`,
            "name": `#${item.number} ${item.name}`,
            "description": item.description,
            "image": `${baseUrl}/${item.image}`,
            "suitableForDiet": "https://schema.org/HalalDiet",
            "offers": {
              "@type": "Offer",
              "price": String(item.priceK * 1000),
              "priceCurrency": "IDR",
              "availability": "https://schema.org/InStock"
            }
          }))
        };
      });

    const menuSchema = {
      "@context": "https://schema.org",
      "@type": "Menu",
      "@id": `${baseUrl}/#official-menu`,
      "name": `${DATA.restaurantInfo.name} Official ${DATA.menuItems.length}-Item Menu (No Pork, No Lard)`,
      "description":
        "Complete official menu of Royal Kopitiam (Kedai Kopitiam • 东方皇家 • Royal Oriental), featuring Signature Dishes, Nasi Goreng, Char Kway Teow, Mee Goreng, Curry & Prata, Starter & Dim Sum, Drink Bar, Kaya Toast & Soft-Boiled Eggs, and Desserts.",
      "inLanguage": ["en", "id"],
      "hasMenuSection": menuSections
    };

    let scriptEl = document.getElementById("dynamicMenuSchemaJsonLd");
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "dynamicMenuSchemaJsonLd";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(menuSchema);
  }

  // Expose full live re-render hook for the CMS
  window.renderEntireSite = function () {
    DATA = window.ROYAL_KOPITIAM_DATA;
    renderThemeAndVisibility();
    renderHeaderSection();
    renderHeroSection();
    renderStorySection();
    renderMenuSectionHeaderAndPackages();
    renderCategoryTabs();
    renderCategorySpotlight();
    renderMenuContent();
    renderKopiRitualSection();
    renderGallery();
    renderFaqSection();
    renderVisitSection();
    renderFooterSection();
    initLiveStatusAndInfo();
    if (window.__syncRoyalReservationModal) {
      window.__syncRoyalReservationModal();
    }
    injectDynamicMenuJsonLd();
  };

  window.openRoyalDishModal = openDishModal;

  document.addEventListener("DOMContentLoaded", () => {
    window.renderEntireSite();
    initEventListeners();
    initReservationModal();
  });
})();
