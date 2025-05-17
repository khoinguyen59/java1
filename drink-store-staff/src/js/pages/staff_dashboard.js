// src/js/pages/staff_dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Staff Dashboard page specific JS loaded!');

    const staffWelcomeNameEl = document.getElementById('staffWelcomeName');
    const staffNameDisplayOnTopbarEl = document.getElementById('staffNameDisplayOnTopbar');
    const staffSalaryEl = document.getElementById('staffSalaryDisplay');
    const staffTotalHoursEl = document.getElementById('staffTotalHoursDisplay');
    const staffNextShiftEl = document.getElementById('staffNextShiftDisplay');
    const staffRegisteredShiftsListEl = document.getElementById('staffRegisteredShiftsList');
    const monthSelectorStaffEl = document.getElementById('monthSelectorForSchedule');
    const currentScheduleMonthDisplayEl = document.getElementById('currentScheduleMonthDisplay');
    const staffNotificationsListEl = document.getElementById('staffNotificationsList');
    const noShiftsMessageEl = document.querySelector('#staffRegisteredShiftsList .no-shifts-message'); // Cần class này trong li
    const noNotificationsMessageEl = document.querySelector('#staffNotificationsList .no-notifications-message'); // Cần class này trong li
    const staffNotificationCountEl = document.getElementById('staffNotificationCount');

    const loggedInStaffName = localStorage.getItem('loggedInStaffName') || "Nhân Viên A";
    const loggedInStaffId = localStorage.getItem('loggedInStaffId') || "NV001"; // Sẽ lấy từ API/session thực tế

    if (staffWelcomeNameEl) staffWelcomeNameEl.textContent = loggedInStaffName;
    if (staffNameDisplayOnTopbarEl) staffNameDisplayOnTopbarEl.textContent = loggedInStaffName;

    function formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) return '_';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    async function fetchStaffDashboardInfo(monthYear) {
        console.log(`Fetching dashboard info for staff: ${loggedInStaffId}, month: ${monthYear}`);
        // Giả lập API call
        const sampleData = {
            "2025-05": {
                salary: 7850000, totalHours: 130, nextShift: "Ngày mai, 14:00 - 18:00",
                registeredShifts: [
                    { date: "2025-05-01", dayOfWeek: "Thứ 2", time: "08:00 - 12:00", status: "confirmed" },
                    { date: "2025-05-03", dayOfWeek: "Thứ 4", time: "14:00 - 22:00", status: "pending" },
                ],
                notifications: [
                    { icon: "fas fa-bullhorn", text: "Lịch làm tuần tới đã có, vui lòng đăng ký." },
                    { icon: "fas fa-check-circle", text: "Yêu cầu đổi ca của bạn đã được duyệt." }
                ]
            }
            // Thêm dữ liệu cho các tháng khác nếu cần test
        };
        return new Promise(resolve => setTimeout(() => {
            const dataForMonth = sampleData[monthYear] || { salary: 0, totalHours: 0, nextShift: "Không có thông tin", registeredShifts: [], notifications: [] };
            resolve(dataForMonth);
        }, 300));
    }

    function displayStaffDashboardInfo(data) {
        if (staffSalaryEl) staffSalaryEl.textContent = formatCurrency(data.salary);
        if (staffTotalHoursEl) staffTotalHoursEl.textContent = data.totalHours > 0 ? `${data.totalHours} giờ` : '_';
        if (staffNextShiftEl) staffNextShiftEl.textContent = data.nextShift || "_";

        if (staffRegisteredShiftsListEl) {
            staffRegisteredShiftsListEl.innerHTML = '';
            if (data.registeredShifts && data.registeredShifts.length > 0) {
                data.registeredShifts.forEach(shift => {
                    const li = document.createElement('li');
                    const shiftDate = new Date(shift.date + 'T00:00:00');
                    li.innerHTML = `<strong>${shift.dayOfWeek} (${shiftDate.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}):</strong> ${shift.time} <span class="shift-status ${shift.status}">${shift.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ duyệt'}</span>`;
                    staffRegisteredShiftsListEl.appendChild(li);
                });
            } else {
                staffRegisteredShiftsListEl.innerHTML = '<li class="no-shifts-message">Chưa có ca nào được đăng ký cho tháng này.</li>';
            }
        }

        if (staffNotificationsListEl) {
            staffNotificationsListEl.innerHTML = '';
            if (data.notifications && data.notifications.length > 0) {
                data.notifications.forEach(noti => {
                    const li = document.createElement('li');
                    li.innerHTML = `<i class="${noti.icon}"></i> ${noti.text}`;
                    staffNotificationsListEl.appendChild(li);
                });
            } else {
                staffNotificationsListEl.innerHTML = '<li class="no-notifications-message">Hiện chưa có thông báo mới.</li>';
            }
        }
        if(staffNotificationCountEl) staffNotificationCountEl.textContent = data.notifications ? data.notifications.length : 0;

        const staffRegisteredCalendarEl = document.getElementById('staffRegisteredShiftsCalendar');
        if(staffRegisteredCalendarEl && data.monthYearForDisplay) {
            staffRegisteredCalendarEl.innerHTML = `<p>Lịch trực quan tháng ${data.monthYearForDisplay} sẽ hiển thị ở đây.</p><p>(Cần triển khai thêm)</p>`;
        } else if (staffRegisteredCalendarEl) {
            staffRegisteredCalendarEl.innerHTML = `<p>Lịch làm việc của bạn sẽ hiển thị ở đây...</p>`;
        }
    }

    async function loadDataForSelectedMonth() {
        if (!monthSelectorStaffEl) return;
        const selectedMonthYear = monthSelectorStaffEl.value;
        if (!selectedMonthYear) return;

        const [year, month] = selectedMonthYear.split('-');
        if(currentScheduleMonthDisplayEl) currentScheduleMonthDisplayEl.textContent = `Tháng ${month}/${year}`;

        if (staffSalaryEl) staffSalaryEl.textContent = "Đang tải...";
        // ... (các dòng loading khác)

        try {
            const data = await fetchStaffDashboardInfo(selectedMonthYear);
            data.monthYearForDisplay = `${month}/${year}`;
            displayStaffDashboardInfo(data);
        } catch (error) {
            console.error("Lỗi:", error);
            // ... (xử lý lỗi hiển thị)
        }
    }

    if (monthSelectorStaffEl) {
        if (!monthSelectorStaffEl.value) {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            monthSelectorStaffEl.value = `${year}-${month}`;
             if(currentScheduleMonthDisplayEl) currentScheduleMonthDisplayEl.textContent = `Tháng ${month}/${year}`;
        }
        monthSelectorStaffEl.addEventListener('change', loadDataForSelectedMonth);
        loadDataForSelectedMonth(); // Load lần đầu
    }
});