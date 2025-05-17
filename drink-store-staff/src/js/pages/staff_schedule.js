// src/js/pages/staff_schedule.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Staff Schedule JS loaded!');

    const weekSelector = document.getElementById('weekSelectorSchedule');
    const availableShiftsTableBody = document.getElementById('availableShiftsTableBody');
    const currentAvailableWeekDisplay = document.getElementById('currentAvailableWeekDisplay');
    const registerShiftsForm = document.getElementById('registerShiftsForm');
    const btnSubmitRegistration = document.getElementById('btnSubmitRegistration');

    const btnViewMyScheduleModal = document.getElementById('btnViewMyScheduleModal');
    const myScheduleModal = document.getElementById('myScheduleModal');
    const closeMyScheduleModalBtn = document.getElementById('closeMyScheduleModalBtn');
    const myScheduleWeekModalDisplay = document.getElementById('myScheduleWeekModalDisplay');
    const myScheduleVisualTableBody = document.getElementById('myScheduleVisualTableBody');

    const loggedInStaffId = localStorage.getItem('loggedInStaffId') || "NV001"; // Lấy từ thực tế

    // --- Helper function to get week number and year ---
    function getWeekNumberAndYear(dateInput) { // dateInput can be a Date object or "YYYY-Www" string
        let date;
        if (typeof dateInput === 'string' && dateInput.includes('-W')) {
            const [year, weekPart] = dateInput.split('-W');
            const week = parseInt(weekPart, 10);
            // Get the first day of that week
            const firstDayOfYear = new Date(parseInt(year, 10), 0, 1);
            const days = (week - 1) * 7 - firstDayOfYear.getDay() + 1; // Adjust for first day of the year
            date = new Date(firstDayOfYear.setDate(days));
        } else {
            date = dateInput ? new Date(dateInput) : new Date();
        }

        const currentThursday = new Date(date.valueOf());
        currentThursday.setDate(currentThursday.getDate() - ((currentThursday.getDay() + 6) % 7) + 3); // Thursday in current week
        const firstThursday = new Date(currentThursday.getFullYear(), 0, 4);
        const weekNumber = 1 + Math.floor(((currentThursday.valueOf() - firstThursday.valueOf()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
        return { week: weekNumber, year: currentThursday.getFullYear(), startDate: getMonday(date) };
    }
    function getMonday(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }


    // --- Fetch Available Shifts ---
    async function fetchAvailableShifts(year, week) {
        console.log(`Fetching available shifts for Year: ${year}, Week: ${week}`);
        // TODO: API call to get available shifts
        // const response = await fetch(`/api/shifts/available?year=${year}&week=${week}`);
        // if (!response.ok) throw new Error('Failed to load available shifts');
        // return await response.json();

        // Sample data
        return new Promise(resolve => setTimeout(() => resolve([
            { id: "shift1", date: "2024-07-29", dayOfWeek: "Thứ 2", shiftName: "Ca Sáng", startTime: "08:00", endTime: "12:00", needed: 3, registered: 2, staffCanRegister: true },
            { id: "shift2", date: "2024-07-29", dayOfWeek: "Thứ 2", shiftName: "Ca Chiều", startTime: "14:00", endTime: "18:00", needed: 2, registered: 1, staffCanRegister: true },
            { id: "shift3", date: "2024-07-30", dayOfWeek: "Thứ 3", shiftName: "Ca Tối", startTime: "18:00", endTime: "22:00", needed: 2, registered: 2, staffCanRegister: false }, // Full
            { id: "shift4", date: "2024-07-31", dayOfWeek: "Thứ 4", shiftName: "Ca Sáng", startTime: "07:00", endTime: "11:00", needed: 3, registered: 0, staffCanRegister: true },
        ]), 500));
    }

    function displayAvailableShifts(shifts) {
        availableShiftsTableBody.innerHTML = '';
        if (shifts && shifts.length > 0) {
            shifts.forEach(shift => {
                const row = availableShiftsTableBody.insertRow();
                const shiftDate = new Date(shift.date + 'T00:00:00');
                row.innerHTML = `
                    <td data-label="Ngày">${shift.dayOfWeek}, ${shiftDate.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}</td>
                    <td data-label="Ca Làm">${shift.shiftName}</td>
                    <td data-label="Thời Gian">${shift.startTime} - ${shift.endTime}</td>
                    <td data-label="SL Cần">${shift.needed}</td>
                    <td data-label="Đã ĐK">${shift.registered}</td>
                    <td data-label="Chọn">
                        ${shift.staffCanRegister && shift.registered < shift.needed ? `<input type="checkbox" name="selectedShift" value="${shift.id}">` : (shift.registered >= shift.needed ? '<span class="muted">Đầy</span>' : '<span class="muted">N/A</span>')}
                    </td>
                `;
            });
        } else {
            availableShiftsTableBody.innerHTML = '<tr><td colspan="6" class="text-center muted">Không có ca làm nào được mở cho tuần này.</td></tr>';
        }
    }

    async function loadAvailableShifts() {
        if (!weekSelector.value) return;
        const { year, week } = getWeekNumberAndYear(weekSelector.value);
        if (currentAvailableWeekDisplay) currentAvailableWeekDisplay.textContent = `${week}/${year}`;
        availableShiftsTableBody.innerHTML = '<tr><td colspan="6" class="text-center muted">Đang tải ca làm...</td></tr>';
        try {
            const shifts = await fetchAvailableShifts(year, week);
            displayAvailableShifts(shifts);
        } catch (error) {
            console.error("Error loading available shifts:", error);
            availableShiftsTableBody.innerHTML = `<tr><td colspan="6" class="text-center muted">Lỗi tải ca làm: ${error.message}</td></tr>`;
        }
    }

    // --- Fetch My Registered Shifts for the Week ---
    async function fetchMyRegisteredShifts(year, week) {
        console.log(`Fetching MY shifts for Staff: ${loggedInStaffId}, Year: ${year}, Week: ${week}`);
        // TODO: API call
        // const response = await fetch(`/api/staff/${loggedInStaffId}/schedule?year=${year}&week=${week}`);
        // if (!response.ok) throw new Error('Failed to load my schedule');
        // return await response.json();

        // Sample Data (sẽ là một mảng các object, mỗi object có thể có `date` và `time` hoặc `shiftName`)
        return new Promise(resolve => setTimeout(() => resolve({
            // Dữ liệu có thể là một object với key là ngày trong tuần (0=Sun, 1=Mon...)
            // Hoặc một mảng các ca đã đăng ký
            shiftsByDay: {
                'Mon': [{startTime: '08:00', endTime: '12:00', shiftName: 'Ca Sáng'}],
                'Wed': [{startTime: '14:00', endTime: '22:00', shiftName: 'Ca Tối'}],
                'Fri': [{startTime: '18:00', endTime: '23:00', shiftName: 'Ca Tối'}],
            },
            weekDates: ["29/07", "30/07", "31/07", "01/08", "02/08", "03/08", "04/08"] // Ví dụ
        }), 300));
    }

    function displayMyScheduleInModal(data, year, week) {
        if (myScheduleWeekModalDisplay) myScheduleWeekModalDisplay.textContent = `${week}/${year}`;
        myScheduleVisualTableBody.innerHTML = ''; // Clear previous

        if (data && data.shiftsByDay) {
            const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
            const dayKeys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Keys cho data.shiftsByDay

            // Tạo header cho ngày
            daysOfWeek.forEach((dayName, index) => {
                const headerCell = document.createElement('div');
                headerCell.classList.add('day-header');
                headerCell.innerHTML = `${dayName}<br><small>(${data.weekDates ? data.weekDates[index] : ''})</small>`;
                myScheduleVisualTableBody.appendChild(headerCell);
            });

            // Tạo ô cho các ca
            dayKeys.forEach(dayKey => {
                const shiftCell = document.createElement('div');
                shiftCell.classList.add('shift-cell');
                const shiftsForDay = data.shiftsByDay[dayKey];
                if (shiftsForDay && shiftsForDay.length > 0) {
                    shiftCell.classList.add('has-shift');
                    shiftsForDay.forEach(shift => {
                        const shiftDiv = document.createElement('div');
                        shiftDiv.classList.add('shift-time');
                        shiftDiv.textContent = `${shift.shiftName} (${shift.startTime}-${shift.endTime})`;
                        shiftCell.appendChild(shiftDiv);
                    });
                } else {
                    shiftCell.innerHTML = `<span>Nghỉ</span>`;
                }
                myScheduleVisualTableBody.appendChild(shiftCell);
            });
        } else {
            myScheduleVisualTableBody.innerHTML = '<p class="text-center muted">Không có lịch làm việc cho tuần này.</p>';
        }
        myScheduleModal.style.display = 'block';
    }


    // --- Event Listeners ---
    if (weekSelector) {
        // Set default week to current week
        const today = new Date();
        const yyyy = today.getFullYear();
        const { week } = getWeekNumberAndYear(today);
        weekSelector.value = `${yyyy}-W${week.toString().padStart(2, '0')}`;

        weekSelector.addEventListener('change', loadAvailableShifts);
        loadAvailableShifts(); // Initial load
    }

    if (registerShiftsForm) {
        registerShiftsForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const selectedShifts = Array.from(document.querySelectorAll('input[name="selectedShift"]:checked')).map(cb => cb.value);
            if (selectedShifts.length === 0) {
                alert('Vui lòng chọn ít nhất một ca để đăng ký.');
                return;
            }
            console.log("Đăng ký các ca:", selectedShifts);
            // TODO: API call to register shifts
            // try {
            //     const response = await fetch(`/api/staff/${loggedInStaffId}/register-shifts`, {
            //         method: 'POST',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify({ shiftIds: selectedShifts })
            //     });
            //     if (!response.ok) {
            //         const errData = await response.json();
            //         throw new Error(errData.message || "Đăng ký ca thất bại");
            //     }
            //     alert("Đăng ký ca thành công!");
            //     loadAvailableShifts(); // Refresh lại danh sách ca
            // } catch (error) {
            //     console.error("Error registering shifts:", error);
            //     alert(`Lỗi: ${error.message}`);
            // }
            alert(`Đã gửi yêu cầu đăng ký cho ${selectedShifts.length} ca. (Chức năng backend cần được triển khai)`);
            // Tạm thời clear checkbox
            document.querySelectorAll('input[name="selectedShift"]:checked').forEach(cb => cb.checked = false);
        });
    }

    if (btnViewMyScheduleModal && myScheduleModal && closeMyScheduleModalBtn) {
        btnViewMyScheduleModal.addEventListener('click', async function() {
            if (!weekSelector.value) {
                alert("Vui lòng chọn tuần để xem lịch.");
                return;
            }
            const { year, week } = getWeekNumberAndYear(weekSelector.value);
            try {
                const myShiftsData = await fetchMyRegisteredShifts(year, week);
                displayMyScheduleInModal(myShiftsData, year, week);
            } catch (error) {
                console.error("Error fetching my schedule:", error);
                myScheduleVisualTableBody.innerHTML = `<p class="text-center muted">Lỗi tải lịch: ${error.message}</p>`;
                myScheduleModal.style.display = 'block';
            }
        });
        closeMyScheduleModalBtn.addEventListener('click', () => myScheduleModal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target == myScheduleModal) {
                myScheduleModal.style.display = 'none';
            }
        });
    }
});