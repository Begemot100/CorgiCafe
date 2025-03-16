document.addEventListener("DOMContentLoaded", function() {
    const filterButton = document.getElementById("filterButton");
    const filterModal = document.getElementById("filterModal");

    if (!filterButton || !filterModal) {
        console.error("❌ Ошибка: `#filterButton` или `#filterModal` не найдены в DOM.");
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

    // 📌 Функция переключения модального окна
    window.toggleFilterModal = function() {
        if (filterModal.classList.contains("hidden")) {
            // 📌 Получаем координаты кнопки и позиционируем модальное окно
            const rect = filterButton.getBoundingClientRect();
            filterModal.style.position = "absolute";
            filterModal.style.top = `${rect.bottom + window.scrollY + 5}px`;  // Отступ вниз
            filterModal.style.left = `${rect.left + window.scrollX}px`;

            // Открываем окно
            filterModal.classList.remove("hidden");
            filterModal.style.display = "block";
            filterModal.classList.add("active");
            console.log("📌 Открываем модальное окно Filter под кнопкой...");
        } else {
            // Закрываем окно
            filterModal.classList.add("hidden");
            filterModal.style.display = "none";
            filterModal.classList.remove("active");
            console.log("📌 Закрываем модальное окно Filter...");
        }
    };

    // 📌 Функция для обработки выбора фильтра
    function applyFilter(filterKey) {
        if (!filterNames[filterKey]) return;

        // Обновляем текст кнопки фильтра
        filterButton.textContent = filterNames[filterKey];

        // Сохраняем выбор в `data-` атрибуты кнопки
        filterButton.dataset.currentFilter = filterKey;
        filterButton.dataset.startDate = "";
        filterButton.dataset.endDate = "";

        // Закрываем модальное окно
        toggleFilterModal();

        // Обновляем URL (без перезагрузки страницы)
        const url = new URL(window.location);
        url.searchParams.set("filter", filterKey);
        url.searchParams.delete("start_date");
        url.searchParams.delete("end_date");

        console.log(`📌 Применяем фильтр: ${filterNames[filterKey]} (${filterKey})`);
        window.location = url.toString(); // Перезагружаем страницу с новым фильтром
    }

    // 📌 Добавляем обработчики клика по элементам списка фильтров
    document.querySelectorAll("#filterModal li").forEach(item => {
        item.addEventListener("click", function(event) {
            event.stopPropagation(); // Не закрывать модальное окно сразу
            const filterKey = this.dataset.filter;
            applyFilter(filterKey);
        });
    });

    // 📌 Обработчик для кнопки фильтра
    filterButton.addEventListener("click", function(event) {
        event.stopPropagation();
        toggleFilterModal();
    });

    // 📌 Закрытие модального окна при клике вне него
    document.addEventListener("click", function(event) {
        if (!filterModal.contains(event.target) && event.target !== filterButton) {
            filterModal.classList.add("hidden");
            filterModal.style.display = "none";
        }
    });
});

// Обновляем URL (без перезагрузки страницы)
const url = new URL(window.location);
url.searchParams.set("filter", filterSelect.value === "custom" ? "personalizado" : filterSelect.value);
if (filterSelect.value === "personalizado") {
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
} else {
    url.searchParams.delete("start_date");
    url.searchParams.delete("end_date");
}

console.log(`📌 Обновление страницы с фильтром: ${url.toString()}`);
window.location = url.toString(); // Перезагрузка страницы с новым фильтром

window.location = url.toString(); // Перезагружаем страницу с новым фильтром
