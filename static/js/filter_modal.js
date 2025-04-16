document.addEventListener("DOMContentLoaded", function () {
    const filterButton = document.getElementById("filterButton");
    const filterModal = document.getElementById("filterModal");
    const customInputs = document.getElementById("customDateInputs");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    if (!filterButton || !filterModal) {
        console.error("❌ Ошибка: `#filterButton` или `#filterModal` не найдены в DOM.");
        return;
    }

    const filterNames = {
        'today': 'Hoy',
        'yesterday': 'Ayer',
        'last7days': 'Últimos 7 días',
        'last30days': 'Últimos 30 días',
        'thismonth': 'Este mes',
        'lastmonth': 'Mes pasado',
        'personalizado': 'Personalizado'
    };

    const initialFilter = filterButton.dataset.currentFilter || 'thismonth';
    filterButton.textContent = filterNames[initialFilter] || 'Este mes';

    customInputs.style.display = "none";

    window.toggleFilterModal = function () {
        const rect = filterButton.getBoundingClientRect();
        filterModal.style.position = "absolute";
        filterModal.style.top = `${rect.bottom + window.scrollY + 5}px`;
        filterModal.style.left = `${rect.left + window.scrollX}px`;

        const isHidden = filterModal.classList.contains("hidden");
        filterModal.classList.toggle("hidden", !isHidden);
        filterModal.style.display = isHidden ? "block" : "none";
        filterModal.classList.toggle("active", isHidden);
    };

    function applyFilter(filterKey) {
        if (!filterNames[filterKey]) return;

        filterButton.textContent = filterNames[filterKey];
        filterButton.dataset.currentFilter = filterKey;
        filterButton.dataset.startDate = "";
        filterButton.dataset.endDate = "";

        if (filterKey === "personalizado") {
            customInputs.style.display = "block";
            startDateInput?.focus();
            toggleFilterModal();
            return;
        } else {
            customInputs.style.display = "none";
        }

        toggleFilterModal();

        const url = new URL(window.location);
        url.searchParams.set("filter", filterKey);
        url.searchParams.delete("start_date");
        url.searchParams.delete("end_date");

        console.log(`📌 Применяем фильтр: ${filterNames[filterKey]} (${filterKey})`);
        window.location = url.toString();
    }

    function applyCustomDates() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert("Por favor, selecciona ambas fechas");
            startDateInput?.focus();
            return;
        }

        const url = new URL(window.location);
        url.searchParams.set("filter", "personalizado");
        url.searchParams.set("start_date", startDate);
        url.searchParams.set("end_date", endDate);

        console.log(`📌 Aplicando filtro personalizado: ${startDate} a ${endDate}`);
        window.location = url.toString();
    }

    filterButton.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleFilterModal();
    });

    document.querySelectorAll("#filterModal li").forEach(item => {
        item.addEventListener("click", function (event) {
            event.stopPropagation();
            const filterKey = this.dataset.filter;
            applyFilter(filterKey);
        });
    });

    document.addEventListener("click", function (event) {
        if (!filterModal.contains(event.target) && event.target !== filterButton) {
            filterModal.classList.add("hidden");
            filterModal.style.display = "none";
        }
    });

    const applyBtn = customInputs.querySelector("button");
    if (applyBtn) {
        applyBtn.addEventListener("click", applyCustomDates);
    }

    const filterSelect = document.getElementById("filterSelect");
    if (filterSelect) {
        filterSelect.addEventListener("change", () => {
            const url = new URL(window.location);
            const selected = filterSelect.value === "custom" ? "personalizado" : filterSelect.value;
            url.searchParams.set("filter", selected);

            if (selected === "personalizado") {
                const start = startDateInput?.value;
                const end = endDateInput?.value;
                if (start && end) {
                    url.searchParams.set("start_date", start);
                    url.searchParams.set("end_date", end);
                }
            } else {
                url.searchParams.delete("start_date");
                url.searchParams.delete("end_date");
            }

            console.log(`📌 Обновление страницы с фильтром: ${url.toString()}`);
            window.location = url.toString();
        });
    }
});
