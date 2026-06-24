import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, HelpCircle, Star, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '@app/AuthContext';
import reservationApi from '@features/reservations/reservationApi';
import userApi from '@features/employees/userApi';
import guestApi from '@features/guests/guestApi';
import { formatVND, formatDate } from '@shared/utils/format';
import { getTodayString } from '@shared/utils/date';
import { RESERVATION_STATUS } from '@shared/constants/statusMaps';
import { useToast } from '@context/ToastContext';
import CustomerLayout from '@layout/CustomerLayout';
import Button from '@shared/ui/Button';
import Badge from '@shared/ui/Badge';

import { useRoomSearch, Room } from './hooks/useRoomSearch';
import { useBookings } from './hooks/useBookings';
import RoomCard from './components/RoomCard';
import BookingModal from './components/BookingModal';

interface GuestForm {
  firstName: string;
  lastName: string;
  phone: string;
  identityNum: string;
  dateOfBirth: string;
}

interface Review {
  id: number;
  guestName: string;
  rating: number;
  date: string;
  comment: string;
  roomTypeName: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: 1, guestName: 'Nguyễn Minh H.', rating: 5, date: '2026-05-12', comment: 'Phòng VIP Suite cực kỳ sang trọng, view sông tuyệt đẹp. Dịch vụ đưa đón rất chu đáo!', roomTypeName: 'VIP Suite' },
  { id: 2, guestName: 'Trần Thị T.', rating: 5, date: '2026-06-01', comment: 'Giường êm, phòng Deluxe sạch sẽ, dịch vụ ăn sáng tại phòng rất ngon miệng.', roomTypeName: 'Deluxe' },
  { id: 3, guestName: 'David K.', rating: 4, date: '2026-06-10', comment: 'Không gian yên tĩnh, thiết kế tối giản rất hợp gu. Sẽ quay lại lần sau.', roomTypeName: 'VIP Suite' }
];

export default function UserHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [section, setSection] = useState<string>('home');

  const {
    rooms,
    loading,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    isSearching,
    setIsSearching,
    loadRooms,
    searchRooms,
  } = useRoomSearch();

  const {
    bookings,
    loadBookings,
    handleCancelBooking,
    handleConfirmPayment,
  } = useBookings();

  // Search & Booking States
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [includeBreakfast, setIncludeBreakfast] = useState<boolean>(true);
  const [airportPickup, setAirportPickup] = useState<boolean>(false);
  const [guestForm, setGuestForm] = useState<GuestForm>({
    firstName: '',
    lastName: '',
    phone: '',
    identityNum: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    loadRooms(controller.signal);
    if (user?.userId) {
      loadBookings(controller.signal);
    }
    return () => {
      controller.abort();
    };
  }, [user]);

  const handleOpenBooking = async (room: Room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);

    try {
      if (user.empId) {
        const empRes = await userApi.getEmpById(user.empId);
        const emp = empRes.data || {};
        setGuestForm({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          phone: emp.phone || '',
          identityNum: emp.identityNum || '',
          dateOfBirth: emp.dateOfBirth || '',
        });
      }
    } catch (err) {
      console.error('Lỗi tải thông tin cá nhân:', err);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !user) return;

    if (!guestForm.firstName || !guestForm.lastName || !guestForm.phone || !guestForm.identityNum) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'warning');
      return;
    }

    const todayStr = getTodayString();
    if (checkIn < todayStr) {
      showToast('Ngày nhận phòng không thể ở trong quá khứ!', 'error');
      return;
    }

    setIsBooking(true);
    try {
      // Create or update current user's guest profile via /api/guests/me
      const guestRes = await guestApi.updateMe({
        firstName: guestForm.firstName,
        lastName: guestForm.lastName,
        identityNum: guestForm.identityNum,
        phone: guestForm.phone,
        dateOfBirth: guestForm.dateOfBirth || null,
      });
      const savedGuest = guestRes.data || {};
      const guestId = savedGuest.id;
      if (guestId && user.guestId !== guestId) {
        user.guestId = guestId;
        localStorage.setItem('userInfo', JSON.stringify(user));
      }

      if (!guestId) {
        throw new Error('Không thể tạo hoặc xác định hồ sơ khách hàng.');
      }

      const payload = {
        guestId: Number(guestId),
        items: [
          {
            roomName: selectedRoom.roomType.name,
            rooms: 1,
            checkIn: checkIn,
            checkOut: checkOut,
          },
        ],
      };

      const res = await reservationApi.create(payload);
      const resData = res.data;
      showToast(`Đặt phòng thành công! Mã đặt phòng: ${resData.resId}`, 'success');

      localStorage.setItem(`currentGuestId_${user.userId}`, String(guestId));

      setSelectedRoom(null);
      setSection('bookings');
      await loadBookings();
    } catch (err: any) {
      showToast('Lỗi đặt phòng: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <CustomerLayout activeSection={section} onSectionChange={setSection}>
      {section === 'home' && (
        <section className="bg-apple-surface-tile-1 text-white py-24 px-6 select-none relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="text-[12px] font-semibold text-apple-primary-on-dark uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles size={14} /> Luxury Collection 2026
            </span>
            <h1 className="text-[44px] md:text-[56px] font-display font-semibold tracking-apple-display-tight leading-tight mb-6 text-white">
              Chào mừng đến với Hotel Haven
            </h1>
            <p className="text-apple-body-muted text-lg md:text-xl font-light max-w-2xl leading-relaxed mb-8">
              Khám phá sự cân bằng hoàn hảo giữa kiến trúc tối giản đương đại và tiện nghi nghỉ dưỡng đẳng cấp 5 sao quốc tế.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button variant="primary" onClick={() => setSection('rooms')}>
                Đặt phòng ngay
              </Button>
              <a href="#amenities" className="inline-flex items-center text-apple-primary-on-dark hover:underline text-[15px] font-medium transition-colors">
                Xem thêm dịch vụ →
              </a>
            </div>
          </div>
        </section>
      )}

      {section === 'home' && (
        <section id="amenities" className="bg-white py-20 px-6 border-b border-apple-divider-soft">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-16 select-none">
              <h2 className="text-3xl font-display font-semibold tracking-apple-tight mb-3">Dịch vụ nghỉ dưỡng cao cấp</h2>
              <p className="text-apple-ink-muted-48 text-[15px]">Từng chi tiết được thiết kế để mang đến sự thư thái tuyệt đối.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🏊', title: 'Hồ Bơi Vô Cực', desc: 'Tọa lạc tại tầng thượng với tầm nhìn toàn cảnh ra đại dương thơ mộng.' },
                { icon: '🍽️', title: 'Nhà Hàng Michelin', desc: 'Trải nghiệm tinh hoa ẩm thực Á - Âu chuẩn mực từ bếp trưởng hàng đầu.' },
                { icon: '💆', title: 'Spa & Trị Liệu', desc: 'Thư giãn cơ thể và tâm trí với các phương pháp trị liệu thiên nhiên.' },
                { icon: '🏋️', title: 'Phòng Gym Hiện Đại', desc: 'Hệ thống thiết bị tập luyện Technogym tiên tiến nâng tầm thể lực.' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-apple-surface-pearl border border-apple-divider-soft/50 rounded-apple-lg p-6 hover:shadow-sm active-scale duration-200 transition-all select-none"
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-apple-ink mb-2">{f.title}</h3>
                  <p className="text-apple-ink-muted-80 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(section === 'home' || section === 'rooms') && (
        <section className="bg-apple-canvas-parchment py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 select-none">
              <div>
                <h2 className="text-2xl font-display font-semibold tracking-apple-tight mb-1">
                  {section === 'home' ? '🏠 Phòng Nổi Bật' : '🏠 Tất Cả Phòng Trống'}
                </h2>
                <p className="text-apple-ink-muted-48 text-sm">Hiển thị các phòng trống sẵn sàng phục vụ</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-apple-ink-muted-80 bg-white border border-apple-hairline rounded-full px-3 py-1.5 shadow-sm">
                <MapPin size={12} className="text-apple-primary" />
                <span>Thành phố Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>

            <div className="bg-white rounded-apple-lg border border-apple-hairline shadow-sm p-6 mb-10 flex flex-col lg:flex-row gap-6 items-end">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-apple-ink-muted-80 flex items-center gap-1.5">
                    <Calendar size={14} className="text-apple-primary" /> Ngày Nhận Phòng
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={getTodayString()}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-apple-surface-pearl text-apple-ink text-[15px] border border-apple-hairline rounded-apple-sm px-4 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-apple-ink-muted-80 flex items-center gap-1.5">
                    <Calendar size={14} className="text-apple-primary" /> Ngày Trả Phòng
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || getTodayString()}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-apple-surface-pearl text-apple-ink text-[15px] border border-apple-hairline rounded-apple-sm px-4 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <Button variant="primary" onClick={() => searchRooms()} className="flex-1 lg:flex-none h-11 !px-8 font-semibold">
                  Tìm Phòng Trống
                </Button>
                {isSearching && (
                  <Button variant="pearl-capsule" onClick={() => { setIsSearching(false); loadRooms(); }} className="h-11">
                    Đặt Lại
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-apple-ink-muted-48">
                <div className="w-8 h-8 border-4 border-apple-divider-soft border-t-apple-primary rounded-full animate-spin-custom mb-3" />
                <span>Đang quét danh sách phòng trống...</span>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(section === 'home' ? rooms.slice(0, 6) : rooms).map((r) => (
                    <RoomCard key={r.id} room={r} onBook={handleOpenBooking} />
                  ))}
                </div>

                {!rooms.length && (
                  <div className="bg-white border border-apple-hairline rounded-apple-lg p-16 text-center select-none text-apple-ink-muted-48">
                    <HelpCircle size={44} className="mx-auto text-apple-ink-muted-48 mb-3" />
                    <h3 className="font-semibold text-apple-ink text-[17px] mb-1">Hiện không có phòng trống</h3>
                    <p className="text-sm">Vui lòng thay đổi khoảng thời gian nhận/trả phòng hoặc liên hệ lễ tân để được hỗ trợ.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {section === 'home' && (
        <section className="bg-white py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 border-b border-apple-divider-soft pb-6 mb-12 select-none">
              <div>
                <h2 className="text-3xl font-display font-semibold tracking-apple-tight mb-2">Ý kiến từ khách hàng</h2>
                <p className="text-apple-ink-muted-48 text-[15px]">Những phản hồi thực tế từ những kỳ lưu trú trọn vẹn.</p>
              </div>
              <div className="flex items-center gap-2 bg-apple-surface-pearl px-4 py-2 border border-apple-hairline rounded-apple-md">
                <span className="font-bold text-lg text-apple-ink">4.9</span>
                <div className="flex text-yellow-500"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                <span className="text-xs text-apple-ink-muted-48">/ 140 đánh giá</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MOCK_REVIEWS.map((rev) => (
                <div key={rev.id} className="bg-apple-canvas-parchment rounded-apple-lg p-6 flex flex-col justify-between select-none">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex text-yellow-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[11px] text-apple-ink-muted-48">{formatDate(rev.date)}</span>
                    </div>
                    <p className="text-apple-ink text-sm leading-relaxed italic mb-4">"{rev.comment}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-apple-divider-soft">
                    <div className="w-8 h-8 rounded-full bg-apple-primary/10 text-apple-primary font-bold flex items-center justify-center text-xs">
                      {rev.guestName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-apple-ink">{rev.guestName}</h4>
                      <p className="text-[10px] text-apple-ink-muted-48">Đã ở phòng: {rev.roomTypeName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {section === 'bookings' && (
        <section className="bg-apple-canvas-parchment py-16 px-6 min-h-[60vh]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-display font-semibold tracking-apple-tight mb-8 select-none">📋 Đặt Phòng Của Tôi</h2>

            {!user ? (
              <div className="bg-white border border-apple-hairline rounded-apple-lg p-16 text-center select-none text-apple-ink-muted-48 shadow-sm">
                <p className="mb-4">Vui lòng đăng nhập để xem lịch sử đặt phòng của bạn</p>
                <Button variant="primary" onClick={() => navigate('/login')}>Đăng Nhập</Button>
              </div>
            ) : (
              <div className="bg-white rounded-apple-lg border border-apple-hairline shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                      <tr className="bg-apple-surface-pearl border-b border-apple-divider-soft text-[12px] uppercase font-semibold text-apple-ink-muted-48 tracking-wider">
                        <th className="px-6 py-4">Mã Đặt</th>
                        <th className="px-6 py-4">Check-in</th>
                        <th className="px-6 py-4">Check-out</th>
                        <th className="px-6 py-4">Tổng Tiền</th>
                        <th className="px-6 py-4">Trạng Thái</th>
                        <th className="px-6 py-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-apple-divider-soft text-[14px]">
                      {bookings.length ? (
                        bookings.slice(0, 15).map((b) => (
                          <tr key={b.resId} className="hover:bg-apple-surface-pearl/50">
                            <td className="px-6 py-4 font-bold text-apple-primary">{b.resId}</td>
                            <td className="px-6 py-4">{formatDate(b.checkIn)}</td>
                            <td className="px-6 py-4">{formatDate(b.checkOut)}</td>
                            <td className="px-6 py-4 font-semibold">{formatVND(b.total)}</td>
                            <td className="px-6 py-4">
                              <Badge status={b.status} statusMap={RESERVATION_STATUS} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              {b.status === 'PENDING_PAYMENT' && (
                                <div className="inline-flex gap-2">
                                  <Button
                                    variant="pearl-capsule"
                                    onClick={() => handleConfirmPayment(b.resId)}
                                    className="!py-1 !px-3 text-xs font-semibold !border-green-200 !bg-green-50 !text-green-700 hover:!bg-green-100 active-scale"
                                  >
                                    Thanh Toán
                                  </Button>
                                  <Button
                                    variant="danger"
                                    onClick={() => handleCancelBooking(b.resId)}
                                    className="!py-1 !px-3 text-xs font-semibold active-scale"
                                  >
                                    Hủy
                                  </Button>
                                </div>
                              )}
                              {b.status === 'CONFIRMED' && (
                                <Button
                                  variant="danger"
                                  onClick={() => handleCancelBooking(b.resId)}
                                  className="!py-1 !px-3 text-xs font-semibold active-scale"
                                >
                                  Hủy Đặt
                                </Button>
                              )}
                              {!['PENDING_PAYMENT', 'CONFIRMED'].includes(b.status) && (
                                <span className="text-apple-ink-muted-48">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-apple-ink-muted-48 select-none">
                            Bạn chưa có lịch sử đặt phòng nào tại khách sạn.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setSelectedRoom(null)}
          guestForm={guestForm}
          setGuestForm={setGuestForm}
          includeBreakfast={includeBreakfast}
          setIncludeBreakfast={setIncludeBreakfast}
          airportPickup={airportPickup}
          setAirportPickup={setAirportPickup}
          isBooking={isBooking}
          onSubmit={handleConfirmBooking}
        />
      )}
    </CustomerLayout>
  );
}
