// Template Lab progressive enhancement: filters the server-rendered grid.
// Without JavaScript the full grid is visible and the controls stay hidden.
(() => {
  const root = document.querySelector("[data-browse-root]");
  if (!root) return;
  const grid = root.querySelector("[data-browse-grid]");
  const search = root.querySelector("[data-browse-search]");
  const sort = root.querySelector("[data-browse-sort]");
  const filtersWrap = root.querySelector("[data-browse-filters]");
  const count = root.querySelector("[data-browse-count]");
  const cards = [...grid.querySelectorAll(".collection-card")];
  if (!cards.length) return;

  root.classList.add("is-enhanced");
  let activeCategory = "All";

  const categories = ["All", ...new Set(cards.map((c) => c.dataset.category))];
  const empty = root.querySelector("[data-browse-empty]");
  const resetBtn = root.querySelector("[data-browse-reset]");
  filtersWrap.innerHTML = categories.map((c) =>
    '<button type="button" class="filter-pill' + (c === "All" ? " is-active" : "") +
    '" aria-pressed="' + (c === "All" ? "true" : "false") + '" data-category="' + c + '">' + c + "</button>").join("");

  function apply() {
    const q = (search?.value ?? "").trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const matchCat = activeCategory === "All" || card.dataset.category === activeCategory;
      const blob = (card.dataset.name + " " + card.dataset.category).toLowerCase();
      const matchQ = !q || blob.includes(q);
      const show = matchCat && matchQ;
      card.hidden = !show;
      if (show) visible++;
    }
    if (count) {
      var msg;
      if (!visible) msg = "No templates match your search.";
      else if (!q && activeCategory === "All") msg = visible + " of " + cards.length + " templates shown";
      else msg = visible + (visible === 1 ? " template matches" : " templates match") + (q ? ' "' + q + '"' : "") + (activeCategory === "All" ? "" : " in " + activeCategory);
      // Only speak when the message actually changed — not on every keystroke.
      if (count.textContent !== msg) count.textContent = msg;
    }
    if (empty) empty.hidden = visible > 0;
    const order = sort?.value ?? "featured";
    const sorted = [...cards];
    if (order === "name-asc") sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
    if (order === "category-asc") sorted.sort((a, b) => a.dataset.category.localeCompare(b.dataset.category) || a.dataset.name.localeCompare(b.dataset.name));
    for (const card of sorted) grid.appendChild(card);
    if (empty) grid.appendChild(empty); // keep the empty panel last after re-sorting
  }

  search?.addEventListener("input", apply);
  sort?.addEventListener("change", apply);
  filtersWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    filtersWrap.querySelectorAll(".filter-pill").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    apply();
  });
  resetBtn?.addEventListener("click", () => {
    if (search) search.value = "";
    activeCategory = "All";
    filtersWrap.querySelectorAll(".filter-pill").forEach((b) => {
      const all = b.dataset.category === "All";
      b.classList.toggle("is-active", all);
      b.setAttribute("aria-pressed", String(all));
    });
    apply();
    search?.focus();
  });
})();
