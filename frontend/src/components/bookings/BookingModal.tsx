import React from 'react';
import { Room } from '../hooks/useRoomSearch';
import Button from '@shared/ui/Button';
import { formatVND, formatDate } from '@shared/utils/format';

interface GuestForm {
  firstName: string;
  lastName: string;
  phone: string;
  identityNum: string;
  dateOfBirth: string;
}

interface BookingModalProps {
  room: Room;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  guestForm: GuestForm;
  setGuestForm: React.Dispatch<React.SetStateAction<GuestForm>>;
  includeBreakfast: boolean;
  setIncludeBreakfast: (val: boolean) => void;
  airportPickup: boolean;
  setAirportPickup: (val: boolean) => void;
  isBooking: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BookingModal({
  room,
  checkIn,
  checkOut,
  onClose,
  guestForm,
  setGuestForm,
  includeBreakfast,
  setIncludeBreakfast,
  airportPickup,
  setAirportPickup,
  isBooking,
  onSubmit,
}: BookingModalProps) {
  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const getSubtotal = () => {
    let price = room.roomType.basePrice * getNights();
    if (includeBreakfast) price += 150000 * getNights();
    if (airportPickup) price += 350000;
    return price;
  };

  return (
    <div
      className="fixed inset-0 bg-apple-surface-black/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] p-4 transition-opacity duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden w-full max-w-[640px] flex flex-col max-h-[85vh] shadow-lg animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-apple-divider-soft select-none">
          <h3 className="font-display font-semibold text-lg text-apple-ink">Xác Nhận Đặt Phòng</h3>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-apple-ink-muted-80 hover:bg-apple-divider-soft transition-all active-scale"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Select Room Summary Box */}
            <div className="bg-apple-canvas-parchment p-4 rounded-apple-md border border-apple-divider-soft flex flex-col gap-1.5 text-sm select-none">
              <h4 className="font-semibold text-apple-ink mb-1">Thông tin phòng chọn:</h4>
              <p>
                🏢 Phòng: <strong>{room.roomNumber}</strong> ({room.roomType?.name})
              </p>
              <p>
                💵 Đơn giá: <strong>{formatVND(room.roomType?.basePrice)}/đêm</strong>
              </p>
              <p>
                📅 Thời gian: <strong>{formatDate(checkIn)}</strong> đến <strong>{formatDate(checkOut)}</strong> ({getNights()} đêm)
              </p>
            </div>

            {/* Apple Style Option Chips (Configurators) */}
            <div className="flex flex-col gap-2.5 select-none">
              <h4 className="text-[13px] font-semibold text-apple-ink uppercase tracking-wider">Dịch vụ đi kèm tự chọn:</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all active-scale border ${
                    includeBreakfast
                      ? 'border-apple-primary bg-apple-primary/5 text-apple-primary'
                      : 'border-apple-hairline bg-apple-canvas text-apple-ink-muted-80 hover:bg-apple-surface-pearl'
                  }`}
                  onClick={() => setIncludeBreakfast(!includeBreakfast)}
                >
                  🥞 Buffet Ăn Sáng (+150k/đêm) {includeBreakfast && '✓'}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all active-scale border ${
                    airportPickup
                      ? 'border-apple-primary bg-apple-primary/5 text-apple-primary'
                      : 'border-apple-hairline bg-apple-canvas text-apple-ink-muted-80 hover:bg-apple-surface-pearl'
                  }`}
                  onClick={() => setAirportPickup(!airportPickup)}
                >
                  🚗 Đưa Đón Sân Bay (+350k) {airportPickup && '✓'}
                </button>
              </div>
            </div>

            {/* Guest Personal Form */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-apple-ink border-b border-apple-divider-soft pb-2 text-[15px] select-none text-left">
                Thông Tin Khách Lưu Trú:
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[13px] font-semibold text-apple-ink-muted-80">Họ và đệm *</label>
                  <input
                    type="text"
                    className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                    required
                    value={guestForm.firstName}
                    onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn"
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[13px] font-semibold text-apple-ink-muted-80">Tên *</label>
                  <input
                    type="text"
                    className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                    required
                    value={guestForm.lastName}
                    onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                    placeholder="Ví dụ: Anh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[13px] font-semibold text-apple-ink-muted-80">Số Điện Thoại *</label>
                  <input
                    type="tel"
                    className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                    required
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                    placeholder="Ví dụ: 0912345678"
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[13px] font-semibold text-apple-ink-muted-80">Số CMND / CCCD *</label>
                  <input
                    type="text"
                    className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                    required
                    value={guestForm.identityNum}
                    onChange={(e) => setGuestForm({ ...guestForm, identityNum: e.target.value })}
                    placeholder="CCCD/CMND 12 số"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80">Ngày Sinh</label>
                <input
                  type="date"
                  className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                  value={guestForm.dateOfBirth}
                  onChange={(e) => setGuestForm({ ...guestForm, dateOfBirth: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Persistent/Sticky Booking Summary Bar inside checkout */}
          <div className="px-6 py-4 border-t border-apple-divider-soft bg-apple-canvas-parchment flex items-center justify-between select-none">
            <div className="text-left">
              <span className="text-xs text-apple-ink-muted-48 block">Tổng cộng:</span>
              <span className="text-lg font-bold text-apple-primary font-display">{formatVND(getSubtotal())}</span>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="pearl-capsule" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={isBooking}>
                {isBooking ? 'Đang Xử Lý...' : 'Đặt Phòng'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
