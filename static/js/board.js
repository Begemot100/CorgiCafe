function updateDashboard() {
    $.get('/dashboard_data', function (data) {
        $(".employee-row").each(function () {
            let empId = $(this).data("id");
            let employee = data.find(e => e.id == empId);

            if (employee) {
                $(`#check-in-time-${empId}`).text(employee.check_in_time || "--:--");
                $(`#check-out-time-${empId}`).text(employee.check_out_time || "--:--");
                $(`#daily-hours-${empId}`).text(`Daily: ${employee.daily_hours}h`);
            }
        });
    }).fail(function () {
        console.error("Ошибка при обновлении данных!");
    });
}

// Обновление каждые 5 минут
setInterval(updateDashboard, 300000);
updateDashboard();

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 board.js загружен!");

    // Добавляем обработчик клика на кнопку "Entrada"
    $(".check-in-btn").on("click", function () {
        const employeeId = $(this).data("id");
        console.log(`🔵 Нажата кнопка "Entrada" для ID ${employeeId}`);

        fetch(`/check_in/${employeeId}`, {
            method: "POST",
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Ответ сервера:", data);

            if (data.error) {
                alert("Ошибка: " + data.error);
                return;
            }

            // Обновляем интерфейс
            $(`#check-in-time-${employeeId}`).text(data.check_in_time);
            $(this).addClass("disabled").prop("disabled", true);
            $(`.check-out-btn[data-id="${employeeId}"]`).removeClass("disabled").prop("disabled", false);
        })
        .catch(error => {
            console.error("Ошибка при check-in:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        });
    });

    // Добавляем обработчик клика на кнопку "Salida"
    $(".check-out-btn").on("click", function () {
        const employeeId = $(this).data("id");
        console.log(`🔴 Нажата кнопка "Salida" для ID ${employeeId}`);

        fetch(`/check_out/${employeeId}`, {
            method: "POST",
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Ответ сервера:", data);

            if (data.error) {
                alert("Ошибка: " + data.error);
                return;
            }

            // Обновляем интерфейс
            $(`#check-out-time-${employeeId}`).text(data.check_out_time);
            $(this).addClass("disabled").prop("disabled", true);
            $(`#daily-hours-${employeeId}`).text(`Daily: ${data.daily_hours}h`);
        })
        .catch(error => {
            console.error("Ошибка при check-out:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        });
    });
});