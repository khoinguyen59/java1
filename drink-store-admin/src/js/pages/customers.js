// js/customers.js
// (Dán toàn bộ nội dung của file js/pages/customers-modal-view.js từ câu trả lời trước vào đây)
document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'http://localhost:3000/api'; // Thay bằng URL backend

    // --- DOM Elements ---
    // Main Customer List
    const mainCustomerSearchInput = document.getElementById('mainCustomerSearchInput');
    const mainCustomerTableBody = document.getElementById('mainCustomerTableBody');
    const mainCustomerPagination = document.getElementById('mainCustomerPagination');
    const addMainCustomerBtn = document.getElementById('addMainCustomerBtn');

    // Customer Detail Modal (Large Modal)
    const customerDetailModal = document.getElementById('customerDetailModal');
    const customerDetailModalTitle = document.getElementById('customerDetailModalTitle');
    const closeCustomerDetailModalBtn = document.getElementById('closeCustomerDetailModal');
    const customerDetailModalBody = document.getElementById('customerDetailModalBody');
    const modalDetailLoadingSpinner = customerDetailModalBody.querySelector('.loading-spinner-container');
    const modalDetailContentWrapper = customerDetailModalBody.querySelector('.detail-content-wrapper');
    // Fields in Large Modal
    const modalDetailAvatar = document.getElementById('modalDetailAvatar');
    const modalDetailName = document.getElementById('modalDetailName');
    const modalDetailEmail = document.getElementById('modalDetailEmail');
    const modalDetailPhone = document.getElementById('modalDetailPhone'); // Thêm ID này vào HTML nếu chưa có
    const modalDetailAddress = document.getElementById('modalDetailAddress'); // Thêm ID này vào HTML nếu chưa có
    const modalDetailRegDate = document.getElementById('modalDetailRegDate'); // Thêm ID này vào HTML nếu chưa có

    const modalEditCustomerBtn = document.getElementById('modalEditCustomerBtn');
    const modalTotalAmountSpent = document.getElementById('modalTotalAmountSpent');
    const modalTotalInvoicesCount = document.getElementById('modalTotalInvoicesCount');
    const modalReturnFrequencyChartCanvas = document.getElementById('modalCustomerReturnFrequencyChart');
    let modalReturnFrequencyChartInstance = null;
    const modalCustomerInvoicesTableBody = document.getElementById('modalCustomerInvoicesTableBody');
    const modalCustomerInvoicesPagination = document.getElementById('modalCustomerInvoicesPagination');


    // Invoice Item Detail Modal (Small Modal)
    const invoiceItemDetailModal = document.getElementById('invoiceItemDetailModal');
    // const invoiceItemModalTitle = document.getElementById('invoiceItemModalTitle'); // Đã có trong HTML
    const closeInvoiceItemModalBtn = document.getElementById('closeInvoiceItemModal');
    const invoiceItemModalInvoiceId = document.getElementById('invoiceItemModalInvoiceId');
    const invoiceItemModalBody = document.getElementById('invoiceItemModalBody');


    // --- State Variables ---
    let currentMainCustomerPage = 1;
    let currentModalInvoicesPage = 1;
    const itemsPerPage = 10;
    let selectedCustomerForDetail = null; // Object khách hàng đang xem chi tiết
    let invoicesForSelectedCustomer = []; // Cache hóa đơn của khách hàng đang xem

    // --- API Helper ---
    async function fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Lỗi HTTP ${response.status}: ${errorData.message || 'Không rõ lỗi'}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Lỗi khi fetch ${endpoint}:`, error);
            alert(`Lỗi: ${error.message}`); // Hoặc sử dụng toast notification
            throw error;
        }
    }

    // --- Main Customer List Functions ---
    async function loadMainCustomerList(page = 1, searchTerm = '') {
        mainCustomerTableBody.innerHTML = `<tr><td colspan="6" class="loading-text">Đang tải...</td></tr>`;
        try {
            // const data = await fetchData(`/customers?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}&fields=name,email,phone,avatarUrl,registrationDate`);
            // --- Dữ liệu mẫu cho Main Customer List ---
            await new Promise(resolve => setTimeout(resolve, 500));
            const sampleAllCustomers = [
                { _id: "cust001", name: "Nguyễn Văn An", email: "an.nv@example.com", phone: "0912345678", avatarUrl: "assets/img/avatars/customer1.png", registrationDate: "2023-01-15T00:00:00Z" },
                { _id: "cust002", name: "Trần Thị Bích", email: "bich.tt@example.com", phone: "0987654321", avatarUrl: "assets/img/avatars/customer2.png", registrationDate: "2023-03-20T00:00:00Z" },
                { _id: "cust003", name: "Lê Hoàng Cường", email: "cuong.lh@example.com", phone: "0905123789", registrationDate: "2023-05-10T00:00:00Z" },
                 ...Array.from({ length: 7 }, (_, i) => ({ _id: `sample${i}`, name: `Khách Hàng Mẫu ${i + 4}`, email: `sample${i+3}@example.com`, phone: `090000000${i}`, registrationDate: new Date(Date.now() - Math.random() * 1e10).toISOString() }))
            ];
            const filteredCustomers = searchTerm
                ? sampleAllCustomers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
                : sampleAllCustomers;
            const totalItems = filteredCustomers.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const paginatedCustomers = filteredCustomers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
            const data = { customers: paginatedCustomers, totalPages, currentPage: page, totalItems };
            // --- Kết thúc dữ liệu mẫu ---

            renderMainCustomerTable(data.customers);
            renderPagination(mainCustomerPagination, data.totalPages, data.currentPage, (newPage) => loadMainCustomerList(newPage, mainCustomerSearchInput.value.trim()));
            currentMainCustomerPage = data.currentPage;
        } catch (error) {
            mainCustomerTableBody.innerHTML = `<tr><td colspan="6" class="no-data-text">Lỗi tải danh sách.</td></tr>`;
        }
    }

    function renderMainCustomerTable(customers) {
        mainCustomerTableBody.innerHTML = '';
        if (!customers || customers.length === 0) {
            mainCustomerTableBody.innerHTML = `<tr><td colspan="6" class="no-data-text">Không có khách hàng.</td></tr>`;
            return;
        }
        customers.forEach(customer => {
            const row = mainCustomerTableBody.insertRow();
            row.innerHTML = `
                <td data-label="Ảnh">
                    ${customer.avatarUrl
                        ? `<img src="${customer.avatarUrl}" alt="${customer.name}" class="customer-avatar-sm">`
                        : `<span class="placeholder-avatar-sm"><i class="fas fa-user"></i></span>`
                    }
                </td>
                <td data-label="Tên Khách Hàng">${customer.name}</td>
                <td data-label="Email">${customer.email}</td>
                <td data-label="Điện Thoại">${customer.phone || 'N/A'}</td>
                <td data-label="Ngày Đăng Ký">${new Date(customer.registrationDate).toLocaleDateString('vi-VN')}</td>
                <td data-label="Hành Động">
                    <button class="btn-action btn-view" title="Xem chi tiết" data-customer-id="${customer._id}"><i class="fas fa-eye"></i></button>
                    <button class="btn-action btn-edit" title="Sửa" data-customer-id="${customer._id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" title="Xóa" data-customer-id="${customer._id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            row.querySelector('.btn-view').addEventListener('click', function() {
                openCustomerDetailModal(this.dataset.customerId);
            });
            // TODO: Gắn sự kiện cho nút sửa, xóa trên bảng chính
             row.querySelector('.btn-edit').addEventListener('click', function() {
                alert(`Chức năng sửa khách hàng ${this.dataset.customerId} (bảng chính) chưa được triển khai.`);
            });
            row.querySelector('.btn-delete').addEventListener('click', function() {
                if(confirm(`Bạn có chắc muốn xóa khách hàng ${this.closest('tr').cells[1].textContent}?`)){
                    alert(`Chức năng xóa khách hàng ${this.dataset.customerId} (bảng chính) chưa được triển khai.`);
                    // TODO: Gọi API xóa và load lại danh sách
                }
            });
        });
    }

    // --- Customer Detail Modal (Large Modal) Functions ---
    async function openCustomerDetailModal(customerId) {
        customerDetailModal.classList.add('active');
        modalDetailLoadingSpinner.style.display = 'flex';
        modalDetailContentWrapper.style.display = 'none';
        currentModalInvoicesPage = 1;

        try {
            // const data = await fetchData(`/customers/${customerId}/details-for-modal`);
            // --- Dữ liệu mẫu cho Customer Detail Modal ---
            await new Promise(resolve => setTimeout(resolve, 1000));
            const allSampleCustomers = [
                { _id: "cust001", name: "Nguyễn Văn An", email: "an.nv@example.com", phone: "0912345678", address: "123 Đường ABC, Q1, HCM", avatarUrl: "assets/img/avatars/customer1.png", registrationDate: "2023-01-15T00:00:00Z", totalSpent: 275000, totalOrders: 4 },
                { _id: "cust002", name: "Trần Thị Bích", email: "bich.tt@example.com", phone: "0987654321", address: "456 Đường XYZ, Q. HK, HN", avatarUrl: "assets/img/avatars/customer2.png", registrationDate: "2023-03-20T00:00:00Z", totalSpent: 87000, totalOrders: 1 },
                { _id: "cust003", name: "Lê Hoàng Cường", email: "cuong.lh@example.com", phone: "0905123789", address: "789 Đường KLM, Q. HC, DN", registrationDate: "2023-05-10T00:00:00Z", totalSpent: 0, totalOrders: 0 },
            ];
            selectedCustomerForDetail = allSampleCustomers.find(c => c._id === customerId) || { name: "Không rõ", _id: customerId, email: "", phone: "", address: "", registrationDate: new Date().toISOString(), totalSpent: 0, totalOrders: 0 };

            const sampleAllInvoicesForCustomer = [
                { _id: "inv001", customerId: "cust001", invoiceCode: "HD001", orderDate: "2023-10-25T10:30:00Z", totalAmount: 125000, status: "Đã Giao", items: [{ productName: "Cà Phê Đen Đá", quantity: 2, priceAtPurchase: 30000, subtotal: 60000 }, { productName: "Bánh mì", quantity: 1, priceAtPurchase: 20000, subtotal: 20000 }] },
                { _id: "inv003", customerId: "cust001", invoiceCode: "HD003", orderDate: "2023-12-01T09:00:00Z", totalAmount: 75000, status: "Hoàn Thành", items: [{ productName: "Trà Sữa Trân Châu", quantity: 1, priceAtPurchase: 45000, subtotal: 45000 }] },
                { _id: "inv004", customerId: "cust001", invoiceCode: "HD004", orderDate: "2024-01-15T11:00:00Z", totalAmount: 30000, status: "Hoàn Thành", items: [{ productName: "Cà Phê Đen Đá", quantity: 1, priceAtPurchase: 30000, subtotal: 30000 }] },
                { _id: "inv005", customerId: "cust001", invoiceCode: "HD005", orderDate: "2024-02-01T11:00:00Z", totalAmount: 45000, status: "Hoàn Thành", items: [{ productName: "Trà Sữa Trân Châu", quantity: 1, priceAtPurchase: 45000, subtotal: 45000 }] },
                { _id: "inv002", customerId: "cust002", invoiceCode: "HD002", orderDate: "2023-11-10T15:00:00Z", totalAmount: 87000, status: "Đang Xử Lý", items: [{ productName: "Nước Ép Cam", quantity: 1, priceAtPurchase: 42000, subtotal: 42000 }] },
            ].filter(inv => inv.customerId === customerId);
            invoicesForSelectedCustomer = sampleAllInvoicesForCustomer;

            const totalInvoices = invoicesForSelectedCustomer.length;
            const totalPagesInvoices = Math.ceil(totalInvoices / itemsPerPage);
            const paginatedInvoices = invoicesForSelectedCustomer.slice((currentModalInvoicesPage - 1) * itemsPerPage, currentModalInvoicesPage * itemsPerPage);

            const monthlyVisits = {};
            invoicesForSelectedCustomer.forEach(invoice => {
                const monthYear = new Date(invoice.orderDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
                monthlyVisits[monthYear] = (monthlyVisits[monthYear] || 0) + 1;
            });
            const sortedMonths = Object.keys(monthlyVisits).sort((a, b) => {
                const [monthA, yearA] = a.split('/'); const [monthB, yearB] = b.split('/');
                return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
            });
            const frequencyData = { labels: sortedMonths.map(my => `T${my.replace('/', '-')}`), visits: sortedMonths.map(month => monthlyVisits[month]) };

            const data = {
                customerInfo: selectedCustomerForDetail,
                invoices: paginatedInvoices,
                totalInvoicesPages: totalPagesInvoices,
                currentInvoicePage: currentModalInvoicesPage,
                // Lấy totalSpent, totalOrders từ selectedCustomerForDetail vì API nên trả về cái này
                totalSpent: selectedCustomerForDetail.totalSpent,
                totalOrders: selectedCustomerForDetail.totalOrders,
                frequencyData
            };
            // --- Kết thúc dữ liệu mẫu ---

            renderCustomerDetailModalContent(data);
            modalDetailLoadingSpinner.style.display = 'none';
            modalDetailContentWrapper.style.display = 'block';
        } catch (error) {
            modalDetailLoadingSpinner.style.display = 'none';
            modalDetailContentWrapper.innerHTML = `<p class="no-data-text">Lỗi tải chi tiết khách hàng.</p>`;
            modalDetailContentWrapper.style.display = 'block';
        }
    }

    function renderCustomerDetailModalContent(data) {
        const { customerInfo, invoices, totalInvoicesPages, currentInvoicePage, totalSpent, totalOrders, frequencyData } = data;

        customerDetailModalTitle.textContent = `Chi Tiết Khách Hàng: ${customerInfo.name}`;
        modalDetailAvatar.src = customerInfo.avatarUrl || 'assets/img/customer_avatar_placeholder.png';
        modalDetailName.textContent = customerInfo.name;
        modalDetailEmail.innerHTML = `<i class="fas fa-envelope"></i> ${customerInfo.email || 'N/A'}`;
        modalDetailPhone.innerHTML = `<i class="fas fa-phone"></i> ${customerInfo.phone || 'N/A'}`;
        modalDetailAddress.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${customerInfo.address || 'N/A'}`;
        modalDetailRegDate.innerHTML = `<i class="fas fa-calendar-alt"></i> ${new Date(customerInfo.registrationDate).toLocaleDateString('vi-VN')}`;

        modalTotalAmountSpent.textContent = `${(totalSpent || 0).toLocaleString('vi-VN')} đ`;
        modalTotalInvoicesCount.textContent = totalOrders || 0;

        if (modalReturnFrequencyChartInstance) modalReturnFrequencyChartInstance.destroy();
        if (modalReturnFrequencyChartCanvas && frequencyData.labels.length > 0) {
            const ctx = modalReturnFrequencyChartCanvas.getContext('2d');
            modalReturnFrequencyChartInstance = new Chart(ctx, {
                type: 'bar',
                data: { labels: frequencyData.labels, datasets: [{ label: 'Số Lần Quay Lại', data: frequencyData.visits, backgroundColor: 'rgba(52, 152, 219, 0.6)', borderColor: 'rgb(52, 152, 219)', borderWidth: 1 }] },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }
            });
        } else if (modalReturnFrequencyChartCanvas) {
            const ctx = modalReturnFrequencyChartCanvas.getContext('2d');
            ctx.clearRect(0, 0, modalReturnFrequencyChartCanvas.width, modalReturnFrequencyChartCanvas.height);
        }

        renderModalInvoicesTable(invoices);
        renderPagination(modalCustomerInvoicesPagination, totalInvoicesPages, currentInvoicePage,
            (newPage) => loadModalInvoicesPage(newPage)
        );
    }

    function renderModalInvoicesTable(invoices) {
        modalCustomerInvoicesTableBody.innerHTML = '';
        if (!invoices || invoices.length === 0) {
            modalCustomerInvoicesTableBody.innerHTML = `<tr><td colspan="5" class="no-data-text">Không có hóa đơn.</td></tr>`;
            return;
        }
        invoices.forEach(invoice => {
            const row = modalCustomerInvoicesTableBody.insertRow();
            row.innerHTML = `
                <td>${invoice.invoiceCode}</td>
                <td>${new Date(invoice.orderDate).toLocaleDateString('vi-VN')}</td>
                <td>${invoice.totalAmount.toLocaleString('vi-VN')} đ</td>
                <td><span class="status ${invoice.status.toLowerCase().replace(/\s+/g, '-')}">${invoice.status}</span></td>
                <td><button class="btn-action btn-view-invoice-item" data-invoice-id="${invoice._id}"><i class="fas fa-eye"></i></button></td>
            `;
            row.querySelector('.btn-view-invoice-item').addEventListener('click', function() {
                const fullInvoice = invoicesForSelectedCustomer.find(inv => inv._id === this.dataset.invoiceId);
                if (fullInvoice) openInvoiceItemDetailModal(fullInvoice);
            });
        });
    }

    function loadModalInvoicesPage(page) {
        currentModalInvoicesPage = page;
        const paginatedInvoices = invoicesForSelectedCustomer.slice((page - 1) * itemsPerPage, page * itemsPerPage);
        const totalPages = Math.ceil(invoicesForSelectedCustomer.length / itemsPerPage);

        renderModalInvoicesTable(paginatedInvoices);
        renderPagination(modalCustomerInvoicesPagination, totalPages, page, (newPage) => loadModalInvoicesPage(newPage));
    }

    // --- Invoice Item Detail Modal (Small Modal) Functions ---
    function openInvoiceItemDetailModal(invoice) {
        invoiceItemModalInvoiceId.textContent = invoice.invoiceCode;
        let itemsHtml = invoice.items.map(item => `
            <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${(item.priceAtPurchase || item.price || 0).toLocaleString('vi-VN')} đ</td>
                <td>${(item.subtotal || 0).toLocaleString('vi-VN')} đ</td>
            </tr>
        `).join('');
        invoiceItemModalBody.innerHTML = `
            <p><strong>Ngày Đặt:</strong> ${new Date(invoice.orderDate).toLocaleString('vi-VN')}</p>
            <p><strong>Trạng Thái:</strong> ${invoice.status}</p>
            <hr>
            <h5>Sản phẩm đã mua:</h5>
            <table>
                <thead><tr><th>Tên Sản Phẩm</th><th>Số Lượng</th><th>Đơn Giá</th><th>Thành Tiền</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="text-align:right; font-weight:bold; margin-top:10px;">Tổng cộng: ${invoice.totalAmount.toLocaleString('vi-VN')} đ</p>
        `;
        invoiceItemDetailModal.classList.add('active');
    }

    // --- Pagination Helper ---
    function renderPagination(container, totalPages, currentPage, callback) {
        container.innerHTML = '';
        if (totalPages <= 1) return;
        const createLink = (text, page, isDisabled = false, isActive = false) => {
            const a = document.createElement('a'); a.href = '#'; a.innerHTML = text;
            if (isDisabled) a.classList.add('disabled'); if (isActive) a.classList.add('active');
            if (!isDisabled) { a.addEventListener('click', (e) => { e.preventDefault(); callback(page); }); }
            return a;
        };
        container.appendChild(createLink('«', currentPage - 1, currentPage === 1));
        for (let i = 1; i <= totalPages; i++) { container.appendChild(createLink(i, i, false, i === currentPage)); }
        container.appendChild(createLink('»', currentPage + 1, currentPage === totalPages));
    }

    // --- Event Listeners ---
    let mainSearchTimeout;
    mainCustomerSearchInput.addEventListener('input', () => {
        clearTimeout(mainSearchTimeout);
        mainSearchTimeout = setTimeout(() => {
            currentMainCustomerPage = 1;
            loadMainCustomerList(currentMainCustomerPage, mainCustomerSearchInput.value.trim());
        }, 500);
    });

    closeCustomerDetailModalBtn.addEventListener('click', () => customerDetailModal.classList.remove('active'));
    closeInvoiceItemModalBtn.addEventListener('click', () => invoiceItemDetailModal.classList.remove('active'));

    customerDetailModal.addEventListener('click', function(event) {
        if (event.target === customerDetailModal) {
            customerDetailModal.classList.remove('active');
        }
    });
    invoiceItemDetailModal.addEventListener('click', function(event) {
        if (event.target === invoiceItemDetailModal) {
            invoiceItemDetailModal.classList.remove('active');
        }
    });

    if (addMainCustomerBtn) addMainCustomerBtn.addEventListener('click', () => alert('Chức năng Thêm Khách Hàng (bảng chính) chưa triển khai.'));
    if (modalEditCustomerBtn) modalEditCustomerBtn.addEventListener('click', () => {
        if(selectedCustomerForDetail) {
            alert(`Chức năng Sửa Khách Hàng ${selectedCustomerForDetail.name} (${selectedCustomerForDetail._id}) chưa triển khai.`);
        }
    });

    // --- Initial Load ---
    loadMainCustomerList();
});