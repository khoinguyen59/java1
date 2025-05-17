// src/js/script.js - For drink-store-nhanvien (Common JS)
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector(".sidebar");
    const sidebarBtn = document.querySelector(".sidebarBtn"); // Nút này trong top-bar

    if (sidebar && sidebarBtn) {
        sidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle("close");
        });
    } else {
        if (!sidebar) console.warn("Sidebar element (.sidebar) not found.");
        if (!sidebarBtn) console.warn("Sidebar Button (.sidebarBtn) not found.");
    }

    // Xử lý dropdown hồ sơ
    const profileDropdownToggle = document.querySelector('.profile-dropdown');
    const profileDropdownContent = document.querySelector('.profile-dropdown .dropdown-content');

    if (profileDropdownToggle && profileDropdownContent) {
        profileDropdownToggle.addEventListener('click', function(event) {
            event.stopPropagation(); // Ngăn sự kiện nổi bọt lên window
            // Toggle display của dropdown content
            const currentDisplay = window.getComputedStyle(profileDropdownContent).display;
            profileDropdownContent.style.display = currentDisplay === 'block' ? 'none' : 'block';
        });

        // Đóng dropdown khi click ra ngoài
        window.addEventListener('click', function(event) {
            if (profileDropdownContent.style.display === 'block') {
                 // Kiểm tra xem click có nằm trong profileDropdown không
                if (!profileDropdownToggle.contains(event.target)) {
                    profileDropdownContent.style.display = 'none';
                }
            }
        });
    } else {
        if(!profileDropdownToggle) console.warn("Profile dropdown toggle not found.");
        if(!profileDropdownContent) console.warn("Profile dropdown content not found.");
    }

    console.log('Common Staff JS (script.js) loaded.');
});