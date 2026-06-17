# ✅ CHECKLIST TRIỂN KHAI - MẬT KHẨU MẶC ĐỊNH

**Ngày:** 24/11/2025  
**Yêu cầu:** Tất cả user có password mặc định "1234", có thể tự đổi sau

---

## 📋 KIỂM TRA TRƯỚC KHI GIAO KHÁCH

### ✅ Bước 1: Chạy SQL Script (1 LẦN DUY NHẤT)
```bash
# Chạy file setup_default_password.sql trong MySQL Workbench hoặc command line
```

**Kết quả mong đợi:**
- ✅ Tất cả password trong bảng `user` = `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- ✅ Bảng backup `user_backup_before_default_password` được tạo

---

### ✅ Bước 2: Kiểm tra Backend đã implement đúng

#### 2.1. BCrypt Encoder đã được config
- **File:** `SecurityConfig.java`
- **Bean:** `BCryptPasswordEncoder` được khai báo
- **Status:** ✅ ĐÃ CÓ

#### 2.2. Change Password API đã có
- **Endpoint:** `POST /api/auth/change-password`
- **File:** `AuthController.java` (lines 235-261)
- **Features:**
  - ✅ Verify old password: `passwordEncoder.matches()`
  - ✅ Hash new password: `passwordEncoder.encode()`
  - ✅ Require JWT token
- **Status:** ✅ ĐÃ IMPLEMENT

#### 2.3. Login API sử dụng BCrypt
- **Endpoint:** `POST /api/auth/login`
- **File:** `AuthController.java`
- **Status:** ✅ ĐÃ SỬ DỤNG BCrypt

---

### ✅ Bước 3: Test Workflow Thực Tế

#### Test Case 1: Login với password mặc định
```http
POST http://localhost:8080/hotel_reservation_premium/api/auth/login
Content-Type: application/json

{
  "account": "anhndtkekeke",
  "password": "1234"
}
```

**Kỳ vọng:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "expiresIn": 86400000
  }
}
```

✅ **STATUS:** [ ] Pass / [ ] Fail

---

#### Test Case 2: Đổi password
```http
POST http://localhost:8080/hotel_reservation_premium/api/auth/change-password
Authorization: Bearer <token_from_step_1>
Content-Type: application/json

{
  "oldPassword": "1234",
  "newPassword": "newpass123"
}
```

**Kỳ vọng:**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

✅ **STATUS:** [ ] Pass / [ ] Fail

---

#### Test Case 3: Login với password mới
```http
POST http://localhost:8080/hotel_reservation_premium/api/auth/login
Content-Type: application/json

{
  "account": "anhndtkekeke",
  "password": "newpass123"
}
```

**Kỳ vọng:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci..."
  }
}
```

✅ **STATUS:** [ ] Pass / [ ] Fail

---

#### Test Case 4: Login với password cũ phải FAIL
```http
POST http://localhost:8080/hotel_reservation_premium/api/auth/login
Content-Type: application/json

{
  "account": "anhndtkekeke",
  "password": "1234"
}
```

**Kỳ vọng:**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

✅ **STATUS:** [ ] Pass / [ ] Fail

---

## 📦 FILES CẦN GIAO CHO KHÁCH

- [x] `target/hotel-reservation-*.jar` (hoặc compiled application)
- [x] `CUSTOMER_CHANGE_PASSWORD_GUIDE.md` (Hướng dẫn người dùng)
- [x] `application.yaml` (Cấu hình database)
- [ ] Danh sách tài khoản (account list)

---

## 🔐 XÁC NHẬN CUỐI CÙNG

### Backend Implementation:
- ✅ `SecurityConfig.java` có `BCryptPasswordEncoder`
- ✅ `AuthController.changePassword()` verify old password
- ✅ `AuthController.changePassword()` hash new password
- ✅ Mọi password mới đều tự động hash

### Database:
- [ ] Đã chạy `setup_default_password.sql`
- [ ] Tất cả user.password = BCrypt hash của "1234"
- [ ] Backup table đã được tạo

### Testing:
- [ ] Test login với "1234" → SUCCESS
- [ ] Test change password → SUCCESS
- [ ] Test login với password mới → SUCCESS
- [ ] Test login với "1234" sau khi đổi → FAIL (đúng)

---

## 🚀 SẴN SÀNG GIAO KHÁCH?

**Checklist tổng:**
- [ ] SQL script đã chạy
- [ ] Backend đã test thành công
- [ ] Tài liệu người dùng đã chuẩn bị
- [ ] Danh sách account đã gửi

**Khi tất cả ✅ → 🎉 SẴN SÀNG GIAO!**

---

## 🔄 ROLLBACK (NẾU CẦN)

Nếu muốn quay lại trạng thái cũ:
```sql
UPDATE user u
INNER JOIN user_backup_before_default_password b ON u.id = b.id
SET u.password = b.password;
```
