import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, Plus, Trash2, UserPlus } from 'lucide-react';
import Layout from '@layouts/Layout';
import reservationApi from '@services/reservationApi';
import guestApi from '@services/guestApi';
import roomApi from '@services/roomApi';
import { formatVND, formatDate } from '@utils/format';
import { RESERVATION_STATUS } from '@constants/statusMaps';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import SearchBox from '@components/ui/SearchBox';
import StatCard from '@components/ui/StatCard';

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  identityNum?: string;
}

interface RoomType {
  id?: number;
  name: string;
  basePrice: number;
}

interface Reservation {
  id: number;
  resId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  total: number;
  status: string;
  overallRoomStatus?: string;
}

interface BookingItem {
  roomName: string;
  rooms: number;
  checkIn: string;
  checkOut: string;
}

export default function Reservations() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Booking Modal states
  const [showModal, setShowModal] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([
    { roomName: '', rooms: 1, checkIn: '', checkOut: '' },
  ]);
  const [guestSearch, setGuestSearch] = useState('');

  // Quick guest creation inside modal
  const [showQuickGuest, setShowQuickGuest] = useState(false);
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    identityNum: '',
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    setLoading(true);
    try {
      const res = await reservationApi.getAll();
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Lỗi tải đặt phòng:', e);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadModalData() {
    try {
      const [gRes, rtRes] = await Promise.all([guestApi.getAll(), roomApi.getAllTypes()]);
      setGuests(Array.isArray(gRes.data) ? gRes.data : []);
      setRoomTypes(Array.isArray(rtRes.data) ? rtRes.data : []);
      if (gRes.data?.length > 0) setSelectedGuestId(String(gRes.data[0].id));
      if (rtRes.data?.length > 0) {
        setBookingItems([{ roomName: rtRes.data[0].name, rooms: 1, checkIn: '', checkOut: '' }]);
      }
    } catch (err) {
      console.error('Lỗi tải thông tin modal:', err);
    }
  }

  function handleOpenModal() {
    loadModalData();
    setShowModal(true);
  }

  function handleAddItem() {
    const defaultTypeName = roomTypes[0]?.name || '';
    setBookingItems([...bookingItems, { roomName: defaultTypeName, rooms: 1, checkIn: '', checkOut: '' }]);
  }

  function handleRemoveItem(idx: number) {
    if (bookingItems.length === 1) return;
    setBookingItems(bookingItems.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof BookingItem, val: string | number) {
    const updated = [...bookingItems];
    updated[idx] = {
      ...updated[idx],
      [field]: val,
    };
    setBookingItems(updated);
  }

  async function handleQuickGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await guestApi.create(guestForm);
      const newGuest = res.data;
      showToast(`Đã thêm khách hàng: ${newGuest.firstName} ${newGuest.lastName}`, 'success');

      // Reload guests list and select the newly created guest
      const gList = await guestApi.getAll();
      setGuests(Array.isArray(gList.data) ? gList.data : []);
      setSelectedGuestId(String(newGuest.id));

      setShowQuickGuest(false);
      setGuestForm({ firstName: '', lastName: '', phone: '', identityNum: '' });
    } catch (err: any) {
      showToast('Lỗi thêm khách: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGuestId) {
      showToast('Vui lòng chọn khách hàng!', 'error');
      return;
    }

    // Validate items
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < bookingItems.length; i++) {
      const item = bookingItems[i];
      if (!item.roomName) {
        showToast('Vui lòng chọn loại phòng!', 'error');
        return;
      }
      if (!item.checkIn || !item.checkOut) {
        showToast('Vui lòng chọn ngày nhận/trả phòng!', 'error');
        return;
      }

      const checkInDate = new Date(item.checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        showToast('Ngày nhận phòng không thể ở trong quá khứ!', 'error');
        return;
      }

      if (new Date(item.checkOut) <= new Date(item.checkIn)) {
        showToast('Ngày trả phòng phải sau ngày nhận phòng!', 'error');
        return;
      }
    }

    try {
      const payload = {
        guestId: Number(selectedGuestId),
        items: bookingItems.map((it) => ({
          roomName: it.roomName,
          rooms: Number(it.rooms),
          checkIn: it.checkIn,
          checkOut: it.checkOut,
        })),
      };

      const res = await reservationApi.create(payload);
      const resData = res.data;
      showToast(`Tạo đặt giữ chỗ thành công! Mã: ${resData.resId}`, 'success');
      setShowModal(false);
      navigate(`/booking-detail/${resData.resId}`);
    } catch (err: any) {
      showToast('Lỗi tạo đặt phòng: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.resId || '').toLowerCase().includes(q) ||
      (r.guestName || '').toLowerCase().includes(q) ||
      String(r.id || '').includes(q);
    const matchStatus = !statusFilter || (r.overallRoomStatus || r.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const statCounts = Object.keys(RESERVATION_STATUS).reduce<Record<string, number>>((acc, k) => {
    acc[k] = reservations.filter((r) => (r.overallRoomStatus || r.status) === k).length;
    return acc;
  }, {});

  const filteredGuests = guests.filter((g) => {
    const q = guestSearch.toLowerCase();
    return `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) || (g.phone || '').includes(q);
  });

  return (
    <Layout title="Quản Lý Đặt Phòng">
      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard
          label="Tổng Đặt Phòng"
          value={reservations.length}
          icon={<Calendar size={18} className="text-apple-primary" />}
        />
        <StatCard
          label="Chờ TT"
          value={statCounts.PENDING_PAYMENT || 0}
          icon={<Calendar size={18} className="text-amber-500" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Xác Nhận"
          value={statCounts.CONFIRMED || 0}
          icon={<Calendar size={18} className="text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Đang Ở"
          value={statCounts.CHECK_IN || 0}
          icon={<Calendar size={18} className="text-green-600" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Đã Hủy"
          value={statCounts.CANCELLED || 0}
          icon={<Calendar size={18} className="text-red-500" />}
          iconBg="bg-red-50"
        />
      </div>

      {/* Table Section */}
      <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-apple-divider-soft flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-apple-ink">Danh Sách Đặt Phòng</h3>
            <p className="text-[13px] text-apple-ink-muted-48">Quản lý và thực hiện thủ tục lưu trú cho khách</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="bg-apple-canvas text-apple-ink text-[14px] hairline-border rounded-full px-4 h-11 focus:outline-none focus:border-apple-primary transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(RESERVATION_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Tìm kiếm đặt phòng..."
              className="w-full sm:w-64"
            />
            <Button variant="primary" onClick={handleOpenModal}>
              <Plus size={16} className="mr-1.5" /> Đặt Phòng Mới
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl text-[13px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                <th className="px-6 py-4">Mã Đặt</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Check-out</th>
                <th className="px-6 py-4">Tổng Tiền</th>
                <th className="px-6 py-4">Trạng Trạng</th>
                <th className="px-6 py-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-divider-soft text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-apple-ink-muted-48">
                    <div className="flex justify-center items-center gap-2">
                      <span className="w-5 h-5 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((r) => {
                  const st = RESERVATION_STATUS[r.overallRoomStatus || r.status] || {
                    label: r.status,
                    cls: 'bg-gray-100 text-gray-800',
                  };
                  return (
                    <tr key={r.resId || r.id} className="hover:bg-apple-surface-pearl/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-apple-primary font-mono">{r.resId}</td>
                      <td className="px-6 py-4 font-semibold text-apple-ink">{r.guestName || '-'}</td>
                      <td className="px-6 py-4 text-apple-ink-muted-80">{formatDate(r.checkIn)}</td>
                      <td className="px-6 py-4 text-apple-ink-muted-80">{formatDate(r.checkOut)}</td>
                      <td className="px-6 py-4 font-semibold text-apple-ink">{formatVND(r.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="p-1.5 rounded-full text-apple-primary hover:bg-apple-primary/10 transition-colors active-scale"
                          onClick={() => navigate(`/booking-detail/${r.resId}`)}
                          title="Xem chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-apple-ink-muted-48">
                    {search || statusFilter ? 'Không tìm thấy kết quả' : 'Chưa có đặt phòng nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Booking Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Đặt Phòng Khách Sạn"
        maxWidth="750px"
        footer={
          <>
            <Button variant="pearl-capsule" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="bookingFormElement">
              💾 Tạo Đặt Phòng
            </Button>
          </>
        }
      >
        <form id="bookingFormElement" onSubmit={handleCreateBooking} className="space-y-6 text-left">
          {/* Guest selection & search */}
          <div className="bg-apple-canvas-parchment border border-apple-divider-soft rounded-apple-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[14px] font-bold text-apple-ink">Khách Hàng Đặt *</label>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 bg-apple-primary/10 hover:bg-apple-primary/20 text-apple-primary text-[12px] font-medium rounded-full active-scale transition-all"
                onClick={() => setShowQuickGuest(!showQuickGuest)}
              >
                <UserPlus size={12} className="mr-1" />
                {showQuickGuest ? 'Chọn Khách Có Sẵn' : 'Thêm Khách Mới Nhanh'}
              </button>
            </div>

            {!showQuickGuest ? (
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-2 focus:outline-none focus:border-apple-primary transition-all"
                  placeholder="🔍 Gõ tìm tên hoặc SĐT khách..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                />
                <select
                  className="w-full bg-apple-canvas text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                  required
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                >
                  {filteredGuests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.firstName} {g.lastName} - {g.phone || 'Không có SĐT'} ({g.identityNum || 'Không có CMND'})
                    </option>
                  ))}
                  {!filteredGuests.length && <option value="">-- Không tìm thấy khách --</option>}
                </select>
              </div>
            ) : (
              <div className="bg-apple-canvas p-4 rounded-apple-sm border border-apple-divider-soft space-y-4">
                <h4 className="text-[13px] font-bold text-apple-primary uppercase tracking-wide">
                  Đăng Ký Khách Hàng Mới
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-apple-ink-muted-80">Họ *</label>
                    <input
                      className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                      required
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                      placeholder="Nguyễn"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-apple-ink-muted-80">Tên *</label>
                    <input
                      className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                      required
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                      placeholder="Văn A"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-apple-ink-muted-80">Điện Thoại *</label>
                    <input
                      className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                      required
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                      placeholder="0912345678"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-apple-ink-muted-80">CMND/CCCD *</label>
                    <input
                      className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                      required
                      value={guestForm.identityNum}
                      onChange={(e) => setGuestForm({ ...guestForm, identityNum: e.target.value })}
                      placeholder="12 chữ số"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="pearl-capsule" type="button" onClick={() => setShowQuickGuest(false)} className="py-1 px-3 text-xs">
                    Hủy
                  </Button>
                  <Button variant="primary" type="button" onClick={handleQuickGuestSubmit} className="py-1 px-3 text-xs">
                    💾 Lưu Khách
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Booking list items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[14px] font-bold text-apple-ink">Danh Sách Phòng Đặt *</label>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 bg-apple-primary text-white text-[12px] font-medium rounded-full active-scale transition-all"
                onClick={handleAddItem}
              >
                <Plus size={14} className="mr-1" /> Thêm Phòng
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {bookingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-apple-canvas border border-apple-divider-soft rounded-apple-sm p-4 relative space-y-3"
                >
                  {bookingItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 active-scale transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-apple-ink-muted-80">Hạng Phòng *</label>
                      <select
                        className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                        value={item.roomName}
                        onChange={(e) => updateItem(idx, 'roomName', e.target.value)}
                        required
                      >
                        {roomTypes.map((rt) => (
                          <option key={rt.name} value={rt.name}>
                            {rt.name} - {formatVND(rt.basePrice)}/đêm
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-apple-ink-muted-80">Số Lượng Phòng *</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                        required
                        value={item.rooms}
                        onChange={(e) => updateItem(idx, 'rooms', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-apple-ink-muted-80">Ngày Check-in *</label>
                      <input
                        type="date"
                        className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                        required
                        value={item.checkIn}
                        onChange={(e) => updateItem(idx, 'checkIn', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-apple-ink-muted-80">Ngày Check-out *</label>
                      <input
                        type="date"
                        className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-1.5 focus:outline-none focus:border-apple-primary transition-all"
                        required
                        value={item.checkOut}
                        onChange={(e) => updateItem(idx, 'checkOut', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
