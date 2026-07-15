# 📚 BẢNG TỔNG HỢP TẤT CẢ API ENDPOINTS

**Base URL**: `http://localhost:8080/hotel_reservation_premium`

---

## 🏨 **1. QUẢN LÝ PHÒNG (Rooms)**

### 1.1 Tìm phòng trống
```
GET /api/rooms/available?name={typeName}&checkIn={date}&checkOut={date}
```
**Query Params**:
- `name` (optional): Tên loại phòng (vd: "Deluxe")
- `checkIn` (required): Ngày nhận phòng (vd: "2025-11-25")
- `checkOut` (required): Ngày trả phòng (vd: "2025-11-27")

---

### 1.2 Tạo phòng mới
```
POST /api/rooms
```
**Body**:
```json
{
    "id": 201,
    "typeName": "Deluxe",
    "status": "AVAILABLE"
}
```
**Giải thích**:
- `id`: Số phòng (unique)
- `typeName`: Tên loại phòng (phải tồn tại trong RoomType)
- `status`: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"

---

### 1.3 Xem tất cả phòng
```
GET /api/rooms
```

---

### 1.4 Xem chi tiết phòng
```
GET /api/rooms/{id}
```

---

### 1.5 Cập nhật phòng
```
PUT /api/rooms/{id}
```
**Body**: Giống như tạo phòng

---

### 1.6 Xóa phòng
```
DELETE /api/rooms/{id}
```

---

## 🏷️ **2. QUẢN LÝ LOẠI PHÒNG (Room Types)**

### 2.1 Tạo loại phòng mới
```
POST /api/rooms/roomTypes
```
**Body**:
```json
{
    "name": "VIP Suite",
    "capacity": 3,
    "basePrice": 2000000,
    "description": "Phòng VIP sang trọng"
}
```
**Giải thích**:
- `name`: Tên loại phòng (unique)
- `capacity`: Sức chứa (số người)
- `basePrice`: Giá cơ bản mỗi đêm (VND)
- `description`: Mô tả

---

### 2.2 Xem tất cả loại phòng
```
GET /api/rooms/roomTypes
```

---

### 2.3 Xem chi tiết loại phòng
```
GET /api/rooms/roomTypes/{name}
```

---

### 2.4 Cập nhật loại phòng
```
PUT /api/rooms/roomTypes/{name}
```

---

### 2.5 Xóa loại phòng
```
DELETE /api/rooms/roomTypes/{name}
```

---

## 🍽️ **3. QUẢN LÝ DỊCH VỤ (Services)**

### 3.1 Tạo dịch vụ mới
```
POST /api/services
```
**Body**:
```json
{
    "name": "Giặt ủi",
    "price": 50000,
    "status": "ACTIVE"
}
```
**Giải thích**:
- `name`: Tên dịch vụ (unique)
- `price`: Giá dịch vụ (VND)
- `status`: "ACTIVE" | "INACTIVE"

---

### 3.2 Xem tất cả dịch vụ
```
GET /api/services
```

---

### 3.3 Xem dịch vụ theo tên
```
GET /api/services/{name}
```

---

### 3.4 Cập nhật dịch vụ
```
PUT /api/services/{name}
```

---

### 3.5 Xóa dịch vụ
```
DELETE /api/services/{name}
```

---

## 👤 **4. QUẢN LÝ KHÁCH (Guests)**

### 4.1 Tạo khách mới
```
POST /api/guests
```
**Body**:
```json
{
    "firstName": "Nguyen",
    "lastName": "Van A",
    "identityNum": "123456789012",
    "phone": "0912345678",
    "dateOfBirth": "1990-01-01"
}
```
**Giải thích**:
- `firstName`: Tên
- `lastName`: Họ
- `identityNum`: Số CMND/CCCD (unique, 12 số)
- `phone`: Số điện thoại
- `dateOfBirth`: Ngày sinh (format: "YYYY-MM-DD")

---

### 4.2 Xem tất cả khách
```
GET /api/guests
```

---

### 4.3 Xem chi tiết khách
```
GET /api/guests/{id}
```

---

### 4.4 Xem lịch sử lưu trú của khách
```
GET /api/guests/{guestId}/stays
```

---

### 4.5 Cập nhật khách
```
PUT /api/guests/{id}
```

---

### 4.6 Xóa khách
```
DELETE /api/guests/{id}
```

---

## 👨‍💼 **5. QUẢN LÝ NHÂN VIÊN (Employees)**

### 5.1 Tạo nhân viên mới
```
POST /api/emps
```
**Body**:
```json
{
    "firstName": "Tran",
    "lastName": "Thi B",
    "dateOfBirth": "1995-05-15",
    "identityNum": "987654321098",
    "email": "tranthib@hotel.com",
    "phone": "0987654321",
    "address": "123 Nguyen Hue, TP.HCM",
    "role": 1
}
```
**Giải thích**:
- `role`: ID của role (1 = Manager, 2 = Receptionist, etc.)

---

### 5.2 Xem tất cả nhân viên
```
GET /api/emps
```

---

### 5.3 Xem chi tiết nhân viên
```
GET /api/emps/{id}
```

---

### 5.4 Cập nhật nhân viên
```
PUT /api/emps/{id}
```

---

### 5.5 Xóa nhân viên
```
DELETE /api/emps/{id}
```

---

## 🔐 **6. AUTHENTICATION (Xác thực)**

### 6.1 Đăng nhập
```
POST /api/auth/login
```
**Body**:
```json
{
    "account": "admin",
    "password": "123456"
}
```

**Response thành công**:
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "simple-token-1",
        "tokenType": "Bearer",
        "userId": 1,
        "account": "admin",
        "empId": 9,
        "empName": "Nguyen Van A",
        "role": "RECEPTIONIST"
    }
}
```

**Response lỗi**:
```json
{
    "success": false,
    "message": "Account not found: wrongaccount",
    "data": null
}
```

**Giải thích**:
- Frontend lưu `token` và `empId` vào localStorage
- Gửi `empId` qua header trong các request cần authentication
- Token hiện tại là đơn giản (không mã hóa), phù hợp development

---

### 6.2 Đăng xuất
```
POST /api/auth/logout
```
**Body**: Không cần

**Response**:
```json
{
    "success": true,
    "message": "Logout successful",
    "data": null
}
```

**Giải thích**:
- Frontend chỉ cần xóa token và thông tin user khỏi localStorage
- Server không cần xử lý gì (vì không dùng JWT)

---

## 👤 **7. QUẢN LÝ TÀI KHOẢN (Users)**

### 7.1 Tạo user mới
```
POST /api/users
```
**Body**:
```json
{
    "empId": 10,
    "account": "admin2",
    "password": "password123"
}
```
**Giải thích**:
- `empId`: ID của nhân viên (phải tồn tại)
- `account`: Tên tài khoản (unique)
- `password`: Mật khẩu

---

### 7.2 Xem tất cả users
```
GET /api/users
```

---

### 7.3 Xem chi tiết user
```
GET /api/users/{id}
```

---

### 7.4 Cập nhật user
```
PUT /api/users/{id}
```

---

### 7.5 Xóa user
```
DELETE /api/users/{id}
```

---

## 📝 **8. QUY TRÌNH ĐẶT PHÒNG**

### 7.1 Tạo bản nháp (Hold)
```
POST /holds
```
**Body**:
```json
{
    "guestId": 2,
    "roomIds": [101, 102],
    "checkIn": "2025-11-25",
    "checkOut": "2025-11-27"
}
```
**Response**: Trả về `token` để xác nhận

---

### 7.2 Xác nhận đặt phòng (Confirm)
```
POST /api/reservations
```
**Headers**:
- `empId`: 9

**Body**:
```json
{
    "token": "token_nhận_từ_bước_7.1"
}
```

---

### 7.3 Xem reservations của khách
```
GET /api/reservations/guests/{guestId}
```

---

### 7.4 Xem reservation gần nhất
```
GET /api/reservations/guests/{guestId}/latestRes
```

---

### 7.5 Xem chi tiết reservation
```
GET /api/reservations/{resId}
```

---

## 💳 **9. THANH TOÁN VÀ TRẠNG THÁI**

### 9.1 Cập nhật trạng thái reservation
```
POST /api/reservationStatus/{resId}/status
```
**Headers**:
- `empId`: 9

**Body**:
```json
{
    "newStatus": "CONFIRMED"
}
```
**Các trạng thái**:
- `PENDING_PAYMENT` → `CONFIRMED` (sau khi thanh toán)
- `CONFIRMED` → `CANCELLED` (hủy)

---

### 9.2 Xem lịch sử thay đổi trạng thái
```
GET /api/reservationStatus/{resId}
```

---

### 9.3 Xem lịch sử trạng thái của resRoom
```
GET /api/reservationStatus/{resId}/resRooms/{resRoomId}
```

---

## 🏨 **10. ĐĂNG KÝ LƯU TRÚ VÀ CHECK-IN/OUT**

### 10.1 Đăng ký lưu trú
```
POST /api/reservation-rooms/resRoomId={resRoomId}-guestId={guestId}
```
**Ví dụ**:
```
POST /api/reservation-rooms/resRoomId=51f2a2cf-bf5e-4fd8-b600-9611ef052a5e-guestId=1
```

---

### 10.2 Check-in
```
POST /api/reservation-rooms/resRoomId={resRoomId}-guestId={guestId}/checkIn
```
**Headers**:
- `empId`: 9

---

### 10.3 Check-out
```
POST /api/reservation-rooms/resRoomId={resRoomId}-guestId={guestId}/checkOut
```
**Headers**:
- `empId`: 9

---

### 10.4 Xem thông tin resRoom
```
GET /api/reservation-rooms?resRoomId={resRoomId}&guestId={guestId}
```

---

### 10.5 Xem tất cả lần lưu trú của khách
```
GET /api/reservation-rooms/guestStays?guestId={guestId}
```

---

### 10.6 Hủy đăng ký lưu trú
```
DELETE /api/reservation-rooms?resRoomId={resRoomId}&guestId={guestId}
```

---

## 🛎️ **11. SỬ DỤNG DỊCH VỤ**

### 11.1 Xem dịch vụ đã dùng của resRoom
```
GET /api/reservation-rooms/{resRoomId}/services
```

---

### 11.2 Thêm dịch vụ cho resRoom
```
POST /api/reservation-rooms/{resRoomId}/services
```
**Headers**:
- `empId`: 9

**Body**:
```json
{
    "serviceId": 1,
    "quantity": 2
}
```

---

### 11.3 Xóa dịch vụ
```
DELETE /api/reservation-rooms/{resRoomId}/services/{serId}
```
**Headers**:
- `empId`: 9

---

## 💰 **12. HÓA ĐƠN (Bills)**

### 12.1 Xem tổng hợp hóa đơn của reservation
```
GET /api/reservations/{resId}/bills
```

---

### 12.2 Xem hóa đơn của resRoom
```
GET /api/reservations/{resId}/bills/reservation-rooms/{resRoomId}
```

---

### 12.3 Đánh dấu ĐÃ THANH TOÁN tất cả bills của reservation
```
POST /api/reservations/{resId}/bills
```

---

### 12.4 Đánh dấu ĐÃ THANH TOÁN bills của resRoom
```
POST /api/reservations/{resId}/bills/reservation-rooms/{resRoomId}
```

---

## 📋 **13. CÁCH ĐỌC API TỪ CODE**

### Công thức:
```java
@RestController
@RequestMapping("/api/guests")  // ← BASE PATH
public class GuestController {
    
    @PostMapping                 // ← METHOD và PATH
    //     ↓ Điền vào Body
    public GuestDto create(@RequestBody GuestCreationRequest rq){
        //                                ↑
        //                    Ctrl + Click để xem cấu trúc
    }
}
```

### Các annotation quan trọng:
- `@GetMapping` → Method: GET
- `@PostMapping` → Method: POST (cần Body)
- `@PutMapping` → Method: PUT (cập nhật)
- `@DeleteMapping` → Method: DELETE
- `@PathVariable` → Lấy từ URL (vd: `/api/guests/{id}`)
- `@RequestParam` → Lấy từ query string (vd: `?name=value`)
- `@RequestBody` → Lấy từ JSON body
- `@RequestHeader` → Lấy từ HTTP header

---

## 🎯 **CHU TRÌNH ĐẦY ĐỦ (WORKFLOW)**

### 1️⃣ **Chuẩn bị dữ liệu**
1. Tạo Room Type → `/api/rooms/roomTypes` (POST)
2. Tạo Room → `/api/rooms` (POST)
3. Tạo Service → `/api/services` (POST)
4. Tạo Guest → `/api/guests` (POST)

### 2️⃣ **Đặt phòng**
5. Tìm phòng trống → `/api/rooms/available` (GET)
6. Tạo Hold → `/holds` (POST)
7. Xác nhận → `/api/reservations` (POST)

### 3️⃣ **Thanh toán**
8. Đổi status → `/api/reservationStatus/{resId}/status` (POST)
   - Body: `{"newStatus": "CONFIRMED"}`

### 4️⃣ **Nhận phòng**
9. Đăng ký lưu trú → `/api/reservation-rooms/...` (POST)
10. Check-in → `/api/reservation-rooms/.../checkIn` (POST)

### 5️⃣ **Sử dụng dịch vụ**
11. Thêm dịch vụ → `/api/reservation-rooms/{resRoomId}/services` (POST)

### 6️⃣ **Trả phòng**
12. Check-out → `/api/reservation-rooms/.../checkOut` (POST)
13. Xem hóa đơn → `/api/reservations/{resId}/bills` (GET)
14. Thanh toán → `/api/reservations/{resId}/bills` (POST)

---

## 💡 **MẸO QUAN TRỌNG**

### Kiểm tra cấu trúc DTO:
1. Mở Controller
2. Tìm method có `@PostMapping` hoặc `@PutMapping`
3. Xem tham số `@RequestBody` (vd: `GuestCreationRequest rq`)
4. Ctrl + Click vào DTO name → Xem các field
5. Copy các field → Tạo JSON body

### Xem data type:
- `String` → `"text"`
- `Integer` → `123`
- `BigDecimal` → `1000000`
- `LocalDate` → `"2025-11-25"`
- `Boolean` → `true` hoặc `false`

### Header thường dùng:
- `empId`: ID nhân viên (9, 10, 11, 12)
- `Content-Type: application/json` (Postman tự thêm)

---

## 🚀 **VÍ DỤ MẪU**

### Test nhanh các API CRUD cơ bản:

```bash
# 1. Tạo Service
POST /api/services
{
  "name": "Breakfast",
  "price": 100000,
  "status": "ACTIVE"
}

# 2. Xem tất cả Services
GET /api/services

# 3. Xem Service theo tên
GET /api/services/Breakfast

# 4. Cập nhật Service
PUT /api/services/Breakfast
{
  "name": "Breakfast",
  "price": 150000,
  "status": "ACTIVE"
}

# 5. Xóa Service
DELETE /api/services/Breakfast
```

---

**Lưu ý**: Nhớ thêm base URL `http://localhost:8080/hotel_reservation_premium` trước tất cả endpoint!
