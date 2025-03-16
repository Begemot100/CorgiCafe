//document.addEventListener("DOMContentLoaded", function () {
//    // Добавляем обработчики на элементы фильтрации
//    document.querySelectorAll(".filter-list li").forEach(item => {
//        item.addEventListener("click", function () {
//            const filterType = this.getAttribute("onclick").match(/'([^']+)'/)[1]; // Получаем тип фильтра
//            applyFilter(filterType);
//        });
//    });
//
//    // Функция запроса данных на сервер
//    window.applyFilter = function (filterType) {
//        console.log("Применяем фильтр:", filterType); // Отладка
//
//        fetch(`/work?filter=${filterType}`, {
//            method: "GET",
//            headers: {
//                "X-Requested-With": "XMLHttpRequest"
//            }
//        })
//        .then(response => response.json())
//        .then(data => {
//            console.log("Полученные данные:", data); // Отладка
//
//            if (data.success) {
//                updateWorkTable(data.employees);
//                updateSummary(data.summary);
//            } else {
//                console.error("Ошибка при обновлении данных:", data.error);
//            }
//        })
//        .catch(error => console.error("Ошибка запроса:", error));
//    };
//
//    // Функция обновления таблицы с сотрудниками
//    function updateWorkTable(employees) {
//        const container = document.querySelector(".main-container");
//        container.innerHTML = ""; // Очищаем контейнер
//
//        employees.forEach(employeeData => {
//            const employeeSection = document.createElement("div");
//            employeeSection.className = "employee-section";
//            employeeSection.setAttribute("data-group", employeeData.employee.section);
//
//            let workLogsHtml = "";
//            employeeData.work_logs.forEach(log => {
//                workLogsHtml += `
//                    <tr>
//                        <td>${log.log_date}</td>
//                        <td>${log.check_in_time}</td>
//                        <td>${log.check_out_time}</td>
//                        <td>${log.worked_hours} h</td>
//                        <td>${log.holidays}</td>
//                    </tr>
//                `;
//            });
//
//            employeeSection.innerHTML = `
//                <div class="employee-header">
//                    <h2>${employeeData.employee.full_name} - ${employeeData.employee.position}</h2>
//                </div>
//                <div class="work-logs-container">
//                    <table class="work-logs-table">
//                        <thead>
//                            <tr>
//                                <th>Fecha</th>
//                                <th>Entrada</th>
//                                <th>Salida</th>
//                                <th>Total</th>
//                                <th>Vacaciones</th>
//                            </tr>
//                        </thead>
//                        <tbody>
//                            ${workLogsHtml}
//                        </tbody>
//                    </table>
//                </div>
//            `;
//            container.appendChild(employeeSection);
//        });
//    }
//
//    // Функция обновления блока "Resumen"
//    function updateSummary(summary) {
//        document.getElementById("total-hours").textContent = summary.total_hours;
//        document.getElementById("total-days").textContent = summary.total_days;
//        document.getElementById("overtime-hours").textContent = summary.overtime;
//        document.getElementById("paid-holidays").textContent = summary.paid_holidays;
//        document.getElementById("unpaid-holidays").textContent = summary.unpaid_holidays;
//    }
//});