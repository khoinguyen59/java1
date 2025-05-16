// login/src/js/auth_script.js
document.addEventListener('DOMContentLoaded', function () {
    const authFormWrapper = document.querySelector('.auth-form-wrapper');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegisterLink = document.getElementById('switchToRegister');
    const switchToLoginLink = document.getElementById('switchToLogin');
    const loginMessageDiv = document.getElementById('loginMessage');
    const registerMessageDiv = document.getElementById('registerMessage');

    const BACKEND_URL = 'http://localhost:5500';

    if (switchToRegisterLink && authFormWrapper) {
        switchToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            authFormWrapper.style.transform = 'translateX(-50%)';
            clearMessages();
        });
    }
    if (switchToLoginLink && authFormWrapper) {
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            authFormWrapper.style.transform = 'translateX(0%)';
            clearMessages();
        });
    }

    function clearMessages() {
        if (loginMessageDiv) {
            loginMessageDiv.style.display = 'none';
            loginMessageDiv.textContent = '';
            loginMessageDiv.className = 'message-div';
        }
        if (registerMessageDiv) {
            registerMessageDiv.style.display = 'none';
            registerMessageDiv.textContent = '';
            registerMessageDiv.className = 'message-div';
        }
    }

    function displayMessage(message, type, formType) {
        const targetDiv = formType === 'login' ? loginMessageDiv : registerMessageDiv;
        if (targetDiv) {
            targetDiv.textContent = message;
            targetDiv.className = `message-div ${type}`;
            targetDiv.style.display = 'block';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            clearMessages();
            const submitButton = loginForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            }

            const username = loginForm.username.value.trim().toLowerCase();
            const password = loginForm.password.value.trim();

            if (!username || !password) {
                displayMessage('Vui lòng nhập đầy đủ thông tin.', 'error', 'login');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';
                }
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
                const data = await response.json();

                if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại.');

                console.log('Auth Script - Data from backend login:', data); // KIỂM TRA DATA TỪ BACKEND
                localStorage.setItem('drinkStoreToken', data.token);
                localStorage.setItem('drinkStoreUserRole', data.role); // Đảm bảo data.role có giá trị đúng
                localStorage.setItem('drinkStoreUsername', data.username);
                console.log('Auth Script - Stored role:', localStorage.getItem('drinkStoreUserRole'));


                displayMessage('Đăng nhập thành công! Đang chuyển hướng...', 'success', 'login');
                
                if (data.role === 'staff') {
                    window.location.href = `${BACKEND_URL}/staff_dashboard`;
                } else if (data.role === 'admin') {
                    window.location.href = `${BACKEND_URL}/dashboard`;
                } else {
                    displayMessage('Vai trò không xác định. Không thể chuyển hướng.', 'error', 'login');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';
                    }
                }
            } catch (error) {
                displayMessage(error.message, 'error', 'login');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            clearMessages();
            const submitButton = registerForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            }

            const username = registerForm.username.value.trim().toLowerCase();
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;
            const role = registerForm.role.value; // Lấy vai trò từ form đăng ký

            let hasError = false;
            if (!username || !password || !confirmPassword || !role) {
                displayMessage('Vui lòng điền đầy đủ thông tin.', 'error', 'register');
                hasError = true;
            } else if (password !== confirmPassword) {
                displayMessage('Mật khẩu không khớp.', 'error', 'register');
                hasError = true;
            } else if (password.length < 6) {
                displayMessage('Mật khẩu phải ít nhất 6 ký tự.', 'error', 'register');
                hasError = true;
            }

            if (hasError) {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Đăng Ký';
                }
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, role }), // Gửi cả role lên backend
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Đăng ký thất bại.');

                displayMessage(data.message + ' Bạn có thể đăng nhập ngay bây giờ.', 'success', 'register');
                registerForm.reset();
                setTimeout(() => {
                    if (authFormWrapper) authFormWrapper.style.transform = 'translateX(0%)';
                    clearMessages();
                    if (loginForm && loginForm.username) {
                        loginForm.username.value = username;
                        if (loginForm.password) loginForm.password.focus();
                    }
                }, 2500);

            } catch (error) {
                displayMessage(error.message, 'error', 'register');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Đăng Ký';
                }
            }
        });
    }
});