/**
 * Bills Management - Complete API Integration
 */

// ==================== BILL API MODULE ====================
const BillAPI = {
    baseURL: 'http://localhost:8080/hotel_reservation_premium/api/reservations',
    
    async _fetch(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = errorText;
                    }
                } catch (e) {
                    // If we can't read the error, use status code
                }
                const error = new Error(errorMessage);
                error.status = response.status;
                throw error;
            }
            
            // Handle empty responses (204 No Content for POST)
            if (response.status === 204 || response.status === 200) {
                // Check if response has content
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                }
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    /**
     * Get bill summary for a reservation
     * @param {string} resId - Reservation ID
     * @returns {Promise<ReservationBillSummary>}
     */
    async getReservationBillSummary(resId) {
        return this._fetch(`/${resId}/bills`);
    },
    
    /**
     * Get bill summary for a reservation room
     * @param {string} resId - Reservation ID
     * @param {string} resRoomId - Reservation Room ID
     * @returns {Promise<ResRoomBillSummary>}
     */
    async getResRoomBillSummary(resId, resRoomId) {
        return this._fetch(`/${resId}/bills/reservation-rooms/${resRoomId}`);
    },
    
    /**
     * Mark all bills of a reservation as paid
     * @param {string} resId - Reservation ID
     */
    async markReservationBillsPaid(resId) {
        return this._fetch(`/${resId}/bills`, {
            method: 'POST'
        });
    },
    
    /**
     * Mark all bills of a reservation room as paid
     * @param {string} resId - Reservation ID
     * @param {string} resRoomId - Reservation Room ID
     */
    async markResRoomBillsPaid(resId, resRoomId) {
        return this._fetch(`/${resId}/bills/reservation-rooms/${resRoomId}`, {
            method: 'POST'
        });
    },
    
    /**
     * Get reservation rooms for a reservation
     * @param {string} resId - Reservation ID
     * @returns {Promise<Array<ReservationRoomDto>>}
     */
    async getReservationRooms(resId) {
        return this._fetch(`/${resId}`);
    }
};

// ==================== BILL UI MODULE ====================
const BillUI = {
    formatCurrency(value) {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    },
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    getStatusClass(status) {
        switch(status?.toUpperCase()) {
            case 'PAID':
                return 'status-paid';
            case 'UNPAID':
                return 'status-unpaid';
            default:
                return 'status-pending';
        }
    },
    
    getStatusText(status) {
        switch(status?.toUpperCase()) {
            case 'PAID':
                return 'Đã thanh toán';
            case 'UNPAID':
                return 'Chưa thanh toán';
            default:
                return 'Đang xử lý';
        }
    },
    
    getReasonText(reason) {
        switch(reason?.toUpperCase()) {
            case 'ROOM_CHARGE':
                return 'Phí phòng';
            case 'SERVICE':
                return 'Dịch vụ';
            case 'REFUND':
                return 'Hoàn tiền';
            default:
                return reason || 'N/A';
        }
    },
    
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    showLoading() {
        const tbody = document.getElementById('bills-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    </td>
                </tr>
            `;
        }
    },
    
    showEmpty(message = 'Không có dữ liệu') {
        const tbody = document.getElementById('bills-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        ${message}
                    </td>
                </tr>
            `;
        }
    },
    
    renderBills(billSummary, roomIdToResRoomIdMap = {}) {
        const tbody = document.getElementById('bills-table-body');
        if (!tbody) return;
        
        if (!billSummary || !billSummary.resRoomBill || billSummary.resRoomBill.length === 0) {
            this.showEmpty('Không có hóa đơn nào cho reservation này');
            return;
        }
        
        let html = '';
        let billIndex = 1;
        
        // Iterate through each reservation room's bills
        billSummary.resRoomBill.forEach(resRoomBill => {
            if (resRoomBill.roomBills && resRoomBill.roomBills.length > 0) {
                // Get roomId from resRoomBill (preferred) or from first bill
                // Handle both camelCase and snake_case JSON properties
                const roomId = resRoomBill.roomId || 
                               resRoomBill.room_id ||
                               (resRoomBill.roomBills.length > 0 ? (resRoomBill.roomBills[0].roomId || resRoomBill.roomBills[0].room_id) : null) ||
                               null;
                
                // Get resRoomId from map
                const resRoomId = roomId ? (roomIdToResRoomIdMap[roomId] || null) : null;
                
                // Check if there are any unpaid bills in this room
                const hasUnpaidBills = resRoomBill.roomBills.some(bill => 
                    (bill.status === 'UNPAID' || bill.status === 'unpaid')
                );
                
                resRoomBill.roomBills.forEach(bill => {
                    // Use roomId from resRoomBill, fallback to bill.roomId
                    // Handle both camelCase and snake_case JSON properties
                    const displayRoomId = roomId || bill.roomId || bill.room_id || 'N/A';
                    
                    html += `
                        <tr class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-indigo-600">#BILL-${String(billIndex).padStart(3, '0')}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${billSummary.reservationId || 'N/A'}</div>
                                <div class="text-xs text-gray-500">Room ID: ${displayRoomId}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">${this.formatCurrency(bill.totalAmount)}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${this.formatDate(bill.date)}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusClass(bill.status)}">
                                    ${this.getStatusText(bill.status)}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div class="flex space-x-2">
                                    <button 
                                        class="text-indigo-600 hover:text-indigo-900 view-details" 
                                        title="Xem chi tiết"
                                        data-res-id="${billSummary.reservationId}"
                                        data-room-id="${displayRoomId !== 'N/A' ? displayRoomId : ''}"
                                        data-bill-amount="${bill.totalAmount}"
                                        data-bill-date="${bill.date}"
                                        data-bill-reason="${bill.reason}"
                                        data-bill-status="${bill.status}">
                                        <i data-feather="eye" class="w-4 h-4"></i>
                                    </button>
                                    <button 
                                        class="text-gray-600 hover:text-gray-900 print-bill" 
                                        title="In hóa đơn"
                                        data-res-id="${billSummary.reservationId}">
                                        <i data-feather="printer" class="w-4 h-4"></i>
                                    </button>
                                    ${hasUnpaidBills && resRoomId ? `
                                        <button 
                                            class="text-green-600 hover:text-green-900 mark-room-paid" 
                                            title="Đánh dấu tất cả hóa đơn của phòng này đã thanh toán"
                                            data-res-id="${billSummary.reservationId}"
                                            data-res-room-id="${resRoomId}"
                                            data-room-id="${displayRoomId}">
                                            <i data-feather="check-circle" class="w-4 h-4"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `;
                    billIndex++;
                });
            }
        });
        
        if (html === '') {
            this.showEmpty('Không có hóa đơn nào');
        } else {
            tbody.innerHTML = html;
            feather.replace();
            this.attachEventListeners();
        }
    },
    
    attachEventListeners() {
        // View details buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resId = btn.getAttribute('data-res-id');
                const roomId = btn.getAttribute('data-room-id');
                const amount = btn.getAttribute('data-bill-amount');
                const date = btn.getAttribute('data-bill-date');
                const reason = btn.getAttribute('data-bill-reason');
                const status = btn.getAttribute('data-bill-status');
                
                this.showBillDetails({
                    resId,
                    roomId,
                    amount,
                    date,
                    reason,
                    status
                });
            });
        });
        
        // Print buttons
        document.querySelectorAll('.print-bill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resId = btn.getAttribute('data-res-id');
                this.printBill(resId);
            });
        });
        
        // Mark room paid buttons
        document.querySelectorAll('.mark-room-paid').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const resId = btn.getAttribute('data-res-id');
                const resRoomId = btn.getAttribute('data-res-room-id');
                const roomId = btn.getAttribute('data-room-id');
                await this.handleMarkRoomPaid(resId, resRoomId, roomId);
            });
        });
    },
    
    showBillDetails(bill) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold text-gray-800">Chi tiết hóa đơn</h3>
                    <button class="text-gray-400 hover:text-gray-600 close-modal">
                        <i data-feather="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div>
                        <span class="text-sm text-gray-500">Reservation ID:</span>
                        <p class="text-sm font-medium text-gray-900">${bill.resId || 'N/A'}</p>
                    </div>
                    ${bill.roomId ? `
                    <div>
                        <span class="text-sm text-gray-500">Room ID:</span>
                        <p class="text-sm font-medium text-gray-900">${bill.roomId}</p>
                    </div>
                    ` : ''}
                    <div>
                        <span class="text-sm text-gray-500">Số tiền:</span>
                        <p class="text-sm font-medium text-gray-900">${this.formatCurrency(bill.amount)}</p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Ngày tạo:</span>
                        <p class="text-sm font-medium text-gray-900">${this.formatDate(bill.date)}</p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Lý do:</span>
                        <p class="text-sm font-medium text-gray-900">${this.getReasonText(bill.reason)}</p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Trạng thái:</span>
                        <p class="text-sm font-medium">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusClass(bill.status)}">
                                ${this.getStatusText(bill.status)}
                            </span>
                        </p>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 close-modal">
                        Đóng
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        feather.replace();
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },
    
    async handleMarkRoomPaid(resId, resRoomId, roomId) {
        if (!confirm(`Bạn có chắc chắn muốn đánh dấu tất cả hóa đơn của phòng ${roomId} là đã thanh toán?`)) {
            return;
        }
        
        try {
            await BillAPI.markResRoomBillsPaid(resId, resRoomId);
            this.showNotification('Đã đánh dấu thanh toán thành công!', 'success');
            // Reload bills
            await BillManager.loadBills(resId);
        } catch (error) {
            this.showNotification('Lỗi khi đánh dấu thanh toán: ' + error.message, 'error');
        }
    },
    
    formatDateOnly(dateString) {
        if (!dateString) return 'N/A';
        try {
            // Xử lý cả format "YYYY-MM-DD" và ISO date string
            let date;
            if (typeof dateString === 'string' && dateString.includes('T')) {
                // ISO format với time
                date = new Date(dateString);
            } else if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Format YYYY-MM-DD (LocalDate từ Java)
                date = new Date(dateString + 'T00:00:00');
            } else {
                date = new Date(dateString);
            }
            
            // Kiểm tra date hợp lệ
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'N/A';
        }
    },

    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    async printBill(resId) {
        try {
            const summary = await BillAPI.getReservationBillSummary(resId);
            
            // Debug: log summary để kiểm tra dữ liệu
            console.log('Bill Summary Data:', summary);
            console.log('Guest Name:', summary.guestName);
            console.log('Guest Phone:', summary.guestPhone);
            console.log('Guest Identity:', summary.guestIdentityNum);
            console.log('Check In:', summary.checkIn);
            console.log('Check Out:', summary.checkOut);
            
            const printWindow = window.open('', '_blank');
            
            // Format dates - xử lý cả camelCase và snake_case
            const checkIn = summary.checkIn || summary.check_in;
            const checkOut = summary.checkOut || summary.check_out;
            const checkInDate = checkIn ? this.formatDateOnly(checkIn) : 'N/A';
            const checkOutDate = checkOut ? this.formatDateOnly(checkOut) : 'N/A';
            
            // Xử lý thông tin khách thuê - hỗ trợ cả camelCase và snake_case
            const guestName = summary.guestName || summary.guest_name || 'N/A';
            const guestPhone = summary.guestPhone || summary.guest_phone || 'N/A';
            const guestIdentityNum = summary.guestIdentityNum || summary.guest_identity_num || 'N/A';
            
            const printDate = new Date().toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Hóa đơn - ${resId}</title>
                        <style>
                            @media print {
                                .no-print { display: none; }
                            }
                            body { 
                                font-family: 'Times New Roman', serif; 
                                padding: 30px; 
                                font-size: 12pt;
                                line-height: 1.6;
                            }
                            .invoice-header {
                                text-align: center;
                                margin-bottom: 30px;
                                border-bottom: 2px solid #000;
                                padding-bottom: 20px;
                            }
                            .invoice-title {
                                font-size: 24pt;
                                font-weight: bold;
                                margin-bottom: 10px;
                                text-transform: uppercase;
                            }
                            .section {
                                margin-top: 25px;
                                margin-bottom: 25px;
                            }
                            .section-title {
                                font-weight: bold;
                                font-size: 14pt;
                                margin-bottom: 10px;
                                padding-bottom: 5px;
                                border-bottom: 1px solid #ccc;
                                text-transform: uppercase;
                            }
                            .info-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 15px;
                                margin-bottom: 15px;
                            }
                            .info-item {
                                margin-bottom: 8px;
                            }
                            .info-label {
                                font-weight: bold;
                                display: inline-block;
                                min-width: 150px;
                            }
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin-top: 15px;
                                margin-bottom: 15px;
                            }
                            th, td { 
                                border: 1px solid #000; 
                                padding: 8px; 
                                text-align: left; 
                            }
                            th { 
                                background-color: #f0f0f0; 
                                font-weight: bold;
                                text-align: center;
                            }
                            .total { 
                                font-weight: bold; 
                                margin-top: 20px; 
                                padding: 15px; 
                                background-color: #f9fafb; 
                                border: 1px solid #000;
                                border-radius: 5px; 
                            }
                            .total p { 
                                margin: 5px 0; 
                                font-size: 13pt;
                            }
                            .signature-section {
                                margin-top: 40px;
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 50px;
                            }
                            .signature-box {
                                text-align: center;
                            }
                            .signature-line {
                                border-top: 1px solid #000;
                                margin-top: 60px;
                                padding-top: 5px;
                            }
                            .room-guests {
                                margin-top: 10px;
                                padding: 10px;
                                background-color: #f9fafb;
                                border: 1px solid #ddd;
                            }
                            .guest-item {
                                margin: 5px 0;
                                padding: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="invoice-header">
                            <div class="invoice-title">HÓA ĐƠN THANH TOÁN</div>
                            <p><strong>Ngày in:</strong> ${printDate}</p>
                        </div>

                        <!-- THÔNG TIN KHÁCH SẠN -->
                        <div class="section">
                            <div class="section-title">1. Thông tin khách sạn</div>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Tên khách sạn:</span>
                                    ${summary.hotelName || 'Hotel Haven'}
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Địa chỉ:</span>
                                    ${summary.hotelAddress || 'Mỗ Lao, Hà Đông, Hà Nội'}
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Số điện thoại:</span>
                                    ${summary.hotelPhone || '+84 28 1234 5678'}
                                </div>
                            </div>
                        </div>

                        <!-- THÔNG TIN KHÁCH THUÊ -->
                        <div class="section">
                            <div class="section-title">2. Thông tin khách thuê</div>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Họ và tên:</span>
                                    ${guestName}
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Số điện thoại:</span>
                                    ${guestPhone}
                                </div>
                                <div class="info-item">
                                    <span class="info-label">CMND/CCCD:</span>
                                    ${guestIdentityNum}
                                </div>
                            </div>
                        </div>


                        <!-- GIÁ PHÒNG & DỊCH VỤ -->
                        <div class="section">
                            <div class="section-title">3. Giá phòng & dịch vụ</div>
                            ${summary.resRoomBill && summary.resRoomBill.length > 0 ? summary.resRoomBill.map((resRoomBill, roomIndex) => {
                                if (!resRoomBill.roomBills || resRoomBill.roomBills.length === 0) return '';
                                
                                const printRoomId = resRoomBill.roomId || resRoomBill.room_id || 'N/A';
                                const roomCheckIn = resRoomBill.checkInTime ? this.formatDateOnly(resRoomBill.checkInTime) : 'N/A';
                                const roomCheckOut = resRoomBill.checkOutTime ? this.formatDateOnly(resRoomBill.checkOutTime) : 'N/A';
                                
                                // Format guests information
                                let guestsHtml = '';
                                if (resRoomBill.guests && resRoomBill.guests.length > 0) {
                                    guestsHtml = '<div class="room-guests"><strong>Khách lưu trú:</strong>';
                                    resRoomBill.guests.forEach((guest, idx) => {
                                        const guestCheckIn = guest.checkInAt ? this.formatDateTime(guest.checkInAt) : 'Chưa check-in';
                                        const guestCheckOut = guest.checkOutAt ? this.formatDateTime(guest.checkOutAt) : 'Chưa check-out';
                                        guestsHtml += `
                                            <div class="guest-item">
                                                ${idx + 1}. ${guest.guestName || 'N/A'} - CCCD: ${guest.identityNum || 'N/A'} 
                                                | Check-in: ${guestCheckIn} | Check-out: ${guestCheckOut}
                                            </div>
                                        `;
                                    });
                                    guestsHtml += '</div>';
                                }
                                
                                return `
                                    <div style="margin-bottom: 25px;">
                                        <h4 style="margin-bottom: 10px; color: #4f46e5;">Phòng ${printRoomId}</h4>
                                        <div style="margin-bottom: 10px;">
                                            <strong>Ngày đến:</strong> ${roomCheckIn} | 
                                            <strong>Ngày đi:</strong> ${roomCheckOut}
                                        </div>
                                        ${guestsHtml}
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Mô tả</th>
                                                    <th>Số tiền</th>
                                                    <th>Ngày tạo</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${resRoomBill.roomBills.map((bill, index) => {
                                                    return `
                                                    <tr>
                                                        <td style="text-align: center;">${index + 1}</td>
                                                        <td>${this.getReasonText(bill.reason)}</td>
                                                        <td style="text-align: right;">${this.formatCurrency(bill.totalAmount)}</td>
                                                        <td>${this.formatDate(bill.date)}</td>
                                                        <td style="text-align: center;">${this.getStatusText(bill.status)}</td>
                                                    </tr>
                                                `;
                                                }).join('')}
                                            </tbody>
                                        </table>
                                        <div style="margin-top: 10px; padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; border-radius: 5px;">
                                            <p><strong>Tổng phòng:</strong> ${this.formatCurrency(resRoomBill.total)}</p>
                                            <p><strong>Đã thanh toán:</strong> ${this.formatCurrency(resRoomBill.totalPaid)}</p>
                                            <p><strong>Còn nợ:</strong> ${this.formatCurrency(resRoomBill.totalDue)}</p>
                                        </div>
                                    </div>
                                `;
                            }).join('') : '<p>Không có hóa đơn nào</p>'}
                        </div>
                        
                        <!-- TỔNG TIỀN -->
                        <div class="total">
                            <h3 style="margin-top: 0; margin-bottom: 15px; text-align: center;">4. TỔNG KẾT</h3>
                            <p><strong>Tổng tiền:</strong> ${this.formatCurrency(summary.total)}</p>
                            <p><strong>Đã thanh toán:</strong> ${this.formatCurrency(summary.totalPaid)}</p>
                            <p><strong>Còn nợ:</strong> ${this.formatCurrency(summary.totalDue)}</p>
                        </div>

                        <!-- KÝ TÊN -->
                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="signature-line">
                                    <strong>Khách hàng</strong><br>
                                    (Ký và ghi rõ họ tên)
                                </div>
                            </div>
                            <div class="signature-box">
                                <div class="signature-line">
                                    <strong>Lễ tân</strong><br>
                                    (Ký và ghi rõ họ tên)
                                </div>
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        } catch (error) {
            this.showNotification('Lỗi khi in hóa đơn: ' + error.message, 'error');
        }
    },
    
};

// ==================== BILL MANAGER MODULE ====================
const BillManager = {
    currentResId: null,
    
    async init() {
        this.setupSearch();
        this.setupMarkAllPaid();
    },
    
    setupSearch() {
        const searchInput = document.getElementById('search-res-id');
        const searchButton = document.getElementById('search-btn');
        
        const performSearch = async () => {
            const resId = searchInput?.value.trim();
            if (resId) {
                await this.loadBills(resId);
            } else {
                BillUI.showEmpty('Vui lòng nhập Reservation ID');
            }
        };
        
        if (searchInput) {
            // Allow Enter key to search
            searchInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await performSearch();
                }
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', performSearch);
        }
    },
    
    setupMarkAllPaid() {
        const markAllPaidBtn = document.getElementById('mark-all-paid-btn');
        if (markAllPaidBtn) {
            markAllPaidBtn.addEventListener('click', async () => {
                if (this.currentResId) {
                    await this.markAllBillsPaid(this.currentResId);
                }
            });
        }
        
        const printAllBillsBtn = document.getElementById('print-all-bills-btn');
        if (printAllBillsBtn) {
            printAllBillsBtn.addEventListener('click', async () => {
                if (this.currentResId) {
                    await BillUI.printBill(this.currentResId);
                }
            });
        }
    },
    
    async loadBills(resId) {
        if (!resId) {
            BillUI.showEmpty('Vui lòng nhập Reservation ID để tìm kiếm');
            return;
        }
        
        this.currentResId = resId;
        BillUI.showLoading();
        
        try {
            // Load both bill summary and reservation rooms in parallel
            const [billSummary, reservationRooms] = await Promise.all([
                BillAPI.getReservationBillSummary(resId),
                BillAPI.getReservationRooms(resId)
            ]);
            
            // Create a map from roomId to resRoomId
            const roomIdToResRoomIdMap = {};
            if (reservationRooms && Array.isArray(reservationRooms)) {
                reservationRooms.forEach(room => {
                    const roomId = room.roomId || room.room_id;
                    const resRoomId = room.id || room.resRoomId || room.res_room_id;
                    if (roomId && resRoomId) {
                        roomIdToResRoomIdMap[roomId] = resRoomId;
                    }
                });
            }
            
            // Debug: log the data structure to check roomId
            console.log('Bill Summary Data:', billSummary);
            console.log('Reservation Rooms:', reservationRooms);
            console.log('RoomId to ResRoomId Map:', roomIdToResRoomIdMap);
            
            if (billSummary.resRoomBill && billSummary.resRoomBill.length > 0) {
                console.log('First ResRoomBill:', billSummary.resRoomBill[0]);
                if (billSummary.resRoomBill[0].roomBills && billSummary.resRoomBill[0].roomBills.length > 0) {
                    console.log('First Bill:', billSummary.resRoomBill[0].roomBills[0]);
                }
            }
            
            BillUI.renderBills(billSummary, roomIdToResRoomIdMap);
            
            // Update summary info
            this.updateSummaryInfo(billSummary);
        } catch (error) {
            console.error('Error loading bills:', error);
            if (error.status === 404) {
                BillUI.showEmpty('Không tìm thấy reservation với ID: ' + resId);
                BillUI.showNotification('Không tìm thấy reservation', 'error');
            } else {
                BillUI.showEmpty('Không tìm thấy hóa đơn hoặc có lỗi xảy ra: ' + error.message);
                BillUI.showNotification('Lỗi khi tải hóa đơn: ' + error.message, 'error');
            }
        }
    },
    
    updateSummaryInfo(billSummary) {
        const summaryCard = document.getElementById('bill-summary');
        const totalEl = document.getElementById('summary-total');
        const paidEl = document.getElementById('summary-paid');
        const dueEl = document.getElementById('summary-due');
        const markAllPaidBtn = document.getElementById('mark-all-paid-btn');
        
        if (billSummary && billSummary.total !== undefined) {
            if (summaryCard) {
                summaryCard.classList.remove('hidden');
            }
            if (totalEl) {
                totalEl.textContent = BillUI.formatCurrency(billSummary.total);
            }
            if (paidEl) {
                paidEl.textContent = BillUI.formatCurrency(billSummary.totalPaid);
            }
            if (dueEl) {
                dueEl.textContent = BillUI.formatCurrency(billSummary.totalDue);
            }
            if (markAllPaidBtn && billSummary.totalDue > 0) {
                markAllPaidBtn.classList.remove('hidden');
            } else if (markAllPaidBtn) {
                markAllPaidBtn.classList.add('hidden');
            }
        } else {
            if (summaryCard) {
                summaryCard.classList.add('hidden');
            }
            if (markAllPaidBtn) {
                markAllPaidBtn.classList.add('hidden');
            }
        }
    },
    
    async markAllBillsPaid(resId) {
        if (!confirm('Bạn có chắc chắn muốn đánh dấu TẤT CẢ hóa đơn của reservation này là đã thanh toán?')) {
            return;
        }
        
        try {
            await BillAPI.markReservationBillsPaid(resId);
            BillUI.showNotification('Đã đánh dấu tất cả hóa đơn là đã thanh toán!', 'success');
            await this.loadBills(resId);
        } catch (error) {
            BillUI.showNotification('Lỗi khi đánh dấu thanh toán: ' + error.message, 'error');
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    BillManager.init();
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});

