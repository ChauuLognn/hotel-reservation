## Quy tắc import

- Format functions: luôn import từ `@shared/utils/format`
- Status maps: luôn import từ `@shared/constants/statusMaps`
- Role constants: luôn import từ `@shared/constants/roleConstants`
- KHÔNG định nghĩa lại formatVND, formatDate, STATUS_MAP trong feature files

## Quy tắc thêm feature mới

- Feature mới → tạo folder trong `features/{tên_feature}/`
- Component tái sử dụng (>= 2 feature dùng) → đưa vào `components/ui/`
- Logic fetch + state → cân nhắc dùng `useFetch` hook từ `shared/hooks/`

## Quy tắc backend (ghi vào backend README.md hoặc docs/)

- Module mới → tạo package `com.hotelreservation.module.{tên}/`
  với đầy đủ: controller/, dto/, entity/, repository/, service/
- Không cross-import giữa module theo chiều ngang trực tiếp
  (ví dụ: billing không import entity của reservation trực tiếp
   mà qua ReservationRoomRepository)
- Shared code → đặt trong `com.hotelreservation.common/`
