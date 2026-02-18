// Template Lab front-end enhancements. No dependencies.
(() => {
  const y = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(y);
  });

  const appRoot = document.getElementById("collectionApp");
  const catalog = window.TEMPLATE_LAB_CATALOG;

  if (!appRoot || !catalog || !Array.isArray(catalog.products)) {
    return;
  }

  const state = {
    query: "",
    category: "All",
    sort: "featured",
  };

  const categoryWrap = document.getElementById("categoryFilters");
  const searchInput = document.getElementById("collectionSearch");
  const sortSelect = document.getElementById("collectionSort");
  const countLabel = document.getElementById("collectionCount");
  const cardsWrap = document.getElementById("collectionCards");

  const categories = ["All"].concat(catalog.categoryOrder || []);

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function makeFilterButtons(list, selected) {
    return list
      .map((item) => {
        const active = item === selected;
        return (
          '<button type="button" class="filter-pill' +
          (active ? " is-active" : "") +
          '" data-value="' +
          escapeHtml(item) +
          '">' +
          escapeHtml(item) +
          "</button>"
        );
      })
      .join("");
  }

  function filterProducts() {
    const q = state.query.trim().toLowerCase();
    let filtered = catalog.products.filter((p) => {
      const byCategory = state.category === "All" || p.category === state.category;
      const blob = (p.name + " " + p.description + " " + p.category).toLowerCase();
      const byQuery = !q || blob.includes(q);
      return byCategory && byQuery;
    });

    if (state.sort === "name-asc") {
      filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
    } else if (state.sort === "category-asc") {
      filtered = filtered
        .slice()
        .sort((a, b) => a.category.localeCompare(b.category, "en-GB") || a.name.localeCompare(b.name, "en-GB"));
    }

    return filtered;
  }

  function renderCards(items) {
    if (!items.length) {
      cardsWrap.innerHTML =
        '<div class="collection-empty"><p>No products match these filters.</p><button type="button" class="filter-pill is-active" id="collectionReset">Reset filters</button></div>';
      const resetButton = document.getElementById("collectionReset");
      if (resetButton) {
        resetButton.addEventListener("click", () => {
          state.query = "";
          state.category = "All";
          state.sort = "featured";
          syncControls();
          render();
        });
      }
      return;
    }

    cardsWrap.innerHTML = items
      .map((p) => {
        return (
          '<article class="collection-card">' +
          '<div class="collection-meta-row">' +
          '<span class="collection-tag">' +
          escapeHtml(p.category) +
          "</span>" +
          "</div>" +
          "<h3>" +
          escapeHtml(p.name) +
          "</h3>" +
          "<p>" +
          escapeHtml(p.description) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function syncControls() {
    if (searchInput) searchInput.value = state.query;
    if (sortSelect) sortSelect.value = state.sort;
    if (categoryWrap) categoryWrap.innerHTML = makeFilterButtons(categories, state.category);
  }

  function render() {
    const items = filterProducts();
    const total = catalog.products.length;
    const countText = "Showing " + items.length + " of " + total + " products";
    if (countLabel) countLabel.textContent = countText;
    renderCards(items);
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.query = event.target.value || "";
      render();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      render();
    });
  }

  if (categoryWrap) {
    categoryWrap.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-value]");
      if (!btn) return;
      state.category = btn.getAttribute("data-value") || "All";
      syncControls();
      render();
    });
  }

  syncControls();
  render();
})();
