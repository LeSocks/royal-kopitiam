/**
 * ============================================================================
 * ROYAL KOPITIAM (KEDAI KOPITIAM • 东方皇家 • ROYAL ORIENTAL)
 * Interactive Application Controller (Menu Explorer, Kopi Guide, Bento Gallery,
 * and Native <dialog> Modals)
 * ============================================================================
 */

(function () {
  "use strict";

  const DATA = window.ROYAL_KOPITIAM_DATA;
  if (!DATA) {
    console.error("ROYAL_KOPITIAM_DATA not found. Make sure siteData.js is loaded first.");
    return;
  }

  // Application State
  const state = {
    menuViewMode: "cards", // 'cards' | 'board'
    activeCategory: "all",
    activeQuickFilter: "all", // 'all' | 'signature' | 'spicy' | 'wokhei' | 'morning'
    searchQuery: "",
    activeRitualId: DATA.kopiRitualGuide[0].id,
    activeGalleryZone: "all",
    lightboxIndex: 0,
    filteredGallery: [...DATA.galleryPhotos]
  };

  function floretHTML(colorClass = "floret-4--cream") {
    return `<span class="floret-4 ${colorClass}" aria-hidden="true"><span></span><span></span><span></span><span></span></span>`;
  }

  function formatPriceK(priceK) {
    return `${priceK} K`;
  }

  function formatPriceIDR(priceK) {
    return `Rp ${(priceK * 1000).toLocaleString("id-ID")}`;
  }

  // ==========================================================================
  // 1. LIVE OPEN / CLOSED STATUS & RESTAURANT DETAILS
  // ==========================================================================
  function initLiveStatusAndInfo() {
    const info = DATA.restaurantInfo;
    const now = new Date();
    const hour = now.getHours();
    const isOpen = hour >= info.hours.openHour24 && hour < info.hours.closeHour24;

    document.querySelectorAll("[data-live-status]").forEach((el) => {
      const dot = el.querySelector(".status-dot");
      const text = el.querySelector(".status-text");
      if (dot) dot.classList.toggle("is-closed", !isOpen);
      if (text) {
        text.textContent = isOpen
          ? `Open Today • Serving Until ${info.hours.closeHour24}:00 WIB`
          : `Opens Daily at 0${info.hours.openHour24}:00 WIB • Morning Kopi & Toast`;
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
        "Hello Royal Kopitiam! I would like to ask about visiting / your menu."
      );
      a.setAttribute("href", `https://wa.me/${info.contact.whatsappNumber}?text=${msg}`);
    });

    document.querySelectorAll("[data-maps-link]").forEach((a) => {
      a.setAttribute("href", info.address.googleMapsUrl);
    });
  }

  // ==========================================================================
  // 2. COMPLETE 61-ITEM INTERACTIVE MENU EXPLORER
  // ==========================================================================
  function getFilteredMenuItems() {
    const q = state.searchQuery.trim().toLowerCase();

    return DATA.menuItems.filter((item) => {
      if (state.activeCategory !== "all" && item.category !== state.activeCategory) {
        return false;
      }

      if (state.activeQuickFilter === "signature") {
        const isSig =
          item.category === "signature" ||
          item.badges.includes("Signature") ||
          item.badges.includes("Best Seller") ||
          item.badges.includes("Chef's Pick");
        if (!isSig) return false;
      } else if (state.activeQuickFilter === "spicy") {
        if (!item.spicy) return false;
      } else if (state.activeQuickFilter === "wokhei") {
        if (!item.badges.includes("Wok Hei")) return false;
      } else if (state.activeQuickFilter === "morning") {
        const isMorning =
          item.category === "toast" ||
          item.badges.includes("Morning Ritual") ||
          item.badges.includes("Kopitiam Kopi") ||
          ["36", "37", "38", "39"].includes(item.number);
        if (!isMorning) return false;
      }

      if (q) {
        const hay = `${item.number} ${item.name} ${item.categoryLabel} ${item.description} ${item.badges.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }

  function renderCategoryTabs() {
    const container = document.getElementById("menuCategoryTabs");
    if (!container) return;

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

    spotlightEl.innerHTML = `
      <div class="category-spotlight__info">
        <div class="category-spotlight__head">
          <span class="category-spotlight__range">Menu Nos. ${cat.rangeLabel}</span>
          <span class="category-spotlight__zh">${cat.chinese}</span>
        </div>
        <h3 class="category-spotlight__title">${cat.name}</h3>
        <p style="font-size: 0.96rem; color: var(--ink-body);">${cat.description}</p>
      </div>
      <img
        class="category-spotlight__img"
        src="${cat.bannerImage}"
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
            Try clearing your search or switching back to "All Menu" to view all 61 Royal Kopitiam items.
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

    // 2. Classic Kopitiam Board List View
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
                  <img class="classic-cat-block__photo" src="${cat.bannerImage}" alt="${cat.name}" loading="lazy" />
                  <div>
                    ${catItems
                      .map(
                        (item) => `
                        <div class="classic-item-row" data-dish-num="${item.number}" tabindex="0" role="button" aria-label="View details for ${item.number}. ${item.name}">
                          <span class="classic-item-row__num">${item.number}.</span>
                          <span class="classic-item-row__name">
                            ${item.name}
                            ${item.spicy ? '<span title="Spicy" style="color: var(--royal-red); font-size: 0.78rem;">🌶</span>' : ""}
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

    // 3. Default Interactive Photo Cards View
    container.innerHTML = `
      <div class="menu-grid">
        ${items
          .map((item) => {
            const badgesHTML = [
              ...item.badges.slice(0, 2).map((b) => `<span class="dish-badge">${b}</span>`),
              item.spicy ? `<span class="dish-badge dish-badge--spicy">Spicy</span>` : ""
            ].join("");

            return `
              <article class="dish-card" data-dish-num="${item.number}" tabindex="0" role="button" aria-label="Inspect dish ${item.number}: ${item.name}">
                <div class="dish-card__media">
                  <span class="dish-num-badge">${item.number}</span>
                  <div class="dish-card__badges">${badgesHTML}</div>
                  <img
                    src="${item.image}"
                    alt="${item.number}. ${item.name}"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="dish-card__body">
                  <div class="dish-card__cat">${item.categoryLabel}</div>
                  <div class="dish-card__head">
                    <h4 class="dish-card__title">${item.name}</h4>
                    <span class="dish-card__price">${formatPriceK(item.priceK)}</span>
                  </div>
                  <p class="dish-card__desc">${item.description}</p>
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
      el.addEventListener("click", () => {
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
              ${item.categoryLabel}
            </span>
            <h3 style="font-family: var(--font-display); font-size: 1.25rem; color: var(--ink-dark); line-height: 1.15;">
              ${item.name}
            </h3>
          </div>
        </div>
        <button type="button" class="modal-close-btn" data-close-modal aria-label="Close modal">✕</button>
      </div>
      <div class="modal-body">
        <div class="dish-modal-grid">
          <div class="dish-modal-photo">
            <img src="${item.image}" alt="${item.name}" style="width: 100%; height: auto;" />
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
              ${item.description}
            </p>

            <div style="display: flex; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 1.35rem;">
              ${item.badges
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
                        <span><strong style="color: var(--royal-red);">#${p.number}</strong> ${p.name}</span>
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
    bindDishOpenTriggers(content);

    if (!modal.open) {
      modal.showModal();
    }
  }

  // ==========================================================================
  // 4. INTERACTIVE ROYAL KOPITIAM DRINK BAR GUIDE (#36 – #45)
  // ==========================================================================
  function renderKopiRitualSection() {
    const tabsEl = document.getElementById("kopiRitualTabs");
    const stageEl = document.getElementById("kopiRitualStage");
    if (!tabsEl || !stageEl) return;

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
          ${current.layers
            .map((layer) => {
              const txtColor = layer.textColor || "#FFFDF8";
              const isLightText = txtColor.toUpperCase() === "#FFFDF8" || txtColor.toUpperCase() === "#FFFFFF";
              const shadowStyle = isLightText
                ? "0 1px 2px rgba(0, 0, 0, 0.55)"
                : "none";
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
            ${current.tagline}
          </span>
          <span class="ritual-stage-details__pronounce">
            Say it: “${current.pronunciation}”
          </span>
        </div>

        <div class="ritual-stage-details__heading">
          <h3>${current.name}</h3>
          <span class="ritual-stage-details__zh">${current.chinese}</span>
        </div>

        <p class="ritual-stage-details__notes">
          ${current.notes}
        </p>

        <div class="cup-breakdown-list" aria-label="Cup layer breakdown">
          ${current.layers
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
            ${current.pairWith}
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
        const firstNum = current.menuNumber.split(" ")[0];
        openDishModal(firstNum);
      });
    }
  }

  // ==========================================================================
  // 5. 16-SLOT ATMOSPHERE & VIBES GALLERY + LIGHTBOX
  // ==========================================================================
  function renderGallery() {
    const pillsEl = document.getElementById("galleryZonePills");
    const gridEl = document.getElementById("bentoGalleryGrid");
    if (!pillsEl || !gridEl) return;

    pillsEl.innerHTML = DATA.galleryZones
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
              src="${item.image}"
              alt="${item.title}"
              loading="lazy"
              decoding="async"
            />
            <figcaption class="bento-tile__overlay">
              <div class="bento-tile__title">${item.title}</div>
              <div class="bento-tile__caption">${item.caption}</div>
            </figcaption>
          </figure>
        `;
      })
      .join("");

    gridEl.querySelectorAll("[data-gallery-idx]").forEach((tile) => {
      tile.addEventListener("click", () => {
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
          <img src="${item.image}" alt="${item.title}" style="max-height: 66vh; width: auto; max-width: 100%; object-fit: contain;" />
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

    document.querySelectorAll("[data-open-dish]").forEach((el) => {
      el.addEventListener("click", () => {
        openDishModal(el.getAttribute("data-open-dish"));
      });
    });

    const mobileBtn = document.getElementById("mobileMenuToggleBtn");
    const mainNav = document.getElementById("mainNavLinks");
    if (mobileBtn && mainNav) {
      mobileBtn.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("is-open");
        mobileBtn.setAttribute("aria-expanded", String(isOpen));
      });
      mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => mainNav.classList.remove("is-open"));
      });
    }

    document.querySelectorAll("dialog.royal-modal").forEach((dlg) => {
      dlg.addEventListener("click", (e) => {
        const rect = dlg.getBoundingClientRect();
        const clickedInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (!clickedInDialog) {
          dlg.close();
          dlg.classList.remove("royal-modal--wide");
        }
      });
    });

    window.addEventListener("keydown", (e) => {
      const lb = document.getElementById("galleryLightboxModal");
      if (lb && lb.open) {
        if (e.key === "ArrowRight") openGalleryLightbox(state.lightboxIndex + 1);
        if (e.key === "ArrowLeft") openGalleryLightbox(state.lightboxIndex - 1);
      }
    });
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
      "name": "Royal Kopitiam Official 61-Item Menu (No Pork, No Lard)",
      "description":
        "Complete 61-item official menu of Royal Kopitiam (Kedai Kopitiam • 东方皇家 • Royal Oriental), featuring Signature Dishes, Nasi Goreng, Char Kway Teow, Mee Goreng, Curry & Prata, Starter & Dim Sum, Drink Bar, Kaya Toast & Soft-Boiled Eggs, and Desserts.",
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

  document.addEventListener("DOMContentLoaded", () => {
    initLiveStatusAndInfo();
    renderCategoryTabs();
    renderCategorySpotlight();
    renderMenuContent();
    renderKopiRitualSection();
    renderGallery();
    initEventListeners();
    injectDynamicMenuJsonLd();
  });
})();
