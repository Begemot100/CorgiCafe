// static/js/newemployee.js
document.addEventListener("DOMContentLoaded", () => {
  const modal    = document.getElementById("employee-modal");
  const openBtn  = document.getElementById("add-modal-btn");
  const closeBtn = modal.querySelector(".cancel-btn");
  const form     = document.getElementById("employee-form");
  const list     = document.querySelector(".employee-list");

  // Открыть/закрыть модалку
  openBtn .addEventListener("click",  () => modal.style.display = "block");
  closeBtn.addEventListener("click", () => modal.style.display = "none");
  window   .addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

  form.addEventListener("submit", async e => {
    e.preventDefault();

    let res, json;
    try {
      res  = await fetch(form.action, { method: form.method, body: new FormData(form) });
      json = await res.json();
    } catch(err) {
      alert("Сетевая ошибка: " + err.message);
      return;
    }

    // если сервер вернул статус 4xx/5xx
    if (!res.ok) {
      alert("Ошибка сервера: " + (json.error || json.message || res.statusText));
      return;
    }

    // теперь точно есть json.employee
    const emp = json.employee;
    if (!emp) {
      alert("Неверный ответ от сервера: " + JSON.stringify(json));
      return;
    }

    // Собираем новую карточку и вставляем в список
    const card = document.createElement("div");
    card.className      = "employee-card";
    card.dataset.id     = emp.id;
    card.dataset.section= emp.section || "";
    card.innerHTML = `
      <div class="employee-row">
        <span class="employee-item">${emp.full_name}</span>
        <span class="employee-item">${emp.position}</span>
        <span class="employee-item">${emp.nie}</span>
        <span class="employee-item">${emp.phone}</span>
        <span class="employee-item">${emp.email}</span>
        <span class="employee-item">${emp.start_date}</span>
        <span class="employee-item">${emp.work_start_time}</span>
        <span class="employee-item">${emp.work_end_time}</span>
        <button class="options-btn" data-id="${emp.id}">...</button>
      </div>`;
    list.appendChild(card);

    // Сброс и закрытие
    form.reset();
    modal.style.display = "none";
  });
});
//xc