// src/js/pages/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard specific JavaScript loaded!');

    // Khởi tạo Biểu đồ Doanh Thu Theo Ngày (dailyRevenueChart)
    try {
        const dailyCtx = document.getElementById('dailyRevenueChart')?.getContext('2d');
        if (dailyCtx) {
            const dailyRevenueChart = new Chart(dailyCtx, {
                type: 'line',
                data: {
                    // Sử dụng labels từ code gốc của bạn, điều chỉnh nếu cần
                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27'],
                    datasets: [{
                        label: 'Doanh Thu (triệu đ)',
                        // Sử dụng data từ code gốc của bạn, điều chỉnh nếu cần
                        data: [3.2, 1.5, 1.8, 4.6, 2.1, 2.5, 2.3, 2.8, 3.1, 2.9, 3.5, 3.8, 2.6, 4.0, 4.2, 3.9, 4.5, 3.8, 2.6, 5.1, 5.0, 4.7, 6.3, 3.5, 4.2, 5.8, 5.6],
                        borderColor: 'rgb(52, 152, 219)', // var(--accent-color)
                        tension: 0.1,
                        fill: true,
                        backgroundColor: 'rgba(52, 152, 219, 0.1)'
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
                                    // Điều chỉnh đơn vị nếu cần, ví dụ của bạn là 'triệu'
                                    return value + ' tr'; // Hoặc ' tỷ' nếu dữ liệu thực sự lớn
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true, // Hoặc false nếu không muốn hiển thị legend
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
                                        // Định dạng lại số tiền cho tooltip
                                        label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y * 1000000);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            console.warn("Canvas element with ID 'dailyRevenueChart' not found on this page.");
        }
    } catch (error) {
        console.error("Error initializing daily revenue chart:", error);
    }

    // Các logic JavaScript khác dành riêng cho trang Dashboard có thể thêm vào đây
});