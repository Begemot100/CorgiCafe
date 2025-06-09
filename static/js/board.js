document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 board.js загружен!");

    // Function to update dashboard data
    function updateDashboard() {
        $.get('/dashboard_data', function (data) {
            $(".employee-row").each(function () {
                let empId = $(this).data("id");
                let employee = data.find(e => e.id == empId);

                if (employee) {
                    $(`#check-in-time-${empId}`).text(employee.check_in_time || "--:--");
                    $(`#check-out-time-${empId}`).text(employee.check_out_time || "--:--");
                    $(`#daily-hours-${empId}`).text(`Daily: ${employee.daily_hours}h`);
                    // Update button states based on fetched data
                    const checkInBtn = $(`.check-in-btn[data-id="${empId}"]`);
                    const checkOutBtn = $(`.check-out-btn[data-id="${empId}"]`);
                    checkInBtn.prop("disabled", employee.check_in_time !== "--:--").toggleClass("disabled", employee.check_in_time !== "--:--");
                    checkOutBtn.prop("disabled", employee.check_in_time === "--:--" || employee.check_out_time !== "--:--").toggleClass("disabled", employee.check_in_time === "--:--" || employee.check_out_time !== "--:--");
                }
            });
        }).fail(function (xhr, status, error) {
            console.error("Ошибка при обновлении данных!", error);
        });
    }

    // Initial update and set interval for every 5 minutes
    updateDashboard();
    setInterval(updateDashboard, 300000);

    // Handle check-in button click
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

            // Update UI
            $(`#check-in-time-${employeeId}`).text(data.check_in_time || "--:--");
            $(this).addClass("disabled").prop("disabled", true);
            $(`.check-out-btn[data-id="${employeeId}"]`).removeClass("disabled").prop("disabled", false);
            // Optionally update daily hours if provided
            if (data.daily_hours) $(`#daily-hours-${employeeId}`).text(`Daily: ${data.daily_hours}h`);
        })
        .catch(error => {
            console.error("Ошибка при check-in:", error);
            alert("An error occurred. Please try again.");
        });
    });

    // Handle check-out button click
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
                alert(data.error || "Failed to check out");
                return;
            }

            // Update UI
            $(`#check-out-time-${employeeId}`).text(data.check_out_time || "--:--");
            $(this).addClass("disabled").prop("disabled", true);
            if (data.daily_hours) $(`#daily-hours-${employeeId}`).text(`Daily: ${data.daily_hours}h`);
        })
        .catch(error => {
            console.error("Ошибка при check-out:", error);
            alert("An error occurred. Please try again.");
        });
    });
});
