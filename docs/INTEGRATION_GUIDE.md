# Hướng Dẫn Tích Hợp Frontend-Backend cho Bookings Page

## Tổng Quan

Tài liệu này mô tả việc kết nối frontend (`bookings.html`) với backend API cho chức năng quản lý đặt phòng.

## Các Thay Đổi Đã Thực Hiện

### 1. Backend Changes

#### 1.1. Cập Nhật `ReservationDto.java`

Đã thêm các trường mới vào DTO để cung cấp đầy đủ thông tin cho frontend:

- `id`: String - Mã đặt phòng
- `guestName`: String - Tên khách hàng
- `guestPhone`: String - Số điện thoại khách hàng
- `checkIn`: LocalDate - Ngày nhận phòng (sớm nhất)
- `checkOut`: LocalDate - Ngày trả phòng (muộn nhất)
- `roomNames`: List<String> - Danh sách tên loại phòng

**File**: `src/main/java/com/BADBOY/hotel_reservation/dto/reservation/ReservationDto.java`

#### 1.2. Thêm Method `getAllReservations()` vào `ReservationDomain.java`

```java
public List<ReservationDto> getAllReservations(){
    List<ReservationDto> lst = new ArrayList<>();
    List<Reservation> reservations = resRepo.findAll();
    for(Reservation r : reservations){
        lst.add(ReservationDto.fromEntity(r, rrRepo.findByReservationId(r.getId())));
    }
    return lst;
}
```

**File**: `src/main/java/com/BADBOY/hotel_reservation/service/ReservationDomain.java`

#### 1.3. Thêm Endpoint GET `/api/reservations/all` vào `ReservationController.java`

```java
@GetMapping("/all")
public List<ReservationDto> getAllReservations(){
    return resDomain.getAllReservations();
}
```

**File**: `src/main/java/com/BADBOY/hotel_reservation/controller/ReservationController.java`

### 2. Frontend Changes

#### 2.1. Tạo File `bookings.js`

File JavaScript mới để xử lý tất cả logic cho trang bookings:

**Các Class/Module chính:**

- `BookingAPI`: Module quản lý tất cả API calls
  - `create(reservationData)`: Tạo đặt phòng mới
  - `getAll()`: Lấy tất cả đặt phòng
  - `getById(resId)`: Lấy chi tiết một đặt phòng
  - `getByGuestId(guestId)`: Lấy đặt phòng theo khách hàng

- `BookingManager`: Class quản lý UI và business logic
  - `loadBookings()`: Load danh sách đặt phòng từ API
  - `renderBookings()`: Render danh sách đặt phòng
  - `openCreateModal()`: Mở form tạo đặt phòng mới
  - `handleCreateBooking()`: Xử lý submit form đặt phòng
  - `filterByStage()`: Lọc theo giai đoạn
  - `filterBookings()`: Tìm kiếm đặt phòng

**File**: `frontend/assets/js/bookings.js`

#### 2.2. Cập Nhật `bookings.html`

- Thêm reference đến `config.js` và `bookings.js`
- Loại bỏ code JavaScript cũ (đã được thay thế bởi `bookings.js`)

**File**: `frontend/bookings.html`

## API Endpoints

### 1. Tạo Đặt Phòng Mới

**Endpoint**: `POST http://localhost:8080/hotel_reservation_premium/api/reservations`

**Headers**:
```
Content-Type: application/json
X-User-Id: 1
```

**Request Body**:
```json
{
  "guestId": 45,
  "items": [
    {
      "roomName": "Phòng đôi",
      "rooms": 2,
      "checkIn": "2025-12-25",
      "checkOut": "2025-12-28"
    }
  ]
}
```

**Response**:
```json
{
  "guestName": "Hậu Hoàng",
  "hold": {
    "roomIds": [1, 2],
    "totalPrices": [900000, 900000],
    "nightStays": [3, 3],
    "expiresAt": "2025-11-26T10:30:00"
  },
  "resId": "uuid-string",
  "total": 1800000
}
```

### 2. Lấy Tất Cả Đặt Phòng

**Endpoint**: `GET http://localhost:8080/hotel_reservation_premium/api/reservations/all`

**Response**:
```json
[
  {
    "id": "uuid-string",
    "guestName": "Hậu Hoàng",
    "guestPhone": "0912000045",
    "total": 1800000,
    "status": "PENDING_PAYMENT",
    "bookingDate": "2025-11-26T10:30:00",
    "roomIds": [1, 2],
    "roomNames": ["Phòng đôi", "Phòng đôi"],
    "prices": [900000, 900000],
    "nights": [3, 3],
    "checkIn": "2025-12-25",
    "checkOut": "2025-12-28"
  }
]
```

## Cách Sử Dụng

### 1. Xem Danh Sách Đặt Phòng

1. Mở trình duyệt và truy cập: `http://localhost:8080/hotel_reservation_premium/bookings.html`
2. Danh sách đặt phòng sẽ tự động load từ backend
3. Sử dụng các nút filter để lọc theo giai đoạn (Stage 1-6)
4. Sử dụng ô tìm kiếm để tìm theo ID, tên khách, hoặc số điện thoại

### 2. Tạo Đặt Phòng Mới

1. Click nút "Đặt Phòng Mới" ở góc trên bên phải
2. Điền thông tin vào form:
   - **ID Khách Hàng**: Nhập ID của khách hàng (phải tồn tại trong database)
   - **Loại Phòng**: Nhập tên loại phòng (ví dụ: "Phòng đôi", "Phòng đơn")
   - **Số Phòng**: Nhập số lượng phòng muốn đặt
   - **Ngày Nhận Phòng**: Chọn ngày check-in
   - **Ngày Trả Phòng**: Chọn ngày check-out
3. Click "Tạo Đặt Phòng"
4. Nếu thành công, sẽ hiển thị thông báo với mã đặt phòng và tổng tiền
5. Danh sách đặt phòng sẽ tự động refresh

## Mapping Trạng Thái

Backend sử dụng enum `ReservationStatus`, frontend map sang các "Stage":

| Backend Status | Frontend Stage | Nhãn Tiếng Việt |
|---------------|----------------|-----------------|
| PENDING_PAYMENT | 1 | Đặt Giữ Chỗ |
| CONFIRMED | 2 | Đã Xác Nhận |
| (không có) | 3 | Đã Đăng Ký |
| CHECKED_IN | 4 | Đã Nhận Phòng |
| IN_SERVICE | 5 | Đang Sử Dụng Dịch Vụ |
| COMPLETED | 6 | Hoàn Thành |

## Lưu Ý Quan Trọng

### 1. User Authentication

Hiện tại, `X-User-Id` được hardcode là `1` trong `bookings.js`. Trong production, cần:
- Lấy user ID từ session/authentication
- Implement proper authentication middleware

### 2. Guest ID Validation

Form tạo đặt phòng yêu cầu nhập Guest ID. Nên:
- Thêm autocomplete/dropdown để chọn khách hàng
- Validate Guest ID tồn tại trước khi submit

### 3. Room Name Validation

Tên phòng phải match với database. Nên:
- Thêm dropdown/select với danh sách loại phòng có sẵn
- Load danh sách từ API `/api/rooms/types`

### 4. Error Handling

Hiện tại error được hiển thị bằng `alert()`. Nên:
- Implement toast notifications
- Show validation errors inline trong form

## Testing

### Test Case 1: Load Danh Sách

1. Start backend server
2. Open `bookings.html`
3. Verify: Danh sách đặt phòng hiển thị

### Test Case 2: Tạo Đặt Phòng Mới

1. Click "Đặt Phòng Mới"
2. Fill form với guest ID = 45
3. Room Name = "Phòng đôi"
4. Rooms = 2
5. Check-in = 2025-12-25
6. Check-out = 2025-12-28
7. Submit
8. Verify: Success message, danh sách refresh

### Test Case 3: Filter

1. Click các nút filter (Stage 1-6)
2. Verify: Danh sách lọc đúng

### Test Case 4: Search

1. Nhập text vào ô tìm kiếm
2. Verify: Danh sách lọc theo ID/tên/phone

## Troubleshooting

### Lỗi: "Failed to load bookings"

- Kiểm tra backend server đang chạy
- Kiểm tra URL trong `bookings.js` khớp với backend
- Check console log để xem lỗi chi tiết

### Lỗi: "Guest not found"

- Verify Guest ID tồn tại trong database
- Query: `SELECT * FROM guest WHERE id = ?`

### Lỗi: "Not enough rooms available"

- Kiểm tra tên phòng đúng
- Kiểm tra phòng còn trống trong khoảng thời gian đó
- Query available rooms: `/api/rooms/available?checkIn=...&checkOut=...`

## Tài Liệu Tham Khảo

- Backend API Documentation: (to be added)
- Frontend Style Guide: `assets/css/style.css`
- Configuration: `assets/js/config.js`

