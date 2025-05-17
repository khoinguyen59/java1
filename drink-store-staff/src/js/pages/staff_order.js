// src/js/pages/staff_order.js (trong thư mục drink-store-nhanvien)
document.addEventListener('DOMContentLoaded', function() {
    // Main page elements
    const menuSection = document.getElementById('menuSection');
    const menuItemsContainer = document.getElementById('menuItemsContainer');
    const menuSearchInput = document.getElementById('menuSearchInput');
    const categoryFilterMenu = document.getElementById('categoryFilterMenu');
    const cartIconWrapper = document.getElementById('cartIconWrapper');
    const cartItemCountBadgeEl = document.getElementById('cartItemCountBadge');

    // Full Page Cart View elements
    const fullPageCartView = document.getElementById('fullPageCartView');
    const closeFullCartBtn = document.getElementById('closeFullCartBtn');
    const fullCartItemsListEl = document.getElementById('fullCartItemsList');
    const fullCartSubtotalEl = document.getElementById('fullCartSubtotal');
    const fullCartItemCountEl = document.getElementById('fullCartItemCount');
    const clearFullCartBtn = document.getElementById('clearFullCartBtn');
    const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');

    // Checkout View elements
    const checkoutView = document.getElementById('checkoutView');
    const backToCartBtn = document.getElementById('backToCartBtn');
    const checkoutOrderSummaryListEl = document.getElementById('checkoutOrderSummaryList');
    const checkoutSubtotalEl = document.getElementById('checkoutSubtotal');
    const checkoutDiscountEl = document.getElementById('checkoutDiscount');
    const checkoutTotalAmountEl = document.getElementById('checkoutTotalAmount');
    const voucherCodeInput = document.getElementById('voucherCodeInput');
    const applyVoucherBtn = document.getElementById('applyVoucherBtn');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    const customerNameInput = document.getElementById('customerName');
    const customerPhoneInput = document.getElementById('customerPhone');

    // --- Custom Modal Elements ---
    const customAlertModal = document.getElementById('customAlertModal');
    const customAlertTitleEl = document.getElementById('customAlertTitle');
    const customAlertMessageEl = document.getElementById('customAlertMessage');
    const customAlertOkBtn = document.getElementById('customAlertOkBtn');
    const customAlertCloseBtn = document.getElementById('customAlertCloseBtn');

    const customConfirmModal = document.getElementById('customConfirmModal');
    const customConfirmTitleEl = document.getElementById('customConfirmTitle');
    const customConfirmMessageEl = document.getElementById('customConfirmMessage');
    const customConfirmOkBtn = document.getElementById('customConfirmOkBtn');
    const customConfirmCancelBtn = document.getElementById('customConfirmCancelBtn');
    const customConfirmCloseBtn = document.getElementById('customConfirmCloseBtn');
    let confirmResolve = null;
    // --- End Custom Modal Elements ---

    let allMenuItems = [];
    let cart = [];
    let currentDiscount = 0;

    const loggedInStaffName = localStorage.getItem('loggedInStaffName') || "Nhân Viên Demo";
    const loggedInStaffId = localStorage.getItem('loggedInStaffId') || "NV-DEMO";
    const PRODUCTS_API_URL = 'http://localhost:5001/api/products';
    const ORDERS_API_URL = 'http://localhost:5001/api/orders';
    const DEFAULT_PLACEHOLDER_IMAGE = 'src/assets/img/placeholder_drink.png';

    // --- Custom Modal Functions ---
    function showCustomAlert(message, title = "Thông báo") {
        if (!customAlertModal || !customAlertTitleEl || !customAlertMessageEl) {
            console.warn("Custom alert elements not found. Falling back to native alert.");
            alert(message);
            return;
        }
        customAlertTitleEl.textContent = title;
        customAlertMessageEl.innerHTML = message.replace(/\n/g, '<br>');
        customAlertModal.style.display = 'flex';
        setTimeout(() => customAlertModal.classList.add('show'), 10);
    }

    function hideCustomAlert() {
        if (!customAlertModal) return;
        customAlertModal.classList.remove('show');
        setTimeout(() => {
            if (!customAlertModal.classList.contains('show')) {
                customAlertModal.style.display = 'none';
            }
        }, 250);
    }

    if (customAlertOkBtn) customAlertOkBtn.addEventListener('click', hideCustomAlert);
    if (customAlertCloseBtn) customAlertCloseBtn.addEventListener('click', hideCustomAlert);
    if (customAlertModal) {
        customAlertModal.addEventListener('click', function(event) {
            if (event.target === customAlertModal) {
                hideCustomAlert();
            }
        });
    }

    function showCustomConfirm(message, title = "Xác nhận") {
        if (!customConfirmModal || !customConfirmTitleEl || !customConfirmMessageEl) {
            console.warn("Custom confirm elements not found. Falling back to native confirm.");
            return Promise.resolve(confirm(message));
        }
        return new Promise((resolve) => {
            confirmResolve = resolve;
            customConfirmTitleEl.textContent = title;
            customConfirmMessageEl.innerHTML = message.replace(/\n/g, '<br>');
            customConfirmModal.style.display = 'flex';
            setTimeout(() => customConfirmModal.classList.add('show'), 10);
        });
    }

    function hideCustomConfirm(resolution) {
        if (!customConfirmModal) return;
        customConfirmModal.classList.remove('show');
        setTimeout(() => {
            if (!customConfirmModal.classList.contains('show')) {
                customConfirmModal.style.display = 'none';
            }
        }, 250);
        if (confirmResolve) {
            confirmResolve(resolution);
            confirmResolve = null;
        }
    }

    if (customConfirmOkBtn) customConfirmOkBtn.addEventListener('click', () => hideCustomConfirm(true));
    if (customConfirmCancelBtn) customConfirmCancelBtn.addEventListener('click', () => hideCustomConfirm(false));
    if (customConfirmCloseBtn) customConfirmCloseBtn.addEventListener('click', () => hideCustomConfirm(false));
    if (customConfirmModal) {
        customConfirmModal.addEventListener('click', function(event) {
            if (event.target === customConfirmModal) {
                hideCustomConfirm(false);
            }
        });
    }
    // --- End Custom Modal Functions ---

    function formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    function showView(viewName) {
        if (menuSection) menuSection.style.display = 'none';
        if (fullPageCartView) fullPageCartView.style.display = 'none';
        if (checkoutView) checkoutView.style.display = 'none';

        const sidebar = document.querySelector('.sidebar');
        let leftOffset = '260px';
        let viewWidth = 'calc(100% - 260px)';

        if (sidebar) {
            const isSidebarClosed = sidebar.classList.contains('close');
            const sidebarComputedWidth = window.getComputedStyle(sidebar).width;

            if (isSidebarClosed) {
                leftOffset = '78px';
                viewWidth = 'calc(100% - 78px)';
            } else {
                leftOffset = '260px';
                viewWidth = 'calc(100% - 260px)';
            }
            
            if (window.innerWidth <= 768) {
                if (sidebarComputedWidth === '78px') {
                    leftOffset = '78px';
                    viewWidth = 'calc(100% - 78px)';
                } else if (sidebarComputedWidth === '260px') {
                     leftOffset = '260px';
                     viewWidth = 'calc(100% - 260px)';
                }
            }
        }

        if (viewName === 'menu' && menuSection) {
            menuSection.style.display = 'block';
        } else if (viewName === 'fullCart' && fullPageCartView) {
            fullPageCartView.style.display = 'flex';
            fullPageCartView.style.left = leftOffset;
            fullPageCartView.style.width = viewWidth;
            renderFullPageCart();
        } else if (viewName === 'checkout' && checkoutView) {
            checkoutView.style.display = 'flex';
            checkoutView.style.left = leftOffset;
            checkoutView.style.width = viewWidth;
            renderCheckoutView();
        }
    }
    
    const sidebarElement = document.querySelector(".sidebar");
    if (sidebarElement) {
        const sidebarObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    if (fullPageCartView && fullPageCartView.style.display === 'flex') {
                        showView('fullCart');
                    } else if (checkoutView && checkoutView.style.display === 'flex') {
                        showView('checkout');
                    }
                }
            });
        });
        sidebarObserver.observe(sidebarElement, { attributes: true });
    }

    async function loadMenuItems() {
        if (!menuItemsContainer) return;
        menuItemsContainer.innerHTML = '<p class="loading-text">Đang tải menu...</p>';
        try {
            const response = await fetch(`${PRODUCTS_API_URL}?limit=50&trangThai=Đang bán`);
            if (!response.ok) {
                let errorMsg = `Không thể tải menu. Status: ${response.status}`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }
            const data = await response.json();
            if (data.products && data.products.length > 0) {
                allMenuItems = data.products.map(p => {
                    let productImagePath = DEFAULT_PLACEHOLDER_IMAGE;
                    if (p.hinhAnh && p.hinhAnh.trim() !== '') {
                        productImagePath = `src/assets/img/products/${p.hinhAnh.trim()}`;
                    }
                    return {
                        ...p,
                        displayImage: productImagePath,
                        originalImageName: p.hinhAnh
                    };
                });
                renderMenuItems(allMenuItems);
                populateCategoryFilter(allMenuItems);
            } else {
                menuItemsContainer.innerHTML = '<p class="loading-text">Không có sản phẩm nào trong menu.</p>';
            }
        } catch (error) {
            console.error("Lỗi tải menu:", error);
            menuItemsContainer.innerHTML = `<p class="loading-text" style="color:red;">Lỗi tải menu: ${error.message}.</p>`;
        }
    }

    function populateCategoryFilter(items) {
        if (!categoryFilterMenu) return;
        const categories = [...new Set(items.map(item => item.danhMuc))];
        categoryFilterMenu.innerHTML = '<option value="">Tất cả danh mục</option>';
        categories.forEach(category => {
            if(category) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilterMenu.appendChild(option);
            }
        });
    }

    function renderMenuItems(itemsToRender) {
        if (!menuItemsContainer) return;
        menuItemsContainer.innerHTML = '';
        if (itemsToRender.length === 0) {
            menuItemsContainer.innerHTML = '<p class="loading-text">Không tìm thấy sản phẩm phù hợp.</p>';
            return;
        }
        itemsToRender.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            itemElement.innerHTML = `
                <img src="${item.displayImage}" alt="${item.tenSanPham}" onerror="this.onerror=null;this.src='${DEFAULT_PLACEHOLDER_IMAGE}';">
                <h4>${item.tenSanPham}</h4>
                <p class="price">${formatCurrency(item.giaBan)}</p>
                <button class="btn btn-primary btn-add-to-cart" data-id="${item._id}">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
            `;
            menuItemsContainer.appendChild(itemElement);
        });
    }

    function addToCart(productId) {
        const product = allMenuItems.find(p => p._id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: product._id,
                name: product.tenSanPham,
                price: product.giaBan,
                image: product.displayImage,
                quantity: 1
            });
        }
        updateCartDisplays();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartDisplays();
    }

    function updateCartItemQuantity(productId, newQuantity) {
        const itemInCart = cart.find(item => item.id === productId);
        if (itemInCart) {
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else {
                itemInCart.quantity = newQuantity;
            }
        }
        updateCartDisplays();
    }
    
    async function clearCart() {
        if (await showCustomConfirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng không?", "Xóa Giỏ Hàng")) {
            cart = [];
            currentDiscount = 0;
            if(voucherCodeInput) voucherCodeInput.value = '';
            updateCartDisplays();
        }
    }

    function updateCartDisplays() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemCountBadgeEl) {
            cartItemCountBadgeEl.textContent = totalItems;
            cartItemCountBadgeEl.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        if (fullPageCartView && fullPageCartView.style.display === 'flex') {
            renderFullPageCart();
        }
        if (checkoutView && checkoutView.style.display === 'flex') {
            renderCheckoutView();
        }
    }

    function renderFullPageCart() {
        if (!fullCartItemsListEl) return;
        fullCartItemsListEl.innerHTML = '';

        if (cart.length === 0) {
            fullCartItemsListEl.innerHTML = '<li class="empty-cart-message-panel">Giỏ hàng trống.</li>';
            if (proceedToCheckoutBtn) proceedToCheckoutBtn.disabled = true;
            if (clearFullCartBtn) clearFullCartBtn.style.display = 'none';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="cart-item-panel-image"><img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='${DEFAULT_PLACEHOLDER_IMAGE}';"></div>
                    <div class="cart-item-panel-details">
                        <span class="item-name">${item.name}</span>
                        <div class="item-qty-controls">
                            <button class="btn-qty btn-qty-decrease" data-id="${item.id}">-</button>
                            <span class="current-item-qty">${item.quantity}</span>
                            <button class="btn-qty btn-qty-increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-panel-price">${formatCurrency(item.price * item.quantity)}</div>
                    <div class="cart-item-panel-remove">
                        <button class="btn-remove-item-panel" data-id="${item.id}" title="Xóa sản phẩm"><i class="fas fa-times-circle"></i></button>
                    </div>
                `;
                fullCartItemsListEl.appendChild(li);
            });
            if (proceedToCheckoutBtn) proceedToCheckoutBtn.disabled = false;
            if (clearFullCartBtn) clearFullCartBtn.style.display = 'block';
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (fullCartSubtotalEl) fullCartSubtotalEl.textContent = formatCurrency(subtotal);
        if (fullCartItemCountEl) fullCartItemCountEl.textContent = totalItemsInCart;
    }

    function renderCheckoutView() {
        if (!checkoutOrderSummaryListEl) return;
        checkoutOrderSummaryListEl.innerHTML = '';

        if (cart.length === 0) {
            checkoutOrderSummaryListEl.innerHTML = '<li>Không có sản phẩm nào để thanh toán.</li>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="item-name-qty">${item.name} (x${item.quantity})</span>
                    <span class="item-total">${formatCurrency(item.price * item.quantity)}</span>
                `;
                checkoutOrderSummaryListEl.appendChild(li);
            });
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAmount = subtotal - currentDiscount;

        if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = formatCurrency(subtotal);
        if (checkoutDiscountEl) checkoutDiscountEl.textContent = formatCurrency(currentDiscount);
        if (checkoutTotalAmountEl) checkoutTotalAmountEl.textContent = formatCurrency(totalAmount < 0 ? 0 : totalAmount);
        
        if (confirmOrderBtn) confirmOrderBtn.disabled = cart.length === 0;
    }

    async function createOrder() {
        if (cart.length === 0) {
            showCustomAlert("Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi tạo đơn hàng.", "Lỗi");
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAmount = subtotal - currentDiscount;
        const selectedPaymentMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethodValue = selectedPaymentMethodRadio ? selectedPaymentMethodRadio.value : 'cash';

        const orderData = {
            staffId: loggedInStaffId,
            staffName: loggedInStaffName,
            customerName: customerNameInput ? customerNameInput.value.trim() : null,
            customerPhone: customerPhoneInput ? customerPhoneInput.value.trim() : null,
            items: cart.map(item => ({
                productId: item.id,
                tenSanPham: item.name,
                soLuong: item.quantity,
                donGia: item.price,
                thanhTien: item.price * item.quantity
            })),
            subtotal: subtotal,
            discountAmount: currentDiscount,
            voucherCode: currentDiscount > 0 && voucherCodeInput ? voucherCodeInput.value.trim() : null,
            totalAmount: totalAmount < 0 ? 0 : totalAmount,
            paymentMethod: paymentMethodValue,
            status: "Hoàn thành"
        };

        if (!await showCustomConfirm(`Xác nhận tạo đơn hàng với tổng tiền ${formatCurrency(orderData.totalAmount)}?`, "Xác Nhận Đơn Hàng")) {
            return;
        }

        try {
            // UNCOMMENT AND USE THIS FOR ACTUAL API CALL
            /*
            const response = await fetch(ORDERS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Tạo đơn hàng thất bại");
            }
            const createdOrder = await response.json();
            showCustomAlert(`Tạo đơn hàng thành công! Mã đơn: ${createdOrder.orderCode || createdOrder._id}`, "Thành Công");
            */
            
            showCustomAlert(`Đơn hàng ĐÃ ĐƯỢC TẠO (Mô phỏng).\nTổng tiền: ${formatCurrency(orderData.totalAmount)}\nNhân viên: ${orderData.staffName}`, "Tạo Đơn Hàng Thành Công");
            console.log("Order Data (Simulated):", orderData);
            
            cart = [];
            currentDiscount = 0;
            if(voucherCodeInput) voucherCodeInput.value = '';
            if(customerNameInput) customerNameInput.value = '';
            if(customerPhoneInput) customerPhoneInput.value = '';
            updateCartDisplays();
            showView('menu');
        } catch (error) {
            console.error("Lỗi tạo đơn:", error);
            showCustomAlert(`Lỗi khi tạo đơn hàng: ${error.message}`, "Lỗi Tạo Đơn Hàng");
        }
    }
    
    function applyVoucher() {
        const code = voucherCodeInput ? voucherCodeInput.value.trim().toUpperCase() : '';
        if (!code) {
            showCustomAlert("Vui lòng nhập mã khuyến mãi.", "Thiếu Thông Tin");
            return;
        }
        if (code === "GIAM10K") {
            currentDiscount = 10000;
            showCustomAlert("Áp dụng mã GIAM10K thành công! Bạn được giảm 10,000đ.", "Khuyến Mãi");
        } else if (code === "GIAM20PT") {
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            currentDiscount = subtotal * 0.20;
            showCustomAlert(`Áp dụng mã GIAM20PT thành công! Bạn được giảm ${formatCurrency(currentDiscount)} (20% của tạm tính).`, "Khuyến Mãi");
        } else {
            currentDiscount = 0;
            showCustomAlert("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.", "Khuyến Mãi Không Hợp Lệ");
        }
        renderCheckoutView();
    }

    // --- Event Listeners ---
    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', () => {
            const searchTerm = menuSearchInput.value.toLowerCase();
            const selectedCategory = categoryFilterMenu ? categoryFilterMenu.value : "";
            const filteredItems = allMenuItems.filter(item =>
                item.tenSanPham.toLowerCase().includes(searchTerm) &&
                (selectedCategory === "" || item.danhMuc === selectedCategory)
            );
            renderMenuItems(filteredItems);
        });
    }
    if (categoryFilterMenu) {
        categoryFilterMenu.addEventListener('change', () => {
            const searchTerm = menuSearchInput ? menuSearchInput.value.toLowerCase() : "";
            const selectedCategory = categoryFilterMenu.value;
            const filteredItems = allMenuItems.filter(item =>
                item.tenSanPham.toLowerCase().includes(searchTerm) &&
                (selectedCategory === "" || item.danhMuc === selectedCategory)
            );
            renderMenuItems(filteredItems);
        });
    }
    if (menuItemsContainer) {
        menuItemsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.btn-add-to-cart');
            if (button) {
                const productId = button.dataset.id;
                addToCart(productId);
            }
        });
    }
    if (cartIconWrapper) {
        cartIconWrapper.addEventListener('click', () => showView('fullCart'));
    }
    if (closeFullCartBtn) {
        closeFullCartBtn.addEventListener('click', () => showView('menu'));
    }
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => showView('menu'));
    }
    if (clearFullCartBtn) {
        clearFullCartBtn.addEventListener('click', clearCart);
    }
    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                showView('checkout');
            } else {
                showCustomAlert("Giỏ hàng trống. Vui lòng thêm sản phẩm.", "Thông Báo");
            }
        });
    }
    if (fullCartItemsListEl) {
        fullCartItemsListEl.addEventListener('click', (event) => {
            const target = event.target;
            const button = target.closest('[data-id]');
            if (!button) return;
            
            const productId = button.dataset.id;

            if (button.classList.contains('btn-qty-increase')) {
                const item = cart.find(i => i.id === productId);
                if (item) updateCartItemQuantity(productId, item.quantity + 1);
            } else if (button.classList.contains('btn-qty-decrease')) {
                const item = cart.find(i => i.id === productId);
                if (item) updateCartItemQuantity(productId, item.quantity - 1);
            } else if (button.classList.contains('btn-remove-item-panel')) {
                removeFromCart(productId);
            }
        });
    }
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => showView('fullCart'));
    }
    if (applyVoucherBtn) {
        applyVoucherBtn.addEventListener('click', applyVoucher);
    }
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', createOrder);
    }

    // --- Initial Load ---
    loadMenuItems();
    updateCartDisplays();
    showView('menu');
});