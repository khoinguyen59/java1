// src/js/pages/products.js
document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:5001/api/products'; // Đảm bảo backend chạy ở port này
    const tableBody = document.getElementById('productsTableBody');
    const paginationControls = document.getElementById('paginationControls');
    const searchInput = document.getElementById('searchProductInput');

    // Modal elements
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnAddProduct = document.getElementById('btnAddProduct');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const productIdField = document.getElementById('productId'); // Hidden input for product ID when editing

    let currentPage = 1;
    const productsPerPage = 4; // Số sản phẩm mỗi trang, bạn có thể thay đổi
    let currentSearchTerm = "";

    // --- Modal Functions ---
    function openModal(title = "Thêm Sản Phẩm Mới", product = null) {
        modalTitle.textContent = title;
        productForm.reset();
        productIdField.value = ''; // Reset hidden ID field

        if (product) { // Editing existing product
            productIdField.value = product._id;
            document.getElementById('maSPModal').value = product.maSP;
            document.getElementById('tenSanPhamModal').value = product.tenSanPham;
            document.getElementById('danhMucModal').value = product.danhMuc;
            document.getElementById('giaBanModal').value = product.giaBan;
            document.getElementById('trangThaiModal').value = product.trangThai;
            document.getElementById('maSPModal').readOnly = true; // Không cho sửa Mã SP khi edit
        } else { // Adding new product
            document.getElementById('maSPModal').readOnly = false;
        }
        productModal.style.display = 'block';
    }

    function closeModal() {
        productModal.style.display = 'none';
    }

    if(btnAddProduct) btnAddProduct.addEventListener('click', () => openModal());
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => { // Close modal if click outside
        if (event.target == productModal) {
            closeModal();
        }
    });

    // --- Fetch and Display Products with Pagination ---
    async function fetchAndDisplayProducts(page = 1, limit = productsPerPage, searchTerm = "") {
        currentPage = page;
        currentSearchTerm = searchTerm;
        try {
            const response = await fetch(`${API_URL}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            tableBody.innerHTML = ''; // Clear previous data
            if (data.products && data.products.length > 0) {
                data.products.forEach(product => {
                    const row = tableBody.insertRow();
                    row.innerHTML = `
                        <td data-label="Mã SP">${product.maSP}</td>
                        <td data-label="Tên Sản Phẩm">${product.tenSanPham}</td>
                        <td data-label="Danh Mục">${product.danhMuc}</td>
                        <td data-label="Giá Bán (VNĐ)">${product.giaBan.toLocaleString('vi-VN')}</td>
                        <td data-label="Trạng Thái"><span class="status ${product.trangThai === 'Đang bán' ? 'active' : (product.trangThai === 'Ngừng bán' ? 'inactive' : 'pending')}">${product.trangThai}</span></td>
                        <td data-label="Hành Động">
                            <button class="btn-action btn-edit" data-id="${product._id}" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-delete" data-id="${product._id}" title="Xóa"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Không tìm thấy sản phẩm nào.</td></tr>`;
            }
            renderPagination(data.totalPages, data.currentPage);
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
            renderPagination(0,1); // No pages if error
        }
    }

    // --- Render Pagination Controls ---
    function renderPagination(totalPages, currentPage) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;

        // Previous button
        const prevButton = document.createElement('a');
        prevButton.href = '#';
        prevButton.innerHTML = '«';
        if (currentPage === 1) prevButton.classList.add('disabled'); // Add 'disabled' class if on first page
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) fetchAndDisplayProducts(currentPage - 1, productsPerPage, currentSearchTerm);
        });
        paginationControls.appendChild(prevButton);

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('a');
            pageButton.href = '#';
            pageButton.textContent = i;
            if (i === currentPage) pageButton.classList.add('active');
            pageButton.addEventListener('click', (e) => {
                e.preventDefault();
                fetchAndDisplayProducts(i, productsPerPage, currentSearchTerm);
            });
            paginationControls.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('a');
        nextButton.href = '#';
        nextButton.innerHTML = '»';
        if (currentPage === totalPages) nextButton.classList.add('disabled');
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) fetchAndDisplayProducts(currentPage + 1, productsPerPage, currentSearchTerm);
        });
        paginationControls.appendChild(nextButton);
    }
     // Add .disabled style to your CSS if you haven't:
    // .pagination a.disabled { pointer-events: none; opacity: 0.6; }


    // --- Form Submission (Add/Edit Product) ---
    productForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(productForm);
        const productData = {
            maSP: formData.get('maSP'),
            tenSanPham: formData.get('tenSanPham'),
            danhMuc: formData.get('danhMuc'),
            giaBan: parseFloat(formData.get('giaBan')), // Ensure it's a number
            trangThai: formData.get('trangThai')
        };
        const currentProductId = productIdField.value;

        let url = API_URL;
        let method = 'POST';

        if (currentProductId) { // Editing
            url = `${API_URL}/${currentProductId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            closeModal();
            fetchAndDisplayProducts(currentProductId ? currentPage : 1, productsPerPage, currentSearchTerm); // Refresh current page or go to first page on add
            alert(currentProductId ? 'Sản phẩm đã được cập nhật!' : 'Sản phẩm đã được thêm!');
        } catch (error) {
            console.error('Lỗi khi lưu sản phẩm:', error);
            alert(`Lỗi: ${error.message}`);
        }
    });

    // --- Event Delegation for Edit and Delete Buttons ---
    tableBody.addEventListener('click', async function(event) {
        const targetButton = event.target.closest('button.btn-action');
        if (!targetButton) return;

        const productId = targetButton.dataset.id;

        if (targetButton.classList.contains('btn-edit')) {
            try {
                const response = await fetch(`${API_URL}/${productId}`);
                if (!response.ok) throw new Error('Không thể tải thông tin sản phẩm để sửa.');
                const productToEdit = await response.json();
                openModal("Chỉnh Sửa Sản Phẩm", productToEdit);
            } catch (error) {
                alert(`Lỗi: ${error.message}`);
            }
        } else if (targetButton.classList.contains('btn-delete')) {
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
                try {
                    const response = await fetch(`${API_URL}/${productId}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Xóa sản phẩm thất bại.');
                    fetchAndDisplayProducts(currentPage, productsPerPage, currentSearchTerm);
                    alert('Sản phẩm đã được xóa!');
                } catch (error) {
                    alert(`Lỗi: ${error.message}`);
                }
            }
        }
    });

    // --- Search Functionality ---
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                fetchAndDisplayProducts(1, productsPerPage, event.target.value.trim());
            }, 500); // Đợi 500ms sau khi người dùng ngừng gõ mới tìm kiếm
        });
    }

    // --- Refresh Button ---
    const btnRefreshProducts = document.getElementById('btnRefreshProducts');
    if (btnRefreshProducts) {
        btnRefreshProducts.addEventListener('click', () => fetchAndDisplayProducts(1, productsPerPage, "")); // Reset search on refresh
    }
    
    // --- Export Excel Button (Placeholder) ---
    const btnExportExcel = document.getElementById('btnExportExcel');
    if (btnExportExcel) {
        btnExportExcel.addEventListener('click', function() {
            alert('Chức năng "Xuất Excel" cần được triển khai (thường ở backend hoặc dùng thư viện JS).');
        });
    }

    // Initial load of products
    fetchAndDisplayProducts();
});