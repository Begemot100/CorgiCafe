// Define updateWorkTable globally
function updateWorkTable(employees) {
    console.log("📌 Обновляем таблицу сотрудников...", employees);

    const container = document.querySelector(".main-container");
    if (!container) {
        console.error("❌ Ошибка: контейнер для сотрудников не найден.");
        return;
    }

    container.innerHTML = ""; // Очищаем контейнер перед обновлением

    // Проверяем, есть ли сотрудники в данных
    if (!employees || employees.length === 0) {
        console.warn("⚠️ Нет данных для отображения сотрудников.");
        container.innerHTML = "<p class='no-data'>Нет данных для выбранного периода.</p>";
        return;
    }

    let visibleEmployees = 0;
    employees.forEach(employeeData => {
        if (!employeeData || !employeeData.employee) {
            console.error("❌ Ошибка: некорректные данные сотрудника", employeeData);
            return;
        }

        // Проверяем, есть ли логи для этого сотрудника в выбранном диапазоне
        if (!employeeData.work_logs || employeeData.work_logs.length === 0) {
            console.log(`⚠️ Сотрудник ${employeeData.employee.full_name} не имеет логов в выбранном диапазоне. Пропускаем.`);
            return;
        }

        console.log("👤 Обрабатываем сотрудника:", employeeData.employee.full_name);
        visibleEmployees++;

        const employeeSection = document.createElement("div");
        employeeSection.className = "employee-section";
        employeeSection.setAttribute("data-group", employeeData.employee.section);

        let workLogsHtml = "";
        employeeData.work_logs.forEach(log => {
            console.log(`📅 Дата: ${log.log_date}, часы: ${log.worked_hours}`);
            // Форматируем дату в формат DD/MM/YYYY
            const logDate = new Date(log.log_date);
            const formattedDate = `${logDate.getDate().toString().padStart(2, '0')}/${(logDate.getMonth() + 1).toString().padStart(2, '0')}/${logDate.getFullYear()}`;
            const workedHours = log.worked_hours ? `${Math.floor(log.worked_hours)}h ${Math.round((log.worked_hours % 1) * 60)}min` : '0h 0min';
            workLogsHtml += `
                <tr class="log-row-${employeeData.employee.id}">
                    <td>${formattedDate}</td>
                    <td>${log.check_in_time || "--:--"}</td>
                    <td>${log.check_out_time || "--:--"}</td>
                    <td>${workedHours}</td>
                    <td>
                        <select onchange="updateHolidayStatus(this.dataset.logId, this)"
                                data-log-id="${log.id}"
                                data-employee-id="${employeeData.employee.id}"
                                id="holiday-select-${log.id}">
                            <option value="workingday" ${log.holidays === 'workingday' ? 'selected' : ''}>Día laboral</option>
                            <option value="paid" ${log.holidays === 'paid' ? 'selected' : ''}>Pagado</option>
                            <option value="unpaid" ${log.holidays === 'unpaid' ? 'selected' : ''}>No pagado</option>
                            <option value="weekend" ${log.holidays === 'weekend' ? 'selected' : ''}>Fin de semana</option>
                            <option value="baja por enfermedad" ${log.holidays === 'baja por enfermedad' ? 'selected' : ''}>Baja por enfermedad</option>
                            <option value="maternidad/paternidad" ${log.holidays === 'maternidad/paternidad' ? 'selected' : ''}>Maternidad/paternidad</option>
                            <option value="vacaciones" ${log.holidays === 'vacaciones' ? 'selected' : ''}>Vacaciones</option>
                            <option value="permiso no retribuido" ${log.holidays === 'permiso no retribuido' ? 'selected' : ''}>Permiso no retribuido</option>
                        </select>
                    </td>
                    <td class="checkbox-cell hidden">
                        <input type="checkbox" class="worklog-checkbox" value="${log.id}" id="log-${log.id}">
                    </td>
                </tr>
            `;
        });

        employeeSection.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" class="round-checkbox employee-checkbox" id="employee_${employeeData.employee.id}" />
            </div>
            <div class="employee-header">
                <h2>${employeeData.employee.full_name} - ${employeeData.employee.position}</h2>
            </div>
            <div class="logs-summary-container">
                <div class="work-logs-container" id="logs-container-${employeeData.employee.id}">
                    <table class="work-logs-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Total</th>
                                <th>Vacaciones</th>
                                <th class="checkbox-column hidden">Seleccionar</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workLogsHtml}
                        </tbody>
                    </table>
                    <div class="action-buttons hidden" id="action-buttons-${employeeData.employee.id}">
                        <button class="select-all-btn" onclick="selectAllEmployeeCheckboxes('${employeeData.employee.id}')">Todo</button>
                        <button class="new-schedule-btn" onclick="openNewScheduleModal()">Aleatorio</button>
                        <button class="delete-log-btn" onclick="deleteSelectedWorkLog('${employeeData.employee.id}')">Eliminar seleccionados</button>
                    </div>
                </div>
                <div class="summary-panel">
                    <h3>Resumen</h3>
                    <p><strong>Horas totales:</strong> <span class="total-hours">${employeeData.summary.total_hours}</span> h</p>
                    <p><strong>Días totales:</strong> <span class="total-days">${employeeData.summary.working_days}</span></p>
                    <p><strong>Horas extras:</strong> <span class="overtime-hours">${employeeData.summary.overtime_hours}</span> h</p>
                    <div class="holiday-status">
                        <p>Vacaciones pagadas: <span class="paid-holidays badge yellow">${employeeData.summary.paid_holidays}</span></p>
                        <p>Vacaciones no pagadas: <span class="unpaid-holidays badge orange">${employeeData.summary.unpaid_holidays}</span></p>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(employeeSection);
    });

    console.log(`✅ Таблица сотрудников успешно обновлена. Отображено сотрудников: ${visibleEmployees}`);
}

// Ensure the function is available globally
window.updateWorkTable = updateWorkTable;

// Additional event listeners or initialization if needed
document.getElementById('filterButton').addEventListener('click', function() {
    toggleFilterModal(this);
});

window.updateHolidayStatus = function(selectElement, employeeId) {
    const logId = selectElement.dataset.logId;
    const newHolidayStatus = selectElement.value;
    const previousValue = selectElement.dataset.previousValue;

    console.log(`🟡 Выбран logId=${logId}, новый статус: ${newHolidayStatus}`);

    if (!logId) {
        console.error("❌ Ошибка: logId не найден.");
        return;
    }

    $.ajax({
        url: `/update_work_log/${logId}`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            holiday_status: newHolidayStatus,
            employee_id: employeeId,
            reset_worklog: newHolidayStatus === "paid" || newHolidayStatus === "unpaid" || newHolidayStatus === "weekend"
        }),
        success: function(response) {
            if (response.success) {
                console.log(`✅ Статус обновлён: ${response.updated_holiday_status}`);

                // 🔄 Обновляем поле, чтобы после перезагрузки не сбрасывалось
                selectElement.dataset.previousValue = response.updated_holiday_status;
                selectElement.value = response.updated_holiday_status;  // <-- Это фиксит сброс

                updateSummaryPanel(employeeId, response.summary);

                if (response.reset) {
                    const row = selectElement.closest("tr");
                    row.querySelector(".check-in-time").textContent = "--:--";
                    row.querySelector(".check-out-time").textContent = "--:--";
                    row.querySelector(".worked-hours").textContent = "0h 0min";
                    console.log(`✅ Work log обнулён для log ${logId}`);
                }
            } else {
                console.error(`❌ Ошибка: ${response.message}`);
                selectElement.value = previousValue;  // <-- Возвращаем предыдущее значение
            }
        },
        error: function(xhr, status, error) {
            console.error(`❌ Ошибка AJAX: ${error} (Status: ${xhr.status})`);
            selectElement.value = previousValue;  // <-- Если ошибка, не сбрасываем
        }
    });
};
document.getElementById('randomForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const startRangeMin = document.getElementById('startRangeMin').value;
    const startRangeMax = document.getElementById('startRangeMax').value;
    const endRangeMin = document.getElementById('endRangeMin').value;
    const endRangeMax = document.getElementById('endRangeMax').value;

    console.log(`📌 Рандомизация диапазонов: Entrada: ${startRangeMin} - ${startRangeMax}, Salida: ${endRangeMin} - ${endRangeMax}`);

    const selectedLogIds = window.selectedLogIds || [];
    console.log(`📌 Выбранные лог-ID: ${selectedLogIds}`);

    selectedLogIds.forEach(logId => {
        const randomCheckIn = generateRandomTime(startRangeMin, startRangeMax);
        const randomCheckOut = generateRandomTime(endRangeMin, endRangeMax);
        const employeeId = document.querySelector(`#holiday-select-${logId}`).dataset.employeeId;

        console.log(`📌 Обновление log ${logId}, сотрудник ${employeeId}: Check-in: ${randomCheckIn}, Check-out: ${randomCheckOut}`);

        $.ajax({
            url: `/update_work_log/${logId}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                holiday_status: 'workingday',
                check_in_time: randomCheckIn,
                check_out_time: randomCheckOut,
                employee_id: employeeId,
                reset_worklog: false
            }),
            success: function(response) {
                if (response.success) {
                    console.log(`✅ Рандомные времена обновлены для log ${logId}`);

                    // 📌 Обновляем UI без перезагрузки
                    const row = document.querySelector(`.log-row-${employeeId}[data-log-id="${logId}"]`);
                    if (row) {
                        row.querySelector(".check-in-time").textContent = response.updated_check_in;
                        row.querySelector(".check-out-time").textContent = response.updated_check_out;
                        row.querySelector(".worked-hours").textContent = response.updated_worked_hours;
                    } else {
                        console.warn(`⚠️ Не найдена строка для log ${logId} в UI`);
                    }
                } else {
                    console.error(`❌ Ошибка: ${response.message}`);
                }
            },
            error: function(xhr, status, error) {
                console.error(`❌ Ошибка AJAX: ${error} (Status: ${xhr.status})`);
            }
        });
    });

    closeRandomModal();
});

function updateWorkLogInUI(response) {
    const logRow = document.querySelector(`tr[data-log-id="${response.log_id}"]`);

    if (logRow) {
        logRow.querySelector(".check-in-time").textContent = response.updated_check_in;
        logRow.querySelector(".check-out-time").textContent = response.updated_check_out;
        logRow.querySelector(".worked-hours").textContent = response.updated_worked_hours;

        // 📌 Устанавливаем статус "Día laboral"
        const holidaySelect = logRow.querySelector(`#holiday-select-${response.log_id}`);
        if (holidaySelect) {
            holidaySelect.value = "workingday";
            console.log(`✅ Статус обновлен на "Día laboral" для log ${response.log_id}`);
        }
    } else {
        console.error(`❌ Ошибка: не найден log ${response.log_id} в DOM.`);
    }
}
// 📌 Обновление ворклогов без перезагрузки
function refreshWorkLogs() {
    fetch("/get_work_logs")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sortLogsByDate(data.logs);
                renderLogs(data.logs);
            } else {
                console.error("❌ Ошибка при получении ворклогов:", data.message);
            }
        })
        .catch(error => console.error("❌ Ошибка загрузки ворклогов:", error));
}

document.querySelectorAll('.holiday-select').forEach(select => {
  select.addEventListener('change', async function() {
    const row = this.closest('tr');
    const logId = row.getAttribute('data-log-id');
    const holidayStatus = this.value;
    // если нужно сбросить — можно передавать true
    const reset = ['paid','unpaid','weekend'].includes(holidayStatus);

    try {
      const res = await fetch(`/update_work_log/${logId}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          holiday_status: holidayStatus,
          reset_worklog: reset
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message||'Ошибка на сервере');

      // обновляем ячейки в строке
      row.querySelector('.check-in').textContent  = json.updated_check_in;
      row.querySelector('.check-out').textContent = json.updated_check_out;
      row.querySelector('.worked-hours').textContent = json.updated_worked_hours;

    } catch(err) {
      console.error(err);
      alert('Не удалось обновить запись: ' + err.message);
    }
  });
});
