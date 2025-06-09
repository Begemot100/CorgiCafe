// ------------------------------
// Helper: Show/Hide Filter Modal
// ------------------------------
function toggleFilterModal() {
  const btn   = document.getElementById("filterButton");
  const modal = document.getElementById("filterModal");
  if (!btn || !modal) return;

  // Position the modal just below the button
  const rect = btn.getBoundingClientRect();
  modal.style.position = "absolute";
  modal.style.top  = `${rect.bottom + window.scrollY + 5}px`;
  modal.style.left = `${rect.left   + window.scrollX}px`;

  // Toggle visibility
  const hidden = modal.classList.contains("hidden");
  modal.classList.toggle("hidden", !hidden);
  modal.style.display = hidden ? "block" : "none";
  modal.classList.toggle("active", hidden);
}

// ------------------------------
// Global click delegation
// ------------------------------
document.addEventListener("click", e => {
  const target = e.target;

  // 1) Clicking the filter button
  if (target.matches("#filterButton")) {
    e.stopPropagation();
    toggleFilterModal();
    return;
  }

  // 2) Clicking a filter option inside the modal
  if (target.matches("#filterModal li")) {
    e.stopPropagation();
    const key = target.dataset.filter;
    if (!key) return;

    const names = {
      today:       "Hoy",
      yesterday:   "Ayer",
      last7days:   "Últimos 7 días",
      last30days:  "Últimos 30 días",
      thismonth:   "Este mes",
      lastmonth:   "Mes pasado",
      personalizado: "Personalizado"
    };

    const btn = document.getElementById("filterButton");
    btn.textContent = names[key] || names.thismonth;
    btn.dataset.currentFilter = key;

    const custom = document.getElementById("customDateInputs");
    custom.style.display = key === "personalizado" ? "block" : "none";

    const url = new URL(window.location);
    url.searchParams.set("filter", key);
    if (key !== "personalizado") {
      url.searchParams.delete("start_date");
      url.searchParams.delete("end_date");
    }

    toggleFilterModal();
    if (key !== "personalizado") window.location = url;
    return;
  }

  // 3) Click outside the filter modal = close it
  const modal = document.getElementById("filterModal");
  const btn   = document.getElementById("filterButton");
  if (modal && !modal.contains(target) && target !== btn) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
});

// ------------------------------
// Custom Date Range "Aplicar" button logic
// ------------------------------
document.addEventListener("click", e => {
  if (!e.target.matches("#customDateInputs button")) return;

  const start = document.getElementById("startDate").value;
  const end   = document.getElementById("endDate").value;

  if (!start || !end) {
    alert("Por favor, selecciona ambas fechas");
    return;
  }

  const url = new URL(window.location);
  url.searchParams.set("filter", "personalizado");
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  window.location = url;
});

// ------------------------------
// Render employee work logs to the DOM
// ------------------------------
function updateWorkTable(employees) {
  const container = document.querySelector(".main-container");
  if (!container) return;
  container.innerHTML = "";

  if (!employees.length) {
    container.innerHTML = "<p class='no-data'>Нет данных для выбранного периода.</p>";
    return;
  }

  employees.forEach(empData => {
    const emp  = empData.employee;
    const logs = empData.work_logs;
    if (!logs.length) return;

    let rows = "";
    logs.forEach(log => {
      const d = new Date(log.log_date);
      const dateFmt = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
      const worked = log.worked_hours
        ? `${Math.floor(log.worked_hours)}h ${Math.round((log.worked_hours%1)*60)}min`
        : "0h 0min";

      rows += `
        <tr data-log-id="${log.id}">
          <td>${dateFmt}</td>
          <td class="check-in-time">${log.check_in_time||"--:--"}</td>
          <td class="check-out-time">${log.check_out_time||"--:--"}</td>
          <td class="worked-hours">${worked}</td>
          <td>
            <select class="holiday-select" data-log-id="${log.id}" data-previous="${log.holidays}">
              <option value="workingday"   ${log.holidays==="workingday"?"selected":""}>Día laboral</option>
              <option value="paid"         ${log.holidays==="paid"?"selected":""}>Pagado</option>
              <option value="unpaid"       ${log.holidays==="unpaid"?"selected":""}>No pagado</option>
              <option value="weekend"      ${log.holidays==="weekend"?"selected":""}>Fin de semana</option>
              <option value="vacaciones"   ${log.holidays==="vacaciones"?"selected":""}>Vacaciones</option>
            </select>
          </td>
        </tr>`;
    });

    container.insertAdjacentHTML("beforeend", `
      <div class="employee-section" data-group="${emp.section}">
        <h2>${emp.full_name} — ${emp.position}</h2>
        <table class="work-logs-table">
          <thead>
            <tr><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Total</th><th>Tipo Día</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`);
  });
}
window.updateWorkTable = updateWorkTable;

// ------------------------------
// Handle status change on holiday type (select)
// ------------------------------
document.addEventListener("change", async e => {
  const sel = e.target;
  if (!sel.matches("select.holiday-select")) return;

  const logId = sel.dataset.logId;
  const oldVal = sel.dataset.previous;
  const newVal = sel.value;
  const reset  = ["paid","unpaid","weekend"].includes(newVal);

  try {
    const res = await fetch(`/update_work_log/${logId}`, {
      method:  "POST",
      headers: {"Content-Type":"application/json"},
      body:    JSON.stringify({holiday_status:newVal, reset_worklog:reset})
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.message||"Update failed");

    const row = document.querySelector(`tr[data-log-id="${logId}"]`);
    row.querySelector(".check-in-time").textContent  = json.updated_check_in;
    row.querySelector(".check-out-time").textContent = json.updated_check_out;
    row.querySelector(".worked-hours").textContent   = json.updated_worked_hours;

    sel.dataset.previous = newVal;
  } catch(err) {
    console.error(err);
    sel.value = oldVal; // rollback if error
  }
});

// ------------------------------
// Show/Hide employee filter dropdown
// ------------------------------
function toggleEmployeeDropdown(event) {
  const dropdown = document.getElementById("employeeDropdown");
  dropdown.classList.toggle("hidden");
}

// ------------------------------
// Apply employee filter (manual mode — no longer used)
// ------------------------------
function applyEmployeeFilter() {
  const checkboxes = document.querySelectorAll(".employee-filter-checkbox");
  const selectedIds = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const allSections = document.querySelectorAll(".employee-section");
  allSections.forEach(section => {
    const employeeId = section.querySelector(".employee-checkbox").id.split("_")[1];
    section.style.display = selectedIds.includes(employeeId) ? "block" : "none";
  });

  document.getElementById("employeeDropdown").classList.add("hidden");
}

// ------------------------------
// Auto-filter on checkbox click (live filtering)
// ------------------------------
function filterEmployees() {
  const checkboxes = document.querySelectorAll(".employee-filter-checkbox");
  const selectedIds = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const allSections = document.querySelectorAll(".employee-section");
  allSections.forEach(section => {
    const employeeId = section.querySelector(".employee-checkbox").id.split("_")[1];
    if (selectedIds.length === 0 || selectedIds.includes(employeeId)) {
      section.style.display = "block";
    } else {
      section.style.display = "none";
    }
  });
}

// ------------------------------
// Hide dropdown when clicking outside of it
// ------------------------------
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('employeeDropdown');
  const button = document.querySelector('button[onclick="toggleEmployeeDropdown(event)"]');

  if (!dropdown || !button) return;

  const isClickInsideDropdown = dropdown.contains(event.target);
  const isClickOnButton = button.contains(event.target);

  if (!isClickInsideDropdown && !isClickOnButton) {
    dropdown.classList.add('hidden');
  }
});
