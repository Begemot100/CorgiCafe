  // Глобальные функции, доступные для onchange
        window.updateSelectBackground = function(selectElement) {
            console.log(`Обновление фона для select с value: ${selectElement.value}`);
            selectElement.style.backgroundColor = '';
            selectElement.style.color = '';
            switch (selectElement.value) {
                case 'paid':
                    selectElement.style.backgroundColor = '#FEDB5B';
                    selectElement.style.color = '#000';
                    break;
                case 'unpaid':
                    selectElement.style.backgroundColor = '#DD8137';
                    selectElement.style.color = '#FFF';
                    break;
                case 'weekend':
                    selectElement.style.backgroundColor = '#A6A6A6';
                    selectElement.style.color = '#FFF';
                    break;
                default:
                    break;
            }
        };
        function sortLogsByDate(logs) {
            logs.sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
        }

        window.updateHolidayStatus = function(selectElement, employeeId) {
            const logId = selectElement.dataset.logId;
            const newHolidayStatus = selectElement.value;
            const previousValue = selectElement.dataset.previousValue;
            console.log(`🟡 Выбран logId=${logId}, employeeId=${employeeId}, новый статус: ${newHolidayStatus}`);

    if (!logId) {
        console.error("❌ Ошибка: logId не найден в dataset.");
        return;
    }

            // Получаем текущий фильтр и даты из #filterButton
            const filterButton = document.getElementById('filterButton');
            const currentFilter = filterButton.dataset.currentFilter;
            const startDate = filterButton.dataset.startDate;
            const endDate = filterButton.dataset.endDate;

            console.log(`Обновление статуса отпуска для log ${logId}, filter: ${currentFilter}, start: ${startDate}, end: ${endDate}`);

            // Проверяем, требуется ли подтверждение
            if (currentFilter === 'thismonth' && newHolidayStatus === 'paid') {
                if (!confirm('¿Estás seguro? Esto reiniciará el registro de trabajo.')) {
                    selectElement.value = previousValue;
                    updateSelectBackground(selectElement);
                    console.log(`Отмена: Статус возвращен к ${previousValue} для фильтра ${currentFilter}`);
                    return;
                }
                console.log(`Подтверждено изменение на Pagado для фильтра ${currentFilter}`);
            } else if (newHolidayStatus === 'paid' || newHolidayStatus === 'unpaid') {
                if (!confirm('¿Estás seguro? Esto reiniciará el registro de trabajo.')) {
                    selectElement.value = previousValue;
                    updateSelectBackground(selectElement);
                    console.log(`Отмена: Статус возвращен к ${previousValue}`);
                    return;
                }
            }

            // Обновляем фон select элемента сразу
            updateSelectBackground(selectElement);

            // Отправляем AJAX запрос с текущим фильтром и датами
            $.ajax({
                url: `/update_work_log/${logId}`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    holiday_status: newHolidayStatus,
                    employee_id: employeeId,
                    reset_worklog: newHolidayStatus === 'paid' || newHolidayStatus === 'unpaid',
                    filter_type: currentFilter,
                    start_date: startDate,
                    end_date: endDate
                }),
                success: function(response) {
                    if (response.success) {
                        console.log(`✅ Обновлен статус отпуска для log ${logId}: ${newHolidayStatus}`);
                        selectElement.dataset.previousValue = newHolidayStatus;
                        updateSummaryPanel(employeeId, response.summary);
                        if (response.reset) {
                            const row = selectElement.closest('tr');
                            row.querySelector('.check-in-time').textContent = '--:--';
                            row.querySelector('.check-out-time').textContent = '--:--';
                            row.querySelector('.worked-hours').textContent = '0h 0min';
                            console.log(`✅ Сброшены данные worklog для log ${logId}`);
                        }
                    fetch("/get_work_logs")
                            .then(response => response.json())
                             .then(data => {
                                sortLogsByDate(data.logs);
                                renderLogs(data.logs);
                    });
                     } else {
                        console.error(`❌ Ошибка: ${response.message}`);
                        selectElement.value = previousValue;
                        updateSelectBackground(selectElement);
                    }
                },
                error: function(xhr, status, error) {
                    console.error(`❌ Ошибка AJAX: ${error} (Status: ${xhr.status})`);
                    selectElement.value = previousValue;
                    updateSelectBackground(selectElement);
                }
            });
        };

        window.updateSummaryPanel = function(employeeId, summary) {
            const summaryPanel = document.getElementById(`summary-panel-${employeeId}`);
            if (summaryPanel) {
                summaryPanel.querySelector('.total-hours').textContent = summary.total_hours;
                summaryPanel.querySelector('.total-days').textContent = summary.working_days;
                summaryPanel.querySelector('.overtime-hours').textContent = summary.overtime_hours;
                summaryPanel.querySelector('.paid-holidays').textContent = summary.paid_holidays;
                summaryPanel.querySelector('.unpaid-holidays').textContent = summary.unpaid_holidays;
                console.log(`✅ Обновлена панель Resumen для сотрудника ${employeeId}:`, summary);
            } else {
                console.error(`❌ Панель Resumen для сотрудника ${employeeId} не найдена`);
            }
        };

        // Функция для переключения видимости dropdown-меню
        window.toggleDropdown = function(event) {
            event.preventDefault();
            event.stopPropagation();
            const dropdownMenu = document.getElementById('dropdown-menu');
            if (!dropdownMenu) {
                console.error("❌ Dropdown-меню не найдено в DOM!");
                return;
            }
            console.log("📌 Нажатие на кнопку троеточие, проверка состояния меню");
            const isActive = dropdownMenu.classList.contains('active');
            dropdownMenu.classList.toggle('active');
            console.log(`📌 Dropdown-меню ${isActive ? 'закрыто' : 'открыто'}, классы: ${dropdownMenu.className}`);
        };

        // Закрытие dropdown-меню при клике вне его
        document.addEventListener('click', function(event) {
            const dropdownMenu = document.getElementById('dropdown-menu');
            const ellipsisBtn = document.querySelector('.ellipsis-btn');
            if (dropdownMenu && !dropdownMenu.contains(event.target) && event.target !== ellipsisBtn) {
                dropdownMenu.classList.remove('active');
                console.log('📌 Dropdown-меню закрыто (клик вне области)');
            }
        });

        // Обработчик для "Todo" - переключение всех чекбоксов и закрытие меню
        document.addEventListener('DOMContentLoaded', function() {
            const chooseAllBtn = document.getElementById('choose-all-btn');
            if (chooseAllBtn) {
                let allChecked = false;
                chooseAllBtn.addEventListener('click', function() {
                    const checkboxes = document.querySelectorAll('.round-checkbox.employee-checkbox');
                    allChecked = !allChecked;
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = allChecked;
                        console.log(`📌 Чекбокс ${checkbox.id} установлен на ${allChecked}`);
                    });
                    console.log(`📌 Все чекбоксы ${allChecked ? 'проставлены' : 'сняты'}`);
                    const dropdownMenu = document.getElementById('dropdown-menu');
                    if (dropdownMenu) {
                        dropdownMenu.classList.remove('active');
                        console.log('📌 Dropdown-меню закрыто после выбора "Todo"');
                    }
                });
            } else {
                console.error("❌ Кнопка 'Todo' не найдена!");
            }

            // Обработчик для "Add Day" - открытие модального окна
            const addDayBtn = document.getElementById('add-day-btn');
            if (addDayBtn) {
                addDayBtn.addEventListener('click', function() {
                    const checkedCheckboxes = document.querySelectorAll('.round-checkbox.employee-checkbox:checked');
                    console.log(`📌 Найдено ${checkedCheckboxes.length} выбранных сотрудников`);
                    if (checkedCheckboxes.length === 1) {
                        const employeeId = checkedCheckboxes[0].id.replace('employee_', '');
                        const employeeName = checkedCheckboxes[0].closest('.employee-section').querySelector('.employee-header h2').textContent;
                        openAddDayModal(employeeId, employeeName);
                        const dropdownMenu = document.getElementById('dropdown-menu');
                        if (dropdownMenu) {
                            dropdownMenu.classList.remove('active');
                            console.log('📌 Dropdown-меню закрыто после выбора "Add Day"');
                        }
                    } else {
                        alert('Por favor, seleccione exactamente un empleado.');
                        console.log('❌ Выбрано неверное количество сотрудников');
                    }
                });
            } else {
                console.error("❌ Кнопка 'Add Day' не найдена!");
            }

            // Обработчик для "Random" - отображение чекбоксов для выбора дней
            const randomBtn = document.getElementById('random-btn');
            if (randomBtn) {
                randomBtn.addEventListener('click', function() {
                    const checkedCheckboxes = document.querySelectorAll('.round-checkbox.employee-checkbox:checked');
                    console.log(`📌 Найдено ${checkedCheckboxes.length} выбранных сотрудников для Random`);
                    if (checkedCheckboxes.length > 0) {
                        showRandomCheckboxes(checkedCheckboxes);
                        const dropdownMenu = document.getElementById('dropdown-menu');
                        if (dropdownMenu) {
                            dropdownMenu.classList.remove('active');
                            console.log('📌 Dropdown-меню закрыто после выбора "Random"');
                        }
                    } else {
                        alert('Por favor, seleccione al menos un empleado.');
                        console.log('❌ Не выбрано ни одного сотрудника');
                    }
                });
            } else {
                console.error("❌ Кнопка 'Random' не найдена!");
            }

            // Инициализация фона для всех select элементов
            document.querySelectorAll('.holiday-select').forEach(select => {
                updateSelectBackground(select);
                select.addEventListener('change', function () {
                    updateSelectBackground(this);
                });
            });
        });

        // Функция для отображения чекбоксов для выбора дней
        window.showRandomCheckboxes = function(checkedCheckboxes) {
            console.log('🔍 Проверка отображения чекбоксов для сотрудников:', Array.from(checkedCheckboxes).map(cb => cb.id));
            const worklogCheckboxes = document.querySelectorAll('.worklog-random-checkbox');

            const employeeIds = new Set(Array.from(checkedCheckboxes).map(cb => cb.id.replace('employee_', '')));
            console.log(`🔍 Найдено ${worklogCheckboxes.length} чекбоксов с классом .worklog-random-checkbox, сотрудники: ${Array.from(employeeIds)}`);

            worklogCheckboxes.forEach(checkbox => {
                const employeeId = checkbox.dataset.employeeId;
                if (employeeIds.has(employeeId)) {
                    const checkboxColumn = document.getElementById(`checkbox-column-${employeeId}`);
                    const checkboxCells = document.querySelectorAll(`.checkbox-cell-${employeeId}`);
                    if (checkboxColumn && checkboxCells.length > 0) {
                        checkboxColumn.style.display = 'table-cell';
                        checkboxCells.forEach(cell => {
                            cell.style.display = 'table-cell';
                            const cb = cell.querySelector('.worklog-random-checkbox');
                            if (cb) {
                                cb.style.display = 'inline';
                                console.log(`✅ Отображен чекбокс для log ${cb.dataset.logId}, сотрудник ${employeeId}`);
                            }
                        });
                    } else {
                        console.error(`❌ Колонка или ячейки "Seleccionar" не найдены для сотрудника ${employeeId}`);
                    }
                } else {
                    checkbox.style.display = 'none';
                    console.log(`⛔ Скрыт чекбокс для log ${checkbox.dataset.logId}, сотрудник ${employeeId}`);
                }
            });

            // Добавляем кнопку "Siguiente" под каждый summary-panel выбранных сотрудников
            employeeIds.forEach(employeeId => {
                const summaryPanel = document.getElementById(`summary-panel-${employeeId}`);
                if (summaryPanel && !document.getElementById(`randomNextBtn-${employeeId}`)) {
                    const nextButton = document.createElement('button');
                    nextButton.textContent = 'Siguiente';
                    nextButton.id = `randomNextBtn-${employeeId}`;
                    nextButton.style.margin = '10px 0';
                    nextButton.style.padding = '5px 10px';
                    nextButton.style.backgroundColor = '#fb8c86';
                    nextButton.style.color = 'white';
                    nextButton.style.border = 'none';
                    nextButton.style.borderRadius = '5px';
                    nextButton.style.cursor = 'pointer';
                    nextButton.onclick = function() {
                        const selectedLogIds = Array.from(worklogCheckboxes)
                            .filter(cb => cb.dataset.employeeId === employeeId && cb.checked)
                            .map(cb => cb.dataset.logId);
                        if (selectedLogIds.length > 0) {
                            openRandomModal(selectedLogIds);
                            document.getElementById(`randomNextBtn-${employeeId}`).remove();
                            worklogCheckboxes.forEach(cb => {
                                if (cb.dataset.employeeId === employeeId) {
                                    cb.style.display = 'none';
                                    const checkboxColumn = document.getElementById(`checkbox-column-${employeeId}`);
                                    const checkboxCells = document.querySelectorAll(`.checkbox-cell-${employeeId}`);
                                    if (checkboxColumn && checkboxCells.length > 0) {
                                        checkboxColumn.style.display = 'none';
                                        checkboxCells.forEach(cell => {
                                            cell.style.display = 'none';
                                        });
                                    }
                                }
                            });
                        } else {
                            alert('Por favor, seleccione al menos un día para este empleado.');
                        }
                    };
                    // Кнопка Todo
                        const todoButton = document.createElement('button');
                        todoButton.textContent = 'Todo';
                        todoButton.id = `randomTodoBtn-${employeeId}`;
                        todoButton.className = 'btn-todo';
                        todoButton.style.backgroundColor = '#fb8c86';
                        todoButton.style.color = '#fff';
                        todoButton.style.padding = '5px 10px';
                        todoButton.style.borderRadius = '5px';
                        todoButton.style.border = 'none';
                        todoButton.style.margin = '10px 0';
                        todoButton.onclick = function() {
                            const checkboxes = Array.from(worklogCheckboxes)
                                .filter(cb => cb.dataset.employeeId === employeeId);

                            const allChecked = checkboxes.every(cb => cb.checked);

                            checkboxes.forEach(cb => cb.checked = !allChecked);

                            console.log(`📌 ${allChecked ? 'Сняты' : 'Установлены'} все чекбоксы для сотрудника ${employeeId}`);
                        };


                        summaryPanel.appendChild(nextButton);
                        summaryPanel.appendChild(todoButton);

                    summaryPanel.appendChild(nextButton);
                    console.log(`✅ Кнопка "Siguiente" добавлена под summary-panel для сотрудника ${employeeId}`);
                }
            });
        };
//qwfqweegf
        // Функция для открытия модального окна добавления дня
        window.openAddDayModal = function(employeeId, employeeName) {
            const modal = document.getElementById('addDayModal');
            const employeeNameInput = document.getElementById('employeeName');
            const employeeIdInput = document.getElementById('employeeId');
            if (modal && employeeNameInput && employeeIdInput) {
                employeeNameInput.value = employeeName;
                employeeIdInput.value = employeeId;
                modal.classList.remove('hidden');
                modal.classList.add('modal-unique', 'active');
                console.log(`📌 Открыт модальный окно для сотрудника ${employeeName} (ID: ${employeeId})`);
            } else {
                console.error('❌ Модальное окно или поле имени/ID не найдено!');
            }
        };
        window.selectedLogEntries = [];
        // Функция для открытия модального окна для Random
          window.openRandomModal = function(selectedLogIds) {
            const modal = document.getElementById('randomModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('modal-unique', 'active');

                // Собираем employeeId вместе с logId
                window.selectedLogEntries = selectedLogIds.map(logId => {
                    const select = document.querySelector(`#holiday-select-${logId}`);
                    return {
                        logId,
                        employeeId: select?.dataset.employeeId || null
                    };
                });

        console.log(`📌 Открыт модал для ${window.selectedLogEntries.length} логов:`, window.selectedLogEntries);
    } else {
        console.error('❌ Модальное окно Random не найдено!');
    }
};


        // Функция для закрытия модального окна добавления дня
        window.closeAddDayModal = function() {
            const modal = document.getElementById('addDayModal');
            if (modal) {
                modal.classList.remove('active');
                modal.classList.add('hidden');
                console.log('📌 Модальное окно закрыто');
            }
        };

        // Функция для закрытия модального окна Random
        window.closeRandomModal = function() {
            const modal = document.getElementById('randomModal');
            if (modal) {
                modal.classList.remove('active');
                modal.classList.add('hidden');
                console.log('📌 Модальное окно Random закрыто');
            }
        };

        // Обработка формы добавления дня
        document.getElementById('addDayForm')?.addEventListener('submit', function(event) {
            event.preventDefault();
            const employeeId = document.getElementById('employeeId').value;
            const logDate = document.getElementById('logDate').value;
            const checkInTime = document.getElementById('checkInTime').value;
            const checkOutTime = document.getElementById('checkOutTime').value;

            console.log(`📌 Форма отправлена: Employee ID: ${employeeId}, Date: ${logDate}, Check-in: ${checkInTime}, Check-out: ${checkOutTime}`);

            $.ajax({
                url: `/add_work_log/${employeeId}`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    log_date: logDate,
                    check_in_time: checkInTime,
                    check_out_time: checkOutTime
                }),
                success: function(response) {
                    if (response.success) {
                        console.log('✅ День добавлен успешно');
                        closeAddDayModal();
                        location.reload();
                    } else {
                        console.error(`❌ Ошибка: ${response.message}`);
                    }
                },
                error: function(xhr, status, error) {
                    console.error(`❌ Ошибка AJAX: ${error} (Status: ${xhr.status})`);
                }
            });
        });

        // Обработка формы Random
        document.getElementById('randomForm')?.addEventListener('submit', function(event) {
            event.preventDefault();

            const startRangeMin = document.getElementById('startRangeMin').value;
            const startRangeMax = document.getElementById('startRangeMax').value;
            const endRangeMin = document.getElementById('endRangeMin').value;
            const endRangeMax = document.getElementById('endRangeMax').value;

            const entries = window.selectedLogEntries || [];

            if (!entries.length) {
                alert("❌ Нет выбранных логов");
                return;
            }

            console.log(`📌 Обработка ${entries.length} логов через Random`);

            let completed = 0;

            entries.forEach(({ logId, employeeId }) => {
                const randomCheckIn = generateRandomTime(startRangeMin, startRangeMax);
                const randomCheckOut = generateRandomTime(endRangeMin, endRangeMax);

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
                            console.log(`✅ Установлено: log ${logId}, сотрудник ${employeeId}`);
                        } else {
                            console.error(`❌ Ошибка: ${response.message}`);
                        }
                        completed++;
                        if (completed === entries.length) {
                            closeRandomModal();
                            location.reload();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error(`❌ Ошибка AJAX для log ${logId}: ${error}`);
                        completed++;
                        if (completed === entries.length) {
                            closeRandomModal();
                            location.reload();
                        }
                    }
                });
            });
        });
//q
        // Функция для генерации случайного времени в заданном диапазоне
        function generateRandomTime(minTime, maxTime) {
            const min = new Date(`1970-01-01T${minTime}:00`);
            const max = new Date(`1970-01-01T${maxTime}:00`);
            const randomTime = new Date(min.getTime() + Math.random() * (max.getTime() - min.getTime()));
            return randomTime.toTimeString().slice(0, 5); // Возвращаем HH:MM
        }