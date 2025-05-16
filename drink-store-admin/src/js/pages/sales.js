// src/js/pages/sales.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sales page specific JavaScript loaded!');

    // Khởi tạo Biểu đồ Doanh Thu (salesRevenueChart)
    try {
        const salesCtx = document.getElementById('salesRevenueChart')?.getContext('2d');
        if (salesCtx) {
            const salesRevenueChart = new Chart(salesCtx, {
                type: 'bar', // Hoặc 'line' tùy theo bạn muốn
                data: {
                    // Dữ liệu mẫu, bạn sẽ cần thay thế bằng dữ liệu thực từ backend hoặc filter
                    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'],
                    datasets: [{
                        label: 'Doanh Thu (triệu đ)',
                        data: [45, 52, 60, 55, 65, 70, 58], // Dữ liệu mẫu
                        backgroundColor: 'rgba(46, 204, 113, 0.6)', // Màu xanh lá cây
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + ' tr'; // Hoặc định dạng tiền tệ đầy đủ
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y * 1000000);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
            console.log("Sales revenue chart initialized successfully.");
        } else {
            console.warn("Canvas element with ID 'salesRevenueChart' not found.");
        }
    } catch (error) {
        console.error("Error initializing sales revenue chart:", error);
    }

    // Xử lý sự kiện cho nút Lọc
    const btnFilterSales = document.getElementById('btnFilterSales');
    const timeRangeSelect = document.getElementById('time-range-sales');

    if (btnFilterSales && timeRangeSelect) {
        btnFilterSales.addEventListener('click', function() {
            const selectedTimeRange = timeRangeSelect.value;
            alert(`Lọc doanh số theo: ${selectedTimeRange}. (Cần logic thực tế để tải và cập nhật dữ liệu/biểu đồ)`);
            // Logic thực tế:
            // 1. Lấy giá trị từ các bộ lọc (ngày bắt đầu, ngày kết thúc nếu có thêm)
            // 2. Gửi request AJAX đến backend để lấy dữ liệu mới theo bộ lọc
            // 3. Cập nhật data cho salesRevenueChart: salesRevenueChart.data.labels = newLabels; salesRevenueChart.data.datasets[0].data = newData; salesRevenueChart.update();
            // 4. Cập nhật bảng giao dịch và danh sách sản phẩm bán chạy
        });
    }

    // Xử lý sự kiện cho các nút hành động trong bảng giao dịch (tương tự trang products)
    const transactionsTableBody = document.querySelector('.recent-transactions-table tbody');
    if (transactionsTableBody) {
        transactionsTableBody.addEventListener('click', function(event) {
            const target = event.target.closest('button.btn-action');
            if (!target) return;

            const row = target.closest('tr');
            const orderId = row.querySelector('td:first-child').textContent;

            if (target.classList.contains('btn-view')) {
                alert(`Xem chi tiết hóa đơn: ${orderId}`);
            } else if (target.classList.contains('btn-edit')) {
                alert(`Chỉnh sửa hóa đơn: ${orderId} (Chức năng này có thể phức tạp)`);
            } else if (target.classList.contains('btn-delete')) {
                if (confirm(`Bạn có chắc chắn muốn xóa hóa đơn "${orderId}" không?`)) {
                    alert(`Xóa hóa đơn: ${orderId}`);
                    // row.remove();
                }
            }
        });
    }
});