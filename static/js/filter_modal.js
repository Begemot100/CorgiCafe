// static/js/filter.js

document.addEventListener("DOMContentLoaded", () => {
  const filterButton   = document.getElementById("filterButton");
  const filterModal    = document.getElementById("filterModal");
  const customInputs   = document.getElementById("customDateInputs");
  const startInput     = document.getElementById("startDate");
  const endInput       = document.getElementById("endDate");
  const modalListItems = filterModal.querySelectorAll("li[data-filter]");
  const applyCustomBtn = customInputs.querySelector("button");

  if (!filterButton || !filterModal) {
    console.error("❌ filterButton or filterModal missing");
    return;
  }

  const names = {
    today:        "Hoy",
    yesterday:    "Ayer",
    last7days:    "Últimos 7 días",
    last30days:   "Últimos 30 días",
    thismonth:    "Este mes",
    lastmonth:    "Mes pasado",
    personalizado:"Personalizado"
  };

  // initialize label
  const init = filterButton.dataset.currentFilter || "thismonth";
  filterButton.textContent = names[init] || names.thismonth;
  customInputs.style.display = "none";

  // show / hide modal
  function toggleModal(){
    const rect = filterButton.getBoundingClientRect();
    filterModal.style.top  = rect.bottom + window.scrollY + 5 + "px";
    filterModal.style.left = rect.left + window.scrollX + "px";
    filterModal.classList.toggle("hidden");
  }

  filterButton.addEventListener("click", e => {
    e.stopPropagation();
    toggleModal();
  });

  // click outside closes
  document.addEventListener("click", e => {
    if (!filterModal.contains(e.target) && e.target !== filterButton) {
      filterModal.classList.add("hidden");
    }
  });

  // apply a “normal” filter
  function doFilter(key){
    filterButton.textContent = names[key];
    filterButton.dataset.currentFilter = key;
    customInputs.style.display = (key === "personalizado") ? "block" : "none";

    // if personalizado – show date inputs
    if (key === "personalizado") {
      startInput.focus();
      return;
    }
    // otherwise navigate
    const u = new URL(window.location);
    u.searchParams.set("filter", key);
    u.searchParams.delete("start_date");
    u.searchParams.delete("end_date");
    window.location = u;
  }

  // list items
  modalListItems.forEach(li => {
    li.addEventListener("click", e => {
      e.stopPropagation();
      doFilter(li.dataset.filter);
      toggleModal();
    });
  });

  // apply custom dates
  applyCustomBtn.addEventListener("click", () => {
    const s = startInput.value, e = endInput.value;
    if (!s||!e) {
      alert("Por favor selecciona ambas fechas");
      startInput.focus();
      return;
    }
    const u = new URL(window.location);
    u.searchParams.set("filter","personalizado");
    u.searchParams.set("start_date",s);
    u.searchParams.set("end_date",e);
    window.location = u;
  });
});
