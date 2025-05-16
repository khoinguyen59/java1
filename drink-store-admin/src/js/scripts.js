// src/js/script.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector(".sidebar");
    const sidebarBtn = document.querySelector(".sidebarBtn");

    if (sidebar && sidebarBtn) {
        sidebarBtn.onclick = function() {
            sidebar.classList.toggle("close");
        }
    } else {
        console.warn("Sidebar or Sidebar Button not found. Sidebar toggle might not work.");
    }

    // Các chức năng JavaScript chung khác cho toàn bộ trang quản trị có thể thêm ở đây
    // Ví dụ: Xử lý dropdown hồ sơ nếu nó phức tạp hơn CSS hover thuần túy
    // const profileDropdown = document.querySelector('.profile-dropdown');
    // if(profileDropdown) {
    //     profileDropdown.addEventListener('click', function() {
    //         this.classList.toggle('active'); // Cần CSS tương ứng cho .profile-dropdown.active .dropdown-content
    //     });
    // }

    console.log('Global Admin JS (script.js) loaded.');
});