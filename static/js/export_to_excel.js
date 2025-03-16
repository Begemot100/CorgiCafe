document.getElementById("exportButton").addEventListener("click", function () {
    const filterButton = document.getElementById("filterButton");
    const filterType = filterButton.dataset.currentFilter;
    const startDate = filterButton.dataset.startDate || null;
    const endDate = filterButton.dataset.endDate || null;

    const selectedEmployees = Array.from(document.querySelectorAll(".round-checkbox.employee-checkbox:checked"))
        .map(checkbox => checkbox.id.replace("employee_", ""));

    if (selectedEmployees.length === 0) {
        alert("Выберите сотрудников для экспорта");
        return;
    }

    const requestData = {
        selectedEmployees: selectedEmployees,
        filterType: filterType,
        startDate: startDate,
        endDate: endDate,
    };

    fetch("/export_excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) throw new Error("Ошибка при загрузке файла");
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "filtered_employee_logs.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => console.error("❌ Ошибка экспорта:", error));
});
