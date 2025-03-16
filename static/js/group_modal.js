document.addEventListener("DOMContentLoaded", function () {
    const groupModal = document.getElementById("groupModal");
    const groupButton = document.querySelector(".filter-btn[onclick*='openGroupModal']");

    if (!groupModal || !groupButton) {
        console.error("❌ Ошибка: Не найдено модальное окно (#groupModal) или кнопка 'Grupo'");
        return;
    }

    window.openGroupModal = function (event) {
        event.stopPropagation();

        console.log("📌 Открытие модального окна Grupo...");

        // Проверяем, найден ли элемент groupModal
        if (!groupModal) {
            console.error("❌ Ошибка: `groupModal` не найден в DOM!");
            return;
        }

        // Определяем координаты кнопки "Grupo"
        const rect = groupButton.getBoundingClientRect();

        // Размещаем модальное окно под кнопкой
        groupModal.style.position = "absolute";
        groupModal.style.top = `${rect.bottom + window.scrollY + 10}px`;
        groupModal.style.left = `${rect.left + window.scrollX}px`;

        // Отображаем модальное окно
        groupModal.classList.remove("hidden");
        groupModal.style.display = "block";

        console.log("✅ `groupModal` открыт.");
    };

    window.closeGroupModal = function () {
        console.log("📌 Закрытие модального окна Grupo...");
        groupModal.style.display = "none";
        groupModal.classList.add("hidden");
    };

    // Закрытие модального окна при клике вне его
    document.addEventListener("click", function (event) {
        if (groupModal && !groupModal.contains(event.target) && event.target !== groupButton) {
            console.log("📌 Клик вне `groupModal`, закрытие...");
            closeGroupModal();
        }
    });

    console.log("✅ `groupModal` логика загружена.");
});
document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 DOM загружен, инициализируем filterByGroup...");

    window.filterByGroup = function () {
        console.log("📌 Фильтрация сотрудников по группам...");

        const salaChecked = document.getElementById("salaCheckbox")?.checked;
        const cocinaChecked = document.getElementById("cocinaCheckbox")?.checked;

        if (salaChecked === undefined || cocinaChecked === undefined) {
            console.error("❌ Ошибка: Чекбоксы фильтра не найдены!");
            return;
        }

        document.querySelectorAll(".employee-section").forEach(section => {
            const sectionGroup = section.getAttribute("data-group");

            if (salaChecked && cocinaChecked) {
                section.style.display = "block";
            } else if (salaChecked && sectionGroup === "Sala") {
                section.style.display = "block";
            } else if (cocinaChecked && sectionGroup === "Cocina") {
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        });

        console.log("✅ Фильтрация завершена.");
    };

    // 📌 Автоматическое обновление фильтра при изменении чекбоксов
    document.querySelectorAll(".group-filter-list input").forEach(checkbox => {
        checkbox.addEventListener("change", filterByGroup);
    });

    console.log("✅ `filterByGroup` загружена и доступна.");
});
