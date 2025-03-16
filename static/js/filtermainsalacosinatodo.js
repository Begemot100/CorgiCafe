document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Фильтр загружен!");

    $(".filter-btn").on("click", function () {
        const filter = $(this).data("filter").toLowerCase(); // Приводим к нижнему регистру
        console.log(`🔵 Нажата кнопка фильтрации: ${filter}`);

        $(".employee-card").each(function () {
            const section = $(this).data("section").toLowerCase(); // Тоже приводим к нижнему регистру

            if (filter === "all") {
                $(this).show();
            } else if (section === filter) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        // Удаляем активный класс у всех кнопок и добавляем только на нажатую
        $(".filter-btn").removeClass("active");
        $(this).addClass("active");
    });
});