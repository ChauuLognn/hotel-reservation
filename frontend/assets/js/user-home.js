/**
 * User Home Page - JavaScript
 * Handles user portal functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadRooms();
    updateAuthDisplay();

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// Navigation functions
function showSection(section) {
    // Hide all sections
    ['home', 'rooms', 'bookings', 'profile', 'bills'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.add('hidden');
    });

    // Show selected section
    if (section === 'home') {
        const home = document.getElementById('home');
        const rooms = document.getElementById('rooms');
        if (home) home.classList.remove('hidden');
        if (rooms) rooms.classList.remove('hidden');
    } else if (section === 'rooms') {
        const home = document.getElementById('home');
        const rooms = document.getElementById('rooms');
        if (home) home.classList.remove('hidden');
        if (rooms) rooms.classList.remove('hidden');
    } else if (section === 'bookings') {
        if (!isAuthenticated()) {
            alert('Vui lòng đăng nhập để xem đặt phòng của bạn!');
            window.location.href = 'login.html';
            return;
        }
        const bookings = document.getElementById('bookings');
        if (bookings) bookings.classList.remove('hidden');
        loadBookings();
    } else if (section === 'profile') {
        if (!isAuthenticated()) {
            alert('Vui lòng đăng nhập để xem thông tin cá nhân!');
            window.location.href = 'login.html';
            return;
        }
        const profile = document.getElementById('profile');
        if (profile) profile.classList.remove('hidden');
    } else if (section === 'bills') {
        if (!isAuthenticated()) {
            alert('Vui lòng đăng nhập để xem bills!');
            window.location.href = 'login.html';
            return;
        }
        const bills = document.getElementById('bills');
        if (bills) bills.classList.remove('hidden');
    }
}

// Dropdown functions
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function closeDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

// Auth functions
function isAuthenticated() {
    const authUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
    return !!authUser;
}

function getAuthUser() {
    try {
        const userStr = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
}

function updateAuthDisplay() {
    const user = getAuthUser();
    const loginBtnContainer = document.getElementById('loginBtnContainer');
    const userDropdown = document.getElementById('userDropdown');

    if (user) {
        if (loginBtnContainer) {
            loginBtnContainer.classList.add('hidden');
        }
        if (userDropdown) {
            userDropdown.classList.remove('hidden');
        }

        const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';
        const userAvatar = document.getElementById('userAvatar');
        const dropdownAvatar = document.getElementById('dropdownAvatar');
        const userName = document.getElementById('userName');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserEmail = document.getElementById('dropdownUserEmail');

        if (userAvatar) userAvatar.textContent = initial;
        if (dropdownAvatar) dropdownAvatar.textContent = initial;
        if (userName) userName.textContent = user.username || user.email;
        if (dropdownUserName) dropdownUserName.textContent = user.fullName || user.username;
        if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || user.username;
    } else {
        if (loginBtnContainer) {
            loginBtnContainer.classList.remove('hidden');
        }
        if (userDropdown) {
            userDropdown.classList.add('hidden');
        }
    }
}

function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('authUser');
        sessionStorage.removeItem('authUser');
        updateAuthDisplay();
        closeDropdown();
        showSection('home');
        
        setTimeout(() => {
            alert('Đã đăng xuất thành công!');
        }, 100);
    }
}

// Load rooms
const mockRooms = [
    {
        id: 1,
        name: 'Phòng Standard',
        capacity: 2,
        basePrice: 500000,
        description: 'Phòng tiêu chuẩn thoải mái',
        status: 'available',
        image: 'https://vinapad.com/wp-content/uploads/2020/07/phong-standard-la-gi.jpg'
    },
    {
        id: 2,
        name: 'Phòng Deluxe',
        capacity: 3,
        basePrice: 800000,
        description: 'Phòng cao cấp với view đẹp',
        status: 'available',
        image: 'https://thuanhuehotelnamhoian.com/wp-content/uploads/2023/08/1-2-scaled.jpg'
    },
    {
        id: 3,
        name: 'Phòng Suite',
        capacity: 4,
        basePrice: 1500000,
        description: 'Phòng sang trọng, rộng rãi',
        status: 'available',
        image: 'https://thecastlehotel.vn/wp-content/uploads/2023/10/Media-Win-Win-94-copy-min.jpeg'
    }
];

function loadRooms() {
    const roomList = document.getElementById('roomList');
    if (!roomList) return;

    roomList.innerHTML = '';

    mockRooms.forEach(room => {
        const roomCard = `
            <div class="room-card">
                <div class="room-image">
                    <img src="${room.image}" alt="${room.name}" onerror="this.src='https://via.placeholder.com/300x200'">
                </div>
                <div class="room-content">
                    <h3 class="room-name">${room.name}</h3>
                    <p class="room-info">
                        Sức chứa: ${room.capacity} người<br>
                        ${room.description}
                    </p>
                    <div class="room-price">${formatPrice(room.basePrice)}</div>
                    <button class="btn btn-full" onclick="bookRoom(${room.id})">
                        Đặt Phòng
                    </button>
                </div>
            </div>
        `;
        roomList.innerHTML += roomCard;
    });
}

function bookRoom(roomId) {
    if (!isAuthenticated()) {
        alert('Vui lòng đăng nhập để đặt phòng!');
        window.location.href = 'login.html';
        return;
    }
    
    const room = mockRooms.find(r => r.id === roomId);
    if (!room) return;
    
    // Inject modal if not exists
    if (!document.getElementById('bookingModal')) {
        const modalHTML = `
        <div id="bookingModal" class="modal">
            <div class="modal-content" style="padding-bottom: 1.5rem;">
                <div class="modal-header">
                    <h2 id="modalTitle">Đặt phòng</h2>
                    <span class="close" onclick="closeBookingModal()">&times;</span>
                </div>
                <form id="bookingForm">
                    <input type="hidden" id="modalRoomName" name="roomName">
                    
                    <div class="form-group" style="margin-top: 1.5rem;">
                        <label for="lastName">Họ và đệm <span style="color: red;">*</span></label>
                        <input type="text" id="lastName" name="lastName" required placeholder="Ví dụ: Nguyễn Văn">
                    </div>
                    
                    <div class="form-group">
                        <label for="firstName">Tên <span style="color: red;">*</span></label>
                        <input type="text" id="firstName" name="firstName" required placeholder="Ví dụ: An">
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Số điện thoại <span style="color: red;">*</span></label>
                        <input type="tel" id="phone" name="phone" required placeholder="Ví dụ: 0912000001">
                    </div>
                    
                    <div class="form-group">
                        <label for="identityNum">Số CCCD / Hộ chiếu <span style="color: red;">*</span></label>
                        <input type="text" id="identityNum" name="identityNum" required placeholder="Ví dụ: 079123000001">
                    </div>
                    
                    <div class="form-group">
                        <label for="roomsCount">Số lượng phòng <span style="color: red;">*</span></label>
                        <input type="number" id="roomsCount" name="roomsCount" required min="1" value="1" placeholder="Số lượng phòng muốn đặt">
                    </div>
                    
                    <div style="display: flex; gap: 1rem; padding: 0 1.5rem; margin-bottom: 1.5rem;">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;" for="checkIn">Ngày nhận <span style="color: red;">*</span></label>
                            <input type="date" id="checkIn" name="checkIn" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;" for="checkOut">Ngày trả <span style="color: red;">*</span></label>
                            <input type="date" id="checkOut" name="checkOut" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <button type="submit" class="btn btn-full" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">Xác nhận đặt phòng</button>
                    </div>
                </form>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    }
    
    // Setup values
    document.getElementById('modalTitle').textContent = `Đặt phòng: ${room.name}`;
    document.getElementById('modalRoomName').value = room.name;
    
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('checkIn').value = today.toISOString().split('T')[0];
    document.getElementById('checkOut').value = tomorrow.toISOString().split('T')[0];
    
    // Show modal
    document.getElementById('bookingModal').style.display = 'block';
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('bookingForm').reset();
    }
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const identityNum = document.getElementById('identityNum').value.trim();
    const roomsCount = parseInt(document.getElementById('roomsCount').value);
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const roomName = document.getElementById('modalRoomName').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';
    
    try {
        // Step 1: Fetch all guests to see if guest exists
        const guestsResponse = await fetch('http://localhost:8080/hotel_reservation_premium/api/guests');
        if (!guestsResponse.ok) throw new Error('Không thể kiểm tra thông tin khách hàng từ hệ thống.');
        const guests = await guestsResponse.json();
        
        let guest = guests.find(g => g.phone === phone || g.identityNum === identityNum);
        let guestId;
        
        if (guest) {
            guestId = guest.id;
        } else {
            // Step 2: Create guest if not exists
            const createGuestResponse = await fetch('http://localhost:8080/hotel_reservation_premium/api/guests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    identityNum: identityNum,
                    phone: phone
                })
            });
            if (!createGuestResponse.ok) {
                const errText = await createGuestResponse.text();
                throw new Error('Không thể tạo thông tin khách hàng: ' + errText);
            }
            const newGuest = await createGuestResponse.json();
            guestId = newGuest.id;
        }
        
        // Save guest ID to session/localStorage to show booking history
        sessionStorage.setItem('guestId', guestId);
        localStorage.setItem('guestId', guestId);
        
        // Step 3: Create reservation
        const reservationData = {
            guestId: guestId,
            items: [
                {
                    roomName: roomName,
                    rooms: roomsCount,
                    checkIn: checkIn,
                    checkOut: checkOut
                }
            ]
        };
        
        const resResponse = await fetch('http://localhost:8080/hotel_reservation_premium/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': '1' // Default admin/user id for auditing
            },
            body: JSON.stringify(reservationData)
        });
        
        if (!resResponse.ok) {
            const errText = await resResponse.text();
            throw new Error('Đặt phòng thất bại: ' + errText);
        }
        
        const result = await resResponse.json();
        alert(`Đặt phòng thành công!\n\nMã đặt phòng: ${result.resId}\nKhách hàng: ${result.guestName}\nTổng tiền: ${formatPrice(result.total)}`);
        
        closeBookingModal();
        
        // Switch to Bookings view and reload history
        showSection('bookings');
        
    } catch (err) {
        console.error(err);
        alert('Đã xảy ra lỗi: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function loadBookings() {
    const bookingList = document.getElementById('bookingList');
    if (!bookingList) return;
    
    const guestId = sessionStorage.getItem('guestId') || localStorage.getItem('guestId');
    if (!guestId) {
        bookingList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Vui lòng thực hiện đặt phòng để xem danh sách phòng đã đặt.</p>';
        return;
    }
    
    try {
        bookingList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Đang tải danh sách đặt phòng...</p>';
        
        const response = await fetch(`http://localhost:8080/hotel_reservation_premium/api/reservations/guests/${guestId}`);
        if (!response.ok) throw new Error('Không thể tải danh sách đặt phòng.');
        
        const bookings = await response.json();
        
        if (bookings.length === 0) {
            bookingList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Bạn chưa có đặt phòng nào.</p>';
            return;
        }
        
        bookingList.innerHTML = '';
        bookings.forEach(booking => {
            const statusMap = {
                'PENDING_PAYMENT': 'Chờ thanh toán',
                'CONFIRMED': 'Đã xác nhận',
                'CHECKED_IN': 'Đã nhận phòng',
                'IN_SERVICE': 'Đang sử dụng dịch vụ',
                'COMPLETED': 'Hoàn thành',
                'CANCELLED': 'Đã hủy'
            };
            const statusText = statusMap[booking.status] || booking.status;
            
            const roomType = booking.roomNames && booking.roomNames.length > 0 ? booking.roomNames.join(', ') : 'N/A';
            const totalRooms = booking.roomIds ? booking.roomIds.length : 0;
            const checkInDate = new Date(booking.checkIn).toLocaleDateString('vi-VN');
            const checkOutDate = new Date(booking.checkOut).toLocaleDateString('vi-VN');
            const totalCost = formatPrice(booking.total);
            
            const card = document.createElement('div');
            card.style.cssText = 'background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #eee; margin-bottom: 1rem;';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #f5f5f5; padding-bottom: 0.75rem;">
                    <div>
                        <h4 style="color: #667eea; margin: 0; font-size: 1.1rem;">Mã đặt phòng: ${booking.id}</h4>
                        <span style="font-size: 0.85rem; color: #888;">Ngày đặt: ${new Date(booking.bookingDate || new Date()).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <span style="padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold; background: #eef2ff; color: #4f46e5;">
                        ${statusText}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; font-size: 0.95rem;">
                    <div>
                        <strong style="color: #666; font-size: 0.85rem; display: block; margin-bottom: 0.2rem;">Loại phòng</strong>
                        <span>${roomType}</span>
                    </div>
                    <div>
                        <strong style="color: #666; font-size: 0.85rem; display: block; margin-bottom: 0.2rem;">Số lượng phòng</strong>
                        <span>${totalRooms} phòng</span>
                    </div>
                    <div>
                        <strong style="color: #666; font-size: 0.85rem; display: block; margin-bottom: 0.2rem;">Thời gian lưu trú</strong>
                        <span>${checkInDate} - ${checkOutDate}</span>
                    </div>
                    <div>
                        <strong style="color: #666; font-size: 0.85rem; display: block; margin-bottom: 0.2rem;">Tổng tiền</strong>
                        <span style="color: #e74c3c; font-weight: bold; font-size: 1.1rem;">${totalCost}</span>
                    </div>
                </div>
            `;
            bookingList.appendChild(card);
        });
        
    } catch (err) {
        console.error(err);
        bookingList.innerHTML = `<p style="text-align: center; color: red; padding: 2rem;">Lỗi khi tải đặt phòng: ${err.message}</p>`;
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}
