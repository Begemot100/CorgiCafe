document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("options-modal");
    const editModal = document.getElementById("employee-modal"); // Модальное окно редактирования
    const editForm = document.getElementById("employee-form"); // Форма редактирования

    document.querySelectorAll(".options-btn").forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation(); // Останавливаем всплытие

            const employeeId = this.getAttribute("data-id");
            console.log("Клик по троеточию, ID:", employeeId);

            // Определяем координаты кнопки
            const rect = this.getBoundingClientRect();
            const modalWidth = modal.offsetWidth || 120; // Учитываем ширину модального окна

            modal.style.top = `${rect.top + window.scrollY}px`;
            modal.style.left = `${rect.left + window.scrollX - modalWidth - 10}px`;
            modal.style.display = "block";

            // Передаем ID сотрудника в кнопки редактирования и удаления
            document.getElementById("edit-btn").setAttribute("data-id", employeeId);
            document.getElementById("delete-btn").setAttribute("data-id", employeeId);
        });
    });

    // Закрытие модального окна при клике вне его
    document.addEventListener("click", function (event) {
        if (!modal.contains(event.target) && !event.target.classList.contains("options-btn")) {
            modal.style.display = "none";
        }
    });

    // ✅ Обработчик нажатия на "Editar"
    document.getElementById("edit-btn").addEventListener("click", function () {
        const employeeId = this.getAttribute("data-id");
        console.log("Редактирование сотрудника ID:", employeeId);

        // Запрос данных о сотруднике
        fetch(`/employee/${employeeId}`)
            .then(response => response.json())
            .then(data => {
                console.log("Данные сотрудника:", data);

                // Заполняем форму данными сотрудника
                document.getElementById("full_name").value = data.full_name;
                document.getElementById("nie").value = data.nie;
                document.getElementById("position").value = data.position;
                document.getElementById("phone").value = data.phone;
                document.getElementById("email").value = data.email;
                document.getElementById("start_date").value = data.start_date;
                document.getElementById("work_start_time").value = data.work_start_time;
                document.getElementById("work_end_time").value = data.work_end_time;
                document.getElementById("days_per_week").value = data.days_per_week;

                // Сохраняем ID сотрудника в скрытое поле
                document.getElementById("employee-id").value = employeeId;

                // Открываем модальное окно
                editModal.style.display = "block";
            })
            .catch(error => console.error("Ошибка при загрузке данных:", error));
    });

    // Закрытие модального окна редактирования
    document.querySelector(".cancel-btn").addEventListener("click", function () {
        editModal.style.display = "none";
    });


    // ✅ Обработчик отправки формы редактирования
    editForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const employeeId = document.getElementById("employee-id").value;
        const formData = new FormData(event.target);

        fetch(`/edit/${employeeId}`, {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
//                alert("Сотрудник успешно обновлен!");

                // Обновляем данные на странице **без перезагрузки**
                const card = document.querySelector(`.employee-card[data-id="${employeeId}"]`);
                if (card) {
                    card.querySelector(".employee-item:nth-child(1)").textContent = formData.get("full_name");
                    card.querySelector(".employee-item:nth-child(2)").textContent = formData.get("position");
                    card.querySelector(".employee-item:nth-child(3)").textContent = formData.get("nie");
                    card.querySelector(".employee-item:nth-child(4)").textContent = formData.get("phone");
                    card.querySelector(".employee-item:nth-child(5)").textContent = formData.get("email");
                    card.querySelector(".employee-item:nth-child(6)").textContent = formData.get("start_date");
                    card.querySelector(".employee-item:nth-child(7)").textContent = formData.get("work_start_time");
                    card.querySelector(".employee-item:nth-child(8)").textContent = formData.get("work_end_time");
                    card.querySelector(".employee-item:nth-child(8)").textContent = formData.get("days_per_week");

                }

                // Закрываем модальное окно
                editModal.style.display = "none";
            } else {
//                alert("Ошибка: " + data.error);
            }
        })
        .catch(error => {
//            console.error("Ошибка:", error);
//            alert("Произошла ошибка. Попробуйте снова.");

        });
    });
    // ✅ Обработчик удаления сотрудника
    document.getElementById("delete-btn").addEventListener("click", function () {
        const employeeId = this.getAttribute("data-id");
        console.log("Удаление сотрудника ID:", employeeId);

        if (!confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
            return;
        }

        fetch(`/delete/${employeeId}`, {
            method: "POST",
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log("Сотрудник успешно удален!");

                // Удаляем карточку сотрудника из списка
                const card = document.querySelector(`.employee-card[data-id="${employeeId}"]`);
                if (card) {
                    card.remove();
                }

                // Закрываем модальное окно
                modal.style.display = "none";
            } else {
                console.error("Ошибка удаления:", data.error);
                alert("Ошибка: " + data.error);
            }
        })
        .catch(error => {
            console.error("Ошибка:", error);
//            alert("Произошла ошибка. Попробуйте снова.");
        });
    });
});


