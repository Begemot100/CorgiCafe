document.addEventListener("DOMContentLoaded", function() {
    const filterButton = document.getElementById("filterButton");
    const customInputs = document.getElementById("customDateInputs");

    if (!filterButton) {
        console.error("❌ Ошибка: `#filterButton` не найден в DOM.");
        return;
    }

    // Объект с названиями фильтров
    const filterNames = {
        'today': 'Hoy',
        'yesterday': 'Ayer',
        'last7days': 'Últimos 7 días',
        'last30days': 'Últimos 30 días',
        'thismonth': 'Este mes',
        'lastmonth': 'Mes pasado',
        'personalizado': 'Personalizado'
    };

    // Устанавливаем текст кнопки при загрузке страницы
    const initialFilter = filterButton.dataset.currentFilter || 'thismonth';
    filterButton.textContent = filterNames[initialFilter] || 'Este mes';

    // 📌 Функция показа/скрытия инпутов
    function toggleCustomInputs() {
        const currentFilter = filterButton.dataset.currentFilter;
        if (currentFilter === "personalizado") {
            customInputs.style.display = "block";
        } else {
            customInputs.style.display = "none";
        }
    }

    // 📌 Функция применения кастомных дат
    function applyCustomDates() {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        if (startDate && endDate) {
            filterButton.textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;
            filterButton.setAttribute("data-start-date", startDate);
            filterButton.setAttribute("data-end-date", endDate);
            filterButton.setAttribute("data-current-filter", "personalizado");

            // Получаем текущий фильтр из кнопки
            const filterType = filterButton.getAttribute("data-current-filter");

            // Обновляем URL без перезагрузки
            const url = new URL(window.location);
            url.searchParams.set("filter", filterType);
            url.searchParams.set("start_date", startDate);
            url.searchParams.set("end_date", endDate);

            console.log(`📌 Обновление страницы с фильтром: ${url.toString()}`);
            window.location = url.toString(); // Перезагружаем страницу с новым фильтром
        }
    }

    // 📌 Функция форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    // Автоматически показываем инпуты при выборе "personalizado"
    toggleCustomInputs();
});