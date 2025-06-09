document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("employee-modal");
    const openBtn = document.getElementById("add-modal-btn");
    const closeBtn = modal.querySelector(".cancel-btn");
    const form = document.getElementById("employee-form");
    const list = document.querySelector(".employee-list");
    const messageDiv = document.getElementById("message");

    openBtn.addEventListener("click", () => {
        form.reset(); // Reset all form fields
        messageDiv.innerHTML = ""; // Clear any previous messages
        modal.style.display = "block"; // Show the modal
    });

    closeBtn.addEventListener("click", () => {
        form.reset(); // Reset form on cancel
        messageDiv.innerHTML = ""; // Clear messages
        modal.style.display = "none";
    });

    window.addEventListener("click", e => {
        if (e.target === modal) {
            form.reset(); // Reset form on outside click
            messageDiv.innerHTML = ""; // Clear messages
            modal.style.display = "none";
        }
    });

    form.addEventListener("submit", async e => {
        e.preventDefault();
        messageDiv.innerHTML = "";
        try {
            const res = await fetch(form.action, {
                method: form.method,
                body: new FormData(form)
            });
            const json = await res.json();
            if (res.ok) {
                const emp = json.employee;
                if (emp) {
                    const card = document.createElement("div");
                    card.className = "employee-card";
                    card.dataset.id = emp.id;
                    card.dataset.section = emp.section || "";
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
                    messageDiv.innerHTML = `<p style="color: green;">${json.message}</p>`;
                    form.reset();
                    modal.style.display = "none";
                }
            } else {
                messageDiv.innerHTML = `<p style="color: red;">Error: ${json.error}</p>`;
            }
        } catch (err) {
            messageDiv.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
        }
    });
});