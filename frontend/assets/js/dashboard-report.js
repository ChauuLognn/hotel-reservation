/**
 * Dashboard Report Manager
 * Handles fetching and displaying report data from backend
 * 
 * QUAN TRỌNG: File config.js phải được load trước file này
 */

// Sử dụng API_CONFIG từ config.js (đã được load trong index.html)
const API_BASE_URL = typeof API_CONFIG !== 'undefined' 
    ? API_CONFIG.BASE_URL 
    : 'http://localhost:8080/hotel_reservation_premium';

document.addEventListener('DOMContentLoaded', () => {
    // Set default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');

    if (dateFromInput && dateToInput) {
        dateFromInput.valueAsDate = firstDay;
        dateToInput.valueAsDate = lastDay;
    }

    // Initial fetch
    fetchDashboardData();

    // Bind filter button
    const btnFilter = document.getElementById('btnFilter');
    if (btnFilter) {
        btnFilter.addEventListener('click', fetchDashboardData);
    }
});

async function fetchDashboardData() {
    const fromDate = document.getElementById('dateFrom').value;
    const toDate = document.getElementById('dateTo').value;

    if (!fromDate || !toDate) {
        showErrorToast('Vui lòng chọn khoảng thời gian');
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        await Promise.all([
            fetchRevenueReport(fromDate, toDate),
            fetchRoomUsageReport(fromDate, toDate),
            fetchServiceUsageReport(fromDate, toDate)
        ]);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    const btnFilter = document.getElementById('btnFilter');
    if (btnFilter) {
        if (isLoading) {
            btnFilter.disabled = true;
            btnFilter.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin text-gray-500"></i>';
        } else {
            btnFilter.disabled = false;
            btnFilter.innerHTML = '<i data-feather="refresh-cw" class="w-4 h-4 text-gray-500"></i>';
        }
        if (typeof feather !== 'undefined') feather.replace();
    }
    
    // Optional: Add opacity to main content while loading
    const mainContent = document.querySelector('.page-content');
    if (mainContent) {
        mainContent.style.opacity = isLoading ? '0.6' : '1';
        mainContent.style.pointerEvents = isLoading ? 'none' : 'auto';
    }
}

async function fetchRevenueReport(from, to) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reports/revenue?from=${from}&to=${to}`);
        if (!response.ok) {
            throw new Error(`Revenue report failed: ${response.status}`);
        }
        
        const data = await response.json();
        updateRevenueStats(data);
        updateRevenueTable(data.days);
    } catch (error) {
        console.error('Error fetching revenue report:', error);
        const tbody = document.getElementById('revenue-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500 py-4">Lỗi khi tải dữ liệu doanh thu</td></tr>';
    }
}

async function fetchRoomUsageReport(from, to) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reports/rooms?from=${from}&to=${to}`);
        if (!response.ok) {
            throw new Error(`Room usage report failed: ${response.status}`);
        }
        
        const data = await response.json();
        updateRoomStats(data);
    } catch (error) {
        console.error('Error fetching room usage report:', error);
        const roomCard = document.getElementById('stat-top-room');
        if (roomCard) {
            const h3 = roomCard.querySelector('h3');
            if (h3) h3.textContent = 'Lỗi';
        }
    }
}

async function fetchServiceUsageReport(from, to) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/reports/services?from=${from}&to=${to}`);
        if (!response.ok) {
            throw new Error(`Service usage report failed: ${response.status}`);
        }
        
        const data = await response.json();
        updateServiceStats(data);
        updateServiceList(data.services);
    } catch (error) {
        console.error('Error fetching service usage report:', error);
        const serviceCard = document.getElementById('stat-top-service');
        if (serviceCard) {
            const h3 = serviceCard.querySelector('h3');
            if (h3) h3.textContent = 'Lỗi';
        }
    }
}

function updateRevenueStats(data) {
    if (!data) return;

    // Update Total Revenue Card
    const revenueCard = document.getElementById('stat-revenue');
    if (revenueCard) {
        const h3 = revenueCard.querySelector('h3');
        if (h3) h3.textContent = formatCurrency(data.totalNetRevenue);
    }

    // Update Total Guests Card
    const guestsCard = document.getElementById('stat-guests');
    if (guestsCard) {
        const h3 = guestsCard.querySelector('h3');
        if (h3) h3.textContent = data.totalGuestsStayed || 0;
    }
}

function updateRevenueTable(days) {
    const tbody = document.getElementById('revenue-table-body');
    if (!tbody) return;

    if (!days || days.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Không có dữ liệu cho khoảng thời gian đã chọn</td></tr>';
        return;
    }

    tbody.innerHTML = days.map(day => `
        <tr>
            <td>${formatDate(day.date)}</td>
            <td>${formatCurrency(day.roomCharge)}</td>
            <td>${formatCurrency(day.serviceCharge)}</td>
            <td class="text-red-500">${formatCurrency(day.refundAmount)}</td>
            <td class="font-medium text-green-600">${formatCurrency(day.netRevenue)}</td>
        </tr>
    `).join('');
}

function updateRoomStats(data) {
    const roomCard = document.getElementById('stat-top-room');
    if (!roomCard) return;
    
    const h3 = roomCard.querySelector('h3');
    const small = roomCard.querySelector('small');

    if (data && data.topRoom) {
        // Backend DTO: RoomUsageItemDto has roomTypeName, timesBooked
        if (h3) h3.textContent = data.topRoom.roomTypeName || 'N/A';
        if (small) small.textContent = `${data.topRoom.timesBooked || 0} lượt đặt`;
    } else {
        if (h3) h3.textContent = 'Không có';
        if (small) small.textContent = 'Chưa có đặt phòng';
    }
}

function updateServiceStats(data) {
    const serviceCard = document.getElementById('stat-top-service');
    if (!serviceCard) return;

    const h3 = serviceCard.querySelector('h3');
    const small = serviceCard.querySelector('small');

    if (data && data.topService) {
        // Backend DTO: ServiceUsageItemDto has serviceName, totalRevenue
        if (h3) h3.textContent = data.topService.serviceName || 'N/A';
        if (small) small.textContent = formatCurrency(data.topService.totalRevenue);
    } else {
        if (h3) h3.textContent = 'Không có';
        if (small) small.textContent = 'Chưa sử dụng';
    }
}

function updateServiceList(services) {
    const container = document.getElementById('service-usage-list');
    if (!container) return;

    if (!services || services.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">Chưa có dịch vụ nào được sử dụng</div>';
        return;
    }

    // Sort by revenue desc and take top 5
    const topServices = services.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)).slice(0, 5);

    container.innerHTML = topServices.map(service => `
        <div class="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50">
            <div>
                <div class="font-medium text-gray-800">${service.serviceName}</div>
                <div class="text-xs text-gray-500">Đã dùng ${service.timesUsed || 0} lần</div>
            </div>
            <div class="text-right">
                <div class="font-medium text-indigo-600">${formatCurrency(service.totalRevenue)}</div>
            </div>
        </div>
    `).join('');
}

// Utility Helpers
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function showErrorToast(message) {
    console.warn(message);
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-800 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    toast.innerHTML = `
        <i data-feather="alert-circle" class="w-5 h-5"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    if (typeof feather !== 'undefined') feather.replace();
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
