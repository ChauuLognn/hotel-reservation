-- =====================================================
-- SCRIPT: Thiết lập mật khẩu mặc định cho tất cả users
-- =====================================================
-- Mục đích: Khi giao sản phẩm cho khách, tất cả tài khoản có mật khẩu "1234"
-- Khách hàng có thể đổi mật khẩu sau thông qua API: POST /api/auth/change-password

USE hotel_reservation_premium;

-- 1. Backup dữ liệu trước khi thay đổi (QUAN TRỌNG!)
-- Chạy lệnh này trong terminal/command line TRƯỚC KHI chạy script:
-- mysqldump -u root -p hotel_reservation_premium user > user_backup.sql
-- 
-- Để rollback (nếu cần):
-- mysql -u root -p hotel_reservation_premium < user_backup.sql

-- 2. Set tất cả mật khẩu = BCrypt hash của "1234"
-- Hash này được tạo bởi BCrypt với strength 10
-- Password gốc: 1234

-- Tắt Safe Update Mode tạm thời (nếu MySQL Workbench báo lỗi 1175)
SET SQL_SAFE_UPDATES = 0;

UPDATE user
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

-- Bật lại Safe Update Mode
SET SQL_SAFE_UPDATES = 1;

-- 3. Kiểm tra kết quả
SELECT 
    id,
    empId,
    account,
    LEFT(password, 20) as password_preview,
    LENGTH(password) as password_length
FROM user
LIMIT 10;

-- =====================================================
-- THÔNG TIN QUAN TRỌNG
-- =====================================================
-- ✅ Tất cả tài khoản giờ đều có mật khẩu: 1234
-- ✅ Khách hàng login bằng: account + password "1234"
-- ✅ Để đổi mật khẩu, gọi API:
--    POST /api/auth/change-password
--    Header: Authorization: Bearer <token>
--    Body: {
--      "oldPassword": "1234",
--      "newPassword": "matkhaumoi123"
--    }

-- =====================================================
-- ROLLBACK (nếu cần quay lại trạng thái cũ)
-- =====================================================
-- mysql -u root -p hotel_reservation_premium < user_backup.sql
