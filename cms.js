/**
 * ============================================================================
 * ROYAL KOPITIAM — FULL HEADER-TO-FOOTER CMS STUDIO ENGINE (cms.js)
 * Edit Menu Items, Pictures, Curated Packages, Recommended Pairings, Drink Bar,
 * Gallery, FAQs, Reservation Modal, and All Template Texts from Header to Footer.
 * ============================================================================
 */

(function () {
  "use strict";

  const CMS_STORAGE_KEY = "ROYAL_KOPITIAM_CMS_DATA_V1";
  const CMS_LOCAL_HISTORY_KEY = "ROYAL_KOPITIAM_CMS_HISTORY_V1";

  const BADGE_PRESETS = [
    "Signature",
    "Best Seller",
    "Chef's Pick",
    "Wok Hei",
    "Seafood",
    "Morning Ritual",
    "Kopitiam Kopi",
    "Kopitiam Classic",
    "Dim Sum",
    "Comfort Bowl",
    "Royal Special",
    "Crispy",
    "Refreshing",
    "Heritage Snack",
    "Espresso Bar",
    "Sweet",
    "Savory",
    "Vegetarian Friendly"
  ];

  const cmsState = {
    isOpen: false,
    isExpanded: false,
    inspectMode: false,
    activeTab: "menu",
    selectedDishNumber: "01",
    menuSearch: "",
    menuCategoryFilter: "all",
    pairingSearch: "",
    serverConnected: false,
    projectAssets: [],
    historyList: [],
    assetPickerCallback: null,
    assetFilterFolder: "all"
  };

  function getData() {
    return window.ROYAL_KOPITIAM_DATA;
  }

  function escHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    let toast = document.getElementById("cmsToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "cmsToast";
      toast.className = "cms-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  function triggerLiveSiteUpdate() {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(getData()));
    } catch (e) {
      console.warn("Could not cache to localStorage:", e);
    }
    if (typeof window.renderEntireSite === "function") {
      window.renderEntireSite();
    }
    const previewFrame = document.getElementById("cmsStandalonePreviewFrame");
    if (previewFrame && previewFrame.contentWindow) {
      try {
        previewFrame.contentWindow.ROYAL_KOPITIAM_DATA = JSON.parse(
          JSON.stringify(getData())
        );
        if (typeof previewFrame.contentWindow.renderEntireSite === "function") {
          previewFrame.contentWindow.renderEntireSite();
        }
      } catch (err) {
        // Ignore cross-frame timing issues
      }
    }
  }

  // ==========================================================================
  // SERVER & LOCAL PERSISTENCE / HISTORY API
  // ==========================================================================
  function getDefaultAssetFallbackList() {
    const d = getData();
    const set = new Set([
      "assets/brand/logo_royal_kopitiam.png",
      "assets/brand/chinese-seal.png",
      "assets/brand/royal-oriental-crest.png",
      "assets/brand/no-pork-no-lard.png",
      "assets/brand/kopitiam-lineart.png"
    ]);
    (d.menuCategories || []).forEach((c) => c.bannerImage && set.add(c.bannerImage));
    (d.menuItems || []).forEach((i) => i.image && set.add(i.image));
    (d.galleryPhotos || []).forEach((g) => g.image && set.add(g.image));
    return Array.from(set).map((p) => {
      const parts = p.split("/");
      return {
        path: p,
        name: parts[parts.length - 1],
        folder: parts[1] || "food"
      };
    });
  }

  async function checkServerStatus() {
    try {
      const res = await fetch("/api/cms/status");
      if (res.ok) {
        const json = await res.json();
        if (json.ok) {
          cmsState.serverConnected = true;
          cmsState.projectAssets = json.assets || getDefaultAssetFallbackList();
          await fetchHistoryList();
          updateTopbarStatusUI();
          return;
        }
      }
    } catch (_) {
      // Static / offline mode
    }
    cmsState.serverConnected = false;
    cmsState.projectAssets = getDefaultAssetFallbackList();
    loadLocalHistory();
    updateTopbarStatusUI();
  }

  function loadLocalHistory() {
    try {
      const raw = localStorage.getItem(CMS_LOCAL_HISTORY_KEY);
      cmsState.historyList = raw ? JSON.parse(raw) : [];
    } catch (_) {
      cmsState.historyList = [];
    }
  }

  function saveLocalHistoryEntry(note) {
    loadLocalHistory();
    const d = getData();
    const entry = {
      id: "local-" + Date.now(),
      timestamp: new Date().toISOString().slice(0, 19),
      note: note || "Saved in Browser",
      menuCount: (d.menuItems || []).length,
      packageCount: (d.curatedPackages || []).length,
      data: JSON.parse(JSON.stringify(d))
    };
    cmsState.historyList.unshift(entry);
    cmsState.historyList = cmsState.historyList.slice(0, 25);
    try {
      localStorage.setItem(CMS_LOCAL_HISTORY_KEY, JSON.stringify(cmsState.historyList));
    } catch (_) {}
  }

  async function fetchHistoryList() {
    if (!cmsState.serverConnected) {
      loadLocalHistory();
      return;
    }
    try {
      const res = await fetch("/api/cms/history");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.history)) {
          cmsState.historyList = json.history;
          return;
        }
      }
    } catch (_) {}
    loadLocalHistory();
  }

  async function saveAndPublishAll(note = "Published via CMS Studio", saveSnapshot = true) {
    triggerLiveSiteUpdate();
    saveLocalHistoryEntry(note);

    if (cmsState.serverConnected) {
      try {
        const res = await fetch("/api/cms/save-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: getData(),
            note,
            saveSnapshot
          })
        });
        const json = await res.json();
        if (json.ok) {
          await fetchHistoryList();
          showToast("✅ Saved to siteData.js on disk & published live!");
          if (cmsState.activeTab === "history") renderActiveTab();
          return;
        }
      } catch (err) {
        console.warn("Server save fallback:", err);
      }
    }
    showToast("✅ Saved to browser storage & updated live!");
    if (cmsState.activeTab === "history") renderActiveTab();
  }

  async function uploadImageFile(file, targetFolder = "food", suggestedPrefix = "dish") {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const cleanName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9._-]/g, "-")
          .replace(/-+/g, "-");
        const filename = `${suggestedPrefix}-${Date.now().toString().slice(-5)}-${cleanName}`;

        if (cmsState.serverConnected) {
          try {
            const res = await fetch("/api/cms/upload-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                folder: targetFolder,
                filename,
                dataUrl
              })
            });
            const json = await res.json();
            if (json.ok && json.path) {
              if (Array.isArray(json.assets)) {
                cmsState.projectAssets = json.assets;
              }
              showToast(`📸 Uploaded & saved to ${json.path}`);
              resolve(json.path);
              return;
            }
          } catch (e) {
            console.warn("Image upload fallback to Data URL:", e);
          }
        }
        showToast("📸 Image loaded into template!");
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

  // ==========================================================================
  // IMAGE PICKER HELPER COMPONENT
  // ==========================================================================
  function renderImagePickerField({
    id,
    label,
    currentValue,
    folder = "food",
    prefix = "img"
  }) {
    const previewSrc = currentValue || "assets/brand/logo_royal_kopitiam.png";
    return `
      <div class="cms-field">
        <label class="cms-label">${escHtml(label)}</label>
        <div class="cms-img-picker" data-img-picker-wrap="${escHtml(id)}">
          <div class="cms-img-picker__preview">
            <img src="${escHtml(previewSrc)}" alt="Preview" data-img-preview="${escHtml(id)}" />
          </div>
          <div class="cms-img-picker__controls">
            <input
              type="text"
              class="cms-input"
              data-img-input="${escHtml(id)}"
              value="${escHtml(currentValue || "")}"
              placeholder="assets/food/... or paste image URL"
            />
            <div class="cms-img-picker__btns">
              <label class="cms-btn cms-btn--green cms-btn--sm" style="cursor: pointer;">
                📁 Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  style="display: none;"
                  data-img-file="${escHtml(id)}"
                  data-img-folder="${escHtml(folder)}"
                  data-img-prefix="${escHtml(prefix)}"
                />
              </label>
              <button
                type="button"
                class="cms-btn cms-btn--sm"
                data-open-asset-lib="${escHtml(id)}"
                data-asset-folder="${escHtml(folder)}"
              >
                🖼️ Choose from Library
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindImagePickers(container, onChangeMap) {
    container.querySelectorAll("[data-img-input]").forEach((input) => {
      const id = input.getAttribute("data-img-input");
      const preview = container.querySelector(`[data-img-preview="${id}"]`);
      input.addEventListener("input", () => {
        if (preview) preview.src = input.value || "assets/brand/logo_royal_kopitiam.png";
        if (onChangeMap[id]) {
          onChangeMap[id](input.value);
          triggerLiveSiteUpdate();
        }
      });
    });

    container.querySelectorAll("[data-img-file]").forEach((fileInput) => {
      const id = fileInput.getAttribute("data-img-file");
      const folder = fileInput.getAttribute("data-img-folder") || "food";
      const prefix = fileInput.getAttribute("data-img-prefix") || "photo";
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const newPath = await uploadImageFile(file, folder, prefix);
        const textInput = container.querySelector(`[data-img-input="${id}"]`);
        const preview = container.querySelector(`[data-img-preview="${id}"]`);
        if (textInput) textInput.value = newPath;
        if (preview) preview.src = newPath;
        if (onChangeMap[id]) {
          onChangeMap[id](newPath);
          triggerLiveSiteUpdate();
        }
      });
    });

    container.querySelectorAll("[data-open-asset-lib]").forEach((btn) => {
      const id = btn.getAttribute("data-open-asset-lib");
      const folder = btn.getAttribute("data-asset-folder") || "all";
      btn.addEventListener("click", () => {
        openAssetLibraryModal(folder, (chosenPath) => {
          const textInput = container.querySelector(`[data-img-input="${id}"]`);
          const preview = container.querySelector(`[data-img-preview="${id}"]`);
          if (textInput) textInput.value = chosenPath;
          if (preview) preview.src = chosenPath;
          if (onChangeMap[id]) {
            onChangeMap[id](chosenPath);
            triggerLiveSiteUpdate();
          }
        });
      });
    });
  }

  function openAssetLibraryModal(initialFolder, onSelect) {
    cmsState.assetFilterFolder = initialFolder || "all";
    cmsState.assetPickerCallback = onSelect;
    const modal = document.getElementById("cmsAssetModalBackdrop");
    if (!modal) return;
    modal.classList.add("is-open");
    renderAssetLibraryGrid();
  }

  function renderAssetLibraryGrid() {
    const gridEl = document.getElementById("cmsAssetModalGrid");
    const filterRow = document.getElementById("cmsAssetFolderFilters");
    if (!gridEl || !filterRow) return;

    const folders = ["all", "food", "gallery", "brand"];
    filterRow.innerHTML = folders
      .map(
        (f) => `
        <button
          type="button"
          class="cms-btn cms-btn--sm ${cmsState.assetFilterFolder === f ? "cms-btn--green" : ""}"
          data-asset-filter-btn="${f}"
        >
          ${f === "all" ? "All Assets" : f.toUpperCase()}
        </button>
      `
      )
      .join("");

    filterRow.querySelectorAll("[data-asset-filter-btn]").forEach((b) => {
      b.addEventListener("click", () => {
        cmsState.assetFilterFolder = b.getAttribute("data-asset-filter-btn");
        renderAssetLibraryGrid();
      });
    });

    const list = (cmsState.projectAssets || []).filter(
      (a) => cmsState.assetFilterFolder === "all" || a.folder === cmsState.assetFilterFolder
    );

    gridEl.innerHTML = list
      .map(
        (asset) => `
        <button type="button" class="cms-asset-card" data-pick-asset="${escHtml(asset.path)}">
          <img src="${escHtml(asset.path)}" alt="${escHtml(asset.name)}" loading="lazy" />
          <div class="cms-asset-card__name" title="${escHtml(asset.path)}">${escHtml(asset.name)}</div>
        </button>
      `
      )
      .join("");

    gridEl.querySelectorAll("[data-pick-asset]").forEach((card) => {
      card.addEventListener("click", () => {
        const chosen = card.getAttribute("data-pick-asset");
        if (cmsState.assetPickerCallback) {
          cmsState.assetPickerCallback(chosen);
        }
        document.getElementById("cmsAssetModalBackdrop")?.classList.remove("is-open");
      });
    });
  }

  // ==========================================================================
  // TAB 1: HEADER, NAVIGATION, BRAND COLORS & SECTION VISIBILITY
  // ==========================================================================
  function renderHeaderTab(ws) {
    const d = getData();
    const h = (d.headerConfig = d.headerConfig || {});
    const t = (d.themeConfig = d.themeConfig || {});
    const vis = (t.sectionVisibility = t.sectionVisibility || {});

    const sectionsList = [
      { key: "hero", label: "1. Hero Banner Section" },
      { key: "story", label: "2. Our Story & Heritage" },
      { key: "packages", label: "3A. Curated Packages / Combos Strip" },
      { key: "menu", label: "3B. Complete Official Menu Explorer" },
      { key: "ritual", label: "4. Kopi & Drink Bar Decoder" },
      { key: "vibes", label: "5. Atmosphere & Vibes Gallery" },
      { key: "faq", label: "6. Quick Facts & Guest FAQ" },
      { key: "visit", label: "7. Visit Us, Amenities & Map" },
      { key: "footer", label: "8. Site Footer" }
    ];

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">🎨 Header, Navigation & Brand Theme</h2>
          <p class="cms-section-desc">Customize the top navigation bar, brand logo, section visibility, and color palette.</p>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🏛️ Header Brand Identity & Status Bar</div>
        </div>
        ${renderImagePickerField({
          id: "headerLogo",
          label: "Header Brand Logo",
          currentValue: h.logo,
          folder: "brand",
          prefix: "logo"
        })}
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Brand Title</label>
            <input type="text" class="cms-input" id="cmsHeaderTitle" value="${escHtml(h.brandTitle)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Brand Chinese / Subtitle</label>
            <input type="text" class="cms-input" id="cmsHeaderSub" value="${escHtml(h.brandSubtitle)}" />
          </div>
        </div>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Header CTA Button Text</label>
            <input type="text" class="cms-input" id="cmsHeaderCtaText" value="${escHtml(h.ctaText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Header CTA Button Link</label>
            <input type="text" class="cms-input" id="cmsHeaderCtaHref" value="${escHtml(h.ctaHref)}" />
          </div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Custom Live Status Pill Text (Leave empty for auto open/close hours)</label>
          <input
            type="text"
            class="cms-input"
            id="cmsHeaderStatusOverride"
            placeholder="Auto: Open Today • Serving Until 22:00 WIB"
            value="${escHtml(h.customStatusText || "")}"
          />
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🧭 Top Navigation Bar Links</div>
          <button type="button" class="cms-btn cms-btn--green cms-btn--sm" id="cmsAddHeaderNavBtn">+ Add Nav Link</button>
        </div>
        <div id="cmsHeaderNavList">
          ${(h.navLinks || [])
            .map(
              (link, idx) => `
              <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.45rem; margin-bottom: 0.45rem; align-items: center;">
                <input type="text" class="cms-input" data-hnav-label="${idx}" value="${escHtml(link.label)}" placeholder="Label" />
                <input type="text" class="cms-input" data-hnav-href="${idx}" value="${escHtml(link.href)}" placeholder="#section or URL" />
                <div style="display: flex; gap: 0.25rem;">
                  <button type="button" class="cms-btn cms-btn--sm" data-hnav-up="${idx}" title="Move Up">↑</button>
                  <button type="button" class="cms-btn cms-btn--sm" data-hnav-down="${idx}" title="Move Down">↓</button>
                  <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-hnav-del="${idx}" title="Remove">✕</button>
                </div>
              </div>
            `
            )
            .join("")}
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">👁️ Page Section Visibility (Show / Hide Sections)</div>
        </div>
        <div class="cms-grid-2">
          ${sectionsList
            .map(
              (sec) => `
              <label style="display: flex; align-items: center; gap: 0.55rem; font-size: 0.82rem; font-weight: 700; padding: 0.45rem 0.65rem; background: #f9f4e8; border-radius: 9px; border: 1px solid #dfd0b8; cursor: pointer;">
                <input type="checkbox" data-vis-toggle="${sec.key}" ${vis[sec.key] !== false ? "checked" : ""} />
                <span>${escHtml(sec.label)}</span>
              </label>
            `
            )
            .join("")}
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🎨 Brand Color Palette</div>
          <button type="button" class="cms-btn cms-btn--sm" id="cmsResetColorsBtn">Reset Default Colors</button>
        </div>
        <div class="cms-grid-3">
          <div class="cms-field">
            <label class="cms-label">Royal Green</label>
            <input type="color" class="cms-input" style="height: 40px; padding: 0.2rem;" id="cmsColorGreen" value="${escHtml(t.royalGreen || "#0f5922")}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Deep Green</label>
            <input type="color" class="cms-input" style="height: 40px; padding: 0.2rem;" id="cmsColorGreenDeep" value="${escHtml(t.royalGreenDeep || "#083b14")}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Royal Oriental Red</label>
            <input type="color" class="cms-input" style="height: 40px; padding: 0.2rem;" id="cmsColorRed" value="${escHtml(t.royalRed || "#c8242b")}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Royal Gold</label>
            <input type="color" class="cms-input" style="height: 40px; padding: 0.2rem;" id="cmsColorGold" value="${escHtml(t.royalGold || "#c7922e")}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Warm Cream Bg</label>
            <input type="color" class="cms-input" style="height: 40px; padding: 0.2rem;" id="cmsColorCream" value="${escHtml(t.royalCream || "#f7f1e3")}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Light Cream Surface</label>
            <input type="color" class="cms-input" style="height: 40px; padding: 0.2rem;" id="cmsColorCreamLight" value="${escHtml(t.royalCreamLight || "#fdfaf3")}" />
          </div>
        </div>
      </div>
    `;

    bindImagePickers(ws, {
      headerLogo: (val) => (h.logo = val)
    });

    const bindInput = (sel, cb) => {
      ws.querySelector(sel)?.addEventListener("input", (e) => {
        cb(e.target.value);
        triggerLiveSiteUpdate();
      });
    };

    bindInput("#cmsHeaderTitle", (v) => (h.brandTitle = v));
    bindInput("#cmsHeaderSub", (v) => (h.brandSubtitle = v));
    bindInput("#cmsHeaderCtaText", (v) => (h.ctaText = v));
    bindInput("#cmsHeaderCtaHref", (v) => (h.ctaHref = v));
    bindInput("#cmsHeaderStatusOverride", (v) => (h.customStatusText = v));

    bindInput("#cmsColorGreen", (v) => (t.royalGreen = v));
    bindInput("#cmsColorGreenDeep", (v) => (t.royalGreenDeep = v));
    bindInput("#cmsColorRed", (v) => (t.royalRed = v));
    bindInput("#cmsColorGold", (v) => (t.royalGold = v));
    bindInput("#cmsColorCream", (v) => (t.royalCream = v));
    bindInput("#cmsColorCreamLight", (v) => (t.royalCreamLight = v));

    ws.querySelector("#cmsResetColorsBtn")?.addEventListener("click", () => {
      t.royalGreen = "#0f5922";
      t.royalGreenDeep = "#083b14";
      t.royalRed = "#c8242b";
      t.royalGold = "#c7922e";
      t.royalCream = "#f7f1e3";
      t.royalCreamLight = "#fdfaf3";
      triggerLiveSiteUpdate();
      renderHeaderTab(ws);
      showToast("🎨 Restored default Royal Kopitiam color palette");
    });

    ws.querySelectorAll("[data-vis-toggle]").forEach((chk) => {
      chk.addEventListener("change", () => {
        vis[chk.getAttribute("data-vis-toggle")] = chk.checked;
        triggerLiveSiteUpdate();
      });
    });

    ws.querySelectorAll("[data-hnav-label]").forEach((inp) => {
      const idx = Number(inp.getAttribute("data-hnav-label"));
      inp.addEventListener("input", () => {
        h.navLinks[idx].label = inp.value;
        triggerLiveSiteUpdate();
      });
    });

    ws.querySelectorAll("[data-hnav-href]").forEach((inp) => {
      const idx = Number(inp.getAttribute("data-hnav-href"));
      inp.addEventListener("input", () => {
        h.navLinks[idx].href = inp.value;
        triggerLiveSiteUpdate();
      });
    });

    ws.querySelectorAll("[data-hnav-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-hnav-up"));
        if (idx > 0) {
          [h.navLinks[idx - 1], h.navLinks[idx]] = [h.navLinks[idx], h.navLinks[idx - 1]];
          triggerLiveSiteUpdate();
          renderHeaderTab(ws);
        }
      });
    });

    ws.querySelectorAll("[data-hnav-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-hnav-down"));
        if (idx < h.navLinks.length - 1) {
          [h.navLinks[idx + 1], h.navLinks[idx]] = [h.navLinks[idx], h.navLinks[idx + 1]];
          triggerLiveSiteUpdate();
          renderHeaderTab(ws);
        }
      });
    });

    ws.querySelectorAll("[data-hnav-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-hnav-del"));
        h.navLinks.splice(idx, 1);
        triggerLiveSiteUpdate();
        renderHeaderTab(ws);
      });
    });

    ws.querySelector("#cmsAddHeaderNavBtn")?.addEventListener("click", () => {
      h.navLinks.push({ label: "New Section", href: "#menu" });
      triggerLiveSiteUpdate();
      renderHeaderTab(ws);
    });
  }

  // ==========================================================================
  // TAB 2: HERO SECTION
  // ==========================================================================
  function renderHeroTab(ws) {
    const d = getData();
    const hero = (d.heroSection = d.heroSection || {});
    hero.stats = hero.stats || [];
    hero.visualPanels = hero.visualPanels || [];
    hero.signatureStrip = hero.signatureStrip || [];

    const dishOptionsHTML = (selectedNum) =>
      (d.menuItems || [])
        .map(
          (m) =>
            `<option value="${escHtml(m.number)}" ${m.number === selectedNum ? "selected" : ""}>#${escHtml(m.number)} ${escHtml(m.name)} (${m.priceK} K)</option>`
        )
        .join("");

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">🏛️ Hero Banner & Visual Stage</h2>
          <p class="cms-section-desc">Edit the top hero copy, badges, CTA buttons, key stats, 3 showcase photos, and bottom strip.</p>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🏷️ Hero Badges, Logos & Headline</div>
        </div>
        <div class="cms-grid-3">
          <div class="cms-field">
            <label class="cms-label">Seal Chinese</label>
            <input type="text" class="cms-input" id="heroSealZh" value="${escHtml(hero.sealChinese)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Seal Subtitle</label>
            <input type="text" class="cms-input" id="heroSealText" value="${escHtml(hero.sealText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Halal Assurance Chip</label>
            <input type="text" class="cms-input" id="heroAssurance" value="${escHtml(hero.assuranceChip)}" />
          </div>
        </div>

        <div class="cms-grid-2">
          ${renderImagePickerField({
            id: "heroLogoImg",
            label: "Hero Crest Logo",
            currentValue: hero.logoImage,
            folder: "brand",
            prefix: "hero-logo"
          })}
          ${renderImagePickerField({
            id: "heroSealImg",
            label: "Hero Chinese Seal Stamp",
            currentValue: hero.sealImage,
            folder: "brand",
            prefix: "hero-seal"
          })}
        </div>

        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Headline Part 1 (Standard)</label>
            <input type="text" class="cms-input" id="heroTitlePrefix" value="${escHtml(hero.titlePrefix)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Headline Part 2 (Italic Red/Serif)</label>
            <input type="text" class="cms-input" id="heroTitleItalic" value="${escHtml(hero.titleItalic)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Headline Part 3 (Connector)</label>
            <input type="text" class="cms-input" id="heroTitleMiddle" value="${escHtml(hero.titleMiddle)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Headline Part 4 (Royal Green Highlight)</label>
            <input type="text" class="cms-input" id="heroTitleHighlight" value="${escHtml(hero.titleHighlight)}" />
          </div>
        </div>

        <div class="cms-field">
          <label class="cms-label">Hero Subtitle Copy (HTML allowed: &lt;strong&gt;, &lt;em&gt;)</label>
          <textarea class="cms-textarea" id="heroSubtitle">${escHtml(hero.subtitle)}</textarea>
        </div>

        <div class="cms-grid-3">
          <div class="cms-field">
            <label class="cms-label">Primary CTA Text</label>
            <input type="text" class="cms-input" id="heroPrimaryCta" value="${escHtml(hero.primaryCtaText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Reserve Button Text</label>
            <input type="text" class="cms-input" id="heroReserveCta" value="${escHtml(hero.reserveCtaText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Secondary CTA Text</label>
            <input type="text" class="cms-input" id="heroSecondaryCta" value="${escHtml(hero.secondaryCtaText)}" />
          </div>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🖼️ Hero 3 Visual Stage Photo Panels</div>
        </div>
        ${hero.visualPanels
          .map(
            (panel, idx) => `
            <div style="padding: 0.75rem; background: #fbf7ee; border: 1px solid #e2d4bd; border-radius: 11px; margin-bottom: 0.75rem;">
              <div style="font-size: 0.78rem; font-weight: 800; color: #083b14; margin-bottom: 0.5rem;">
                Stage Panel ${idx + 1} (${idx === 0 ? "Top Wide Banner" : idx === 1 ? "Bottom-Left Card" : "Bottom-Right Card"})
              </div>
              ${renderImagePickerField({
                id: `heroPanelImg_${idx}`,
                label: "Panel Photo",
                currentValue: panel.image,
                folder: idx === 0 ? "gallery" : "food",
                prefix: `hero-panel-${idx + 1}`
              })}
              <div class="cms-grid-2">
                <div class="cms-field">
                  <label class="cms-label">Overlay Title</label>
                  <input type="text" class="cms-input" data-hpanel-title="${idx}" value="${escHtml(panel.title)}" />
                </div>
                <div class="cms-field">
                  <label class="cms-label">Overlay Subtitle</label>
                  <input type="text" class="cms-input" data-hpanel-sub="${idx}" value="${escHtml(panel.subtitle)}" />
                </div>
                <div class="cms-field">
                  <label class="cms-label">Corner Tag / Price Badge</label>
                  <input type="text" class="cms-input" data-hpanel-tag="${idx}" value="${escHtml(panel.tag)}" />
                </div>
                <div class="cms-field">
                  <label class="cms-label">Click Opens Dish #</label>
                  <select class="cms-select" data-hpanel-dish="${idx}">
                    ${dishOptionsHTML(panel.dishNumber)}
                  </select>
                </div>
              </div>
            </div>
          `
          )
          .join("")}
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📊 Hero Key Stats & Bottom Signature Strip</div>
        </div>
        <div class="cms-label" style="margin-bottom: 0.45rem;">3 Hero Stat Counters</div>
        ${hero.stats
          .map(
            (st, idx) => `
            <div class="cms-grid-2" style="margin-bottom: 0.45rem;">
              <input type="text" class="cms-input" data-hstat-val="${idx}" value="${escHtml(st.value)}" placeholder="Stat Value (e.g. 61 Dishes)" />
              <input type="text" class="cms-input" data-hstat-lbl="${idx}" value="${escHtml(st.label)}" placeholder="Stat Label" />
            </div>
          `
          )
          .join("")}

        <div class="cms-label" style="margin: 0.85rem 0 0.45rem;">Bottom Hero Signature Strip Items</div>
        ${hero.signatureStrip
          .map(
            (st, idx) => `
            <div class="cms-grid-2" style="margin-bottom: 0.45rem;">
              <input type="text" class="cms-input" data-hstrip-lbl="${idx}" value="${escHtml(st.label)}" placeholder="Bold Prefix (e.g. TOAST & KOPI:)" />
              <input type="text" class="cms-input" data-hstrip-txt="${idx}" value="${escHtml(st.text)}" placeholder="Items text" />
            </div>
          `
          )
          .join("")}
      </div>
    `;

    const imgCallbacks = {
      heroLogoImg: (v) => (hero.logoImage = v),
      heroSealImg: (v) => (hero.sealImage = v)
    };
    hero.visualPanels.forEach((p, idx) => {
      imgCallbacks[`heroPanelImg_${idx}`] = (v) => (p.image = v);
    });
    bindImagePickers(ws, imgCallbacks);

    const bind = (sel, fn) => {
      ws.querySelector(sel)?.addEventListener("input", (e) => {
        fn(e.target.value);
        triggerLiveSiteUpdate();
      });
    };
    bind("#heroSealZh", (v) => (hero.sealChinese = v));
    bind("#heroSealText", (v) => (hero.sealText = v));
    bind("#heroAssurance", (v) => (hero.assuranceChip = v));
    bind("#heroTitlePrefix", (v) => (hero.titlePrefix = v));
    bind("#heroTitleItalic", (v) => (hero.titleItalic = v));
    bind("#heroTitleMiddle", (v) => (hero.titleMiddle = v));
    bind("#heroTitleHighlight", (v) => (hero.titleHighlight = v));
    bind("#heroSubtitle", (v) => (hero.subtitle = v));
    bind("#heroPrimaryCta", (v) => (hero.primaryCtaText = v));
    bind("#heroReserveCta", (v) => (hero.reserveCtaText = v));
    bind("#heroSecondaryCta", (v) => (hero.secondaryCtaText = v));

    ws.querySelectorAll("[data-hpanel-title]").forEach((el) => {
      const i = Number(el.getAttribute("data-hpanel-title"));
      el.addEventListener("input", () => {
        hero.visualPanels[i].title = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-hpanel-sub]").forEach((el) => {
      const i = Number(el.getAttribute("data-hpanel-sub"));
      el.addEventListener("input", () => {
        hero.visualPanels[i].subtitle = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-hpanel-tag]").forEach((el) => {
      const i = Number(el.getAttribute("data-hpanel-tag"));
      el.addEventListener("input", () => {
        hero.visualPanels[i].tag = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-hpanel-dish]").forEach((el) => {
      const i = Number(el.getAttribute("data-hpanel-dish"));
      el.addEventListener("change", () => {
        hero.visualPanels[i].dishNumber = el.value;
        triggerLiveSiteUpdate();
      });
    });

    ws.querySelectorAll("[data-hstat-val]").forEach((el) => {
      const i = Number(el.getAttribute("data-hstat-val"));
      el.addEventListener("input", () => {
        hero.stats[i].value = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-hstat-lbl]").forEach((el) => {
      const i = Number(el.getAttribute("data-hstat-lbl"));
      el.addEventListener("input", () => {
        hero.stats[i].label = el.value;
        triggerLiveSiteUpdate();
      });
    });

    ws.querySelectorAll("[data-hstrip-lbl]").forEach((el) => {
      const i = Number(el.getAttribute("data-hstrip-lbl"));
      el.addEventListener("input", () => {
        hero.signatureStrip[i].label = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-hstrip-txt]").forEach((el) => {
      const i = Number(el.getAttribute("data-hstrip-txt"));
      el.addEventListener("input", () => {
        hero.signatureStrip[i].text = el.value;
        triggerLiveSiteUpdate();
      });
    });
  }

  // ==========================================================================
  // TAB 3: OUR STORY & HERITAGE PILLARS
  // ==========================================================================
  function renderStoryTab(ws) {
    const d = getData();
    const s = (d.storySection = d.storySection || {});
    s.pillars = s.pillars || [];

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">📜 Our Story, Collage Photos & Heritage Pillars</h2>
          <p class="cms-section-desc">Edit the editorial story text, 5 collage images/crests, and 4 pillar cards.</p>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">✍️ Story Editorial Copy</div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Eyebrow Label</label>
          <input type="text" class="cms-input" id="storyEyebrow" value="${escHtml(s.eyebrow)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Section Headline</label>
          <input type="text" class="cms-input" id="storyTitle" value="${escHtml(s.title)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Lead Paragraph (HTML allowed)</label>
          <textarea class="cms-textarea" id="storyLead">${escHtml(s.leadParagraph)}</textarea>
        </div>
        <div class="cms-field">
          <label class="cms-label">Second Paragraph (HTML allowed)</label>
          <textarea class="cms-textarea" id="storyBody">${escHtml(s.bodyParagraph)}</textarea>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📸 Left Photographic Collage & Brand Crests</div>
        </div>
        ${renderImagePickerField({
          id: "storyMainPhoto",
          label: "Main Collage Photo (Top Left)",
          currentValue: s.mainPhoto,
          folder: "gallery",
          prefix: "story-main"
        })}
        ${renderImagePickerField({
          id: "storySubPhoto",
          label: "Secondary Collage Photo (Bottom Left)",
          currentValue: s.subPhoto,
          folder: "gallery",
          prefix: "story-sub"
        })}
        ${renderImagePickerField({
          id: "storyCrestImg",
          label: "Official Crest Plaque Image",
          currentValue: s.crestImage,
          folder: "brand",
          prefix: "story-crest"
        })}
        <div class="cms-grid-2">
          ${renderImagePickerField({
            id: "storyNoPorkImg",
            label: "No Pork No Lard Badge",
            currentValue: s.noPorkImage,
            folder: "brand",
            prefix: "story-nopork"
          })}
          ${renderImagePickerField({
            id: "storyLineartImg",
            label: "Kopitiam Lineart Illustration",
            currentValue: s.lineartImage,
            folder: "brand",
            prefix: "story-lineart"
          })}
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🏛️ Story Pillar Cards</div>
          <button type="button" class="cms-btn cms-btn--green cms-btn--sm" id="cmsAddStoryPillarBtn">+ Add Pillar</button>
        </div>
        ${s.pillars
          .map(
            (p, idx) => `
            <div style="padding: 0.7rem; background: #fbf7ee; border: 1px solid #e2d4bd; border-radius: 10px; margin-bottom: 0.6rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <strong style="font-size: 0.76rem; color: #083b14;">Pillar #${idx + 1}</strong>
                <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-del-pillar="${idx}">Delete</button>
              </div>
              <div class="cms-field">
                <input type="text" class="cms-input" data-pillar-title="${idx}" value="${escHtml(p.title)}" placeholder="Pillar Title" />
              </div>
              <div class="cms-field">
                <textarea class="cms-textarea" style="min-height: 54px;" data-pillar-desc="${idx}" placeholder="Pillar Description">${escHtml(p.description)}</textarea>
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    `;

    bindImagePickers(ws, {
      storyMainPhoto: (v) => (s.mainPhoto = v),
      storySubPhoto: (v) => (s.subPhoto = v),
      storyCrestImg: (v) => (s.crestImage = v),
      storyNoPorkImg: (v) => (s.noPorkImage = v),
      storyLineartImg: (v) => (s.lineartImage = v)
    });

    const bind = (sel, fn) => {
      ws.querySelector(sel)?.addEventListener("input", (e) => {
        fn(e.target.value);
        triggerLiveSiteUpdate();
      });
    };
    bind("#storyEyebrow", (v) => (s.eyebrow = v));
    bind("#storyTitle", (v) => (s.title = v));
    bind("#storyLead", (v) => (s.leadParagraph = v));
    bind("#storyBody", (v) => (s.bodyParagraph = v));

    ws.querySelectorAll("[data-pillar-title]").forEach((el) => {
      const i = Number(el.getAttribute("data-pillar-title"));
      el.addEventListener("input", () => {
        s.pillars[i].title = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-pillar-desc]").forEach((el) => {
      const i = Number(el.getAttribute("data-pillar-desc"));
      el.addEventListener("input", () => {
        s.pillars[i].description = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-del-pillar]").forEach((btn) => {
      btn.addEventListener("click", () => {
        s.pillars.splice(Number(btn.getAttribute("data-del-pillar")), 1);
        triggerLiveSiteUpdate();
        renderStoryTab(ws);
      });
    });
    ws.querySelector("#cmsAddStoryPillarBtn")?.addEventListener("click", () => {
      s.pillars.push({
        title: "New Heritage Pillar",
        description: "Describe this culinary or hospitality highlight."
      });
      triggerLiveSiteUpdate();
      renderStoryTab(ws);
    });
  }

  // ==========================================================================
  // TAB 4: CURATED PACKAGES & COMBOS EDITOR
  // ==========================================================================
  function renderPackagesTab(ws) {
    const d = getData();
    const pkgs = (d.curatedPackages = d.curatedPackages || []);

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">🍱 Curated Packages & Combos</h2>
          <p class="cms-section-desc">Create, edit, or reorder combo packages. Pick included dishes visually — the photo mosaic and item pills update automatically!</p>
        </div>
        <button type="button" class="cms-btn cms-btn--green" id="cmsAddPackageBtn">+ Add New Package</button>
      </div>

      ${pkgs
        .map((pkg, idx) => {
          const resolvedDishes = (pkg.items || [])
            .map((num) => d.menuItems.find((m) => m.number === num))
            .filter(Boolean);
          const autoSum = resolvedDishes.reduce((acc, m) => acc + Number(m.priceK || 0), 0);
          const displayPrice = pkg.autoPrice ? autoSum : pkg.priceK;

          return `
            <div class="cms-card">
              <div class="cms-card__head">
                <div class="cms-card__title">
                  <span>📦 Package #${idx + 1}: ${escHtml(pkg.title)}</span>
                  <span style="background: #0f5922; color: #fff; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.72rem;">
                    ${displayPrice} K
                  </span>
                </div>
                <div style="display: flex; gap: 0.3rem;">
                  <button type="button" class="cms-btn cms-btn--sm" data-pkg-up="${idx}" title="Move Left/Up">↑</button>
                  <button type="button" class="cms-btn cms-btn--sm" data-pkg-down="${idx}" title="Move Right/Down">↓</button>
                  <button type="button" class="cms-btn cms-btn--sm" data-pkg-dup="${idx}" title="Duplicate">Copy</button>
                  <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-pkg-del="${idx}" title="Delete">Delete</button>
                </div>
              </div>

              <div class="cms-grid-2">
                <div class="cms-field">
                  <label class="cms-label">Eyebrow Badge</label>
                  <input type="text" class="cms-input" data-pkg-eyebrow="${idx}" value="${escHtml(pkg.eyebrow)}" />
                </div>
                <div class="cms-field">
                  <label class="cms-label">Package Title</label>
                  <input type="text" class="cms-input" data-pkg-title="${idx}" value="${escHtml(pkg.title)}" />
                </div>
              </div>

              <div class="cms-field">
                <label class="cms-label">Package Description</label>
                <textarea class="cms-textarea" style="min-height: 58px;" data-pkg-desc="${idx}">${escHtml(pkg.description)}</textarea>
              </div>

              <div class="cms-grid-3" style="align-items: end; margin-bottom: 0.75rem;">
                <label style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; font-weight: 800; padding: 0.5rem; background: #f9f4e8; border-radius: 8px; border: 1px solid #dfd0b8; cursor: pointer;">
                  <input type="checkbox" data-pkg-autoprice="${idx}" ${pkg.autoPrice ? "checked" : ""} />
                  <span>Auto-Sum Dish Prices (${autoSum} K)</span>
                </label>

                <div class="cms-field" style="margin-bottom: 0;">
                  <label class="cms-label">Package Price (in K)</label>
                  <input
                    type="number"
                    class="cms-input"
                    data-pkg-price="${idx}"
                    value="${escHtml(displayPrice)}"
                    ${pkg.autoPrice ? "disabled" : ""}
                  />
                </div>

                <label style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; font-weight: 800; padding: 0.5rem; background: #f9f4e8; border-radius: 8px; border: 1px solid #dfd0b8; cursor: pointer;">
                  <input type="checkbox" data-pkg-featured="${idx}" ${pkg.featured ? "checked" : ""} />
                  <span>★ Featured Gold Border</span>
                </label>
              </div>

              <div class="cms-grid-3" style="align-items: end; margin-bottom: 0.85rem;">
                <label style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; font-weight: 800; padding: 0.5rem; background: #f9f4e8; border-radius: 8px; border: 1px solid #dfd0b8; cursor: pointer;">
                  <input type="checkbox" data-pkg-showres="${idx}" ${pkg.showReserveBtn ? "checked" : ""} />
                  <span>Show "Book Table" Button</span>
                </label>
                <div class="cms-field" style="margin-bottom: 0;">
                  <label class="cms-label">Book Button Label</label>
                  <input type="text" class="cms-input" data-pkg-reslabel="${idx}" value="${escHtml(pkg.reserveBtnText || "Book Table →")}" />
                </div>
                <div class="cms-field" style="margin-bottom: 0;">
                  <label class="cms-label">Preset Guests (Pax)</label>
                  <input type="number" class="cms-input" data-pkg-respax="${idx}" value="${escHtml(pkg.reservePax || 4)}" />
                </div>
              </div>

              <div class="cms-field">
                <label class="cms-label">
                  <span>Included Dishes in Package (${resolvedDishes.length} items — First 4 appear in Mosaic)</span>
                </label>
                <div class="cms-selected-pills">
                  ${resolvedDishes
                    .map(
                      (dish, dIdx) => `
                      <span class="cms-selected-pill">
                        <img src="${escHtml(dish.image)}" alt="" />
                        <span>#${escHtml(dish.number)} ${escHtml(dish.name)} (${dish.priceK}K)</span>
                        <button type="button" data-pkg-item-left="${idx}:${dIdx}" title="Move Earlier">←</button>
                        <button type="button" data-pkg-item-right="${idx}:${dIdx}" title="Move Later">→</button>
                        <button type="button" data-pkg-item-rm="${idx}:${dish.number}" title="Remove Dish">✕</button>
                      </span>
                    `
                    )
                    .join("")}
                </div>
                <div style="display: flex; gap: 0.45rem;">
                  <select class="cms-select" data-pkg-add-select="${idx}">
                    <option value="">+ Select a dish/drink to add to this package...</option>
                    ${(d.menuItems || [])
                      .map(
                        (m) =>
                          `<option value="${escHtml(m.number)}">#${escHtml(m.number)} — ${escHtml(m.name)} (${m.priceK} K)</option>`
                      )
                      .join("")}
                  </select>
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    `;

    ws.querySelector("#cmsAddPackageBtn")?.addEventListener("click", () => {
      pkgs.push({
        id: "pkg-" + Date.now(),
        eyebrow: "✨ SPECIAL PACKAGE SET",
        title: "New Royal Kopitiam Set",
        priceK: 65,
        autoPrice: true,
        featured: false,
        showReserveBtn: true,
        reserveBtnText: "Book Table →",
        reservePax: 2,
        description: "Curated combination of our signature dishes and classic kopitiam drinks.",
        items: ["01", "38"]
      });
      triggerLiveSiteUpdate();
      renderPackagesTab(ws);
      showToast("🍱 Added new Curated Package!");
    });

    ws.querySelectorAll("[data-pkg-eyebrow]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-eyebrow"));
      el.addEventListener("input", () => {
        pkgs[i].eyebrow = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-pkg-title]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-title"));
      el.addEventListener("input", () => {
        pkgs[i].title = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-pkg-desc]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-desc"));
      el.addEventListener("input", () => {
        pkgs[i].description = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-pkg-autoprice]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-autoprice"));
      el.addEventListener("change", () => {
        pkgs[i].autoPrice = el.checked;
        triggerLiveSiteUpdate();
        renderPackagesTab(ws);
      });
    });
    ws.querySelectorAll("[data-pkg-price]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-price"));
      el.addEventListener("input", () => {
        pkgs[i].priceK = Number(el.value || 0);
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-pkg-featured]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-featured"));
      el.addEventListener("change", () => {
        pkgs[i].featured = el.checked;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-pkg-showres]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-showres"));
      el.addEventListener("change", () => {
        pkgs[i].showReserveBtn = el.checked;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-pkg-reslabel]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-reslabel"));
      el.addEventListener("input", () => {
        pkgs[i].reserveBtnText = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-pkg-respax]").forEach((el) => {
      const i = Number(el.getAttribute("data-pkg-respax"));
      el.addEventListener("input", () => {
        pkgs[i].reservePax = Number(el.value || 2);
        triggerLiveSiteUpdate();
      });
    });

    ws.querySelectorAll("[data-pkg-add-select]").forEach((sel) => {
      const i = Number(sel.getAttribute("data-pkg-add-select"));
      sel.addEventListener("change", () => {
        if (!sel.value) return;
        pkgs[i].items = pkgs[i].items || [];
        if (!pkgs[i].items.includes(sel.value)) {
          pkgs[i].items.push(sel.value);
          triggerLiveSiteUpdate();
          renderPackagesTab(ws);
        }
      });
    });

    ws.querySelectorAll("[data-pkg-item-rm]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [pIdx, num] = btn.getAttribute("data-pkg-item-rm").split(":");
        const pkg = pkgs[Number(pIdx)];
        pkg.items = (pkg.items || []).filter((n) => n !== num);
        triggerLiveSiteUpdate();
        renderPackagesTab(ws);
      });
    });

    ws.querySelectorAll("[data-pkg-item-left]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [pIdx, dIdx] = btn.getAttribute("data-pkg-item-left").split(":").map(Number);
        const arr = pkgs[pIdx].items;
        if (dIdx > 0) {
          [arr[dIdx - 1], arr[dIdx]] = [arr[dIdx], arr[dIdx - 1]];
          triggerLiveSiteUpdate();
          renderPackagesTab(ws);
        }
      });
    });

    ws.querySelectorAll("[data-pkg-item-right]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [pIdx, dIdx] = btn.getAttribute("data-pkg-item-right").split(":").map(Number);
        const arr = pkgs[pIdx].items;
        if (dIdx < arr.length - 1) {
          [arr[dIdx + 1], arr[dIdx]] = [arr[dIdx], arr[dIdx + 1]];
          triggerLiveSiteUpdate();
          renderPackagesTab(ws);
        }
      });
    });

    ws.querySelectorAll("[data-pkg-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-pkg-up"));
        if (i > 0) {
          [pkgs[i - 1], pkgs[i]] = [pkgs[i], pkgs[i - 1]];
          triggerLiveSiteUpdate();
          renderPackagesTab(ws);
        }
      });
    });

    ws.querySelectorAll("[data-pkg-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-pkg-down"));
        if (i < pkgs.length - 1) {
          [pkgs[i + 1], pkgs[i]] = [pkgs[i], pkgs[i + 1]];
          triggerLiveSiteUpdate();
          renderPackagesTab(ws);
        }
      });
    });

    ws.querySelectorAll("[data-pkg-dup]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-pkg-dup"));
        const copy = JSON.parse(JSON.stringify(pkgs[i]));
        copy.id = "pkg-" + Date.now();
        copy.title += " (Copy)";
        pkgs.splice(i + 1, 0, copy);
        triggerLiveSiteUpdate();
        renderPackagesTab(ws);
      });
    });

    ws.querySelectorAll("[data-pkg-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-pkg-del"));
        pkgs.splice(i, 1);
        triggerLiveSiteUpdate();
        renderPackagesTab(ws);
      });
    });
  }

  // ==========================================================================
  // TAB 5: COMPLETE MENU ITEMS, PICTURES & RECOMMENDED PAIRINGS EDITOR
  // ==========================================================================
  function renderMenuTab(ws) {
    const d = getData();
    const items = d.menuItems || [];
    const cats = (d.menuCategories || []).filter((c) => c.id !== "all");

    let activeDish =
      items.find((i) => i.number === cmsState.selectedDishNumber) || items[0];
    if (activeDish) {
      cmsState.selectedDishNumber = activeDish.number;
    }

    const q = cmsState.menuSearch.trim().toLowerCase();
    const filteredList = items.filter((item) => {
      if (
        cmsState.menuCategoryFilter !== "all" &&
        item.category !== cmsState.menuCategoryFilter
      ) {
        return false;
      }
      if (q) {
        const hay = `${item.number} ${item.name} ${item.categoryLabel} ${item.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const pq = cmsState.pairingSearch.trim().toLowerCase();
    const pairingCandidates = items.filter((m) => {
      if (activeDish && m.number === activeDish.number) return false;
      if (!pq) return true;
      return `${m.number} ${m.name} ${m.categoryLabel}`.toLowerCase().includes(pq);
    });

    const activePairings = ((activeDish && activeDish.pairings) || [])
      .map((num) => items.find((m) => m.number === num))
      .filter(Boolean);

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">🍽️ Menu Items, Pictures & Pairings (${items.length} Items)</h2>
          <p class="cms-section-desc">Select any dish on the left to edit its photo, price, badges, dietary flags, and recommended pairings.</p>
        </div>
        <button type="button" class="cms-btn cms-btn--green" id="cmsAddNewDishBtn">+ Add New Dish / Drink</button>
      </div>

      <div class="cms-grid-2" style="margin-bottom: 0.85rem;">
        <input
          type="search"
          class="cms-input"
          id="cmsMenuSearchInput"
          placeholder="🔍 Search dish #01–#61, name, keyword..."
          value="${escHtml(cmsState.menuSearch)}"
        />
        <select class="cms-select" id="cmsMenuCatFilter">
          <option value="all">All Categories (${items.length})</option>
          ${cats
            .map(
              (c) =>
                `<option value="${escHtml(c.id)}" ${cmsState.menuCategoryFilter === c.id ? "selected" : ""}>${escHtml(c.name)}</option>`
            )
            .join("")}
        </select>
      </div>

      <div class="cms-menu-manager">
        <!-- Left Column: Scrollable Dish Selector -->
        <div class="cms-dish-list" id="cmsDishListContainer">
          ${filteredList
            .map(
              (item) => `
              <button
                type="button"
                class="cms-dish-list-item ${activeDish && item.number === activeDish.number ? "is-active" : ""}"
                data-select-dish="${escHtml(item.number)}"
              >
                <img src="${escHtml(item.image)}" alt="" class="cms-dish-list-item__thumb" loading="lazy" />
                <div class="cms-dish-list-item__info">
                  <div class="cms-dish-list-item__title">#${escHtml(item.number)} ${escHtml(item.name)}</div>
                  <div class="cms-dish-list-item__meta">${escHtml(item.categoryLabel)} • ${item.priceK} K</div>
                </div>
              </button>
            `
            )
            .join("")}
        </div>

        <!-- Right Column: Active Dish Full Editor -->
        <div id="cmsDishEditorPane">
          ${
            activeDish
              ? `
            <div class="cms-card">
              <div class="cms-card__head">
                <div class="cms-card__title">
                  <span>Editing Dish #${escHtml(activeDish.number)} — ${escHtml(activeDish.name)}</span>
                </div>
                <div style="display: flex; gap: 0.35rem;">
                  <button type="button" class="cms-btn cms-btn--sm" id="cmsPreviewDishModalBtn">👁️ View Modal</button>
                  <button type="button" class="cms-btn cms-btn--sm" id="cmsDuplicateDishBtn">Duplicate</button>
                  <button type="button" class="cms-btn cms-btn--red cms-btn--sm" id="cmsDeleteDishBtn">Delete</button>
                </div>
              </div>

              ${renderImagePickerField({
                id: "activeDishPhoto",
                label: `Dish #${activeDish.number} Photograph`,
                currentValue: activeDish.image,
                folder: "food",
                prefix: `dish-${activeDish.number}`
              })}

              <div class="cms-grid-3">
                <div class="cms-field">
                  <label class="cms-label">Menu Number</label>
                  <input type="text" class="cms-input" id="dishEditNumber" value="${escHtml(activeDish.number)}" />
                </div>
                <div class="cms-field">
                  <label class="cms-label">Price in K (Rp ${(activeDish.priceK * 1000).toLocaleString("id-ID")})</label>
                  <input type="number" class="cms-input" id="dishEditPrice" value="${escHtml(activeDish.priceK)}" min="1" step="1" />
                </div>
                <div class="cms-field">
                  <label class="cms-label">Category</label>
                  <select class="cms-select" id="dishEditCategory">
                    ${cats
                      .map(
                        (c) =>
                          `<option value="${escHtml(c.id)}" ${activeDish.category === c.id ? "selected" : ""}>${escHtml(c.name)}</option>`
                      )
                      .join("")}
                  </select>
                </div>
              </div>

              <div class="cms-field">
                <label class="cms-label">Dish Name</label>
                <input type="text" class="cms-input" id="dishEditName" value="${escHtml(activeDish.name)}" />
              </div>

              <div class="cms-field">
                <label class="cms-label">Dish Description</label>
                <textarea class="cms-textarea" id="dishEditDesc">${escHtml(activeDish.description)}</textarea>
              </div>

              <!-- Dietary & Allergen Controls -->
              <div class="cms-grid-2" style="margin-bottom: 0.75rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 800; padding: 0.55rem 0.7rem; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 9px; color: #9f1239; cursor: pointer;">
                  <input type="checkbox" id="dishEditSpicy" ${activeDish.spicy ? "checked" : ""} />
                  <span>🌶 Spicy Dish Profile</span>
                </label>

                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 800; padding: 0.55rem 0.7rem; background: #eef6f0; border: 1px solid #bbf7d0; border-radius: 9px; color: #083b14; cursor: pointer;">
                  <input type="checkbox" id="dishEditKidFriendly" ${activeDish.kidFriendly ? "checked" : ""} />
                  <span>👶 Kid-Friendly (Non-Spicy)</span>
                </label>
              </div>

              <div class="cms-field">
                <label class="cms-label">
                  <span>Seafood / Allergen Callout Tag (Leave blank if none)</span>
                </label>
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.35rem;">
                  <button type="button" class="cms-btn cms-btn--sm" data-allergen-preset="">None</button>
                  <button type="button" class="cms-btn cms-btn--sm" data-allergen-preset="🦐 Contains Prawn/Seafood">🦐 Contains Prawn/Seafood</button>
                  <button type="button" class="cms-btn cms-btn--sm" data-allergen-preset="🐟 Contains Tuna">🐟 Contains Tuna</button>
                  <button type="button" class="cms-btn cms-btn--sm" data-allergen-preset="🥜 Contains Peanuts">🥜 Contains Peanuts</button>
                </div>
                <input type="text" class="cms-input" id="dishEditSeafood" value="${escHtml(activeDish.seafoodLabel || "")}" placeholder="e.g., 🦐 Contains Prawn/Seafood" />
              </div>

              <!-- Badges Editor -->
              <div class="cms-field">
                <label class="cms-label">Dish Highlight Badges</label>
                <div class="cms-selected-pills">
                  ${(activeDish.badges || [])
                    .map(
                      (b) => `
                      <span class="cms-selected-pill">
                        <span>${escHtml(b)}</span>
                        <button type="button" data-rm-badge="${escHtml(b)}">✕</button>
                      </span>
                    `
                    )
                    .join("")}
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.45rem;">
                  ${BADGE_PRESETS.map(
                    (bp) => `
                    <button
                      type="button"
                      class="cms-btn cms-btn--sm ${(activeDish.badges || []).includes(bp) ? "cms-btn--green" : ""}"
                      data-toggle-badge="${escHtml(bp)}"
                    >
                      + ${escHtml(bp)}
                    </button>
                  `
                  ).join("")}
                </div>
                <div style="display: flex; gap: 0.4rem;">
                  <input type="text" class="cms-input" id="customBadgeInput" placeholder="Add custom badge text..." />
                  <button type="button" class="cms-btn cms-btn--green" id="addCustomBadgeBtn">Add Badge</button>
                </div>
              </div>

              <!-- Recommended Pairings Visual Selector -->
              <div class="cms-field" style="margin-top: 0.9rem; padding-top: 0.85rem; border-top: 1.5px dashed #e2d4bd;">
                <label class="cms-label">
                  <span>🤝 Recommended Royal Pairings (${activePairings.length} linked dishes)</span>
                </label>
                <div class="cms-selected-pills">
                  ${activePairings
                    .map(
                      (p, pIdx) => `
                      <span class="cms-selected-pill">
                        <img src="${escHtml(p.image)}" alt="" />
                        <span>#${escHtml(p.number)} ${escHtml(p.name)} (${p.priceK}K)</span>
                        <button type="button" data-pair-left="${pIdx}" title="Move Earlier">←</button>
                        <button type="button" data-pair-right="${pIdx}" title="Move Later">→</button>
                        <button type="button" data-pair-rm="${escHtml(p.number)}" title="Remove Pairing">✕</button>
                      </span>
                    `
                    )
                    .join("")}
                </div>

                <input
                  type="search"
                  class="cms-input"
                  id="cmsPairingSearchInput"
                  placeholder="Filter dishes to pair with #${escHtml(activeDish.number)}..."
                  value="${escHtml(cmsState.pairingSearch)}"
                  style="margin-bottom: 0.45rem;"
                />

                <div class="cms-dish-selector-grid">
                  ${pairingCandidates
                    .map((cand) => {
                      const isSel = (activeDish.pairings || []).includes(cand.number);
                      return `
                        <button
                          type="button"
                          class="cms-dish-Option ${isSel ? "is-selected" : ""}"
                          data-toggle-pairing="${escHtml(cand.number)}"
                        >
                          <img src="${escHtml(cand.image)}" alt="" loading="lazy" />
                          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            #${escHtml(cand.number)} ${escHtml(cand.name)}
                          </span>
                        </button>
                      `;
                    })
                    .join("")}
                </div>
              </div>
            </div>
          `
              : `<div class="cms-card">No dish selected.</div>`
          }
        </div>
      </div>
    `;

    // Search & filter handlers
    ws.querySelector("#cmsMenuSearchInput")?.addEventListener("input", (e) => {
      cmsState.menuSearch = e.target.value;
      renderMenuTab(ws);
      const inp = ws.querySelector("#cmsMenuSearchInput");
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    });

    ws.querySelector("#cmsMenuCatFilter")?.addEventListener("change", (e) => {
      cmsState.menuCategoryFilter = e.target.value;
      renderMenuTab(ws);
    });

    ws.querySelectorAll("[data-select-dish]").forEach((btn) => {
      btn.addEventListener("click", () => {
        cmsState.selectedDishNumber = btn.getAttribute("data-select-dish");
        renderMenuTab(ws);
      });
    });

    ws.querySelector("#cmsAddNewDishBtn")?.addEventListener("click", () => {
      const nextNum = String(items.length + 1).padStart(2, "0");
      const defaultCat = cats[0] || { id: "signature", name: "Signature Dishes" };
      const newDish = {
        number: nextNum,
        name: "New Royal Kopitiam Dish",
        category: defaultCat.id,
        categoryLabel: defaultCat.name,
        priceK: 35,
        image: "assets/food/dish-01-nasi-lemak-cutlet.jpg",
        hasIndividualPhoto: true,
        badges: ["Signature"],
        spicy: false,
        kidFriendly: true,
        seafoodLabel: "",
        description: "Freshly prepared authentic kopitiam dish crafted 100% No Pork, No Lard.",
        pairings: ["36", "51"]
      };
      items.push(newDish);
      cmsState.selectedDishNumber = nextNum;
      triggerLiveSiteUpdate();
      renderMenuTab(ws);
      showToast(`🍽️ Added Dish #${nextNum}`);
    });

    if (!activeDish) return;

    bindImagePickers(ws, {
      activeDishPhoto: (val) => {
        activeDish.image = val;
        renderMenuTab(ws);
      }
    });

    ws.querySelector("#cmsPreviewDishModalBtn")?.addEventListener("click", () => {
      if (window.openRoyalDishModal) {
        window.openRoyalDishModal(activeDish.number);
      }
    });

    ws.querySelector("#cmsDuplicateDishBtn")?.addEventListener("click", () => {
      const nextNum = String(items.length + 1).padStart(2, "0");
      const copy = JSON.parse(JSON.stringify(activeDish));
      copy.number = nextNum;
      copy.name += " (Copy)";
      items.push(copy);
      cmsState.selectedDishNumber = nextNum;
      triggerLiveSiteUpdate();
      renderMenuTab(ws);
      showToast(`📋 Duplicated as Dish #${nextNum}`);
    });

    ws.querySelector("#cmsDeleteDishBtn")?.addEventListener("click", () => {
      const idx = items.indexOf(activeDish);
      if (idx !== -1) {
        items.splice(idx, 1);
        cmsState.selectedDishNumber = items[0]?.number || "";
        triggerLiveSiteUpdate();
        renderMenuTab(ws);
        showToast("🗑️ Dish removed from menu");
      }
    });

    ws.querySelector("#dishEditNumber")?.addEventListener("input", (e) => {
      activeDish.number = e.target.value;
      cmsState.selectedDishNumber = activeDish.number;
      triggerLiveSiteUpdate();
    });

    ws.querySelector("#dishEditPrice")?.addEventListener("input", (e) => {
      activeDish.priceK = Number(e.target.value || 0);
      triggerLiveSiteUpdate();
    });

    ws.querySelector("#dishEditCategory")?.addEventListener("change", (e) => {
      activeDish.category = e.target.value;
      const foundCat = cats.find((c) => c.id === e.target.value);
      if (foundCat) activeDish.categoryLabel = foundCat.name;
      triggerLiveSiteUpdate();
      renderMenuTab(ws);
    });

    ws.querySelector("#dishEditName")?.addEventListener("input", (e) => {
      activeDish.name = e.target.value;
      triggerLiveSiteUpdate();
    });

    ws.querySelector("#dishEditDesc")?.addEventListener("input", (e) => {
      activeDish.description = e.target.value;
      triggerLiveSiteUpdate();
    });

    ws.querySelector("#dishEditSpicy")?.addEventListener("change", (e) => {
      activeDish.spicy = e.target.checked;
      triggerLiveSiteUpdate();
    });

    ws.querySelector("#dishEditKidFriendly")?.addEventListener("change", (e) => {
      activeDish.kidFriendly = e.target.checked;
      triggerLiveSiteUpdate();
    });

    ws.querySelector("#dishEditSeafood")?.addEventListener("input", (e) => {
      activeDish.seafoodLabel = e.target.value;
      triggerLiveSiteUpdate();
    });

    ws.querySelectorAll("[data-allergen-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeDish.seafoodLabel = btn.getAttribute("data-allergen-preset");
        triggerLiveSiteUpdate();
        renderMenuTab(ws);
      });
    });

    // Badges
    ws.querySelectorAll("[data-rm-badge]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const b = btn.getAttribute("data-rm-badge");
        activeDish.badges = (activeDish.badges || []).filter((x) => x !== b);
        triggerLiveSiteUpdate();
        renderMenuTab(ws);
      });
    });

    ws.querySelectorAll("[data-toggle-badge]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const b = btn.getAttribute("data-toggle-badge");
        activeDish.badges = activeDish.badges || [];
        if (activeDish.badges.includes(b)) {
          activeDish.badges = activeDish.badges.filter((x) => x !== b);
        } else {
          activeDish.badges.push(b);
        }
        triggerLiveSiteUpdate();
        renderMenuTab(ws);
      });
    });

    ws.querySelector("#addCustomBadgeBtn")?.addEventListener("click", () => {
      const inp = ws.querySelector("#customBadgeInput");
      const val = inp?.value.trim();
      if (val) {
        activeDish.badges = activeDish.badges || [];
        if (!activeDish.badges.includes(val)) activeDish.badges.push(val);
        triggerLiveSiteUpdate();
        renderMenuTab(ws);
      }
    });

    // Pairings
    ws.querySelector("#cmsPairingSearchInput")?.addEventListener("input", (e) => {
      cmsState.pairingSearch = e.target.value;
      renderMenuTab(ws);
      const inp = ws.querySelector("#cmsPairingSearchInput");
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    });

    ws.querySelectorAll("[data-toggle-pairing]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const num = btn.getAttribute("data-toggle-pairing");
        activeDish.pairings = activeDish.pairings || [];
        if (activeDish.pairings.includes(num)) {
          activeDish.pairings = activeDish.pairings.filter((n) => n !== num);
        } else {
          activeDish.pairings.push(num);
        }
        triggerLiveSiteUpdate();
        renderMenuTab(ws);
      });
    });

    ws.querySelectorAll("[data-pair-rm]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const num = btn.getAttribute("data-pair-rm");
        activeDish.pairings = (activeDish.pairings || []).filter((n) => n !== num);
        triggerLiveSiteUpdate();
        renderMenuTab(ws);
      });
    });

    ws.querySelectorAll("[data-pair-left]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-pair-left"));
        const arr = activeDish.pairings;
        if (i > 0) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
          triggerLiveSiteUpdate();
          renderMenuTab(ws);
        }
      });
    });

    ws.querySelectorAll("[data-pair-right]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-pair-right"));
        const arr = activeDish.pairings;
        if (i < arr.length - 1) {
          [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
          triggerLiveSiteUpdate();
          renderMenuTab(ws);
        }
      });
    });
  }

  // ==========================================================================
  // TAB 6: MENU CATEGORIES & MENU SECTION HEADER
  // ==========================================================================
  function renderCategoriesTab(ws) {
    const d = getData();
    const cfg = (d.menuSectionConfig = d.menuSectionConfig || {});
    const cats = (d.menuCategories = d.menuCategories || []);

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">🗂️ Menu Section Header & Categories</h2>
          <p class="cms-section-desc">Edit the Menu section headline and customize all category tabs, Chinese titles, ranges, and spotlight banners.</p>
        </div>
        <button type="button" class="cms-btn cms-btn--green" id="cmsAddCategoryBtn">+ Add Category</button>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📝 Menu Section Header Texts</div>
        </div>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Plaque Pill Text</label>
            <input type="text" class="cms-input" id="menuCfgPlaque" value="${escHtml(cfg.plaqueText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Search Bar Placeholder</label>
            <input type="text" class="cms-input" id="menuCfgSearch" value="${escHtml(cfg.searchPlaceholder)}" />
          </div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Menu Section Headline</label>
          <input type="text" class="cms-input" id="menuCfgTitle" value="${escHtml(cfg.title)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Menu Section Subtitle</label>
          <textarea class="cms-textarea" style="min-height: 54px;" id="menuCfgDesc">${escHtml(cfg.description)}</textarea>
        </div>
      </div>

      ${cats
        .map(
          (cat, idx) => `
          <div class="cms-card">
            <div class="cms-card__head">
              <div class="cms-card__title">Category: ${escHtml(cat.name)} (${escHtml(cat.chinese)})</div>
              <div style="display: flex; gap: 0.3rem;">
                <button type="button" class="cms-btn cms-btn--sm" data-cat-up="${idx}">↑</button>
                <button type="button" class="cms-btn cms-btn--sm" data-cat-down="${idx}">↓</button>
                ${
                  cat.id !== "all"
                    ? `<button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-cat-del="${idx}">Delete</button>`
                    : ""
                }
              </div>
            </div>
            ${renderImagePickerField({
              id: `catBanner_${idx}`,
              label: "Category Spotlight Banner Photo",
              currentValue: cat.bannerImage,
              folder: "food",
              prefix: `cat-${cat.id}`
            })}
            <div class="cms-grid-3">
              <div class="cms-field">
                <label class="cms-label">Category Name</label>
                <input type="text" class="cms-input" data-cat-name="${idx}" value="${escHtml(cat.name)}" />
              </div>
              <div class="cms-field">
                <label class="cms-label">Chinese Title</label>
                <input type="text" class="cms-input" data-cat-zh="${idx}" value="${escHtml(cat.chinese)}" />
              </div>
              <div class="cms-field">
                <label class="cms-label">Menu Range Label</label>
                <input type="text" class="cms-input" data-cat-range="${idx}" value="${escHtml(cat.rangeLabel)}" />
              </div>
            </div>
            <div class="cms-field">
              <label class="cms-label">Category Spotlight Description</label>
              <textarea class="cms-textarea" style="min-height: 52px;" data-cat-desc="${idx}">${escHtml(cat.description)}</textarea>
            </div>
          </div>
        `
        )
        .join("")}
    `;

    const imgCallbacks = {};
    cats.forEach((c, idx) => {
      imgCallbacks[`catBanner_${idx}`] = (val) => (c.bannerImage = val);
    });
    bindImagePickers(ws, imgCallbacks);

    ws.querySelector("#menuCfgPlaque")?.addEventListener("input", (e) => {
      cfg.plaqueText = e.target.value;
      triggerLiveSiteUpdate();
    });
    ws.querySelector("#menuCfgSearch")?.addEventListener("input", (e) => {
      cfg.searchPlaceholder = e.target.value;
      triggerLiveSiteUpdate();
    });
    ws.querySelector("#menuCfgTitle")?.addEventListener("input", (e) => {
      cfg.title = e.target.value;
      triggerLiveSiteUpdate();
    });
    ws.querySelector("#menuCfgDesc")?.addEventListener("input", (e) => {
      cfg.description = e.target.value;
      triggerLiveSiteUpdate();
    });

    ws.querySelectorAll("[data-cat-name]").forEach((el) => {
      const i = Number(el.getAttribute("data-cat-name"));
      el.addEventListener("input", () => {
        cats[i].name = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-cat-zh]").forEach((el) => {
      const i = Number(el.getAttribute("data-cat-zh"));
      el.addEventListener("input", () => {
        cats[i].chinese = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-cat-range]").forEach((el) => {
      const i = Number(el.getAttribute("data-cat-range"));
      el.addEventListener("input", () => {
        cats[i].rangeLabel = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-cat-desc]").forEach((el) => {
      const i = Number(el.getAttribute("data-cat-desc"));
      el.addEventListener("input", () => {
        cats[i].description = el.value;
        triggerLiveSiteUpdate();
      });
    });

    ws.querySelectorAll("[data-cat-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-cat-up"));
        if (i > 0) {
          [cats[i - 1], cats[i]] = [cats[i], cats[i - 1]];
          triggerLiveSiteUpdate();
          renderCategoriesTab(ws);
        }
      });
    });
    ws.querySelectorAll("[data-cat-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-cat-down"));
        if (i < cats.length - 1) {
          [cats[i + 1], cats[i]] = [cats[i], cats[i + 1]];
          triggerLiveSiteUpdate();
          renderCategoriesTab(ws);
        }
      });
    });
    ws.querySelectorAll("[data-cat-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-cat-del"));
        cats.splice(i, 1);
        triggerLiveSiteUpdate();
        renderCategoriesTab(ws);
      });
    });
    ws.querySelector("#cmsAddCategoryBtn")?.addEventListener("click", () => {
      const slug = "cat-" + Date.now().toString().slice(-4);
      cats.push({
        id: slug,
        name: "New Category",
        chinese: "新分类",
        rangeLabel: "62+",
        bannerImage: "assets/food/dish-hainan-white.jpg",
        description: "Explore our newest culinary creations."
      });
      triggerLiveSiteUpdate();
      renderCategoriesTab(ws);
    });
  }

  // ==========================================================================
  // TAB 7: KOPI & DRINK BAR DECODER (#36 – #50)
  // ==========================================================================
  function renderRitualTab(ws) {
    const d = getData();
    const cfg = (d.ritualSectionConfig = d.ritualSectionConfig || {});
    const list = (d.kopiRitualGuide = d.kopiRitualGuide || []);

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">☕ Kopi & Drink Bar Cup Decoder</h2>
          <p class="cms-section-desc">Edit Drink Bar section texts, featured drinks, cup layer proportions, colors, and ideal food pairings.</p>
        </div>
        <button type="button" class="cms-btn cms-btn--green" id="cmsAddRitualDrinkBtn">+ Add Featured Drink</button>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📝 Drink Bar Section Header</div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Plaque Pill Text</label>
          <input type="text" class="cms-input" id="ritualCfgPlaque" value="${escHtml(cfg.plaqueText)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Section Headline</label>
          <input type="text" class="cms-input" id="ritualCfgTitle" value="${escHtml(cfg.title)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Section Description (HTML allowed)</label>
          <textarea class="cms-textarea" style="min-height: 56px;" id="ritualCfgDesc">${escHtml(cfg.description)}</textarea>
        </div>
      </div>

      ${list
        .map(
          (drink, idx) => `
          <div class="cms-card">
            <div class="cms-card__head">
              <div class="cms-card__title">#${escHtml(drink.menuNumber)} ${escHtml(drink.name)} (${escHtml(drink.chinese)}) — ${escHtml(drink.price)}</div>
              <div style="display: flex; gap: 0.3rem;">
                <button type="button" class="cms-btn cms-btn--sm" data-ritual-up="${idx}">↑</button>
                <button type="button" class="cms-btn cms-btn--sm" data-ritual-down="${idx}">↓</button>
                <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-ritual-del="${idx}">Delete</button>
              </div>
            </div>

            <div class="cms-grid-3">
              <div class="cms-field">
                <label class="cms-label">Menu Number</label>
                <input type="text" class="cms-input" data-rit-num="${idx}" value="${escHtml(drink.menuNumber)}" />
              </div>
              <div class="cms-field">
                <label class="cms-label">Drink Name</label>
                <input type="text" class="cms-input" data-rit-name="${idx}" value="${escHtml(drink.name)}" />
              </div>
              <div class="cms-field">
                <label class="cms-label">Chinese Name</label>
                <input type="text" class="cms-input" data-rit-zh="${idx}" value="${escHtml(drink.chinese)}" />
              </div>
            </div>

            <div class="cms-grid-3">
              <div class="cms-field">
                <label class="cms-label">Price Label</label>
                <input type="text" class="cms-input" data-rit-price="${idx}" value="${escHtml(drink.price)}" />
              </div>
              <div class="cms-field">
                <label class="cms-label">Pronunciation</label>
                <input type="text" class="cms-input" data-rit-pron="${idx}" value="${escHtml(drink.pronunciation)}" />
              </div>
              <div class="cms-field">
                <label class="cms-label">Tagline</label>
                <input type="text" class="cms-input" data-rit-tag="${idx}" value="${escHtml(drink.tagline)}" />
              </div>
            </div>

            <div class="cms-field">
              <label class="cms-label">Tasting Notes</label>
              <textarea class="cms-textarea" style="min-height: 52px;" data-rit-notes="${idx}">${escHtml(drink.notes)}</textarea>
            </div>

            <div class="cms-field">
              <label class="cms-label">Best Paired With Text</label>
              <input type="text" class="cms-input" data-rit-pair="${idx}" value="${escHtml(drink.pairWith)}" />
            </div>

            <div class="cms-field">
              <label class="cms-label">
                <span>Cup Proportions Layers (Top to Bottom)</span>
                <button type="button" class="cms-btn cms-btn--sm" data-rit-add-layer="${idx}">+ Add Layer</button>
              </label>
              ${(drink.layers || [])
                .map(
                  (layer, lIdx) => `
                  <div style="display: grid; grid-template-columns: 1.2fr 1.6fr 75px 46px auto; gap: 0.4rem; align-items: center; margin-bottom: 0.38rem;">
                    <input type="text" class="cms-input" data-rlayer-short="${idx}:${lIdx}" value="${escHtml(layer.shortLabel)}" placeholder="e.g. 65% Kopi" />
                    <input type="text" class="cms-input" data-rlayer-lbl="${idx}:${lIdx}" value="${escHtml(layer.label)}" placeholder="Full layer description" />
                    <input type="number" class="cms-input" data-rlayer-pct="${idx}:${lIdx}" value="${escHtml(layer.pct)}" min="5" max="100" title="Height %" />
                    <input type="color" class="cms-input" style="height: 36px; padding: 0.15rem;" data-rlayer-col="${idx}:${lIdx}" value="${escHtml(layer.color || "#3A2012")}" title="Layer Color" />
                    <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-rlayer-del="${idx}:${lIdx}">✕</button>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>
        `
        )
        .join("")}
    `;

    ws.querySelector("#ritualCfgPlaque")?.addEventListener("input", (e) => {
      cfg.plaqueText = e.target.value;
      triggerLiveSiteUpdate();
    });
    ws.querySelector("#ritualCfgTitle")?.addEventListener("input", (e) => {
      cfg.title = e.target.value;
      triggerLiveSiteUpdate();
    });
    ws.querySelector("#ritualCfgDesc")?.addEventListener("input", (e) => {
      cfg.description = e.target.value;
      triggerLiveSiteUpdate();
    });

    const bindField = (attr, key) => {
      ws.querySelectorAll(`[${attr}]`).forEach((el) => {
        const i = Number(el.getAttribute(attr));
        el.addEventListener("input", () => {
          list[i][key] = el.value;
          triggerLiveSiteUpdate();
        });
      });
    };
    bindField("data-rit-num", "menuNumber");
    bindField("data-rit-name", "name");
    bindField("data-rit-zh", "chinese");
    bindField("data-rit-price", "price");
    bindField("data-rit-pron", "pronunciation");
    bindField("data-rit-tag", "tagline");
    bindField("data-rit-notes", "notes");
    bindField("data-rit-pair", "pairWith");

    ws.querySelectorAll("[data-rlayer-short]").forEach((el) => {
      const [i, l] = el.getAttribute("data-rlayer-short").split(":").map(Number);
      el.addEventListener("input", () => {
        list[i].layers[l].shortLabel = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-rlayer-lbl]").forEach((el) => {
      const [i, l] = el.getAttribute("data-rlayer-lbl").split(":").map(Number);
      el.addEventListener("input", () => {
        list[i].layers[l].label = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-rlayer-pct]").forEach((el) => {
      const [i, l] = el.getAttribute("data-rlayer-pct").split(":").map(Number);
      el.addEventListener("input", () => {
        list[i].layers[l].pct = Number(el.value || 25);
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-rlayer-col]").forEach((el) => {
      const [i, l] = el.getAttribute("data-rlayer-col").split(":").map(Number);
      el.addEventListener("input", () => {
        list[i].layers[l].color = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-rlayer-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [i, l] = btn.getAttribute("data-rlayer-del").split(":").map(Number);
        list[i].layers.splice(l, 1);
        triggerLiveSiteUpdate();
        renderRitualTab(ws);
      });
    });
    ws.querySelectorAll("[data-rit-add-layer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-rit-add-layer"));
        list[i].layers = list[i].layers || [];
        list[i].layers.push({
          shortLabel: "25% Layer",
          label: "Fresh Ingredient Layer",
          pct: 25,
          color: "#8B5A2B",
          textColor: "#FFFDF8"
        });
        triggerLiveSiteUpdate();
        renderRitualTab(ws);
      });
    });

    ws.querySelectorAll("[data-ritual-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-ritual-up"));
        if (i > 0) {
          [list[i - 1], list[i]] = [list[i], list[i - 1]];
          triggerLiveSiteUpdate();
          renderRitualTab(ws);
        }
      });
    });
    ws.querySelectorAll("[data-ritual-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-ritual-down"));
        if (i < list.length - 1) {
          [list[i + 1], list[i]] = [list[i], list[i + 1]];
          triggerLiveSiteUpdate();
          renderRitualTab(ws);
        }
      });
    });
    ws.querySelectorAll("[data-ritual-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-ritual-del"));
        list.splice(i, 1);
        triggerLiveSiteUpdate();
        renderRitualTab(ws);
      });
    });
    ws.querySelector("#cmsAddRitualDrinkBtn")?.addEventListener("click", () => {
      list.push({
        id: "drink-" + Date.now(),
        menuNumber: "40",
        name: "Milo Dino",
        chinese: "美禄恐龙",
        price: "20 K",
        pronunciation: "Mee-Loh Dee-Noh",
        tagline: "Malty Chocolate Mountain",
        layers: [
          {
            shortLabel: "25% Milo Heap",
            label: "Crunchy Unblended Milo Powder",
            pct: 25,
            color: "#4A2511",
            textColor: "#FFFDF8"
          },
          {
            shortLabel: "75% Iced Milo",
            label: "Chilled Creamy Chocolate Malt Milk",
            pct: 75,
            color: "#7B4B2A",
            textColor: "#FFFDF8"
          }
        ],
        notes: "Rich iced chocolate malt crowned with a generous mountain of crunchy Milo powder.",
        pairWith: "52. Milo Toast or 34. French Fries"
      });
      triggerLiveSiteUpdate();
      renderRitualTab(ws);
    });
  }

  // ==========================================================================
  // TAB 8: ATMOSPHERE & VIBES BENTO GALLERY
  // ==========================================================================
  function renderVibesTab(ws) {
    const d = getData();
    const cfg = (d.vibesSectionConfig = d.vibesSectionConfig || {});
    const zones = (d.galleryZones = d.galleryZones || []);
    const photos = (d.galleryPhotos = d.galleryPhotos || []);

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">🖼️ Atmosphere & Vibes Bento Gallery (${photos.length} Photos)</h2>
          <p class="cms-section-desc">Edit gallery header texts, filter zones, and upload/manage every photo card in the bento grid.</p>
        </div>
        <button type="button" class="cms-btn cms-btn--green" id="cmsAddGalleryPhotoBtn">+ Add Gallery Photo</button>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📝 Gallery Section Header</div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Plaque Pill Text</label>
          <input type="text" class="cms-input" id="vibesCfgPlaque" value="${escHtml(cfg.plaqueText)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Section Headline</label>
          <input type="text" class="cms-input" id="vibesCfgTitle" value="${escHtml(cfg.title)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Section Description</label>
          <textarea class="cms-textarea" style="min-height: 52px;" id="vibesCfgDesc">${escHtml(cfg.description)}</textarea>
        </div>
      </div>

      ${photos
        .map(
          (p, idx) => `
          <div class="cms-card">
            <div class="cms-card__head">
              <div class="cms-card__title">${escHtml(p.slotLabel || `#${idx + 1}`)} — ${escHtml(p.title)}</div>
              <div style="display: flex; gap: 0.3rem;">
                <button type="button" class="cms-btn cms-btn--sm" data-gal-up="${idx}">↑</button>
                <button type="button" class="cms-btn cms-btn--sm" data-gal-down="${idx}">↓</button>
                <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-gal-del="${idx}">Delete</button>
              </div>
            </div>
            ${renderImagePickerField({
              id: `galPhoto_${idx}`,
              label: "Gallery Photograph",
              currentValue: p.image,
              folder: "gallery",
              prefix: `gallery-${idx + 1}`
            })}
            <div class="cms-grid-3">
              <div class="cms-field">
                <label class="cms-label">Slot Badge Label</label>
                <input type="text" class="cms-input" data-gal-slot="${idx}" value="${escHtml(p.slotLabel)}" />
              </div>
              <div class="cms-field">
                <label class="cms-label">Filter Zone</label>
                <select class="cms-select" data-gal-zone="${idx}">
                  ${zones
                    .filter((z) => z.id !== "all")
                    .map(
                      (z) =>
                        `<option value="${escHtml(z.id)}" ${p.zone === z.id ? "selected" : ""}>${escHtml(z.label)}</option>`
                    )
                    .join("")}
                </select>
              </div>
              <div class="cms-field">
                <label class="cms-label">Bento Tile Size</label>
                <select class="cms-select" data-gal-span="${idx}">
                  <option value="normal" ${p.span === "normal" ? "selected" : ""}>Normal (1x1)</option>
                  <option value="wide" ${p.span === "wide" ? "selected" : ""}>Wide (2x1)</option>
                  <option value="tall" ${p.span === "tall" ? "selected" : ""}>Tall (1x2)</option>
                  <option value="wide-tall" ${p.span === "wide-tall" ? "selected" : ""}>Hero Feature (2x2)</option>
                </select>
              </div>
            </div>
            <div class="cms-field">
              <label class="cms-label">Photo Title</label>
              <input type="text" class="cms-input" data-gal-title="${idx}" value="${escHtml(p.title)}" />
            </div>
            <div class="cms-field">
              <label class="cms-label">Photo Caption</label>
              <textarea class="cms-textarea" style="min-height: 50px;" data-gal-cap="${idx}">${escHtml(p.caption)}</textarea>
            </div>
          </div>
        `
        )
        .join("")}
    `;

    const imgCallbacks = {};
    photos.forEach((p, idx) => {
      imgCallbacks[`galPhoto_${idx}`] = (val) => (p.image = val);
    });
    bindImagePickers(ws, imgCallbacks);

    ws.querySelector("#vibesCfgPlaque")?.addEventListener("input", (e) => {
      cfg.plaqueText = e.target.value;
      triggerLiveSiteUpdate();
    });
    ws.querySelector("#vibesCfgTitle")?.addEventListener("input", (e) => {
      cfg.title = e.target.value;
      triggerLiveSiteUpdate();
    });
    ws.querySelector("#vibesCfgDesc")?.addEventListener("input", (e) => {
      cfg.description = e.target.value;
      triggerLiveSiteUpdate();
    });

    ws.querySelectorAll("[data-gal-slot]").forEach((el) => {
      const i = Number(el.getAttribute("data-gal-slot"));
      el.addEventListener("input", () => {
        photos[i].slotLabel = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-gal-zone]").forEach((el) => {
      const i = Number(el.getAttribute("data-gal-zone"));
      el.addEventListener("change", () => {
        photos[i].zone = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-gal-span]").forEach((el) => {
      const i = Number(el.getAttribute("data-gal-span"));
      el.addEventListener("change", () => {
        photos[i].span = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-gal-title]").forEach((el) => {
      const i = Number(el.getAttribute("data-gal-title"));
      el.addEventListener("input", () => {
        photos[i].title = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-gal-cap]").forEach((el) => {
      const i = Number(el.getAttribute("data-gal-cap"));
      el.addEventListener("input", () => {
        photos[i].caption = el.value;
        triggerLiveSiteUpdate();
      });
    });

    ws.querySelectorAll("[data-gal-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-gal-up"));
        if (i > 0) {
          [photos[i - 1], photos[i]] = [photos[i], photos[i - 1]];
          triggerLiveSiteUpdate();
          renderVibesTab(ws);
        }
      });
    });
    ws.querySelectorAll("[data-gal-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-gal-down"));
        if (i < photos.length - 1) {
          [photos[i + 1], photos[i]] = [photos[i], photos[i + 1]];
          triggerLiveSiteUpdate();
          renderVibesTab(ws);
        }
      });
    });
    ws.querySelectorAll("[data-gal-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-gal-del"));
        photos.splice(i, 1);
        triggerLiveSiteUpdate();
        renderVibesTab(ws);
      });
    });
    ws.querySelector("#cmsAddGalleryPhotoBtn")?.addEventListener("click", () => {
      const num = String(photos.length + 1).padStart(2, "0");
      photos.unshift({
        id: "gal-" + Date.now(),
        zone: "space",
        span: "normal",
        image: "assets/gallery/atmo-interior-hall.png",
        title: "New Kopitiam Moment",
        caption: "Warm hospitality and sunlit marble tables at Royal Kopitiam.",
        slotLabel: `${num} • Moment`
      });
      triggerLiveSiteUpdate();
      renderVibesTab(ws);
    });
  }

  // ==========================================================================
  // TAB 9: QUICK FACTS & GUEST FAQ
  // ==========================================================================
  function renderFaqTab(ws) {
    const d = getData();
    const f = (d.faqSection = d.faqSection || {});
    const fc = (f.factCard = f.factCard || { facts: [] });
    fc.facts = fc.facts || [];
    f.faqs = f.faqs || [];

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">❓ Quick Facts & Guest FAQ</h2>
          <p class="cms-section-desc">Customize the At-a-Glance Fact Sheet and the Guest FAQ Accordion questions & answers.</p>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📝 FAQ Section Header</div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Plaque Pill Text</label>
          <input type="text" class="cms-input" id="faqPlaque" value="${escHtml(f.plaqueText)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Section Headline</label>
          <input type="text" class="cms-input" id="faqTitle" value="${escHtml(f.title)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Section Subtitle</label>
          <textarea class="cms-textarea" style="min-height: 52px;" id="faqDesc">${escHtml(f.description)}</textarea>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📋 At-a-Glance Fact Sheet Rows</div>
          <button type="button" class="cms-btn cms-btn--green cms-btn--sm" id="cmsAddFactRowBtn">+ Add Fact Row</button>
        </div>
        <div class="cms-grid-3">
          <div class="cms-field">
            <label class="cms-label">Card Eyebrow</label>
            <input type="text" class="cms-input" id="fcEyebrow" value="${escHtml(fc.eyebrow)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Card Title</label>
            <input type="text" class="cms-input" id="fcTitle" value="${escHtml(fc.title)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Halal Pill Text</label>
            <input type="text" class="cms-input" id="fcBadge" value="${escHtml(fc.badge)}" />
          </div>
        </div>
        ${fc.facts
          .map(
            (row, idx) => `
            <div style="display: grid; grid-template-columns: 180px 1fr auto; gap: 0.45rem; margin-bottom: 0.45rem; align-items: start;">
              <input type="text" class="cms-input" data-fact-lbl="${idx}" value="${escHtml(row.label)}" placeholder="Fact Label" />
              <input type="text" class="cms-input" data-fact-val="${idx}" value="${escHtml(row.value)}" placeholder="Fact Value (HTML allowed)" />
              <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-fact-del="${idx}">✕</button>
            </div>
          `
          )
          .join("")}
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">💬 Guest FAQ Accordion Items</div>
          <button type="button" class="cms-btn cms-btn--green cms-btn--sm" id="cmsAddFaqItemBtn">+ Add FAQ Question</button>
        </div>
        ${f.faqs
          .map(
            (item, idx) => `
            <div style="padding: 0.75rem; background: #fbf7ee; border: 1px solid #e2d4bd; border-radius: 10px; margin-bottom: 0.65rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
                <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.76rem; font-weight: 800; color: #083b14;">
                  <input type="checkbox" data-faq-open="${idx}" ${item.open ? "checked" : ""} />
                  <span>Expanded by default (FAQ #${idx + 1})</span>
                </label>
                <div style="display: flex; gap: 0.25rem;">
                  <button type="button" class="cms-btn cms-btn--sm" data-faq-up="${idx}">↑</button>
                  <button type="button" class="cms-btn cms-btn--sm" data-faq-down="${idx}">↓</button>
                  <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-faq-del="${idx}">Delete</button>
                </div>
              </div>
              <div class="cms-field">
                <input type="text" class="cms-input" data-faq-q="${idx}" value="${escHtml(item.question)}" placeholder="Question" />
              </div>
              <div class="cms-field">
                <textarea class="cms-textarea" style="min-height: 62px;" data-faq-a="${idx}" placeholder="Answer (HTML allowed)">${escHtml(item.answer)}</textarea>
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    `;

    const bind = (sel, fn) => {
      ws.querySelector(sel)?.addEventListener("input", (e) => {
        fn(e.target.value);
        triggerLiveSiteUpdate();
      });
    };
    bind("#faqPlaque", (v) => (f.plaqueText = v));
    bind("#faqTitle", (v) => (f.title = v));
    bind("#faqDesc", (v) => (f.description = v));
    bind("#fcEyebrow", (v) => (fc.eyebrow = v));
    bind("#fcTitle", (v) => (fc.title = v));
    bind("#fcBadge", (v) => (fc.badge = v));

    ws.querySelectorAll("[data-fact-lbl]").forEach((el) => {
      const i = Number(el.getAttribute("data-fact-lbl"));
      el.addEventListener("input", () => {
        fc.facts[i].label = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-fact-val]").forEach((el) => {
      const i = Number(el.getAttribute("data-fact-val"));
      el.addEventListener("input", () => {
        fc.facts[i].value = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-fact-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        fc.facts.splice(Number(btn.getAttribute("data-fact-del")), 1);
        triggerLiveSiteUpdate();
        renderFaqTab(ws);
      });
    });
    ws.querySelector("#cmsAddFactRowBtn")?.addEventListener("click", () => {
      fc.facts.push({ label: "New Fact", value: "Details here" });
      triggerLiveSiteUpdate();
      renderFaqTab(ws);
    });

    ws.querySelectorAll("[data-faq-q]").forEach((el) => {
      const i = Number(el.getAttribute("data-faq-q"));
      el.addEventListener("input", () => {
        f.faqs[i].question = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-faq-a]").forEach((el) => {
      const i = Number(el.getAttribute("data-faq-a"));
      el.addEventListener("input", () => {
        f.faqs[i].answer = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-faq-open]").forEach((el) => {
      const i = Number(el.getAttribute("data-faq-open"));
      el.addEventListener("change", () => {
        f.faqs[i].open = el.checked;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-faq-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-faq-up"));
        if (i > 0) {
          [f.faqs[i - 1], f.faqs[i]] = [f.faqs[i], f.faqs[i - 1]];
          triggerLiveSiteUpdate();
          renderFaqTab(ws);
        }
      });
    });
    ws.querySelectorAll("[data-faq-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-faq-down"));
        if (i < f.faqs.length - 1) {
          [f.faqs[i + 1], f.faqs[i]] = [f.faqs[i], f.faqs[i + 1]];
          triggerLiveSiteUpdate();
          renderFaqTab(ws);
        }
      });
    });
    ws.querySelectorAll("[data-faq-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        f.faqs.splice(Number(btn.getAttribute("data-faq-del")), 1);
        triggerLiveSiteUpdate();
        renderFaqTab(ws);
      });
    });
    ws.querySelector("#cmsAddFaqItemBtn")?.addEventListener("click", () => {
      f.faqs.push({
        question: "New Frequently Asked Question?",
        answer: "Provide a clear, helpful answer for guests here.",
        open: true
      });
      triggerLiveSiteUpdate();
      renderFaqTab(ws);
    });
  }

  // ==========================================================================
  // TAB 10: VISIT US, LOCATION, HOURS, CONTACTS & AMENITIES
  // ==========================================================================
  function renderVisitTab(ws) {
    const d = getData();
    const info = (d.restaurantInfo = d.restaurantInfo || {});
    info.address = info.address || {};
    info.hours = info.hours || {};
    info.contact = info.contact || {};
    const vCfg = (d.visitSectionConfig = d.visitSectionConfig || {});
    vCfg.amenities = vCfg.amenities || [];

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">📍 Visit Us, Address, Hours, Contacts & Map</h2>
          <p class="cms-section-desc">Update your physical address, Google Maps link, embedded map URL, operating hours, WhatsApp number, and guest amenities.</p>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📝 Visit Section Headline & Buttons</div>
        </div>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Plaque Pill Text</label>
            <input type="text" class="cms-input" id="visPlaque" value="${escHtml(vCfg.plaqueText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Section Headline</label>
            <input type="text" class="cms-input" id="visTitle" value="${escHtml(vCfg.title)}" />
          </div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Section Description</label>
          <textarea class="cms-textarea" style="min-height: 52px;" id="visDesc">${escHtml(vCfg.description)}</textarea>
        </div>
        <div class="cms-grid-3">
          <div class="cms-field">
            <label class="cms-label">Reserve CTA Label</label>
            <input type="text" class="cms-input" id="visResBtn" value="${escHtml(vCfg.reserveBtnText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Maps CTA Label</label>
            <input type="text" class="cms-input" id="visMapBtn" value="${escHtml(vCfg.mapsBtnText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">WhatsApp CTA Label</label>
            <input type="text" class="cms-input" id="visWaBtn" value="${escHtml(vCfg.whatsappBtnText)}" />
          </div>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🗺️ Street Address & Map Links</div>
        </div>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Street Address</label>
            <input type="text" class="cms-input" id="addrStreet" value="${escHtml(info.address.street)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">District / Area</label>
            <input type="text" class="cms-input" id="addrDistrict" value="${escHtml(info.address.district)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">City</label>
            <input type="text" class="cms-input" id="addrCity" value="${escHtml(info.address.city)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Postal Code</label>
            <input type="text" class="cms-input" id="addrPostal" value="${escHtml(info.address.postalCode)}" />
          </div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Landmark / Parking Note</label>
          <input type="text" class="cms-input" id="addrLandmark" value="${escHtml(info.address.landmark)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Google Maps Link URL</label>
          <input type="text" class="cms-input" id="addrMapsUrl" value="${escHtml(info.address.googleMapsUrl)}" />
        </div>
        <div class="cms-field">
          <label class="cms-label">Embedded Map &lt;iframe&gt; URL</label>
          <input type="text" class="cms-input" id="addrEmbedUrl" value="${escHtml(info.address.mapEmbedUrl)}" />
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🕒 Operating Hours & Contact Channels</div>
        </div>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Open Hour (24h, e.g. 7)</label>
            <input type="number" class="cms-input" id="hrOpen" value="${escHtml(info.hours.openHour24)}" min="0" max="23" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Close Hour (24h, e.g. 22)</label>
            <input type="number" class="cms-input" id="hrClose" value="${escHtml(info.hours.closeHour24)}" min="1" max="24" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Weekday Hours Label</label>
            <input type="text" class="cms-input" id="hrWeekday" value="${escHtml(info.hours.weekdayLabel)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Weekend Hours Label</label>
            <input type="text" class="cms-input" id="hrWeekend" value="${escHtml(info.hours.weekendLabel)}" />
          </div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Morning Ritual / Hours Note</label>
          <input type="text" class="cms-input" id="hrNote" value="${escHtml(info.hours.breakfastNote)}" />
        </div>

        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">WhatsApp Number (Digits Only for wa.me link)</label>
            <input type="text" class="cms-input" id="cntWaNum" value="${escHtml(info.contact.whatsappNumber)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">WhatsApp Display Phone</label>
            <input type="text" class="cms-input" id="cntWaDisp" value="${escHtml(info.contact.whatsappDisplay)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Instagram Handle</label>
            <input type="text" class="cms-input" id="cntIg" value="${escHtml(info.contact.instagramHandle)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Email Address</label>
            <input type="text" class="cms-input" id="cntEmail" value="${escHtml(info.contact.email)}" />
          </div>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">✨ Guest Amenity Cards</div>
          <button type="button" class="cms-btn cms-btn--green cms-btn--sm" id="cmsAddAmenityBtn">+ Add Amenity</button>
        </div>
        ${vCfg.amenities
          .map(
            (am, idx) => `
            <div style="display: grid; grid-template-columns: 1fr 1.6fr auto; gap: 0.45rem; margin-bottom: 0.45rem; align-items: start;">
              <input type="text" class="cms-input" data-am-title="${idx}" value="${escHtml(am.title)}" placeholder="Amenity Title" />
              <input type="text" class="cms-input" data-am-desc="${idx}" value="${escHtml(am.description)}" placeholder="Amenity Description" />
              <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-am-del="${idx}">✕</button>
            </div>
          `
          )
          .join("")}
      </div>
    `;

    const bind = (sel, fn) => {
      ws.querySelector(sel)?.addEventListener("input", (e) => {
        fn(e.target.value);
        triggerLiveSiteUpdate();
      });
    };
    bind("#visPlaque", (v) => (vCfg.plaqueText = v));
    bind("#visTitle", (v) => (vCfg.title = v));
    bind("#visDesc", (v) => (vCfg.description = v));
    bind("#visResBtn", (v) => (vCfg.reserveBtnText = v));
    bind("#visMapBtn", (v) => (vCfg.mapsBtnText = v));
    bind("#visWaBtn", (v) => (vCfg.whatsappBtnText = v));

    bind("#addrStreet", (v) => (info.address.street = v));
    bind("#addrDistrict", (v) => (info.address.district = v));
    bind("#addrCity", (v) => (info.address.city = v));
    bind("#addrPostal", (v) => (info.address.postalCode = v));
    bind("#addrLandmark", (v) => (info.address.landmark = v));
    bind("#addrMapsUrl", (v) => (info.address.googleMapsUrl = v));
    bind("#addrEmbedUrl", (v) => (info.address.mapEmbedUrl = v));

    bind("#hrOpen", (v) => (info.hours.openHour24 = Number(v || 7)));
    bind("#hrClose", (v) => (info.hours.closeHour24 = Number(v || 22)));
    bind("#hrWeekday", (v) => (info.hours.weekdayLabel = v));
    bind("#hrWeekend", (v) => (info.hours.weekendLabel = v));
    bind("#hrNote", (v) => (info.hours.breakfastNote = v));

    bind("#cntWaNum", (v) => (info.contact.whatsappNumber = v.replace(/[^0-9]/g, "")));
    bind("#cntWaDisp", (v) => (info.contact.whatsappDisplay = v));
    bind("#cntIg", (v) => (info.contact.instagramHandle = v));
    bind("#cntEmail", (v) => (info.contact.email = v));

    ws.querySelectorAll("[data-am-title]").forEach((el) => {
      const i = Number(el.getAttribute("data-am-title"));
      el.addEventListener("input", () => {
        vCfg.amenities[i].title = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-am-desc]").forEach((el) => {
      const i = Number(el.getAttribute("data-am-desc"));
      el.addEventListener("input", () => {
        vCfg.amenities[i].description = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-am-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        vCfg.amenities.splice(Number(btn.getAttribute("data-am-del")), 1);
        triggerLiveSiteUpdate();
        renderVisitTab(ws);
      });
    });
    ws.querySelector("#cmsAddAmenityBtn")?.addEventListener("click", () => {
      vCfg.amenities.push({
        title: "✨ New Guest Comfort",
        description: "Describe this facility or guest benefit."
      });
      triggerLiveSiteUpdate();
      renderVisitTab(ws);
    });
  }

  // ==========================================================================
  // TAB 11: RESERVATION MODAL & SITE FOOTER CUSTOMIZER
  // ==========================================================================
  function renderReservationAndFooterTab(ws) {
    const d = getData();
    const resCfg = (d.reservationModalConfig = d.reservationModalConfig || {});
    resCfg.quickHours = resCfg.quickHours || ["08:00", "10:00", "12:00", "15:00", "19:00"];
    resCfg.seatingOptions = resCfg.seatingOptions || [
      { value: "Indoor", label: "❄️ Indoor" },
      { value: "Outdoor", label: "🌿 Outdoor" },
      { value: "VIP Room", label: "👑 VIP Room" }
    ];
    const fCfg = (d.footerConfig = d.footerConfig || {});
    fCfg.navLinks = fCfg.navLinks || [];
    fCfg.highlights = fCfg.highlights || [];

    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">📅 Reservation Modal & Site Footer</h2>
          <p class="cms-section-desc">Customize the WhatsApp Table Reservation modal (guest count limits, hours, seating options) and the entire site footer.</p>
        </div>
        <button type="button" class="cms-btn cms-btn--green" id="cmsTestResModalBtn">📅 Test Reservation Modal</button>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📅 Table Reservation Modal Settings</div>
        </div>
        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Modal Eyebrow</label>
            <input type="text" class="cms-input" id="resEyebrow" value="${escHtml(resCfg.eyebrow)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Modal Title</label>
            <input type="text" class="cms-input" id="resTitle" value="${escHtml(resCfg.title)}" />
          </div>
        </div>

        <div class="cms-grid-3">
          <div class="cms-field">
            <label class="cms-label">Default Guests</label>
            <input type="number" class="cms-input" id="resDefPax" value="${escHtml(resCfg.defaultPax || 4)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Min Guests</label>
            <input type="number" class="cms-input" id="resMinPax" value="${escHtml(resCfg.minPax || 1)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Max Guests</label>
            <input type="number" class="cms-input" id="resMaxPax" value="${escHtml(resCfg.maxPax || 100)}" />
          </div>
        </div>

        <div class="cms-grid-3">
          <div class="cms-field">
            <label class="cms-label">Earliest Time</label>
            <input type="time" class="cms-input" id="resMinTime" value="${escHtml(resCfg.minTime || "07:00")}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Latest Time</label>
            <input type="time" class="cms-input" id="resMaxTime" value="${escHtml(resCfg.maxTime || "21:30")}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Default Time</label>
            <input type="time" class="cms-input" id="resDefTime" value="${escHtml(resCfg.defaultTime || "12:00")}" />
          </div>
        </div>

        <div class="cms-field">
          <label class="cms-label">Quick-Tap Hour Chips (Comma-separated, e.g. 08:00, 10:00, 12:00, 15:00, 19:00)</label>
          <input type="text" class="cms-input" id="resQuickHours" value="${escHtml(resCfg.quickHours.join(", "))}" />
        </div>

        <div class="cms-field">
          <label class="cms-label">
            <span>Seating Preference Options</span>
            <button type="button" class="cms-btn cms-btn--sm" id="cmsAddSeatOptBtn">+ Add Seating Option</button>
          </label>
          ${resCfg.seatingOptions
            .map(
              (opt, idx) => `
              <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.45rem; margin-bottom: 0.4rem;">
                <input type="text" class="cms-input" data-seat-val="${idx}" value="${escHtml(opt.value)}" placeholder="Value (e.g. Indoor)" />
                <input type="text" class="cms-input" data-seat-lbl="${idx}" value="${escHtml(opt.label)}" placeholder="Button Label (e.g. ❄️ Indoor)" />
                <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-seat-del="${idx}">✕</button>
              </div>
            `
            )
            .join("")}
        </div>

        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">WhatsApp Greeting Line</label>
            <input type="text" class="cms-input" id="resGreet" value="${escHtml(resCfg.greetingLine)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">WhatsApp Closing Line</label>
            <input type="text" class="cms-input" id="resClose" value="${escHtml(resCfg.closingLine)}" />
          </div>
        </div>
      </div>

      <!-- Footer Customizer -->
      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🦶 Site Footer Customizer</div>
        </div>
        ${renderImagePickerField({
          id: "footerLogoImg",
          label: "Footer Brand Logo",
          currentValue: fCfg.logo,
          folder: "brand",
          prefix: "footer-logo"
        })}
        <div class="cms-grid-3">
          <div class="cms-field">
            <label class="cms-label">Footer Brand Title</label>
            <input type="text" class="cms-input" id="footTitle" value="${escHtml(fCfg.title)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Footer Chinese Subtitle</label>
            <input type="text" class="cms-input" id="footSub" value="${escHtml(fCfg.subtitle)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Halal Pill Text</label>
            <input type="text" class="cms-input" id="footBadge" value="${escHtml(fCfg.badgeText)}" />
          </div>
        </div>
        <div class="cms-field">
          <label class="cms-label">Footer About Paragraph</label>
          <textarea class="cms-textarea" style="min-height: 54px;" id="footDesc">${escHtml(fCfg.description)}</textarea>
        </div>

        <div class="cms-field">
          <label class="cms-label">
            <span>Footer Signature Highlights List (One line per item)</span>
          </label>
          <textarea class="cms-textarea" id="footHighlights" style="min-height: 110px;">${escHtml((fCfg.highlights || []).join("\n"))}</textarea>
        </div>

        <div class="cms-grid-2">
          <div class="cms-field">
            <label class="cms-label">Copyright Line</label>
            <input type="text" class="cms-input" id="footCopy" value="${escHtml(fCfg.copyrightText)}" />
          </div>
          <div class="cms-field">
            <label class="cms-label">Bottom-Right Assurance Note</label>
            <input type="text" class="cms-input" id="footRight" value="${escHtml(fCfg.bottomRightText)}" />
          </div>
        </div>
      </div>
    `;

    bindImagePickers(ws, {
      footerLogoImg: (val) => (fCfg.logo = val)
    });

    ws.querySelector("#cmsTestResModalBtn")?.addEventListener("click", () => {
      if (window.__openRoyalReservationModal) {
        window.__openRoyalReservationModal();
      }
    });

    const bind = (sel, fn) => {
      ws.querySelector(sel)?.addEventListener("input", (e) => {
        fn(e.target.value);
        triggerLiveSiteUpdate();
      });
    };
    bind("#resEyebrow", (v) => (resCfg.eyebrow = v));
    bind("#resTitle", (v) => (resCfg.title = v));
    bind("#resDefPax", (v) => (resCfg.defaultPax = Number(v || 4)));
    bind("#resMinPax", (v) => (resCfg.minPax = Number(v || 1)));
    bind("#resMaxPax", (v) => (resCfg.maxPax = Number(v || 100)));
    bind("#resMinTime", (v) => (resCfg.minTime = v));
    bind("#resMaxTime", (v) => (resCfg.maxTime = v));
    bind("#resDefTime", (v) => (resCfg.defaultTime = v));
    bind("#resGreet", (v) => (resCfg.greetingLine = v));
    bind("#resClose", (v) => (resCfg.closingLine = v));

    ws.querySelector("#resQuickHours")?.addEventListener("input", (e) => {
      resCfg.quickHours = e.target.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      triggerLiveSiteUpdate();
    });

    ws.querySelectorAll("[data-seat-val]").forEach((el) => {
      const i = Number(el.getAttribute("data-seat-val"));
      el.addEventListener("input", () => {
        resCfg.seatingOptions[i].value = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-seat-lbl]").forEach((el) => {
      const i = Number(el.getAttribute("data-seat-lbl"));
      el.addEventListener("input", () => {
        resCfg.seatingOptions[i].label = el.value;
        triggerLiveSiteUpdate();
      });
    });
    ws.querySelectorAll("[data-seat-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        resCfg.seatingOptions.splice(Number(btn.getAttribute("data-seat-del")), 1);
        triggerLiveSiteUpdate();
        renderReservationAndFooterTab(ws);
      });
    });
    ws.querySelector("#cmsAddSeatOptBtn")?.addEventListener("click", () => {
      resCfg.seatingOptions.push({ value: "Terrace", label: "☀️ Terrace" });
      triggerLiveSiteUpdate();
      renderReservationAndFooterTab(ws);
    });

    bind("#footTitle", (v) => (fCfg.title = v));
    bind("#footSub", (v) => (fCfg.subtitle = v));
    bind("#footBadge", (v) => (fCfg.badgeText = v));
    bind("#footDesc", (v) => (fCfg.description = v));
    bind("#footCopy", (v) => (fCfg.copyrightText = v));
    bind("#footRight", (v) => (fCfg.bottomRightText = v));
    ws.querySelector("#footHighlights")?.addEventListener("input", (e) => {
      fCfg.highlights = e.target.value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      triggerLiveSiteUpdate();
    });
  }

  // ==========================================================================
  // TAB 12: SAVE CONFIGURATION, VERSION HISTORY & BACKUPS
  // ==========================================================================
  function renderHistoryTab(ws) {
    ws.innerHTML = `
      <div class="cms-section-header">
        <div>
          <h2 class="cms-section-title">💾 Save Configuration, Version History & Backups</h2>
          <p class="cms-section-desc">Save named configuration snapshots, restore previous versions, or export/import siteData.js.</p>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🚀 Save & Create Version Snapshot</div>
          <span style="font-size: 0.74rem; font-weight: 800; color: ${cmsState.serverConnected ? "#0f5922" : "#b45309"};">
            ${cmsState.serverConnected ? "🟢 Connected to Local Disk Server (siteData.js)" : "🟡 Browser Storage Mode"}
          </span>
        </div>
        <div style="display: flex; gap: 0.55rem; flex-wrap: wrap;">
          <input
            type="text"
            class="cms-input"
            id="cmsSnapshotNoteInput"
            placeholder="Version note (e.g., Updated Weekend Menu & Packages)..."
            style="flex: 1; min-width: 220px;"
          />
          <button type="button" class="cms-btn cms-btn--green" id="cmsSaveSnapshotNowBtn">
            💾 Save & Publish Snapshot
          </button>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">📦 Export, Import & Factory Reset</div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button type="button" class="cms-btn cms-btn--green" id="cmsDownloadSiteDataJsBtn">
            📥 Download siteData.js
          </button>
          <button type="button" class="cms-btn" id="cmsDownloadJsonBtn">
            📄 Download JSON Backup
          </button>
          <label class="cms-btn" style="cursor: pointer;">
            📂 Import JSON / siteData.js
            <input type="file" id="cmsImportFileInput" accept=".json,.js" style="display: none;" />
          </label>
          <button type="button" class="cms-btn cms-btn--red" id="cmsFactoryResetBtn">
            🔄 Reset to Factory Default
          </button>
        </div>
      </div>

      <div class="cms-card">
        <div class="cms-card__head">
          <div class="cms-card__title">🕰️ Saved Version History (${cmsState.historyList.length} Snapshots)</div>
        </div>
        ${
          cmsState.historyList.length === 0
            ? `<p style="font-size: 0.82rem; color: #6e5d4f;">No snapshots saved yet. Click "Save & Publish Snapshot" above to record a restore point.</p>`
            : cmsState.historyList
                .map(
                  (entry, idx) => `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; padding: 0.65rem 0.75rem; background: #fbf7ee; border: 1px solid #e2d4bd; border-radius: 10px; margin-bottom: 0.5rem;">
                  <div>
                    <div style="font-size: 0.83rem; font-weight: 800; color: #083b14;">
                      ${escHtml(entry.note || "Configuration Snapshot")}
                    </div>
                    <div style="font-size: 0.72rem; color: #6e5d4f;">
                      🕒 ${escHtml(entry.timestamp)} • ${entry.menuCount || 61} Menu Items • ${entry.packageCount || 3} Packages
                    </div>
                  </div>
                  <div style="display: flex; gap: 0.35rem;">
                    <button type="button" class="cms-btn cms-btn--green cms-btn--sm" data-hist-restore="${idx}">
                      ⏪ Restore
                    </button>
                    <button type="button" class="cms-btn cms-btn--red cms-btn--sm" data-hist-del="${idx}">
                      ✕
                    </button>
                  </div>
                </div>
              `
                )
                .join("")
        }
      </div>
    `;

    ws.querySelector("#cmsSaveSnapshotNowBtn")?.addEventListener("click", () => {
      const note =
        ws.querySelector("#cmsSnapshotNoteInput")?.value.trim() ||
        "Manual Snapshot via CMS Studio";
      saveAndPublishAll(note, true);
    });

    ws.querySelector("#cmsDownloadSiteDataJsBtn")?.addEventListener("click", () => {
      const content =
        "/**\n * ROYAL KOPITIAM — Generated by CMS Studio\n */\nwindow.ROYAL_KOPITIAM_DATA = " +
        JSON.stringify(getData(), null, 2) +
        ";\n";
      const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "siteData.js";
      a.click();
      URL.revokeObjectURL(url);
      showToast("📥 Downloaded siteData.js");
    });

    ws.querySelector("#cmsDownloadJsonBtn")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(getData(), null, 2)], {
        type: "application/json;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `royal-kopitiam-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("📄 Downloaded JSON backup");
    });

    ws.querySelector("#cmsImportFileInput")?.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          let text = String(reader.result || "").trim();
          let parsed;
          if (text.includes("window.ROYAL_KOPITIAM_DATA")) {
            const sandbox = { window: {} };
            new Function("window", text)(sandbox.window);
            parsed = sandbox.window.ROYAL_KOPITIAM_DATA;
          } else {
            parsed = JSON.parse(text);
          }
          if (parsed && Array.isArray(parsed.menuItems)) {
            window.ROYAL_KOPITIAM_DATA = parsed;
            saveAndPublishAll(`Imported ${file.name}`, true);
            renderActiveTab();
            showToast(`✅ Imported configuration from ${file.name}`);
          } else {
            showToast("⚠️ Invalid configuration file format");
          }
        } catch (err) {
          showToast("⚠️ Could not parse imported file");
        }
      };
      reader.readAsText(file);
    });

    ws.querySelector("#cmsFactoryResetBtn")?.addEventListener("click", () => {
      if (!window.ROYAL_KOPITIAM_FACTORY_DATA) return;
      localStorage.removeItem(CMS_STORAGE_KEY);
      window.ROYAL_KOPITIAM_DATA = JSON.parse(
        JSON.stringify(window.ROYAL_KOPITIAM_FACTORY_DATA)
      );
      saveAndPublishAll("Reset to Factory Default", true);
      renderActiveTab();
      showToast("🔄 Restored factory default configuration");
    });

    ws.querySelectorAll("[data-hist-restore]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-hist-restore"));
        const snap = cmsState.historyList[idx];
        if (snap && snap.data) {
          window.ROYAL_KOPITIAM_DATA = JSON.parse(JSON.stringify(snap.data));
          saveAndPublishAll(`Restored snapshot: ${snap.note}`, false);
          renderActiveTab();
          showToast(`⏪ Restored snapshot from ${snap.timestamp}`);
        }
      });
    });

    ws.querySelectorAll("[data-hist-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const idx = Number(btn.getAttribute("data-hist-del"));
        const snap = cmsState.historyList[idx];
        cmsState.historyList.splice(idx, 1);
        try {
          localStorage.setItem(CMS_LOCAL_HISTORY_KEY, JSON.stringify(cmsState.historyList));
        } catch (_) {}
        if (cmsState.serverConnected && snap?.id) {
          try {
            await fetch("/api/cms/delete-history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: snap.id })
            });
          } catch (_) {}
        }
        renderHistoryTab(ws);
      });
    });
  }

  // ==========================================================================
  // CMS SHELL & NAVIGATION CONTROLLER
  // ==========================================================================
  const TABS_CONFIG = [
    { id: "menu", icon: "🍽️", label: "Menu & Pairings", group: "Culinary & Packages" },
    { id: "packages", icon: "🍱", label: "Curated Packages", group: "Culinary & Packages" },
    { id: "categories", icon: "🗂️", label: "Menu Categories", group: "Culinary & Packages" },
    { id: "ritual", icon: "☕", label: "Kopi & Drink Bar", group: "Culinary & Packages" },
    { id: "header", icon: "🎨", label: "Header & Theme", group: "Template Sections" },
    { id: "hero", icon: "🏛️", label: "Hero Banner", group: "Template Sections" },
    { id: "story", icon: "📜", label: "Our Story & Pillars", group: "Template Sections" },
    { id: "vibes", icon: "🖼️", label: "Atmosphere Gallery", group: "Template Sections" },
    { id: "faq", icon: "❓", label: "Quick Facts & FAQ", group: "Template Sections" },
    { id: "visit", icon: "📍", label: "Visit Us & Map", group: "Template Sections" },
    { id: "reservation", icon: "📅", label: "Reservation & Footer", group: "Template Sections" },
    { id: "history", icon: "💾", label: "Save & History", group: "System" }
  ];

  function updateTopbarStatusUI() {
    const statusEl = document.getElementById("cmsTopbarStatusText");
    if (!statusEl) return;
    statusEl.innerHTML = cmsState.serverConnected
      ? `<span style="color:#4ade80;">●</span> Auto-Syncing to Disk (siteData.js)`
      : `<span style="color:#fbbf24;">●</span> Live Browser Storage Mode`;
  }

  function renderSidebarNav() {
    const navEl = document.getElementById("cmsSidebarNav");
    if (!navEl) return;

    let lastGroup = "";
    const html = [];
    TABS_CONFIG.forEach((tab) => {
      if (tab.group !== lastGroup) {
        lastGroup = tab.group;
        html.push(`<div class="cms-nav-group-label">${escHtml(tab.group)}</div>`);
      }
      const active = cmsState.activeTab === tab.id ? "is-active" : "";
      html.push(`
        <button type="button" class="cms-nav-btn ${active}" data-cms-tab="${tab.id}">
          <span>${tab.icon}</span>
          <span>${escHtml(tab.label)}</span>
        </button>
      `);
    });

    navEl.innerHTML = html.join("");
    navEl.querySelectorAll("[data-cms-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        cmsState.activeTab = btn.getAttribute("data-cms-tab");
        renderSidebarNav();
        renderActiveTab();
      });
    });
  }

  function renderActiveTab() {
    const ws = document.getElementById("cmsWorkspaceArea");
    if (!ws) return;

    switch (cmsState.activeTab) {
      case "header":
        renderHeaderTab(ws);
        break;
      case "hero":
        renderHeroTab(ws);
        break;
      case "story":
        renderStoryTab(ws);
        break;
      case "packages":
        renderPackagesTab(ws);
        break;
      case "menu":
        renderMenuTab(ws);
        break;
      case "categories":
        renderCategoriesTab(ws);
        break;
      case "ritual":
        renderRitualTab(ws);
        break;
      case "vibes":
        renderVibesTab(ws);
        break;
      case "faq":
        renderFaqTab(ws);
        break;
      case "visit":
        renderVisitTab(ws);
        break;
      case "reservation":
        renderReservationAndFooterTab(ws);
        break;
      case "history":
        renderHistoryTab(ws);
        break;
      default:
        renderMenuTab(ws);
    }
  }

  function openCMS(tabId, dishNumber) {
    const shell = document.getElementById("cmsStudioShell");
    if (!shell) return;
    if (tabId) cmsState.activeTab = tabId;
    if (dishNumber) cmsState.selectedDishNumber = dishNumber;

    cmsState.isOpen = true;
    shell.classList.add("is-open");
    document.body.classList.add("cms-drawer-open");
    renderSidebarNav();
    renderActiveTab();
  }

  function closeCMS() {
    const shell = document.getElementById("cmsStudioShell");
    if (!shell) return;
    cmsState.isOpen = false;
    shell.classList.remove("is-open");
    document.body.classList.remove("cms-drawer-open");
  }

  function toggleInspectMode(forceVal) {
    cmsState.inspectMode =
      typeof forceVal === "boolean" ? forceVal : !cmsState.inspectMode;
    document.body.classList.toggle("cms-inspect-mode", cmsState.inspectMode);
    const btn = document.getElementById("cmsToggleInspectBtn");
    if (btn) {
      btn.classList.toggle("is-active", cmsState.inspectMode);
      btn.innerHTML = cmsState.inspectMode
        ? "🎯 Inspecting Page (Click Any Element)"
        : "✏️ Click-to-Edit Page";
    }
  }

  function mountCMSShell() {
    if (window.location.search.includes("preview=1")) return;
    const isStandalonePage = document.body.hasAttribute("data-cms-standalone");

    // 1. Floating Dock & Inspect Banner (only on main website)
    if (!isStandalonePage) {
      const dock = document.createElement("div");
      dock.className = "cms-floating-dock";
      dock.innerHTML = `
        <button type="button" class="cms-dock-btn cms-dock-btn--inspect" id="cmsToggleInspectBtn">
          ✏️ Click-to-Edit Page
        </button>
        <button type="button" class="cms-dock-btn cms-dock-btn--primary" id="cmsOpenStudioBtn">
          ⚙️ CMS Studio
        </button>
      `;
      document.body.appendChild(dock);

      const banner = document.createElement("div");
      banner.className = "cms-inspect-banner";
      banner.innerHTML = `
        <span>🎯 Click any section, package, or dish card on the page to edit it in the CMS!</span>
        <button type="button" class="cms-btn cms-btn--sm" id="cmsExitInspectBannerBtn">Exit</button>
      `;
      document.body.appendChild(banner);
    }

    // 2. Main CMS Studio Drawer / Container
    const shell = document.createElement("aside");
    shell.id = "cmsStudioShell";
    shell.className = "cms-studio-Shell" + (isStandalonePage ? " is-open" : "");
    shell.setAttribute("aria-label", "Royal Kopitiam Content Management System");
    shell.innerHTML = `
      <div class="cms-topbar">
        <div class="cms-topbar__brand">
          <span class="cms-topbar__badge">CMS STUDIO</span>
          <div>
            <div class="cms-topbar__title">Royal Kopitiam • Header-to-Footer Editor</div>
            <div class="cms-topbar__status" id="cmsTopbarStatusText">Checking persistence mode...</div>
          </div>
        </div>
        <div class="cms-topbar__actions">
          <button type="button" class="cms-top-btn cms-top-btn--save" id="cmsQuickSaveAllBtn">
            💾 Save & Publish
          </button>
          ${
            !isStandalonePage
              ? `
            <button type="button" class="cms-top-btn" id="cmsExpandWidthBtn">
              ⇔ Expand Fullscreen
            </button>
            <a href="cms.html" class="cms-top-btn" title="Open Dedicated Admin Studio Page">
              ↗ Admin Page
            </a>
            <button type="button" class="cms-top-btn cms-top-btn--close" id="cmsCloseStudioBtn">
              ✕ Close
            </button>
          `
              : `
            <a href="index.html" class="cms-top-btn">
              ← View Live Website
            </a>
          `
          }
        </div>
      </div>

      <div class="cms-body">
        <nav class="cms-sidebar" id="cmsSidebarNav" aria-label="CMS Sections"></nav>
        <div class="cms-workspace" id="cmsWorkspaceArea"></div>
      </div>
    `;

    const mountTarget = document.getElementById("cmsStandaloneMount") || document.body;
    mountTarget.appendChild(shell);

    // 3. Asset Library Picker Modal
    const assetModal = document.createElement("div");
    assetModal.id = "cmsAssetModalBackdrop";
    assetModal.className = "cms-asset-modal-backdrop";
    assetModal.innerHTML = `
      <div class="cms-asset-modal">
        <div class="cms-topbar">
          <div class="cms-topbar__brand">
            <span class="cms-topbar__badge">ASSET LIBRARY</span>
            <div class="cms-topbar__title">Choose a Photograph or Brand Graphic</div>
          </div>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <div id="cmsAssetFolderFilters" style="display: flex; gap: 0.3rem;"></div>
            <button type="button" class="cms-top-btn cms-top-btn--close" id="cmsCloseAssetModalBtn">✕</button>
          </div>
        </div>
        <div class="cms-asset-grid" id="cmsAssetModalGrid"></div>
      </div>
    `;
    document.body.appendChild(assetModal);

    // Bind events
    document.getElementById("cmsOpenStudioBtn")?.addEventListener("click", () => {
      if (cmsState.isOpen) {
        closeCMS();
      } else {
        openCMS();
      }
    });

    document.getElementById("cmsCloseStudioBtn")?.addEventListener("click", () => closeCMS());

    document.getElementById("cmsExpandWidthBtn")?.addEventListener("click", (e) => {
      cmsState.isExpanded = !cmsState.isExpanded;
      shell.classList.toggle("is-expanded", cmsState.isExpanded);
      document.body.classList.toggle("cms-drawer-expanded", cmsState.isExpanded);
      e.currentTarget.textContent = cmsState.isExpanded
        ? "⇒ Dock Split-View"
        : "⇔ Expand Fullscreen";
    });

    document.getElementById("cmsQuickSaveAllBtn")?.addEventListener("click", () => {
      saveAndPublishAll("Quick Save via CMS Topbar", true);
    });

    document.getElementById("cmsToggleInspectBtn")?.addEventListener("click", () => {
      toggleInspectMode();
    });

    document.getElementById("cmsExitInspectBannerBtn")?.addEventListener("click", () => {
      toggleInspectMode(false);
    });

    document.getElementById("cmsCloseAssetModalBtn")?.addEventListener("click", () => {
      assetModal.classList.remove("is-open");
    });
    assetModal.addEventListener("click", (e) => {
      if (e.target === assetModal) assetModal.classList.remove("is-open");
    });

    // Global click-to-edit inspector delegation on main page
    document.addEventListener(
      "click",
      (e) => {
        if (!cmsState.inspectMode) return;
        if (
          e.target.closest("#cmsStudioShell") ||
          e.target.closest(".cms-floating-dock") ||
          e.target.closest(".cms-inspect-banner") ||
          e.target.closest("#cmsAssetModalBackdrop")
        ) {
          return;
        }

        const dishCard = e.target.closest("[data-cms-dish]");
        if (dishCard) {
          e.preventDefault();
          e.stopPropagation();
          const num = dishCard.getAttribute("data-cms-dish");
          toggleInspectMode(false);
          openCMS("menu", num);
          showToast(`✏️ Editing Dish #${num}`);
          return;
        }

        const pkgCard = e.target.closest("[data-cms-package-index]");
        if (pkgCard) {
          e.preventDefault();
          e.stopPropagation();
          toggleInspectMode(false);
          openCMS("packages");
          showToast("✏️ Editing Curated Packages");
          return;
        }

        const secEl = e.target.closest("[data-cms-section]");
        if (secEl) {
          e.preventDefault();
          e.stopPropagation();
          const secId = secEl.getAttribute("data-cms-section");
          const tabMap = {
            header: "header",
            hero: "hero",
            story: "story",
            packages: "packages",
            menu: "menu",
            ritual: "ritual",
            vibes: "vibes",
            faq: "faq",
            visit: "visit",
            footer: "reservation"
          };
          toggleInspectMode(false);
          openCMS(tabMap[secId] || "menu");
          showToast(`✏️ Editing ${secId.toUpperCase()} section`);
        }
      },
      true
    );

    renderSidebarNav();
    renderActiveTab();
    checkServerStatus();

    // Auto-open if URL has ?cms=1
    if (window.location.search.includes("cms=1")) {
      openCMS();
    }
  }

  window.openRoyalCMS = openCMS;

  document.addEventListener("DOMContentLoaded", () => {
    mountCMSShell();
  });
})();
