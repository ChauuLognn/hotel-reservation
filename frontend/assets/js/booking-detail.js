/**
 * Booking Detail Page - Complete Rewrite
 * Handles booking detail view with full backend integration
 */

const BookingDetailAPI = (() => {
    const BASE_URL = 'http://localhost:8080/hotel_reservation_premium/api';

    const handleError = (error, action) => {
        console.error(`❌ Error in ${action}:`, error);
        throw error;
    };

    return {
        /**
         * Get reservation detail by ID
         */
        getReservation: async (resId) => {
            try {
                // Use the query parameter endpoint that works in Postman
                const url = `${BASE_URL}/reservations?resId=${resId}`;
                console.log('🔍 Fetching reservation from URL:', url);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('📡 Response status:', response.status);
                console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Error response:', errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('✅ Reservation loaded successfully:', data);
                return data;
            } catch (error) {
                console.error('❌ Exception caught:', error);
                handleError(error, `get reservation ${resId}`);
            }
        },

        /**
         * Get reservation rooms
         */
        getReservationRooms: async (resId) => {
            try {
                const url = `${BASE_URL}/reservations/${resId}`;
                console.log('🔍 Fetching reservation rooms from:', url);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    console.warn('⚠️ Could not load rooms:', response.status);
                    return [];
                }
                const data = await response.json();
                console.log('✅ Reservation rooms loaded:', data);
                return data;
            } catch (error) {
                console.warn('⚠️ Error loading rooms:', error);
                return []; // Return empty array on error
            }
        },

        /**
         * Get status history
         */
        getStatusHistory: async (resId) => {
            try {
                const url = `${BASE_URL}/reservationStatus/${resId}`;
                const response = await fetch(url);
                if (!response.ok) return []; // Optional, return empty if fails
                return await response.json();
            } catch (error) {
                console.warn('Could not load status history:', error);
                return [];
            }
        },

        /**
         * Update reservation status
         */
        updateStatus: async (resId, newStatus, reason = '') => {
            try {
                const userId = 1; // TODO: Get from session
                const url = `${BASE_URL}/reservationStatus/${resId}/status`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': userId.toString()
                    },
                    body: JSON.stringify({
                        newStatus: newStatus,
                        reason: reason
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                return true;
            } catch (error) {
                handleError(error, `update status for reservation ${resId}`);
            }
        },

        /**
         * Get registered guests for a reservation room
         */
        getRegisteredGuests: async (resRoomId) => {
            try {
                const url = `${BASE_URL}/reservation-guests/reservation-room/${resRoomId}`;
                console.log('🔍 Fetching registered guests:', url);
                
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn('⚠️ Could not load guests:', response.status);
                    return [];
                }
                const data = await response.json();
                console.log('✅ Registered guests loaded:', data);
                return data;
            } catch (error) {
                console.warn('⚠️ Error loading guests:', error);
                return [];
            }
        },

        /**
         * Register guest to reservation room
         */
        registerGuest: async (resRoomId, guestId) => {
            try {
                const url = `${BASE_URL}/reservation-guests/register?resRoomId=${resRoomId}&guestId=${guestId}`;
                console.log('📝 Registering guest:', url);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('✅ Guest registered successfully:', data);
                return data;
            } catch (error) {
                handleError(error, `register guest ${guestId} to room ${resRoomId}`);
            }
        },

        /**
         * Get all guests
         */
        getAllGuests: async () => {
            try {
                const url = `${BASE_URL}/guests`;
                const response = await fetch(url);
                if (!response.ok) return [];
                return await response.json();
            } catch (error) {
                console.warn('⚠️ Error loading all guests:', error);
                return [];
            }
        },

        /**
         * Get guest details by ID
         */
        getGuestById: async (guestId) => {
            try {
                const url = `${BASE_URL}/guests/${guestId}`;
                console.log('🔍 Fetching guest details:', url);
                
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`⚠️ Could not load guest ${guestId}:`, response.status);
                    return null;
                }
                const data = await response.json();
                console.log(`✅ Guest ${guestId} loaded:`, data);
                return data;
            } catch (error) {
                console.warn(`⚠️ Error loading guest ${guestId}:`, error);
                return null;
            }
        },

        /**
         * Check-in guest to reservation room
         */
        checkInGuest: async (resRoomId, guestId, checkInAt = null) => {
            try {
                const url = `${BASE_URL}/reservation-guests/resRoomId=${resRoomId}-guestId=${guestId}/checkIn`;
                console.log('🏨 Checking in guest:', url);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: checkInAt ? JSON.stringify(checkInAt) : null
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                console.log(`✅ Guest ${guestId} checked in successfully:`, data);
                return data;
            } catch (error) {
                console.error(`❌ Error checking in guest ${guestId}:`, error);
                throw error;
            }
        },

        /**
         * Check-out guest from reservation room
         */
        checkOutGuest: async (resRoomId, guestId, checkOutAt = null) => {
            try {
                const url = `${BASE_URL}/reservation-guests/resRoomId=${resRoomId}-guestId=${guestId}/checkOut`;
                console.log('🚪 Checking out guest:', url);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: checkOutAt ? JSON.stringify(checkOutAt) : null
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                console.log(`✅ Guest ${guestId} checked out successfully:`, data);
                return data;
            } catch (error) {
                console.error(`❌ Error checking out guest ${guestId}:`, error);
                throw error;
            }
        },

        /**
         * Get all available services
         */
        getAllServices: async () => {
            try {
                const url = `${BASE_URL}/services`;
                console.log('🛎️ Fetching all services:', url);
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                console.log('✅ Services loaded:', data);
                return data;
            } catch (error) {
                console.error('❌ Error loading services:', error);
                return [];
            }
        },

        /**
         * Get services used by a reservation room
         */
        getServicesOfRoom: async (resRoomId) => {
            try {
                const url = `${BASE_URL}/reservation-rooms/${resRoomId}/services`;
                console.log('📋 Fetching services for room:', url);
                
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`⚠️ Could not load services for room ${resRoomId}`);
                    return [];
                }
                
                const data = await response.json();
                console.log(`✅ Services for room ${resRoomId}:`, data);
                return data;
            } catch (error) {
                console.warn(`⚠️ Error loading services for room ${resRoomId}:`, error);
                return [];
            }
        },

        /**
         * Add service to reservation room
         */
        addServiceToRoom: async (resRoomId, serviceName, quantity, userId = 9) => {
            try {
                const url = `${BASE_URL}/reservation-rooms/${resRoomId}/services`;
                console.log('➕ Adding service to room:', url);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User_id': userId.toString()
                    },
                    body: JSON.stringify({
                        name: serviceName,
                        quantity: quantity
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                console.log('✅ Service added successfully');
                return true;
            } catch (error) {
                console.error('❌ Error adding service:', error);
                throw error;
            }
        }
    };
})();

class BookingDetailManager {
    constructor() {
        this.reservation = null;
        this.reservationRooms = [];
        this.statusHistory = [];
        this.currentStage = 1;
        this.allGuests = []; // Cache all guests
        this.registeredGuests = {}; // Cache registered guests by room ID
        this.guestDetails = {}; // Cache detailed guest info by guest ID
        this.allServices = []; // Cache all available services
        this.roomServices = {}; // Cache services by room ID
        console.log('🏗️ BookingDetailManager initialized');
        this.init();
    }

    async init() {
        console.log('🚀 Initializing BookingDetailManager...');
        console.log('🌐 Current URL:', window.location.href);
        console.log('🔗 URL Search Params:', window.location.search);
        
        const resId = this.getUrlParam('id');
        console.log('🎫 Reservation ID from URL:', resId);
        
        if (!resId || resId === 'new') {
            console.error('❌ Invalid reservation ID:', resId);
            this.showError('Không tìm thấy mã đặt phòng');
            return;
        }

        console.log('✅ Valid reservation ID, proceeding to load...');
        await this.loadBookingDetail(resId);
        this.attachEventListeners();
        this.initializeFeatherIcons();
    }

    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    async loadBookingDetail(resId) {
        try {
            console.log('🚀 Starting to load booking detail for:', resId);
            this.showLoading();

            // Load reservation - MAIN DATA
            console.log('📥 Step 1: Loading reservation data...');
            this.reservation = await BookingDetailAPI.getReservation(resId);
            
            console.log('📦 Raw reservation data received:', this.reservation);
            
            if (!this.reservation) {
                throw new Error('Không nhận được dữ liệu từ server');
            }
            
            if (!this.reservation.id) {
                console.warn('⚠️ Reservation data missing ID:', this.reservation);
                throw new Error('Dữ liệu reservation không hợp lệ (thiếu ID)');
            }

            // Load rooms (optional)
            console.log('📥 Step 2: Loading reservation rooms...');
            try {
                this.reservationRooms = await BookingDetailAPI.getReservationRooms(resId);
            } catch (error) {
                console.warn('⚠️ Could not load rooms:', error);
                this.reservationRooms = [];
            }

            // Load status history (optional)
            console.log('📥 Step 3: Loading status history...');
            try {
                this.statusHistory = await BookingDetailAPI.getStatusHistory(resId);
            } catch (error) {
                console.warn('⚠️ Could not load status history:', error);
                this.statusHistory = [];
            }

            // Map status to stage
            this.currentStage = this.mapStatusToStage(this.reservation.status);
            console.log('🎯 Status mapping:', this.reservation.status, '→ Stage:', this.currentStage);

            // Update UI
            console.log('🎨 Updating UI...');
            this.updateUI();
            
            // Hide loading overlay
            this.hideLoading();
            console.log('✅ Booking detail loaded successfully!');
        } catch (error) {
            console.error('❌ Failed to load booking detail:', error);
            console.error('❌ Error stack:', error.stack);
            this.hideLoading();
            this.showError(`Không thể tải thông tin đặt phòng: ${error.message}`);
        }
    }

    mapStatusToStage(status) {
        const mapping = {
            'PENDING_PAYMENT': 1,
            'CONFIRMED': 2,
            'CHECK_IN': 4,
            'CHECK_OUT': 6,
            'CANCELLED': 4,
            'PENDING_EXPIRED': 1
        };
        return mapping[status] || 1;
    }

    getStageLabel(stage) {
        const labels = {
            1: 'Đặt Giữ Chỗ',
            2: 'Đã Xác Nhận',
            3: 'Đã Đăng Ký',
            4: 'Đã Nhận Phòng',
            5: 'Đang Sử Dụng Dịch Vụ',
            6: 'Check-Out Khách Hàng'
        };
        return labels[stage] || 'Không Xác Định';
    }

    updateUI() {
        if (!this.reservation) return;

        // Update header
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = `Đặt Phòng ${this.reservation.id}`;
        }

        // Update booking info
        this.updateElement('bookingId', this.reservation.id || 'N/A');
        this.updateElement('guestName', this.reservation.guestName || 'N/A');
        this.updateElement('guestEmail', this.reservation.guestPhone || 'N/A');

        // Room info
        const roomType = this.reservation.roomNames && this.reservation.roomNames.length > 0 
            ? this.reservation.roomNames[0] 
            : 'N/A';
        this.updateElement('roomType', roomType);

        const totalRooms = this.reservation.roomIds ? this.reservation.roomIds.length : 0;
        this.updateElement('numRooms', totalRooms.toString());

        // Dates
        if (this.reservation.checkIn) {
            this.updateElement('checkInDate', 
                new Date(this.reservation.checkIn).toLocaleDateString('vi-VN'));
        }
        if (this.reservation.checkOut) {
            this.updateElement('checkOutDate', 
                new Date(this.reservation.checkOut).toLocaleDateString('vi-VN'));
        }

        // Total cost
        this.updateElement('totalCost', this.formatCurrency(this.reservation.total || 0));

        // Update status badge
        const statusBadge = document.getElementById('statusBadge');
        if (statusBadge) {
            statusBadge.textContent = `Giai đoạn ${this.currentStage}: ${this.getStageLabel(this.currentStage)}`;
            statusBadge.className = `px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full status-stage${this.currentStage}`;
        }

        // Update workflow progress
        this.updateElement('currentStage', this.currentStage.toString());
        this.updateElement('currentStageLabel', this.getStageLabel(this.currentStage));

        // Update workflow circles
        this.updateWorkflowProgress();

        // Show current stage content
        this.showCurrentStage();

        // Update stage-specific content
        this.updateStageContent();
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateWorkflowProgress() {
        // Update circles
        document.querySelectorAll('.workflow-step-circle').forEach((circle, idx) => {
            const stage = idx + 1;
            circle.className = 'workflow-step-circle';
            if (stage < this.currentStage) {
                circle.classList.add('completed');
            } else if (stage === this.currentStage) {
                circle.classList.add('active');
            } else {
                circle.classList.add('pending');
            }
        });

        // Update connectors
        document.querySelectorAll('.workflow-connector').forEach((connector, idx) => {
            if (idx < this.currentStage - 1) {
                connector.className = 'workflow-connector completed';
            } else {
                connector.className = 'workflow-connector pending';
            }
        });
    }

    showCurrentStage() {
        // Hide all stages
        document.querySelectorAll('.stage-content').forEach(el => {
            el.classList.remove('active');
        });

        // Show current stage
        const currentStageEl = document.querySelector(`.stage-content[data-stage="${this.currentStage}"]`);
        if (currentStageEl) {
            currentStageEl.classList.add('active');
        }
    }

    updateStageContent() {
        // Stage 1: Hold information
        if (this.currentStage === 1 && this.reservation) {
            const holdToken = document.getElementById('holdToken');
            if (holdToken && this.reservation.id) {
                holdToken.textContent = this.reservation.id.substring(0, 20) + '...';
            }

            const roomIds = document.getElementById('roomIds');
            if (roomIds && this.reservation.roomIds) {
                roomIds.textContent = this.reservation.roomIds.join(', ');
            }
        }

        // Stage 2: Load registered guests
        if (this.currentStage === 2) {
            this.loadRegisteredGuests();
        }

        // Stage 3: Display detailed guest information
        if (this.currentStage === 3) {
            this.displayGuestDetailsInStage3();
        }

        // Stage 4: Display guests list for check-in
        if (this.currentStage === 4) {
            this.displayStage4GuestsList();
        }

        // Stage 5: Display services by room
        if (this.currentStage === 5) {
            this.displayStage5Services();
        }

        // Stage 6: Display guests for checkout
        if (this.currentStage === 6) {
            this.displayStage6GuestsList();
        }
    }

    attachEventListeners() {
        // Event listeners are handled by onclick in HTML
    }

    async confirmHold() {
        if (!this.reservation) {
            alert('Không tìm thấy thông tin đặt phòng');
            return;
        }

        if (this.reservation.status !== 'PENDING_PAYMENT') {
            alert(`Không thể xác nhận. Trạng thái hiện tại: ${this.reservation.status}`);
            return;
        }

        if (!confirm('Bạn có chắc chắn muốn xác nhận giữ chỗ này?')) {
            return;
        }

        const button = event.target.closest('button');
        const originalText = button ? button.innerHTML : '';
        
        try {
            if (button) {
                button.disabled = true;
                button.innerHTML = '<span>Đang xử lý...</span>';
            }

            await BookingDetailAPI.updateStatus(
                this.reservation.id,
                'CONFIRMED',
                'Xác nhận giữ chỗ từ giai đoạn 1'
            );

            // Reload data
            await this.loadBookingDetail(this.reservation.id);
            alert('✅ Xác nhận giữ chỗ thành công!');
        } catch (error) {
            console.error('Failed to confirm hold:', error);
            alert('Không thể xác nhận giữ chỗ. Lỗi: ' + error.message);
            
            if (button && originalText) {
                button.disabled = false;
                button.innerHTML = originalText;
            }
        }
    }

    async cancelBooking() {
        if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) {
            return;
        }

        try {
            await BookingDetailAPI.updateStatus(
                this.reservation.id,
                'CANCELLED',
                'Hủy đặt phòng bởi người dùng'
            );
            alert('❌ Đặt phòng đã bị hủy');
            window.location.href = 'bookings.html';
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            alert('Không thể hủy đặt phòng. Lỗi: ' + error.message);
        }
    }

    async nextStage() {
        // No auto check-in when moving from Stage 4 to Stage 5
        // Check-in is now manual in Stage 4
        
        if (this.currentStage < 6) {
            this.currentStage++;
            this.updateUI();
        }
    }

    prevStage() {
        if (this.currentStage > 1) {
            this.currentStage--;
            this.updateUI();
        }
    }

    completeBooking() {
        alert('✅ Đặt phòng hoàn tất thành công!');
        window.location.href = 'bookings.html';
    }

    addService() {
        alert('Đang mở hộp thoại chọn dịch vụ...');
    }

    goBack() {
        window.location.href = 'bookings.html';
    }

    async checkInSingleGuest(roomId, guestId, guestKey) {
        console.log(`🏨 Checking in guest ${guestId} in room ${roomId}...`);
        
        try {
            // Call API to check-in
            await BookingDetailAPI.checkInGuest(roomId, guestId);
            
            // Mark as checked in
            if (!this.checkedInGuests) {
                this.checkedInGuests = new Set();
            }
            this.checkedInGuests.add(guestKey);
            
            console.log(`✅ Guest ${guestId} checked in successfully`);
            
            // Refresh the display
            this.displayStage4GuestsList();
            
        } catch (error) {
            console.error(`❌ Failed to check-in guest ${guestId}:`, error);
            
            // Parse error message
            let errorMessage = 'Lỗi khi check-in khách';
            try {
                const match = error.message.match(/HTTP \d+: (.+)/);
                if (match) {
                    const errorObj = JSON.parse(match[1]);
                    errorMessage = errorObj.message || errorMessage;
                }
            } catch {
                errorMessage = error.message || errorMessage;
            }
            
            alert(`❌ ${errorMessage}`);
        }
    }

    async checkOutSingleGuest(roomId, guestId, guestKey) {
        console.log(`🚪 Checking out guest ${guestId} from room ${roomId}...`);
        
        try {
            // Call API to check-out
            await BookingDetailAPI.checkOutGuest(roomId, guestId);
            
            // Mark as checked out
            if (!this.checkedOutGuests) {
                this.checkedOutGuests = new Set();
            }
            this.checkedOutGuests.add(guestKey);
            
            console.log(`✅ Guest ${guestId} checked out successfully`);
            
            // Refresh the display
            this.displayStage6GuestsList();
            
        } catch (error) {
            console.error(`❌ Failed to check-out guest ${guestId}:`, error);
            
            // Parse error message
            let errorMessage = 'Lỗi khi check-out khách';
            try {
                const match = error.message.match(/HTTP \d+: (.+)/);
                if (match) {
                    const errorObj = JSON.parse(match[1]);
                    errorMessage = errorObj.message || errorMessage;
                }
            } catch {
                errorMessage = error.message || errorMessage;
            }
            
            alert(`❌ ${errorMessage}`);
        }
    }

    async performCheckIn() {
        console.log('🏨 Starting check-in process for all registered guests...');
        
        const checkInPromises = [];
        
        // Iterate through all rooms and their registered guests
        for (const [roomId, guests] of Object.entries(this.registeredGuests)) {
            if (!guests || guests.length === 0) {
                console.log(`⚠️ No guests to check-in for room ${roomId}`);
                continue;
            }
            
            // Check-in each guest in the room
            for (const guest of guests) {
                if (guest.guestId) {
                    console.log(`📝 Queuing check-in for guest ${guest.guestId} in room ${roomId}`);
                    checkInPromises.push(
                        BookingDetailAPI.checkInGuest(roomId, guest.guestId)
                            .catch(err => {
                                console.error(`Failed to check-in guest ${guest.guestId}:`, err);
                                return { error: true, guestId: guest.guestId, message: err.message };
                            })
                    );
                }
            }
        }
        
        if (checkInPromises.length === 0) {
            console.warn('⚠️ No guests to check-in');
            alert('Không có khách nào để check-in. Vui lòng đăng ký khách trước.');
            throw new Error('No guests to check-in');
        }
        
        console.log(`🔄 Checking in ${checkInPromises.length} guests...`);
        const results = await Promise.all(checkInPromises);
        
        // Check for any errors
        const errors = results.filter(r => r && r.error);
        if (errors.length > 0) {
            console.error('❌ Some check-ins failed:', errors);
            
            // Parse error messages for better user feedback
            const errorMessages = errors.map(e => {
                try {
                    const match = e.message.match(/HTTP \d+: (.+)/);
                    if (match) {
                        const errorObj = JSON.parse(match[1]);
                        return errorObj.message || e.message;
                    }
                } catch {
                    return e.message;
                }
                return e.message;
            });
            
            const uniqueErrors = [...new Set(errorMessages)];
            const errorMsg = uniqueErrors.join('\n');
            
            alert(`❌ Không thể check-in:\n\n${errorMsg}\n\n` +
                  `Lỗi: ${errors.length}/${results.length} khách\n\n` +
                  `Gợi ý: Nếu "Phòng đã hết thời gian ở", vui lòng tạo reservation mới với ngày check-in/check-out hợp lệ.`);
            throw new Error('Some check-ins failed');
        }
        
        console.log('✅ All guests checked in successfully!');
        alert(`✅ Check-in thành công cho ${results.length} khách!`);
    }

    async loadAllGuests() {
        try {
            this.allGuests = await BookingDetailAPI.getAllGuests();
            console.log('✅ Loaded all guests:', this.allGuests);
        } catch (error) {
            console.warn('⚠️ Could not load guests:', error);
            this.allGuests = [];
        }
    }

    async loadRegisteredGuests() {
        if (!this.reservationRooms || this.reservationRooms.length === 0) {
            console.warn('⚠️ No reservation rooms to load guests for');
            return;
        }

        for (const room of this.reservationRooms) {
            try {
                const guests = await BookingDetailAPI.getRegisteredGuests(room.id);
                this.registeredGuests[room.id] = guests;
                console.log(`✅ Loaded guests for room ${room.id}:`, guests);
            } catch (error) {
                console.warn(`⚠️ Error loading guests for room ${room.id}:`, error);
                this.registeredGuests[room.id] = [];
            }
        }

        // Update UI to show registered guests
        this.updateRegisteredGuestsUI();
    }

    updateRegisteredGuestsUI() {
        const container = document.getElementById('registeredGuestsList');
        if (!container) return;

        let html = '';
        let totalGuests = 0;

        for (const [roomId, guests] of Object.entries(this.registeredGuests)) {
            const room = this.reservationRooms.find(r => r.id === roomId);
            if (!room || guests.length === 0) continue;

            totalGuests += guests.length;

            html += `
                <div class="border border-purple-200 rounded p-3 bg-white">
                    <div class="font-semibold text-sm text-purple-900 mb-2">
                        Phòng ${room.roomId || room.id}
                    </div>
                    <div class="space-y-1">
                        ${guests.map(g => `
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-gray-700">${g.guestName}</span>
                                <span class="text-gray-500">${g.identityNum || 'N/A'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (totalGuests === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Chưa có khách nào được đăng ký</p>';
        } else {
            container.innerHTML = html;
        }

        feather.replace();
    }

    async displayGuestDetailsInStage3() {
        console.log('🎯 Displaying guest details in Stage 3...');
        const container = document.getElementById('stage3GuestDetailsList');
        
        if (!container) {
            console.error('❌ Stage 3 guest details container not found');
            return;
        }

        // Show loading
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Đang tải thông tin khách...</p>
            </div>
        `;

        // Collect all guest IDs from registered guests
        const guestIds = new Set();
        for (const roomId in this.registeredGuests) {
            const guests = this.registeredGuests[roomId] || [];
            guests.forEach(g => {
                if (g.guestId) {
                    guestIds.add(g.guestId);
                }
            });
        }

        console.log(`📋 Found ${guestIds.size} unique guests to load details for`);

        if (guestIds.size === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-feather="alert-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-600">Chưa có khách nào được đăng ký lưu trú</p>
                    <p class="text-sm text-gray-500 mt-2">Vui lòng quay lại Giai đoạn 2 để đăng ký khách</p>
                </div>
            `;
            this.initializeFeatherIcons();
            return;
        }

        // Load detailed info for each guest
        const guestDetailsPromises = Array.from(guestIds).map(async (guestId) => {
            if (this.guestDetails[guestId]) {
                return this.guestDetails[guestId];
            }
            const guestData = await BookingDetailAPI.getGuestById(guestId);
            if (guestData) {
                this.guestDetails[guestId] = guestData;
            }
            return guestData;
        });

        const loadedGuests = await Promise.all(guestDetailsPromises);
        const validGuests = loadedGuests.filter(g => g !== null);

        console.log(`✅ Loaded ${validGuests.length} guest details successfully`);

        if (validGuests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-feather="alert-circle" class="w-16 h-16 text-orange-400 mx-auto mb-4"></i>
                    <p class="text-gray-600">Không thể tải thông tin chi tiết khách</p>
                </div>
            `;
            this.initializeFeatherIcons();
            return;
        }

        // Find which room each guest is assigned to
        const guestRoomMap = {};
        for (const roomId in this.registeredGuests) {
            const guests = this.registeredGuests[roomId] || [];
            guests.forEach(g => {
                if (g.guestId) {
                    guestRoomMap[g.guestId] = roomId;
                }
            });
        }

        // Render guest cards
        let html = '<div class="space-y-4">';
        
        validGuests.forEach((guest, index) => {
            const roomId = guestRoomMap[guest.id];
            const room = this.reservationRooms.find(r => r.id === roomId);
            const roomNumber = room ? room.roomNumber : 'N/A';
            
            // Construct full name from firstName and lastName
            const fullName = `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'N/A';
            
            // Format date of birth
            const dob = guest.dateOfBirth ? new Date(guest.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A';

            html += `
                <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                                ${index + 1}
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">${fullName}</h3>
                                <p class="text-sm text-gray-500">Phòng: ${roomNumber}</p>
                            </div>
                        </div>
                        <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Đã đăng ký
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center space-x-3">
                            <i data-feather="phone" class="w-5 h-5 text-gray-400"></i>
                            <div>
                                <p class="text-xs text-gray-500">Số điện thoại</p>
                                <p class="text-sm font-medium text-gray-900">${guest.phone || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <i data-feather="credit-card" class="w-5 h-5 text-gray-400"></i>
                            <div>
                                <p class="text-xs text-gray-500">CMND/CCCD</p>
                                <p class="text-sm font-medium text-gray-900">${guest.identityNum || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <i data-feather="calendar" class="w-5 h-5 text-gray-400"></i>
                            <div>
                                <p class="text-xs text-gray-500">Ngày sinh</p>
                                <p class="text-sm font-medium text-gray-900">${dob}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <i data-feather="user" class="w-5 h-5 text-gray-400"></i>
                            <div>
                                <p class="text-xs text-gray-500">Họ</p>
                                <p class="text-sm font-medium text-gray-900">${guest.firstName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
        this.initializeFeatherIcons();
    }

    displayStage4GuestsList() {
        console.log('📋 Displaying guests list for Stage 4 check-in...');
        const container = document.getElementById('stage4GuestsList');
        
        if (!container) {
            console.warn('⚠️ Stage 4 guests list container not found');
            return;
        }

        // Initialize checkedInGuests if not exists
        if (!this.checkedInGuests) {
            this.checkedInGuests = new Set();
        }

        // Count total guests
        let totalGuests = 0;
        let checkedInCount = 0;
        let html = '';

        for (const [roomId, guests] of Object.entries(this.registeredGuests)) {
            if (!guests || guests.length === 0) continue;
            
            const room = this.reservationRooms.find(r => r.id === roomId);
            const roomNumber = room ? room.roomNumber : roomId;
            
            totalGuests += guests.length;
            
            html += `
                <div class="border-b border-gray-200 pb-4 mb-4 last:border-0">
                    <div class="flex items-center space-x-2 mb-3">
                        <i data-feather="home" class="w-4 h-4 text-indigo-600"></i>
                        <span class="font-semibold text-gray-800">Phòng ${roomNumber}</span>
                    </div>
                    <div class="space-y-2">
                        ${guests.map(g => {
                            const guestKey = `${roomId}_${g.guestId}`;
                            const isCheckedIn = this.checkedInGuests.has(guestKey);
                            if (isCheckedIn) checkedInCount++;
                            
                            return `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div class="flex items-center space-x-3">
                                        <i data-feather="user" class="w-4 h-4 text-gray-600"></i>
                                        <span class="text-sm font-medium text-gray-800">${g.guestName || 'Guest #' + g.guestId}</span>
                                    </div>
                                    <div>
                                        ${isCheckedIn 
                                            ? '<span class="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><i data-feather="check" class="w-3 h-3 mr-1"></i>Đã Check-In</span>'
                                            : `<button onclick="checkInSingleGuest('${roomId}', '${g.guestId}', '${guestKey}')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors duration-200">Check-In Ngay</button>`
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        if (totalGuests === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i data-feather="alert-circle" class="w-8 h-8 text-gray-400 mx-auto mb-2"></i>
                    <p class="text-gray-500">Chưa có khách nào được đăng ký</p>
                    <p class="text-xs text-gray-400 mt-1">Vui lòng quay lại Giai đoạn 2</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="mb-4 pb-3 border-b border-gray-300">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-600 font-medium">Tổng số khách:</span>
                        <span class="font-bold text-indigo-600">${totalGuests} khách</span>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-gray-600">Đã check-in:</span>
                        <span class="font-semibold text-green-600">${checkedInCount}/${totalGuests}</span>
                    </div>
                </div>
                ${html}
            `;
        }

        this.initializeFeatherIcons();
    }

    async displayStage5Services() {
        console.log('🛎️ Displaying services for Stage 5...');
        
        // Load all services if not loaded
        if (this.allServices.length === 0) {
            this.allServices = await BookingDetailAPI.getAllServices();
        }

        // Load services for each room
        for (const room of this.reservationRooms) {
            const services = await BookingDetailAPI.getServicesOfRoom(room.id);
            this.roomServices[room.id] = services || [];
        }

        this.updateStage5ServicesUI();
    }

    updateStage5ServicesUI() {
        const container = document.getElementById('stage5ServicesByRoom');
        if (!container) return;

        let html = '';
        let totalServices = 0;
        let totalAmount = 0;

        for (const room of this.reservationRooms) {
            const services = this.roomServices[room.id] || [];
            const roomNumber = room.roomNumber || room.roomId || room.id;

            html += `
                <div class="border border-gray-200 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center space-x-2">
                            <i data-feather="home" class="w-5 h-5 text-yellow-600"></i>
                            <h5 class="font-semibold text-gray-900">Phòng ${roomNumber}</h5>
                        </div>
                        <span class="text-sm text-gray-500">${services.length} dịch vụ</span>
                    </div>
                    
                    ${services.length === 0 ? `
                        <p class="text-sm text-gray-500 text-center py-2">Chưa sử dụng dịch vụ nào</p>
                    ` : `
                        <div class="space-y-2">
                            ${services.map(s => {
                                totalServices += s.quantity || 1;
                                totalAmount += parseFloat(s.totalAmount || 0);
                                return `
                                    <div class="bg-yellow-50 border border-yellow-200 rounded p-3 flex justify-between items-center">
                                        <div>
                                            <p class="font-medium text-gray-900">${s.service}</p>
                                            <p class="text-xs text-gray-500">Số lượng: ${s.quantity || 1}</p>
                                        </div>
                                        <span class="font-semibold text-gray-900">${this.formatCurrency(s.totalAmount)}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            `;
        }

        container.innerHTML = html || '<p class="text-center text-gray-500">Không có phòng nào</p>';

        // Update totals
        document.getElementById('totalServicesCount').textContent = totalServices;
        document.getElementById('totalServicesAmount').textContent = this.formatCurrency(totalAmount);

        this.initializeFeatherIcons();
    }

    async showAddServiceModal() {
        console.log('🔓 Opening add service modal...');
        
        // Load all services if not loaded
        if (this.allServices.length === 0) {
            this.allServices = await BookingDetailAPI.getAllServices();
        }

        // Populate room dropdown
        const roomSelect = document.getElementById('selectRoomForService');
        if (roomSelect && this.reservationRooms.length > 0) {
            roomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>' +
                this.reservationRooms.map(room => 
                    `<option value="${room.id}">Phòng ${room.roomNumber || room.roomId || room.id}</option>`
                ).join('');
        }

        // Populate service dropdown
        const serviceSelect = document.getElementById('selectServiceName');
        if (serviceSelect && this.allServices.length > 0) {
            serviceSelect.innerHTML = '<option value="">-- Chọn dịch vụ --</option>' +
                this.allServices.map(service => 
                    `<option value="${service.name}" data-price="${service.price}">${service.name} - ${this.formatCurrency(service.price)}</option>`
                ).join('');
            
            // Add event listener to show price
            serviceSelect.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const price = selectedOption.getAttribute('data-price');
                document.getElementById('servicePriceValue').textContent = price ? this.formatCurrency(price) : '--';
            });
        }

        // Show modal
        const modal = document.getElementById('addServiceModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeAddServiceModal() {
        const modal = document.getElementById('addServiceModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Reset form
        document.getElementById('selectRoomForService').value = '';
        document.getElementById('selectServiceName').value = '';
        document.getElementById('serviceQuantity').value = '1';
        document.getElementById('servicePriceValue').textContent = '--';
    }

    async addServiceToRoom() {
        const resRoomId = document.getElementById('selectRoomForService').value;
        const serviceName = document.getElementById('selectServiceName').value;
        const quantity = parseInt(document.getElementById('serviceQuantity').value);

        if (!resRoomId || !serviceName || !quantity || quantity < 1) {
            alert('Vui lòng chọn đầy đủ thông tin dịch vụ');
            return;
        }

        try {
            await BookingDetailAPI.addServiceToRoom(resRoomId, serviceName, quantity);
            alert('✅ Thêm dịch vụ thành công!');
            
            // Reload services
            await this.displayStage5Services();
            
            // Close modal
            this.closeAddServiceModal();
        } catch (error) {
            alert('❌ Lỗi khi thêm dịch vụ: ' + error.message);
        }
    }

    async displayStage6GuestsList() {
        console.log('🚪 Displaying guests list for Stage 6 checkout...');
        
        const container = document.getElementById('stage6GuestsList');
        if (!container) {
            console.warn('⚠️ Stage 6 guests list container not found');
            return;
        }

        // Initialize checkedOutGuests if not exists
        if (!this.checkedOutGuests) {
            this.checkedOutGuests = new Set();
        }

        // Count total guests
        let totalGuests = 0;
        let checkedOutCount = 0;
        let html = '';

        for (const [roomId, guests] of Object.entries(this.registeredGuests)) {
            if (!guests || guests.length === 0) continue;
            
            const room = this.reservationRooms.find(r => r.id === roomId);
            const roomNumber = room ? room.roomNumber : roomId;
            
            totalGuests += guests.length;
            
            html += `
                <div class="border-b border-gray-200 pb-4 mb-4 last:border-0">
                    <div class="flex items-center space-x-2 mb-3">
                        <i data-feather="home" class="w-4 h-4 text-purple-600"></i>
                        <span class="font-semibold text-gray-800">Phòng ${roomNumber}</span>
                    </div>
                    <div class="space-y-2">
                        ${guests.map(g => {
                            const guestKey = `${roomId}_${g.guestId}`;
                            const isCheckedOut = this.checkedOutGuests.has(guestKey);
                            const isCheckedIn = this.checkedInGuests && this.checkedInGuests.has(guestKey);
                            if (isCheckedOut) checkedOutCount++;
                            
                            return `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div class="flex items-center space-x-3">
                                        <i data-feather="user" class="w-4 h-4 text-gray-600"></i>
                                        <span class="text-sm font-medium text-gray-800">${g.guestName || 'Guest #' + g.guestId}</span>
                                    </div>
                                    <div>
                                        ${isCheckedOut 
                                            ? '<span class="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"><i data-feather="check" class="w-3 h-3 mr-1"></i>Đã Check-Out</span>'
                                            : (isCheckedIn 
                                                ? `<button onclick="checkOutSingleGuest('${roomId}', '${g.guestId}', '${guestKey}')" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors duration-200">Check-Out Ngay</button>`
                                                : '<span class="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-xs font-medium">Chưa Check-In</span>'
                                            )
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        if (totalGuests === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i data-feather="alert-circle" class="w-8 h-8 text-gray-400 mx-auto mb-2"></i>
                    <p class="text-gray-500">Chưa có khách nào được đăng ký</p>
                    <p class="text-xs text-gray-400 mt-1">Vui lòng quay lại Giai đoạn 2</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="mb-4 pb-3 border-b border-gray-300">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-600 font-medium">Tổng số khách:</span>
                        <span class="font-bold text-purple-600">${totalGuests} khách</span>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-gray-600">Đã check-out:</span>
                        <span class="font-semibold text-red-600">${checkedOutCount}/${totalGuests}</span>
                    </div>
                </div>
                ${html}
            `;
        }

        this.initializeFeatherIcons();
    }

    async checkOutSingleGuest(roomId, guestId, guestKey) {
        console.log(`🚪 Checking out guest ${guestId} from room ${roomId}...`);
        
        try {
            // Call API to check-out
            await BookingDetailAPI.checkOutGuest(roomId, guestId);
            
            // Mark as checked out
            if (!this.checkedOutGuests) {
                this.checkedOutGuests = new Set();
            }
            this.checkedOutGuests.add(guestKey);
            
            console.log(`✅ Guest ${guestId} checked out successfully`);
            
            // Refresh the display
            this.displayStage6GuestsList();
            
        } catch (error) {
            console.error(`❌ Failed to check-out guest ${guestId}:`, error);
            
            // Parse error message
            let errorMessage = 'Lỗi khi check-out khách';
            try {
                const match = error.message.match(/HTTP \\d+: (.+)/);
                if (match) {
                    const errorObj = JSON.parse(match[1]);
                    errorMessage = errorObj.message || errorMessage;
                }
            } catch {
                errorMessage = error.message || errorMessage;
            }
            
            alert(`❌ ${errorMessage}`);
        }
    }

    async showRegisterGuestModal() {
        console.log('🔓 Opening register guest modal...');
        
        // Load all guests if not loaded
        if (this.allGuests.length === 0) {
            await this.loadAllGuests();
        }

        // Populate room dropdown
        const roomSelect = document.getElementById('selectRoomForGuest');
        if (roomSelect && this.reservationRooms.length > 0) {
            roomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>' +
                this.reservationRooms.map(room => 
                    `<option value="${room.id}">Phòng ${room.roomId || room.id}</option>`
                ).join('');
        }

        // Populate guest dropdown
        const guestSelect = document.getElementById('selectGuest');
        if (guestSelect && this.allGuests.length > 0) {
            guestSelect.innerHTML = '<option value="">-- Chọn khách --</option>' +
                this.allGuests.map(guest => 
                    `<option value="${guest.id}">${guest.firstName} ${guest.lastName} - ${guest.identityNum || 'N/A'}</option>`
                ).join('');
        }

        // Show modal
        const modal = document.getElementById('registerGuestModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeRegisterGuestModal() {
        const modal = document.getElementById('registerGuestModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async registerGuestToRoom() {
        const resRoomId = document.getElementById('selectRoomForGuest')?.value;
        const guestId = document.getElementById('selectGuest')?.value;

        if (!resRoomId || !guestId) {
            alert('Vui lòng chọn phòng và khách');
            return;
        }

        try {
            await BookingDetailAPI.registerGuest(resRoomId, parseInt(guestId));
            alert('✅ Đăng ký khách thành công!');
            
            // Reload registered guests
            await this.loadRegisteredGuests();
            
            // Close modal
            this.closeRegisterGuestModal();
        } catch (error) {
            console.error('❌ Failed to register guest:', error);
            alert('Không thể đăng ký khách: ' + error.message);
        }
    }

    async proceedToStay() {
        // Check if at least one guest is registered
        const totalGuests = Object.values(this.registeredGuests).reduce((sum, guests) => sum + guests.length, 0);
        
        if (totalGuests === 0) {
            if (!confirm('Chưa có khách nào được đăng ký. Bạn có muốn tiếp tục không?')) {
                return;
            }
        }

        this.nextStage();
    }

    hideLoading() {
        console.log('✨ Hiding loading state...');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    showLoading() {
        console.log('📋 Showing loading state...');
        // Don't replace content, just show loading indicator
        const main = document.querySelector('main');
        if (main) {
            // Add loading overlay if not exists
            let loadingOverlay = document.getElementById('loadingOverlay');
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'loadingOverlay';
                loadingOverlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;';
                loadingOverlay.innerHTML = '<div style="background: white; padding: 30px; border-radius: 10px; text-align: center;"><p style="color: #6b7280; font-size: 18px;">⏳ Đang tải...</p></div>';
                document.body.appendChild(loadingOverlay);
            }
            loadingOverlay.style.display = 'flex';
        }
    }

    showError(message) {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto mt-8">
                    <div class="text-center">
                        <div class="mb-4">
                            <i data-feather="alert-circle" class="w-16 h-16 text-red-500 mx-auto"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Lỗi Tải Dữ Liệu</h3>
                        <p class="text-red-500 mb-6">${message}</p>
                        <div class="space-y-3">
                            <button onclick="window.location.href='bookings.html'" 
                                class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                                Quay Lại Danh Sách Đặt Phòng
                            </button>
                            <button onclick="location.reload()" 
                                class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                                Thử Lại
                            </button>
                        </div>
                    </div>
                </div>
            `;
            this.initializeFeatherIcons();
        }
    }

    formatCurrency(amount) {
        if (!amount) return '0₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    initializeFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

// Initialize
let bookingDetailManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bookingDetailManager = new BookingDetailManager();
    });
} else {
    bookingDetailManager = new BookingDetailManager();
}

// Global functions for onclick handlers
function nextStage() {
    bookingDetailManager.nextStage();
}

function prevStage() {
    bookingDetailManager.prevStage();
}

function confirmHold() {
    bookingDetailManager.confirmHold();
}

function cancelBooking() {
    bookingDetailManager.cancelBooking();
}

function completeBooking() {
    bookingDetailManager.completeBooking();
}

function addService() {
    bookingDetailManager.addService();
}

function goBack() {
    bookingDetailManager.goBack();
}


function showAddServiceModal() {
    bookingDetailManager.showAddServiceModal();
}

function closeAddServiceModal() {
    bookingDetailManager.closeAddServiceModal();
}

function addServiceToRoom() {
    bookingDetailManager.addServiceToRoom();
}

function showRegisterGuestModal() {
    bookingDetailManager.showRegisterGuestModal();
}

function closeRegisterGuestModal() {
    bookingDetailManager.closeRegisterGuestModal();
}

function registerGuestToRoom() {
    bookingDetailManager.registerGuestToRoom();
}

function proceedToStay() {
    bookingDetailManager.proceedToStay();
}

function checkInSingleGuest(roomId, guestId, guestKey) {
    bookingDetailManager.checkInSingleGuest(roomId, guestId, guestKey);
}

function checkOutSingleGuest(roomId, guestId, guestKey) {
    bookingDetailManager.checkOutSingleGuest(roomId, guestId, guestKey);
}

