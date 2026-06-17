/**
 * Bookings Page - Main JavaScript Module
 * Handles booking/reservation management with backend API integration
 */

const BookingAPI = (() => {
    const BASE_URL = 'http://localhost:8080/hotel_reservation_premium/api/reservations';

    // Helper to handle fetch errors
    const handleError = (error, action) => {
        console.error(`Error in ${action}:`, error);
        throw error;
    };

    return {
        /**
         * Create a new reservation
         * @param {Object} reservationData - { guestId, items: [{roomName, rooms, checkIn, checkOut}] }
         * @returns {Promise<Object>} - Reservation response
         */
        create: async (reservationData) => {
            try {
                // Mock user ID for now - in production this should come from session
                const userId = 1; 
                
                const response = await fetch(BASE_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-User-Id': userId.toString()
                    },
                    body: JSON.stringify(reservationData)
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                return await response.json();
            } catch (error) {
                handleError(error, 'create reservation');
            }
        },

        /**
         * Get all reservations
         * @returns {Promise<Array>} - List of reservation objects
         */
        getAll: async () => {
            try {
                console.log('Fetching all reservations from:', `${BASE_URL}/all`);
                const response = await fetch(`${BASE_URL}/all`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to fetch reservations:', response.status, errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                const data = await response.json();
                console.log('Received reservations:', data.length, 'items');
                return data;
            } catch (error) {
                console.error('Error in getAll:', error);
                handleError(error, 'get all reservations');
            }
        },

        /**
         * Get reservation by ID
         * @param {string} resId - Reservation ID
         * @returns {Promise<Object>} - Reservation object
         */
        getById: async (resId) => {
            try {
                const response = await fetch(`${BASE_URL}?resId=${resId}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                handleError(error, `get reservation ${resId}`);
            }
        },

        /**
         * Get reservations by guest ID
         * @param {number} guestId - Guest ID
         * @returns {Promise<Array>} - List of reservation objects
         */
        getByGuestId: async (guestId) => {
            try {
                const response = await fetch(`${BASE_URL}/guests/${guestId}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                handleError(error, `get reservations for guest ${guestId}`);
            }
        },

        /**
         * Get all room types
         * @returns {Promise<Array>} - List of room type objects
         */
        getAllRoomTypes: async () => {
            try {
                const response = await fetch('http://localhost:8080/hotel_reservation_premium/api/rooms/roomTypes');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                handleError(error, 'get all room types');
            }
        }
    };
})();

class BookingManager {
    constructor() {
        this.bookings = [];
        this.filteredBookings = [];
        this.currentFilter = 'all';
        this.roomTypes = []; // Store room types for dropdown
        this.init();
    }

    /**
     * Initialize the page
     */
    async init() {
        this.cacheElements();
        this.attachEventListeners();
        await this.loadBookings();
        this.initializeFeatherIcons();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            bookingsList: document.getElementById('bookingsList'),
            searchInput: document.getElementById('searchInput'),
            modal: null // Will be created dynamically
        };
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Search
        this.elements.searchInput?.addEventListener('input', (e) => this.filterBookings(e.target.value));

        // Note: Filter buttons are attached in HTML onclick attributes
        // Note: Create new booking button is attached in HTML onclick attribute
    }

    /**
     * Load bookings from API
     */
    async loadBookings() {
        try {
            this.elements.bookingsList.innerHTML = '<div class="text-center py-12"><p class="text-gray-500">Đang tải...</p></div>';
            
            const reservations = await BookingAPI.getAll();
            console.log('Raw reservations from API:', reservations);
            
            if (!reservations || reservations.length === 0) {
                console.warn('No reservations found in database');
                this.elements.bookingsList.innerHTML = '<div class="text-center py-12"><p class="text-gray-500">Chưa có đặt phòng nào</p></div>';
                return;
            }
            
            // Transform API data to match frontend format
            this.bookings = reservations.map(res => {
                try {
                    return this.transformReservationToBooking(res);
                } catch (e) {
                    console.error('Error transforming reservation:', res, e);
                    return null;
                }
            }).filter(b => b !== null); // Remove null entries
            
            console.log('Transformed bookings:', this.bookings.length);
            this.filteredBookings = [...this.bookings];
            
            this.renderBookings();
        } catch (error) {
            console.error('Failed to load bookings:', error);
            this.elements.bookingsList.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-500 mb-2">Không thể tải danh sách đặt phòng.</p>
                    <p class="text-sm text-gray-500">Lỗi: ${error.message}</p>
                    <button onclick="bookingManager.loadBookings()" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Thử Lại
                    </button>
                </div>
            `;
        }
    }

    /**
     * Transform API reservation data to frontend booking format
     */
    transformReservationToBooking(reservation) {
        // Map status to stage
        const statusToStage = {
            'PENDING_PAYMENT': 1,
            'CONFIRMED': 2,
            'CHECKED_IN': 4,
            'IN_SERVICE': 5,
            'COMPLETED': 6,
            'CANCELLED': 4
        };

        const stage = statusToStage[reservation.status] || 1;
        
        // Get room type from first room name
        const roomType = reservation.roomNames && reservation.roomNames.length > 0 
            ? reservation.roomNames[0] 
            : 'N/A';
        
        // Calculate total rooms
        const totalRooms = reservation.roomIds ? reservation.roomIds.length : 0;
        
        // Calculate total nights
        const totalNights = reservation.nights && reservation.nights.length > 0
            ? reservation.nights[0]
            : 0;

        return {
            id: reservation.id,
            stage: stage,
            guestName: reservation.guestName || 'N/A',
            guestPhone: reservation.guestPhone || 'N/A',
            roomType: roomType,
            rooms: totalRooms,
            checkIn: reservation.checkIn,
            checkOut: reservation.checkOut,
            nights: totalNights,
            totalCost: reservation.total || 0,
            createdAt: reservation.bookingDate ? reservation.bookingDate.split('T')[0] : new Date().toISOString().split('T')[0],
            status: reservation.status
        };
    }

    /**
     * Get stage label in Vietnamese
     */
    getStageLabel(stage) {
        const labels = {
            1: 'Đặt Giữ Chỗ',
            2: 'Đã Xác Nhận',
            3: 'Đã Đăng Ký',
            4: 'Đã Nhận Phòng',
            5: 'Đang Sử Dụng Dịch Vụ',
            6: 'Hoàn Thành'
        };
        return labels[stage] || 'Không Xác Định';
    }

    /**
     * Get stage CSS class
     */
    getStageColor(stage) {
        const colors = {
            1: 'stage-1',
            2: 'stage-2',
            3: 'stage-3',
            4: 'stage-4',
            5: 'stage-5',
            6: 'stage-6'
        };
        return colors[stage] || '';
    }

    /**
     * Render bookings list
     */
    renderBookings() {
        const container = this.elements.bookingsList;
        
        if (this.filteredBookings.length === 0) {
            container.innerHTML = '<div class="text-center py-12"><p class="text-gray-500">Không tìm thấy đặt phòng</p></div>';
            return;
        }

        container.innerHTML = this.filteredBookings.map(booking => `
            <div class="booking-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6" onclick="bookingManager.viewBooking('${booking.id}')">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${booking.id}</h3>
                        <p class="text-sm text-gray-600">${booking.guestName} • ${booking.guestPhone}</p>
                    </div>
                    <span class="stage-badge ${this.getStageColor(booking.stage)}">Stage ${booking.stage}: ${this.getStageLabel(booking.stage)}</span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-gray-600">Loại Phòng</p>
                        <p class="font-semibold text-gray-900">${booking.roomType}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-600">Số Phòng</p>
                        <p class="font-semibold text-gray-900">${booking.rooms}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-600">Nhận Phòng</p>
                        <p class="font-semibold text-gray-900">${booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('vi-VN') : 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-600">Số Đêm</p>
                        <p class="font-semibold text-gray-900">${booking.nights}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-600">Tổng Tiền</p>
                        <p class="font-semibold text-indigo-600">${this.formatCurrency(booking.totalCost)}</p>
                    </div>
                </div>

                <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p class="text-xs text-gray-500">Tạo: ${new Date(booking.createdAt).toLocaleDateString('vi-VN')}</p>
                    <button class="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 transition-all">
                        <span class="text-sm font-medium">Xem Chi Tiết</span>
                        <i data-feather="arrow-right" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.initializeFeatherIcons();
    }

    /**
     * Filter bookings by stage
     */
    filterByStage(stage) {
        this.currentFilter = stage;
        
        if (stage === 'all') {
            this.filteredBookings = [...this.bookings];
        } else {
            this.filteredBookings = this.bookings.filter(b => b.stage === stage);
        }

        // Update button states
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        this.renderBookings();
    }

    /**
     * Search bookings
     */
    filterBookings(query) {
        const q = query.toLowerCase();
        
        let baseBookings = this.currentFilter === 'all' 
            ? [...this.bookings]
            : this.bookings.filter(b => b.stage === this.currentFilter);
        
        this.filteredBookings = baseBookings.filter(b => 
            b.id.toLowerCase().includes(q) ||
            b.guestName.toLowerCase().includes(q) ||
            b.guestPhone.toLowerCase().includes(q)
        );
        
        this.renderBookings();
    }

    /**
     * View booking detail
     */
    viewBooking(bookingId) {
        // Navigate to booking detail page
        window.location.href = `booking-detail.html?id=${bookingId}`;
    }

    /**
     * Open create booking modal
     */
    async openCreateModal() {
        // Create modal HTML if not exists
        if (!document.getElementById('createBookingModal')) {
            const modalHTML = `
                <div id="createBookingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 class="text-xl font-bold text-gray-900">Đặt Phòng Mới</h3>
                            <button onclick="bookingManager.closeCreateModal()" class="text-gray-400 hover:text-gray-600 transition">
                                <i data-feather="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                        <form id="createBookingForm" class="p-6">
                            <div class="space-y-4">
                                <!-- Guest ID -->
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        ID Khách Hàng <span class="text-red-500">*</span>
                                    </label>
                                    <input type="number" id="guestId" name="guestId" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Nhập ID khách hàng">
                                </div>

                                <!-- Room Information -->
                                <div class="border-t pt-4">
                                    <h4 class="font-semibold text-gray-900 mb-3">Thông Tin Phòng</h4>
                                    
                                    <div>
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                                            Loại Phòng <span class="text-red-500">*</span>
                                        </label>
                                        <select id="roomName" name="roomName" required
                                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                            <option value="">-- Chọn loại phòng --</option>
                                        </select>
                                    </div>

                                    <div class="mt-4">
                                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                                            Số Phòng <span class="text-red-500">*</span>
                                        </label>
                                        <input type="number" id="rooms" name="rooms" required min="1"
                                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Nhập số phòng">
                                    </div>

                                    <div class="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                                Ngày Nhận Phòng <span class="text-red-500">*</span>
                                            </label>
                                            <input type="date" id="checkIn" name="checkIn" required
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                                Ngày Trả Phòng <span class="text-red-500">*</span>
                                            </label>
                                            <input type="date" id="checkOut" name="checkOut" required
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Form Actions -->
                            <div class="flex gap-3 mt-6 pt-4 border-t">
                                <button type="button" onclick="bookingManager.closeCreateModal()"
                                    class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                                    Hủy
                                </button>
                                <button type="submit"
                                    class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                                    Tạo Đặt Phòng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Attach form submit handler
            document.getElementById('createBookingForm').addEventListener('submit', (e) => this.handleCreateBooking(e));
        }

        const modal = document.getElementById('createBookingModal');
        modal.classList.remove('hidden');
        
        // Load room types and populate dropdown
        await this.loadRoomTypesIntoDropdown();
        
        this.initializeFeatherIcons();
    }

    /**
     * Load room types and populate dropdown
     */
    async loadRoomTypesIntoDropdown() {
        try {
            const roomNameSelect = document.getElementById('roomName');
            if (!roomNameSelect) return;

            // Show loading state
            roomNameSelect.innerHTML = '<option value="">Đang tải...</option>';
            roomNameSelect.disabled = true;

            // Fetch room types
            const roomTypes = await BookingAPI.getAllRoomTypes();
            this.roomTypes = roomTypes;

            // Populate dropdown
            roomNameSelect.innerHTML = '<option value="">-- Chọn loại phòng --</option>';
            roomTypes.forEach(roomType => {
                const option = document.createElement('option');
                option.value = roomType.name;
                // Hiển thị: Tên phòng - Giá/đêm (Sức chứa: X người)
                const capacityText = roomType.capacity ? ` (${roomType.capacity} người)` : '';
                option.textContent = `${roomType.name} - ${this.formatCurrency(roomType.basePrice)}/đêm${capacityText}`;
                option.setAttribute('data-price', roomType.basePrice || 0);
                option.setAttribute('data-capacity', roomType.capacity || 0);
                roomNameSelect.appendChild(option);
            });

            roomNameSelect.disabled = false;
        } catch (error) {
            console.error('Failed to load room types:', error);
            const roomNameSelect = document.getElementById('roomName');
            if (roomNameSelect) {
                roomNameSelect.innerHTML = '<option value="">Lỗi khi tải danh sách phòng</option>';
                roomNameSelect.disabled = true;
            }
        }
    }

    /**
     * Close create booking modal
     */
    closeCreateModal() {
        const modal = document.getElementById('createBookingModal');
        if (modal) {
            modal.classList.add('hidden');
            const form = document.getElementById('createBookingForm');
            if (form) {
                form.reset();
                // Reset dropdown to default state
                const roomNameSelect = document.getElementById('roomName');
                if (roomNameSelect) {
                    roomNameSelect.innerHTML = '<option value="">-- Chọn loại phòng --</option>';
                    roomNameSelect.disabled = false;
                }
            }
        }
    }

    /**
     * Handle create booking form submission
     */
    async handleCreateBooking(e) {
        e.preventDefault();

        const formData = {
            guestId: parseInt(document.getElementById('guestId').value),
            items: [
                {
                    roomName: document.getElementById('roomName').value,
                    rooms: parseInt(document.getElementById('rooms').value),
                    checkIn: document.getElementById('checkIn').value,
                    checkOut: document.getElementById('checkOut').value
                }
            ]
        };

        try {
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang tạo...';

            const response = await BookingAPI.create(formData);
            
            console.log('Booking created successfully:', response);
            alert(`Đặt phòng thành công!\n\nMã đặt phòng: ${response.resId}\nKhách hàng: ${response.guestName}\nTổng tiền: ${this.formatCurrency(response.total)}`);
            
            this.closeCreateModal();
            await this.loadBookings(); // Reload bookings list
            
        } catch (error) {
            console.error('Failed to create booking:', error);
            alert('Không thể tạo đặt phòng. Vui lòng kiểm tra thông tin và thử lại.\n\nLỗi: ' + error.message);
            
            // Restore button state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Tạo Đặt Phòng';
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    /**
     * Initialize Feather Icons
     */
    initializeFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

// Initialize booking manager when DOM is ready
let bookingManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bookingManager = new BookingManager();
    });
} else {
    bookingManager = new BookingManager();
}

// Global functions for onclick handlers
function filterByStage(stage) {
    bookingManager.filterByStage(stage);
}

function createNewBooking() {
    bookingManager.openCreateModal();
}

