import { Plus, Trash2, UserPlus } from 'lucide-react';
import { formatVND, formatDateTime } from '@utils/format';
import { BookingRoom, GuestItem, ServiceItem } from '@hooks/useBookingDetail';

interface RoomStaySectionProps {
  bookingRoom: BookingRoom;
  roomInfo: any;
  overallStatus: string;
  registeredGuests: GuestItem[];
  usedServices: ServiceItem[];
  isRoomLoading: boolean;
  onOpenAddGuest: (resRoomId: number) => void;
  onOpenAddService: (resRoomId: number) => void;
  onCheckIn: (resRoomId: number, guestId: number, name: string) => void;
  onCheckOut: (resRoomId: number, guestId: number, name: string) => void;
  onDeleteService: (resRoomId: number, svcId: number) => void;
}

export default function RoomStaySection({
  bookingRoom,
  roomInfo,
  overallStatus,
  registeredGuests,
  usedServices,
  isRoomLoading,
  onOpenAddGuest,
  onOpenAddService,
  onCheckIn,
  onCheckOut,
  onDeleteService,
}: RoomStaySectionProps) {
  return (
    <div
      className={`bg-apple-canvas rounded-apple-lg border overflow-hidden transition-all duration-200 ${
        isRoomLoading ? 'border-apple-primary' : 'border-apple-hairline'
      }`}
    >
      <div className="px-6 py-4 bg-apple-surface-pearl border-b border-apple-divider-soft flex items-center justify-between">
        <h4 className="font-bold text-apple-primary text-base">
          Phòng {roomInfo.roomNumber || bookingRoom.roomId} — {roomInfo.roomTypeName || '-'}
        </h4>
        <span className="text-[14px] text-apple-ink-muted-80 font-semibold">
          {formatVND(bookingRoom.totalPrice)} (Tầng {roomInfo.floorNumber || 1})
        </span>
      </div>
      <div className="p-6 space-y-6 text-left">
        {/* Guest Stays section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-[14px] font-bold text-apple-ink">👥 Khách Lưu Trú ({registeredGuests.length})</h5>
            {['PENDING_PAYMENT', 'CONFIRMED', 'CHECK_IN'].includes(overallStatus) && (
              <button
                type="button"
                className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-apple-canvas-parchment text-apple-ink text-[11px] font-semibold border border-apple-hairline rounded active-scale transition-all"
                onClick={() => onOpenAddGuest(bookingRoom.id)}
              >
                <UserPlus size={12} className="mr-1" /> Đăng Ký Khách
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-apple-divider-soft rounded-apple-sm">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl font-semibold text-apple-ink-muted-48 uppercase">
                  <th className="px-4 py-2.5">Tên Khách</th>
                  <th className="px-4 py-2.5">CMND/CCCD</th>
                  <th className="px-4 py-2.5">Nhận Phòng (Check-in)</th>
                  <th className="px-4 py-2.5">Trả Phòng (Check-out)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-divider-soft text-apple-ink">
                {registeredGuests.length ? (
                  registeredGuests.map((rg, i) => (
                    <tr key={i} className="hover:bg-apple-surface-pearl/20">
                      <td className="px-4 py-2.5 font-semibold">{rg.guestName}</td>
                      <td className="px-4 py-2.5 text-apple-ink-muted-80">{rg.identityNum || '-'}</td>
                      <td className="px-4 py-2.5">
                        {rg.checkInAt ? (
                          <span className="text-green-600 font-medium">
                            {new Date(rg.checkInAt).toLocaleString('vi-VN')}
                          </span>
                        ) : ['CONFIRMED', 'CHECK_IN'].includes(overallStatus) ? (
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-600 text-[11px] font-bold rounded active-scale transition-all"
                            onClick={() => onCheckIn(bookingRoom.id, rg.guestId, rg.guestName)}
                          >
                            Check-In
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {rg.checkOutAt ? (
                          <span className="text-apple-ink-muted-48">
                            {new Date(rg.checkOutAt).toLocaleString('vi-VN')}
                          </span>
                        ) : rg.checkInAt && overallStatus === 'CHECK_IN' ? (
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded active-scale transition-all"
                            onClick={() => onCheckOut(bookingRoom.id, rg.guestId, rg.guestName)}
                          >
                            Check-Out
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-apple-ink-muted-48">
                      Chưa có khách đăng ký phòng này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Room Services section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-[14px] font-bold text-apple-ink">☕ Dịch Vụ Sử Dụng ({usedServices.length})</h5>
            {overallStatus === 'CHECK_IN' && (
              <button
                type="button"
                className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-apple-canvas-parchment text-apple-ink text-[11px] font-semibold border border-apple-hairline rounded active-scale transition-all"
                onClick={() => onOpenAddService(bookingRoom.id)}
              >
                <Plus size={12} className="mr-1" /> Thêm Dịch Vụ
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-apple-divider-soft rounded-apple-sm">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl font-semibold text-apple-ink-muted-48 uppercase">
                  <th className="px-4 py-2.5">Tên Dịch Vụ</th>
                  <th className="px-4 py-2.5">SL</th>
                  <th className="px-4 py-2.5">Tổng Tiền</th>
                  <th className="px-4 py-2.5">Ngày Dùng</th>
                  <th className="px-4 py-2.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-divider-soft text-apple-ink">
                {usedServices.length ? (
                  usedServices.map((svc, i) => (
                    <tr key={svc.id || i} className="hover:bg-apple-surface-pearl/20">
                      <td className="px-4 py-2.5 font-semibold">{svc.service}</td>
                      <td className="px-4 py-2.5 text-apple-ink-muted-80">{svc.quantity}</td>
                      <td className="px-4 py-2.5 font-semibold text-apple-primary">{formatVND(svc.totalAmount)}</td>
                      <td className="px-4 py-2.5 text-apple-ink-muted-48 text-xs">{formatDateTime(svc.usedAt)}</td>
                      <td className="px-4 py-2.5 text-right">
                        {overallStatus === 'CHECK_IN' ? (
                          <button
                            type="button"
                            className="p-1 rounded-full text-red-600 hover:bg-red-50 transition-colors active-scale inline-flex"
                            onClick={() => onDeleteService(bookingRoom.id, svc.id)}
                            title="Xóa"
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-apple-ink-muted-48">
                      Chưa dùng dịch vụ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
