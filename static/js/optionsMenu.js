document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("options-modal");
    const editModal = document.getElementById("edit-employee-modal");
    const editForm = document.getElementById("edit-employee-form");

    document.querySelectorAll(".options-btn").forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            const employeeId = this.getAttribute("data-id");
            console.log("Клик по троеточию, ID:", employeeId);
            const rect = this.getBoundingClientRect();
            const modalWidth = modal.offsetWidth || 120;
            modal.style.top = `${rect.top + window.scrollY}px`;
            modal.style.left = `${rect.left + window.scrollX - modalWidth - 10}px`;
            modal.style.display = "block";
            document.getElementById("edit-btn").setAttribute("data-id", employeeId);
            document.getElementById("delete-btn").setAttribute("data-id", employeeId);
        });
    });

    document.addEventListener("click", function (event) {
        if (!modal.contains(event.target) && !event.target.classList.contains("options-btn")) {
            modal.style.display = "none";
        }
    });

    document.getElementById("edit-btn").addEventListener("click", function () {
        const employeeId = this.getAttribute("data-id");
        console.log("Редактирование сотрудника ID:", employeeId);
        modal.style.display = "none";
        fetch(`/employee/${employeeId}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("Данные сотрудника:", data);
                if (!data || !data.id) throw new Error("Invalid employee data");
                editForm.action = `/employee/edit/${data.id}`;
                editForm.querySelector("#employee-id").value = data.id || "";
                editForm.querySelector("#edit-full-name").value = data.full_name || "";
                editForm.querySelector("#edit-nie").value = data.nie || "";
                editForm.querySelector("#edit-start-date").value = data.start_date || "";
                editForm.querySelector("#edit-end-date").value = data.end_date || "";
                editForm.querySelector("#edit-work-start-time").value = data.work_start_time || "";
                editForm.querySelector("#edit-work-end-time").value = data.work_end_time || "";
                editForm.querySelector("#edit-days-per-week").value = data.days_per_week !== null ? data.days_per_week : "";
                editForm.querySelector("#edit-position").value = data.position || "";
                editForm.querySelector("#edit-section").value = data.section || "";
                editForm.querySelector("#edit-phone").value = data.phone || "";
                editForm.querySelector("#edit-email").value = data.email || "";
                document.getElementById("edit-message").innerHTML = "";
                editModal.style.display = "block";
            })
            .catch(error => {
                console.error("Ошибка при загрузке данных:", error);
                document.getElementById("edit-message").innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            });
    });

    // Add event listener for the new close button
    document.getElementById("close-edit-modal").addEventListener("click", function () {
        editModal.style.display = "none";
    });

    document.querySelector(".cancel-btn").addEventListener("click", function () {
        editModal.style.display = "none";
    });

    editForm.addEventListener("submit", async e => {
    e.preventDefault();
    editMessageDiv.innerHTML = "";
    try {
        const res = await fetch(editForm.action, {
            method: editForm.method,
            body: new FormData(editForm)
        });
        let json;
        try {
            json = await res.json();
        } catch (parseError) {
            throw new Error("Invalid JSON response: " + parseError.message);
        }
        if (res.ok) {
            const employeeId = editForm.querySelector("#employee-id").value;
            const card = document.querySelector(`.employee-card[data-id="${employeeId}"]`);
            if (card) {
                card.querySelector(".employee-item:nth-child(1)").textContent = editForm.querySelector("#edit-full-name").value || "";
                card.querySelector(".employee-item:nth-child(2)").textContent = editForm.querySelector("#edit-position").value || "";
                card.querySelector(".employee-item:nth-child(3)").textContent = editForm.querySelector("#edit-nie").value || "";
                card.querySelector(".employee-item:nth-child(4)").textContent = editForm.querySelector("#edit-phone").value || "";
                card.querySelector(".employee-item:nth-child(5)").textContent = editForm.querySelector("#edit-email").value || "";
                card.querySelector(".employee-item:nth-child(6)").textContent = editForm.querySelector("#edit-start-date").value || "";
                card.querySelector(".employee-item:nth-child(7)").textContent = editForm.querySelector("#edit-work-start-time").value || "";
                card.querySelector(".employee-item:nth-child(8)").textContent = editForm.querySelector("#edit-work-end-time").value || "";
                const daysPerWeek = editForm.querySelector("#edit-days-per-week").value;
                if (daysPerWeek) card.querySelector(".employee-item:nth-child(9)")?.textContent = daysPerWeek || "";
            }
            editMessageDiv.innerHTML = `<p style="color: green;">${json.message}</p>`;
            resetModal(editForm, editMessageDiv);
            editModal.style.display = "none";
        } else {
            editMessageDiv.innerHTML = `<p style="color: red;">Error: ${json.error || `HTTP ${res.status} - ${res.statusText}`}</p>`;
        }
    } catch (err) {
        editMessageDiv.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
});

    document.getElementById("delete-btn").addEventListener("click", function () {
        const employeeId = this.getAttribute("data-id");
        console.log("Удаление сотрудника ID:", employeeId);
        if (!confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
            return;
        }
        fetch(`/employee/delete/${employeeId}`, {
            method: "POST",
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log("Сотрудник успешно удален!");
                const card = document.querySelector(`.employee-card[data-id="${employeeId}"]`);
                if (card) card.remove();
                modal.style.display = "none";
            } else {
                console.error("Ошибка удаления:", data.error);
                alert("Ошибка: " + data.error);
            }
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        });
    });
});
