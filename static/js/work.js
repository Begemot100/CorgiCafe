// static/js/app.js

// ------------------------------
// Helper: Toggle Filter Modal
// ------------------------------
function toggleFilterModal() {
  const filterButton = document.getElementById("filterButton");
  const filterModal = document.getElementById("filterModal");
  if (!filterButton || !filterModal) return;

  const rect = filterButton.getBoundingClientRect();
  filterModal.style.position = "absolute";
  filterModal.style.top = `${rect.bottom + window.scrollY + 5}px`;
  filterModal.style.left = `${rect.left + window.scrollX}px`;

  const isHidden = filterModal.classList.contains("hidden");
  filterModal.classList.toggle("hidden", !isHidden);
  filterModal.style.display = isHidden ? "block" : "none";
  filterModal.classList.toggle("active", isHidden);
}

// ------------------------------
// Filter Button & Modal Logic
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const filterButton   = document.getElementById("filterButton");
  const filterModal    = document.getElementById("filterModal");
  const customInputs   = document.getElementById("customDateInputs");
  const startDateInput = document.getElementById("startDate");
  const endDateInput   = document.getElementById("endDate");
  const applyBtn       = customInputs?.querySelector("button");

  // Initial label
  const filterNames = {
    today:       "Hoy",
    yesterday:   "Ayer",
    last7days:   "Últimos 7 días",
    last30days:  "Últimos 30 días",
    thismonth:   "Este mes",
    lastmonth:   "Mes pasado",
    personalizado: "Personalizado"
  };
  const initKey = filterButton?.dataset.currentFilter || "thismonth";
  if (filterButton) filterButton.textContent = filterNames[initKey] || filterNames.thismonth;

  customInputs.style.display = "none";

  filterButton?.addEventListener("click", e => {
    e.stopPropagation();
    toggleFilterModal();
  });

  // Clicking outside closes
  document.addEventListener("click", e => {
    if (!filterModal.contains(e.target) && e.target !== filterButton) {
      filterModal.classList.add("hidden");
      filterModal.style.display = "none";
    }
  });

  // Modal options
  document.querySelectorAll("#filterModal li").forEach(li => {
    li.addEventListener("click", e => {
      e.stopPropagation();
      const key = li.dataset.filter;
      if (!key) return;

      filterButton.textContent = filterNames[key] || filterNames.thismonth;
      filterButton.dataset.currentFilter = key;
      customInputs.style.display = (key === "personalizado") ? "block" : "none";

      // Build URL
      const url = new URL(window.location);
      url.searchParams.set("filter", key);
      if (key === "personalizado") {
        toggleFilterModal();
        startDateInput?.focus();
        return;
      } else {
        url.searchParams.delete("start_date");
        url.searchParams.delete("end_date");
      }
      toggleFilterModal();
      window.location = url;
    });
  });

  applyBtn?.addEventListener("click", () => {
    const s = startDateInput.value, e = endDateInput.value;
    if (!s || !e) {
      alert("Por favor, selecciona ambas fechas");
      startDateInput.focus();
      return;
    }
    const url = new URL(window.location);
    url.searchParams.set("filter", "personalizado");
    url.searchParams.set("start_date", s);
    url.searchParams.set("end_date", e);
    window.location = url;
  });

  // Optional <select> fallback
  document.getElementById("filterSelect")?.addEventListener("change", () => {
    const sel = document.getElementById("filterSelect").value;
    const key = sel === "custom" ? "personalizado" : sel;
    const url = new URL(window.location);
    url.searchParams.set("filter", key);
    if (key === "personalizado") {
      const s = startDateInput.value, e = endDateInput.value;
      if (s && e) {
        url.searchParams.set("start_date", s);
        url.searchParams.set("end_date", e);
      }
    } else {
      url.searchParams.delete("start_date");
      url.searchParams.delete("end_date");
    }
    window.location = url;
  });
});


// ------------------------------
// Render / Update Work Table
// ------------------------------
function updateWorkTable(employees) {
  console.log("📌 Обновляем таблицу сотрудников...", employees);
  const container = document.querySelector(".main-container");
  if (!container) return;

  container.innerHTML = "";
  if (!employees || employees.length === 0) {
    container.innerHTML = "<p class='no-data'>Нет данных для выбранного периода.</p>";
    return;
  }

  let count = 0;
  employees.forEach(empData => {
    const emp = empData.employee;
    const logs = empData.work_logs;
    if (!logs || !logs.length) return;
    count++;

    // Build HTML
    let rows = "";
    logs.forEach(log => {
      const d = new Date(log.log_date);
      const dateFmt = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
      const worked = log.worked_hours
        ? `${Math.floor(log.worked_hours)}h ${Math.round((log.worked_hours%1)*60)}min`
        : "0h 0min";

      rows += `
        <tr data-log-id="${log.id}">
          <td>${dateFmt}</td>
          <td class="check-in-time">${log.check_in_time||"--:--"}</td>
          <td class="check-out-time">${log.check_out_time||"--:--"}</td>
          <td class="worked-hours">${worked}</td>
          <td>
            <select class="holiday-select"
                    data-log-id="${log.id}"
                    data-previous-value="${log.holidays}">
              <option value="workingday" ${log.holidays==="workingday"?"selected":""}>Día laboral</option>
              <option value="paid" ${log.holidays==="paid"?"selected":""}>Pagado</option>
              <option value="unpaid" ${log.holidays==="unpaid"?"selected":""}>No pagado</option>
              <option value="weekend" ${log.holidays==="weekend"?"selected":""}>Fin de semana</option>
              <option value="baja por enfermedad" ${log.holidays==="baja por enfermedad"?"selected":""}>Baja por enfermedad</option>
              <option value="maternidad/paternidad" ${log.holidays==="maternidad/paternidad"?"selected":""}>Maternidad/paternidad</option>
              <option value="vacaciones" ${log.holidays==="vacaciones"?"selected":""}>Vacaciones</option>
              <option value="permiso no retribuido" ${log.holidays==="permiso no retribuido"?"selected":""}>Permiso no retribuido</option>
            </select>
          </td>
        </tr>`;
    });

    const html = `
      <div class="employee-section" data-group="${emp.section}">
        <div class="employee-header">
          <h2>${emp.full_name} — ${emp.position}</h2>
        </div>
        <table class="work-logs-table">
          <thead>
            <tr>
              <th>Fecha</th><th>Entrada</th><th>Salida</th><th>Total</th><th>Tipo Día</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="summary-panel">
          <p><strong>Horas totales:</strong> ${empData.summary.total_hours} h</p>
          <p><strong>Días totales:</strong> ${empData.summary.working_days}</p>
          <p><strong>Horas extra:</strong> ${empData.summary.overtime_hours} h</p>
          <p><strong>Pagadas:</strong> ${empData.summary.paid_holidays}</p>
          <p><strong>No pagadas:</strong> ${empData.summary.unpaid_holidays}</p>
        </div>
      </div>`;
    container.insertAdjacentHTML("beforeend", html);
  });

  console.log(`✅ Отображено сотрудников: ${count}`);
}
window.updateWorkTable = updateWorkTable;


// ------------------------------
// Delegate Holiday-Status Changes
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".main-container");
  if (!container) return;

  container.addEventListener("change", async e => {
    const sel = e.target;
    if (!sel.matches("select.holiday-select")) return;

    const logId = sel.dataset.logId;
    const oldVal = sel.dataset.previousValue || "workingday";
    const newVal = sel.value;
    const reset   = ["paid","unpaid","weekend"].includes(newVal);

    try {
      const res = await fetch(`/update_work_log/${logId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holiday_status: newVal,
          reset_worklog: reset
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Ошибка");

      // Update UI cells
      const tr = container.querySelector(`tr[data-log-id="${logId}"]`);
      tr.querySelector(".check-in-time").textContent  = json.updated_check_in;
      tr.querySelector(".check-out-time").textContent = json.updated_check_out;
      tr.querySelector(".worked-hours").textContent  = json.updated_worked_hours;

      // Store new for next error rollback
      sel.dataset.previousValue = newVal;

    } catch(err) {
      console.error(err);
      // rollback on error
      sel.value = oldVal;
    }
  });
});
