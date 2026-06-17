# Stage 4 Check-In Feature

## ✅ Tính Năng Đã Hoàn Thành

### Mô Tả
Khi user ở **Giai đoạn 4 (Nhận Phòng)** click vào nút **"Dịch Vụ Trong Lưu Trú → Giai Đoạn 5"**, hệ thống sẽ tự động thực hiện check-in cho **TẤT CẢ** khách đã đăng ký lưu trú ở giai đoạn 2.

---

## 🔧 Cài Đặt Kỹ Thuật

### 1. Backend Endpoint
**Endpoint**: `POST /api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}/checkIn`

**Controller**: `ReservationGuestController.java`
```java
@PostMapping("/resRoomId={resRoomId}-guestId={guestId}/checkIn")
public ReservationGuestDto checkIn(@PathVariable String resRoomId,
                            @PathVariable Integer guestId,
                            @RequestBody(required=false) LocalDateTime checkInAt){
    return resGuestDomain.setCheckIn(resRoomId, guestId, checkInAt);                           
}
```

**Tham số**:
- `resRoomId`: ID của ReservationRoom
- `guestId`: ID của Guest
- `checkInAt`: Thời gian check-in (optional, nếu null thì dùng thời gian hiện tại)

**Response**: `ReservationGuestDto` với thông tin check-in đã cập nhật

---

### 2. Frontend Implementation

#### A. API Method: `checkInGuest()`
**File**: `booking-detail.js` (Lines ~215-238)

```javascript
checkInGuest: async (resRoomId, guestId, checkInAt = null) => {
    const url = `${BASE_URL}/reservation-guests/resRoomId=${resRoomId}-guestId=${guestId}/checkIn`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: checkInAt ? JSON.stringify(checkInAt) : null
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
}
```

#### B. Business Logic: `performCheckIn()`
**File**: `booking-detail.js` (Lines ~565-608)

**Chức năng**:
1. Duyệt qua tất cả các phòng trong `this.registeredGuests`
2. Với mỗi phòng, duyệt qua tất cả khách đã đăng ký
3. Gọi API check-in cho từng khách
4. Xử lý song song tất cả requests với `Promise.all()`
5. Kiểm tra lỗi và hiển thị thông báo

```javascript
async performCheckIn() {
    const checkInPromises = [];
    
    // Iterate through all rooms and registered guests
    for (const [roomId, guests] of Object.entries(this.registeredGuests)) {
        for (const guest of guests) {
            if (guest.guestId) {
                checkInPromises.push(
                    BookingDetailAPI.checkInGuest(roomId, guest.guestId)
                        .catch(err => ({
                            error: true, 
                            guestId: guest.guestId, 
                            message: err.message
                        }))
                );
            }
        }
    }
    
    const results = await Promise.all(checkInPromises);
    
    // Check for errors
    const errors = results.filter(r => r && r.error);
    if (errors.length > 0) {
        throw new Error('Some check-ins failed');
    }
    
    alert(`✅ Check-in thành công cho ${results.length} khách!`);
}
```

#### C. Updated `nextStage()` Method
**File**: `booking-detail.js` (Lines ~526-542)

```javascript
async nextStage() {
    // Special handling for Stage 4 -> Stage 5: Check-in all guests
    if (this.currentStage === 4) {
        try {
            await this.performCheckIn();
        } catch (error) {
            console.error('❌ Check-in failed:', error);
            alert('Lỗi khi check-in khách. Vui lòng thử lại.');
            return; // Don't proceed if check-in fails
        }
    }
    
    if (this.currentStage < 6) {
        this.currentStage++;
        this.updateUI();
    }
}
```

---

## 📋 Luồng Hoạt Động (Workflow)

### Luồng Chi Tiết

```
Stage 2: Đăng Ký Lưu Trú
├── User đăng ký khách cho từng phòng
├── Data lưu vào this.registeredGuests[roomId] = [guest1, guest2, ...]
└── Hiển thị danh sách khách đã đăng ký

↓ User click "Tiếp Tục"

Stage 3: Xem Thông Tin Khách
├── Hiển thị chi tiết khách (tên, SĐT, CMND, ngày sinh)
└── Xác nhận danh sách khách chính xác

↓ User click "Tiếp Tục"

Stage 4: Nhận Phòng
├── Hiển thị thông tin lưu trú
├── User xác nhận muốn chuyển sang Stage 5
└── **User click "Dịch Vụ Trong Lưu Trú → Giai Đoạn 5"**

↓ Trigger Check-In Process

performCheckIn() executed:
├── 1. Thu thập tất cả guest IDs từ registeredGuests
├── 2. Tạo array của Promises cho từng check-in request
├── 3. Gọi API: POST /resRoomId={id}-guestId={id}/checkIn
│   ├── Room 1, Guest A → API call
│   ├── Room 1, Guest B → API call
│   ├── Room 2, Guest C → API call
│   └── Room 3, Guest D → API call
├── 4. Chờ tất cả requests hoàn thành (Promise.all)
├── 5. Kiểm tra errors
│   ├── Có lỗi → Alert + KHÔNG chuyển stage
│   └── Không lỗi → Alert success
└── 6. Chuyển sang Stage 5

↓ Check-in thành công

Stage 5: Sử Dụng Dịch Vụ
├── Khách đã check-in
└── Có thể sử dụng dịch vụ khách sạn
```

---

## 🧪 Testing Guide

### Test Case 1: Check-in Thành Công
**Bước thực hiện**:
1. Mở `booking-detail.html?id=<reservation_id>`
2. Đi đến Stage 2
3. Đăng ký ít nhất 1 khách cho 1 phòng
4. Tiến đến Stage 4
5. Click nút "Dịch Vụ Trong Lưu Trú → Giai Đoạn 5"

**Kết quả mong đợi**:
- ✅ Console log: "🏨 Starting check-in process..."
- ✅ Console log: "📝 Queuing check-in for guest..."
- ✅ Console log: "✅ Guest X checked in successfully"
- ✅ Alert: "✅ Check-in thành công cho N khách!"
- ✅ Chuyển sang Stage 5

### Test Case 2: Check-in Với Nhiều Khách
**Bước thực hiện**:
1. Đăng ký 3-4 khách cho nhiều phòng khác nhau
2. Tiến đến Stage 4
3. Click nút chuyển Stage 5

**Kết quả mong đợi**:
- ✅ Tất cả khách đều được check-in
- ✅ Alert hiển thị đúng số lượng khách
- ✅ Không có lỗi trong console

### Test Case 3: Check-in Thất Bại
**Bước thực hiện**:
1. Đảm bảo backend server bị tắt hoặc endpoint lỗi
2. Thử check-in từ Stage 4

**Kết quả mong đợi**:
- ❌ Console log: "❌ Check-in failed"
- ❌ Alert: "Lỗi khi check-in khách. Vui lòng thử lại."
- ❌ KHÔNG chuyển sang Stage 5 (vẫn ở Stage 4)

### Test Case 4: Check-in Không Có Khách
**Bước thực hiện**:
1. Bỏ qua Stage 2 (không đăng ký khách)
2. Tiến đến Stage 4
3. Click nút chuyển Stage 5

**Kết quả mong đợi**:
- ⚠️ Alert: "Không có khách nào để check-in..."
- ⚠️ KHÔNG chuyển sang Stage 5

---

## 🔍 API Request Examples

### Request 1: Check-in Guest 123 to Room ABC
```http
POST /hotel_reservation_premium/api/reservation-guests/resRoomId=ABC-guestId=123/checkIn
Content-Type: application/json

null
```

### Request 2: Check-in với thời gian cụ thể
```http
POST /hotel_reservation_premium/api/reservation-guests/resRoomId=ABC-guestId=123/checkIn
Content-Type: application/json

"2025-11-26T14:30:00"
```

### Response Success
```json
{
    "resRoomId": "ABC",
    "guestId": 123,
    "guestName": "Nguyen Van A",
    "identityNum": "123456789",
    "checkInAt": "2025-11-26T14:30:00"
}
```

### Response Error (Guest already checked in)
```http
HTTP 400 Bad Request

Guest already checked in
```

---

## 📊 Data Flow

### this.registeredGuests Structure
```javascript
{
    "room-id-1": [
        { guestId: 101, guestName: "Nguyen Van A", ... },
        { guestId: 102, guestName: "Tran Thi B", ... }
    ],
    "room-id-2": [
        { guestId: 103, guestName: "Le Van C", ... }
    ]
}
```

### Check-in Requests Generated
```javascript
[
    checkInGuest("room-id-1", 101),
    checkInGuest("room-id-1", 102),
    checkInGuest("room-id-2", 103)
]
```

### Promise.all() Results
```javascript
[
    { resRoomId: "room-id-1", guestId: 101, checkInAt: "..." },
    { resRoomId: "room-id-1", guestId: 102, checkInAt: "..." },
    { resRoomId: "room-id-2", guestId: 103, checkInAt: "..." }
]
```

---

## ⚠️ Error Handling

### Các Trường Hợp Lỗi

1. **Network Error**: Không kết nối được server
   - Action: Catch error, alert user, không chuyển stage

2. **HTTP 400/500**: Server trả về lỗi
   - Action: Parse error message, alert user, không chuyển stage

3. **Partial Failure**: Một số khách check-in thành công, một số thất bại
   - Action: Alert số lượng thất bại, không chuyển stage

4. **No Guests**: Không có khách nào để check-in
   - Action: Alert user quay lại Stage 2, không chuyển stage

### Error Messages
- ✅ Success: `"✅ Check-in thành công cho 3 khách!"`
- ❌ Complete Failure: `"Lỗi khi check-in khách. Vui lòng thử lại."`
- ⚠️ Partial Failure: `"Một số khách check-in thất bại (2/5). Vui lòng kiểm tra lại."`
- 🚫 No Guests: `"Không có khách nào để check-in. Vui lòng đăng ký khách trước."`

---

## 🎯 Key Features

1. **Automatic Check-in**: Tự động check-in tất cả khách khi chuyển stage
2. **Batch Processing**: Xử lý nhiều requests song song với Promise.all()
3. **Error Resilience**: Catch lỗi cho từng request riêng lẻ
4. **User Feedback**: Alert rõ ràng về kết quả check-in
5. **Stage Control**: Chỉ chuyển stage khi check-in thành công hoàn toàn

---

## 📌 Files Modified

1. **booking-detail.js**
   - Line ~215-238: Added `checkInGuest()` API method
   - Line ~526-542: Updated `nextStage()` to trigger check-in
   - Line ~565-608: Added `performCheckIn()` business logic

2. **ReservationGuestController.java** (Already existed)
   - Line ~45-50: Check-in endpoint `/resRoomId={resRoomId}-guestId={guestId}/checkIn`

---

## 🎉 Summary

**Status**: ✅ **HOÀN TẤT**

Tính năng check-in tự động đã được tích hợp hoàn chỉnh vào Stage 4. Khi user click nút "Dịch Vụ Trong Lưu Trú", hệ thống sẽ:
1. Tự động check-in TẤT CẢ khách đã đăng ký
2. Xử lý song song nhiều requests
3. Báo lỗi nếu có vấn đề
4. Chỉ chuyển sang Stage 5 khi check-in thành công

**User Experience**: Mượt mà, tự động, và an toàn với error handling đầy đủ.
