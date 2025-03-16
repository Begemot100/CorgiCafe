// 📌 Ждём полной загрузки DOM перед выполнением кода
document.addEventListener("DOMContentLoaded", function () {
    // Получаем модальное окно и кнопки управления
    const modal = document.getElementById("employee-modal");
    const openModalBtn = document.getElementById("add-modal-btn"); // Кнопка "Nuevo empleado"
    const closeModalBtn = document.querySelector(".cancel-btn"); // Кнопка "Cancelar"

    // Проверяем, что все элементы найдены
    if (!modal || !openModalBtn || !closeModalBtn) {
        console.error("Не найдены элементы модального окна!");
        return;
    }

    // 📌 Открытие модального окна при клике на "Nuevo empleado"
    openModalBtn.addEventListener("click", function () {
        modal.style.display = "block";
    });

    // 📌 Закрытие модального окна при клике на "Cancelar"
    closeModalBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // 📌 Закрытие модального окна при клике вне его
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

// 📌 Обработчик отправки формы добавления сотрудника
document.getElementById('employee-form').addEventListener('submit', function (event) {
    console.log("Форма отправлена!");  // Проверка, вызывается ли обработчик

    event.preventDefault(); // Предотвращаем перезагрузку страницы

    const formData = new FormData(event.target);

    // 📌 Выводим в консоль отправляемые данные
    console.log("Отправка данных:", Object.fromEntries(formData));

    fetch('/add', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json()) // Преобразуем ответ в JSON
    .then(data => {
//        console.log("Ответ сервера:", data); // Выводим ответ сервера
        if (data.employee) {
            alert("Сотрудник успешно добавлен!");
        } else {
//            alert("Ошибка: " + data.error);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка. Попробуйте снова.');
    });
});