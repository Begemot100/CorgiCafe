document.addEventListener("DOMContentLoaded", function () {
    const filterButton = document.getElementById("filterButton");
    const filterModal = document.getElementById("filterModal");
    const customInputs = document.getElementById("customDateInputs");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const exportButton = document.getElementById("exportButton");

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

        filterButton.dataset.startDate = startDate;
        filterButton.dataset.endDate = endDate;
        filterButton.dataset.currentFilter = "personalizado";

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

    if (exportButton) {
        exportButton.addEventListener("click", function () {
            const filterType = filterButton.dataset.currentFilter;
            const startDate = filterButton.dataset.startDate || null;
            const endDate = filterButton.dataset.endDate || null;

            if (filterType === "personalizado" && (!startDate || !endDate)) {
                alert("Выберите даты для экспорта персонализированного фильтра");
                return;
            }

            const selectedEmployees = Array.from(document.querySelectorAll(".round-checkbox.employee-checkbox:checked"))
                .map(checkbox => checkbox.id.replace("employee_", ""));

            if (selectedEmployees.length === 0) {
                alert("Выберите сотрудников для экспорта");
                return;
            }

            const requestData = {
                selectedEmployees: selectedEmployees,
                filterType: filterType,
                startDate: startDate,
                endDate: endDate,
                statusFilter: document.getElementById("statusFilter")?.value || null,
                sortByDate: true
            };

            fetch("/export_excel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                if (!response.ok) throw new Error("Ошибка при загрузке файла");
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "filtered_employee_logs.xlsx";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error("❌ Ошибка экспорта:", error));
        });
    }
});

