import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { formatDate } from '@shared/utils/format';
import { RESERVATION_STATUS } from '@shared/constants/statusMaps';
import Layout from '@layout/Layout';
import reservationApi from '@features/reservations/api/reservationApi';
import SearchBox from '@shared/ui/SearchBox';

interface RegisteredGuest {
  guestName: string;
  roomNumber: number;
  identityNum?: string;
  checkInAt?: string;
  checkOutAt?: string;
}

interface BookingSummary {
  id: number;
  resId: string;
  guestName: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  status: string;
  overallRoomStatus?: string;
}

export default function ReservationGuests() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedResId, setExpandedResId] = useState<string | null>(null);
  const [expandedGuests, setExpandedGuests] = useState<Record<string, RegisteredGuest[]>>({});
  const [loadingGuests, setLoadingGuests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await reservationApi.getAll();
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(resId: string) {
    if (expandedResId === resId) {
      setExpandedResId(null);
      return;
    }
    setExpandedResId(resId);

    // Check if guests already loaded for this reservation
    if (expandedGuests[resId]) return;

    setLoadingGuests((prev) => ({ ...prev, [resId]: true }));
    try {
      // Fetch rooms of reservation
      const roomsRes = await reservationApi.getRoomsByResId(resId);
      const roomsList = roomsRes.data || [];

      // Fetch guests for each room in parallel
      const guestsByRoom = await Promise.all(
        roomsList.map(async (room: any) => {
          const gRes = await reservationApi.getGuestsByResRoom(room.id);
          return (gRes.data || []).map((g: any) => ({
            ...g,
            roomNumber: room.roomId, // room.roomId contains the room number (int)
          }));
        })
      );

      const flatGuests: RegisteredGuest[] = guestsByRoom.flat();
      setExpandedGuests((prev) => ({ ...prev, [resId]: flatGuests }));
    } catch (err) {
      console.error('Lỗi tải danh sách khách lưu trú:', err);
    } finally {
      setLoadingGuests((prev) => ({ ...prev, [resId]: false }));
    }
  }

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.resId || '').toLowerCase().includes(q) ||
      (b.guestName || '').toLowerCase().includes(q) ||
      (b.guestPhone || '').includes(q)
    );
  });

  return (
    <Layout title="Quản Lý Đặt Chỗ">
      {/* Table Section */}
      <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline overflow-hidden">
        <div className="p-6 border-b border-apple-divider-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-apple-ink">Danh Sách Khách Trong Đặt Phòng</h3>
            <p className="text-[13px] text-apple-ink-muted-48">Xem chi tiết khách ở từng phòng theo phiếu đặt</p>
          </div>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo mã đặt, tên khách..."
            className="w-full sm:w-80"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl text-[13px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                <th className="w-12 px-6 py-4"></th>
                <th className="px-6 py-4">Mã Đặt</th>
                <th className="px-6 py-4">Khách Đặt Chính</th>
                <th className="px-6 py-4">SĐT</th>
                <th className="px-6 py-4">Ngày Nhận</th>
                <th className="px-6 py-4">Ngày Trả</th>
                <th className="px-6 py-4">Trạng Thái</th>
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
                filtered.map((b) => {
                  const isExpanded = expandedResId === b.resId;
                  const st = RESERVATION_STATUS[b.overallRoomStatus || b.status] || {
                    label: b.status || '-',
                    cls: 'bg-gray-100 text-gray-800',
                  };
                  const guestsList = expandedGuests[b.resId] || [];
                  const isLoadingG = loadingGuests[b.resId];

                  return (
                    <React.Fragment key={b.resId}>
                      <tr
                        className="hover:bg-apple-surface-pearl/40 transition-colors cursor-pointer select-none"
                        onClick={() => toggleExpand(b.resId)}
                      >
                        <td className="px-6 py-4 text-center">
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-apple-ink-muted-48" />
                          ) : (
                            <ChevronDown size={16} className="text-apple-ink-muted-48" />
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-apple-primary font-mono">{b.resId}</td>
                        <td className="px-6 py-4 font-semibold text-apple-ink">{b.guestName}</td>
                        <td className="px-6 py-4 text-apple-ink-muted-80">{b.guestPhone || '-'}</td>
                        <td className="px-6 py-4 text-apple-ink-muted-80">{formatDate(b.checkIn)}</td>
                        <td className="px-6 py-4 text-apple-ink-muted-80">{formatDate(b.checkOut)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-apple-canvas-parchment">
                          <td colSpan={7} className="px-8 py-5 border-l-4 border-apple-primary">
                            <div className="space-y-3">
                              <h4 className="text-[14px] font-bold text-apple-ink uppercase tracking-wide">
                                Chi Tiết Khách Lưu Trú Cho Từng Phòng
                              </h4>

                              {isLoadingG ? (
                                <p className="text-[13px] text-apple-ink-muted-48 flex items-center gap-1.5">
                                  <span className="w-4 h-4 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
                                  Đang tải danh sách khách...
                                </p>
                              ) : guestsList.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {guestsList.map((g, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-apple-canvas border border-apple-divider-soft rounded-apple-sm p-4 flex items-center gap-3.5"
                                    >
                                      <div className="bg-apple-primary/10 w-9 h-9 rounded-full flex items-center justify-center text-apple-primary">
                                        <User size={18} />
                                      </div>
                                      <div className="text-[13px] leading-snug space-y-0.5">
                                        <div className="font-bold text-apple-ink">{g.guestName}</div>
                                        <div className="text-apple-ink-muted-48">
                                          Phòng {g.roomNumber} | CCCD: {g.identityNum || '-'}
                                        </div>
                                        {g.checkInAt && (
                                          <div className="text-green-600 text-[11px] font-semibold">
                                            Check-in: {new Date(g.checkInAt).toLocaleString('vi-VN')}
                                          </div>
                                        )}
                                        {g.checkOutAt && (
                                          <div className="text-apple-ink-muted-48 text-[11px]">
                                            Check-out: {new Date(g.checkOutAt).toLocaleString('vi-VN')}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[13px] text-red-500 font-medium">
                                  Chưa có khách nào được đăng ký lưu trú trong các phòng.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-apple-ink-muted-48">
                    Không tìm thấy dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
