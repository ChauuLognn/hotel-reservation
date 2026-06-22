import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, LogOut, CheckCircle, HelpCircle, Star, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '@app/AuthContext';
import roomApi from '@features/rooms/api/roomApi';
import reservationApi from '@features/reservations/api/reservationApi';
import userApi from '@features/employees/api/userApi';
import guestApi from '@features/guests/api/guestApi';
import { formatVND, formatDate } from '@shared/utils/format';
import { getTodayString, getTomorrowString } from '@shared/utils/date';
import { RESERVATION_STATUS } from '@shared/constants/statusMaps';
import { useToast } from '@context/ToastContext';
import { useConfirm } from '@context/ConfirmContext';
import CustomerLayout from '@layout/CustomerLayout';
import Button from '@shared/ui/Button';
import Badge from '@shared/ui/Badge';

interface Room {
  id: number;
  roomNumber: number;
  floorNumber: number;
  status: string;
  roomType: {
    name: string;
    basePrice: number;
    capacity: number;
  };
}

interface Booking {
  resId: string;
  checkIn: string;
  checkOut: string;
  total: number;
  status: string;
}

interface GuestForm {
  firstName: string;
  lastName: string;
  phone: string;
  identityNum: string;
  dateOfBirth: string;
}

// Local mock reviews for SaaS 2026 aesthetics
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
  const confirm = useConfirm();
  const [section, setSection] = useState<string>('home');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Search & Booking States
  const [checkIn, setCheckIn] = useState<string>(getTodayString());
  const [checkOut, setCheckOut] = useState<string>(getTomorrowString());
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  // Configurator options in Booking flow (Apple Style option chips)
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
    loadRooms();
    if (user?.userId) loadBookings();
  }, [user]);

  async function loadRooms() {
    setLoading(true);
    setIsSearching(false);
    try {
      const availRes = await roomApi.findAvailable({ checkIn: getTodayString(), checkOut: getTomorrowString() });
      const availList = availRes.data?.data || availRes.data || [];

      const enriched: Room[] = availList.map((av: any) => ({
        id: av.roomId,
        roomNumber: av.roomId,
        floorNumber: Math.floor(av.roomId / 100) || 1,
        status: 'READY',
        roomType: {
          name: av.name,
          basePrice: av.baseprice,
          capacity: av.capacity,
        },
      }));
      setRooms(enriched);
    } catch (err) {
      console.error('Lỗi tải phòng:', err);
    } finally {
      setLoading(false);
    }
  }

  async function searchRooms() {
    if (!checkIn || !checkOut) {
      showToast('Vui lòng chọn đầy đủ ngày nhận và trả phòng!', 'warning');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      showToast('Ngày trả phòng phải sau ngày nhận phòng!', 'warning');
      return;
    }
    setLoading(true);
    setIsSearching(true);
    try {
      const availRes = await roomApi.findAvailable({ checkIn, checkOut });
      const availList = availRes.data?.data || availRes.data || [];

      const enriched: Room[] = availList.map((av: any) => ({
        id: av.roomId,
        roomNumber: av.roomId,
        floorNumber: Math.floor(av.roomId / 100) || 1,
        status: 'AVAILABLE',
        roomType: {
          name: av.name,
          basePrice: av.baseprice,
          capacity: av.capacity,
        },
      }));
      setRooms(enriched);
    } catch (err: any) {
      showToast('Lỗi tải phòng trống: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings() {
    if (!user?.userId) return;
    try {
      const res = await reservationApi.getMyBookings();
      setBookings(res.data?.data || res.data || []);
    } catch {
      setBookings([]);
    }
  }

  const handleOpenBooking = async (room: Room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);

    // Tự động điền thông tin cá nhân
    try {
      if (user.empId) {
        const empRes = await userApi.getEmpById(user.empId);
        const emp = empRes.data?.data || empRes.data || {};
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
    if (!selectedRoom) return;

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
      let guestId = user?.guestId;
      if (guestId) {
        await guestApi.update(guestId, {
          firstName: guestForm.firstName,
          lastName: guestForm.lastName,
          identityNum: guestForm.identityNum,
          phone: guestForm.phone,
          dateOfBirth: guestForm.dateOfBirth || null,
        });
      } else {
        const newGuestRes = await guestApi.create({
          firstName: guestForm.firstName,
          lastName: guestForm.lastName,
          identityNum: guestForm.identityNum,
          phone: guestForm.phone,
          dateOfBirth: guestForm.dateOfBirth || null,
        });
        const newGuest = newGuestRes.data?.data || newGuestRes.data || {};
        guestId = newGuest.id;
        if (guestId && user) {
          user.guestId = guestId;
          localStorage.setItem('userInfo', JSON.stringify(user));
        }
      }

      if (!guestId) {
        throw new Error('Không thể tạo hoặc xác định hồ sơ khách hàng.');
      }

      // Tạo đặt phòng (confirmHold)
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

  async function handleCancelBooking(resId: string) {
    const isConfirmed = await confirm({
      title: 'Hủy Đặt Phòng',
      message: 'Bạn có chắc chắn muốn hủy đặt phòng này?',
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.updateStatus(resId, { newStatus: 'CANCELLED', reason: 'Khách hàng tự hủy' });
      showToast('Đã hủy đặt phòng thành công!', 'success');
      await loadBookings();
    } catch (err: any) {
      showToast('Lỗi hủy đặt phòng: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleConfirmPayment(resId: string) {
    const isConfirmed = await confirm({
      title: 'Xác Nhận Thanh Toán',
      message: 'Xác nhận bạn đã thanh toán cho đặt phòng này?',
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.updateStatus(resId, { newStatus: 'CONFIRMED', reason: 'Khách hàng xác nhận thanh toán' });
      showToast('Xác nhận thanh toán thành công!', 'success');
      await loadBookings();
    } catch (err: any) {
      showToast('Lỗi xác nhận thanh toán: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  // Calculate total nights
  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const getSubtotal = () => {
    if (!selectedRoom) return 0;
    let price = selectedRoom.roomType.basePrice * getNights();
    if (includeBreakfast) price += 150000 * getNights();
    if (airportPickup) price += 350000;
    return price;
  };

  return (
    <CustomerLayout activeSection={section} onSectionChange={setSection}>
      {/* 1. Hero Section (Alternate band: Dark Canvas) */}
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

      {/* 2. Hotel Amenities & Features (Alternate band: White Canvas) */}
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

      {/* 3. Rooms Searching & Grid Section (Alternate band: Parchment Canvas) */}
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

            {/* Premium Date Search Bar */}
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
                <Button variant="primary" onClick={searchRooms} className="flex-1 lg:flex-none h-11 !px-8 font-semibold">
                  Tìm Phòng Trống
                </Button>
                {isSearching && (
                  <Button variant="pearl-capsule" onClick={() => { setIsSearching(false); loadRooms(); }} className="h-11">
                    Đặt Lại
                  </Button>
                )}
              </div>
            </div>

            {/* Room Cards Grid (Standard store card style) */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-apple-ink-muted-48">
                <div className="w-8 h-8 border-4 border-apple-divider-soft border-t-apple-primary rounded-full animate-spin-custom mb-3" />
                <span>Đang quét danh sách phòng trống...</span>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(section === 'home' ? rooms.slice(0, 6) : rooms).map((r) => (
                    <div
                      key={r.id}
                      className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col group"
                    >
                      {/* Room photography space */}
                      <div className="relative aspect-[16/10] bg-apple-surface-tile-1 flex items-center justify-center text-[72px] select-none text-white/10 group-hover:scale-102 transition-transform duration-300">
                        🏨
                        <div className="absolute top-4 left-4 bg-apple-surface-black/60 text-white text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-[2px]">
                          Phòng {r.roomNumber}
                        </div>
                      </div>
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="font-display font-semibold text-lg text-apple-ink tracking-apple-tight">
                              {r.roomType?.name || 'Standard Room'}
                            </h3>
                            <span className="text-[12px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold border border-green-100">
                              Có Sẵn
                            </span>
                          </div>
                          
                          <div className="text-[13px] text-apple-ink-muted-80 flex items-center gap-4 mb-4 select-none">
                            <span>👤 Tối đa: <strong>{r.roomType?.capacity || '?'} khách</strong></span>
                            <span className="text-apple-divider-soft">|</span>
                            <span>🏢 Vị trí: <strong>Tầng {r.floorNumber || '?'}</strong></span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-apple-divider-soft flex items-center justify-between">
                          <div>
                            <span className="text-xs text-apple-ink-muted-48 block">Giá mỗi đêm</span>
                            <span className="text-[17px] font-bold text-apple-ink font-display">
                              {formatVND(r.roomType?.basePrice)}
                              <span className="text-xs text-apple-ink-muted-48 font-normal">/đêm</span>
                            </span>
                          </div>
                          <Button variant="primary" onClick={() => handleOpenBooking(r)} className="!py-2 text-xs font-semibold">
                            Đặt Phòng
                          </Button>
                        </div>
                      </div>
                    </div>
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

      {/* 4. Local Ratings & Reviews Mock Section (Airbnb Style) */}
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

      {/* 5. Customer Booking History List */}
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

      {/* 6. Checkout Modal (Booking Info collection) */}
      {selectedRoom && (
        <div
          className="fixed inset-0 bg-apple-surface-black/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] p-4 transition-opacity duration-200"
          onClick={(e) => e.target === e.currentTarget && setSelectedRoom(null)}
        >
          <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden w-full max-w-[640px] flex flex-col max-h-[85vh] shadow-lg animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-apple-divider-soft select-none">
              <h3 className="font-display font-semibold text-lg text-apple-ink">Xác Nhận Đặt Phòng</h3>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-apple-ink-muted-80 hover:bg-apple-divider-soft transition-all active-scale"
                onClick={() => setSelectedRoom(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                
                {/* Select Room Summary Box */}
                <div className="bg-apple-canvas-parchment p-4 rounded-apple-md border border-apple-divider-soft flex flex-col gap-1.5 text-sm select-none">
                  <h4 className="font-semibold text-apple-ink mb-1">Thông tin phòng chọn:</h4>
                  <p>🏢 Phòng: <strong>{selectedRoom.roomNumber}</strong> ({selectedRoom.roomType?.name})</p>
                  <p>💵 Đơn giá: <strong>{formatVND(selectedRoom.roomType?.basePrice)}/đêm</strong></p>
                  <p>📅 Thời gian: <strong>{formatDate(checkIn)}</strong> đến <strong>{formatDate(checkOut)}</strong> ({getNights()} đêm)</p>
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
                  <h4 className="font-semibold text-apple-ink border-b border-apple-divider-soft pb-2 text-[15px] select-none">
                    Thông Tin Khách Lưu Trú:
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
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
                    <div className="flex flex-col gap-1.5">
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
                    <div className="flex flex-col gap-1.5">
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
                    <div className="flex flex-col gap-1.5">
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

                  <div className="flex flex-col gap-1.5">
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

              {/* 7. Persistent/Sticky Booking Summary Bar inside checkout */}
              <div className="px-6 py-4 border-t border-apple-divider-soft bg-apple-canvas-parchment flex items-center justify-between select-none">
                <div>
                  <span className="text-xs text-apple-ink-muted-48 block">Tổng cộng:</span>
                  <span className="text-lg font-bold text-apple-primary font-display">{formatVND(getSubtotal())}</span>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="pearl-capsule" onClick={() => setSelectedRoom(null)}>
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
      )}
    </CustomerLayout>
  );
}
