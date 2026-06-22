import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Eye, ArrowRight } from 'lucide-react';
import Layout from '@layout/Layout';
import reservationApi from '@features/reservations/api/reservationApi';
import billApi from '@features/billing/api/billApi';
import roomApi from '@features/rooms/api/roomApi';
import { formatVND, formatDate } from '@shared/utils/format';
import { RESERVATION_STATUS } from '@shared/constants/statusMaps';
import { useToast } from '@context/ToastContext';
import { useConfirm } from '@context/ConfirmContext';
import Button from '@shared/ui/Button';
import Modal from '@shared/ui/Modal';
import SearchBox from '@shared/ui/SearchBox';
import StatCard from '@shared/ui/StatCard';

interface RoomBillItem {
  reason: 'ROOM_CHARGE' | 'SERVICE' | 'REFUND' | string;
  status: 'PAID' | 'UNPAID' | string;
  totalAmount: number;
}

interface ResRoomBill {
  roomId: number;
  total: number;
  roomBills: RoomBillItem[];
}

interface ReservationBillSummary {
  reservationId: string;
  guestName: string;
  guestPhone?: string;
  guestIdentityNum?: string;
  checkIn?: string;
  checkOut?: string;
  total: number;
  totalPaid: number;
  totalDue: number;
  resRoomBill?: ResRoomBill[];
}

interface Booking {
  resId: string;
  guestName: string;
  status: string;
  total: number;
}

interface Room {
  id: number;
  roomNumber: string;
}

export default function Bills() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [billDetails, setBillDetails] = useState<Record<string, ReservationBillSummary>>({});
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [stats, setStats] = useState({ paidSum: 0, unpaidCount: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<ReservationBillSummary | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  async function fetchData(signal?: AbortSignal) {
    setLoading(true);
    try {
      const [resList, roomsRes, summariesRes] = await Promise.all([
        reservationApi.getAll(signal),
        roomApi.getAll(signal),
        billApi.getSummaries(signal),
      ]);
      const bookingsList = Array.isArray(resList.data) ? resList.data : [];
      setBookings(bookingsList);
      setRoomsList(
        Array.isArray(roomsRes.data)
          ? roomsRes.data.map((r: any) => ({ id: r.id, roomNumber: String(r.id) }))
          : []
      );

      const summariesData = Array.isArray(summariesRes.data) ? summariesRes.data : [];
      const summaries: Record<string, ReservationBillSummary> = {};
      let paidSum = 0;
      let unpaidCount = 0;

      summariesData.forEach((s: any) => {
        summaries[s.reservationId] = s;
        paidSum += Number(s.totalPaid || 0);
        if (Number(s.totalDue || 0) > 0) {
          unpaidCount++;
        }
      });

      setBillDetails(summaries);
      setStats({ paidSum, unpaidCount });
    } catch (e) {
      console.error(e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.resId || '').toLowerCase().includes(q) ||
      (b.guestName || '').toLowerCase().includes(q) ||
      (b.status || '').toLowerCase().includes(q)
    );
  });

  const roomsLookup = roomsList.reduce<Record<number, Room>>((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {});

  function openDetailModal(resId: string) {
    const billDetail = billDetails[resId];
    if (billDetail && billDetail.resRoomBill) {
      setSelectedBill(billDetail);
      setShowModal(true);
    } else {
      setLoading(true);
      billApi
        .getByResId(resId)
        .then((res) => {
          if (res.data) {
            setSelectedBill(res.data);
            setShowModal(true);
          } else {
            showToast('Không tìm thấy thông tin hóa đơn cho đặt phòng này.', 'error');
          }
        })
        .catch(() => showToast('Lỗi tải hóa đơn', 'error'))
        .finally(() => setLoading(false));
    }
  }

  async function handleConfirmPayment(resId: string) {
    const isConfirmed = await confirm({
      title: 'Thanh Toán Hóa Đơn',
      message: 'Xác nhận thanh toán cho toàn bộ đặt phòng này?',
    });
    if (!isConfirmed) return;
    try {
      await billApi.confirmPaidForRes(resId);
      showToast('Đã thanh toán hóa đơn thành công!', 'success');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showToast('Lỗi thanh toán: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  return (
    <Layout title="Quản Lý Hóa Đơn">
      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Tổng Số Hóa Đơn"
          value={bookings.length}
          icon={<DollarSign size={20} className="text-apple-primary" />}
        />
        <StatCard
          label="Doanh Thu Đã Thu"
          value={formatVND(stats.paidSum)}
          icon={<DollarSign size={20} className="text-green-600" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Số HĐ Chưa Thu"
          value={stats.unpaidCount}
          icon={<DollarSign size={20} className="text-amber-500" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Table Section */}
      <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline overflow-hidden">
        <div className="p-6 border-b border-apple-divider-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-apple-ink">Hóa Đơn Theo Phiếu Đặt Phòng</h3>
            <p className="text-[13px] text-apple-ink-muted-48">Xem và xử lý thanh toán các hóa đơn của khách</p>
          </div>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo mã đặt phòng, tên khách..."
            className="w-full sm:w-80"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl text-[13px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                <th className="px-6 py-4">Mã Đặt Phòng</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Tổng Cộng</th>
                <th className="px-6 py-4">Đã Thanh Toán</th>
                <th className="px-6 py-4">Chưa Thanh Toán</th>
                <th className="px-6 py-4">Trạng Thái Đặt</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-divider-soft text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-apple-ink-muted-48">
                    <div className="flex justify-center items-center gap-2">
                      <span className="w-5 h-5 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
                      Đang tải hóa đơn...
                    </div>
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((b) => {
                  const bDetail = billDetails[b.resId] || {};
                  const st = RESERVATION_STATUS[b.status] || {
                    label: b.status,
                    cls: 'bg-gray-100 text-gray-800',
                  };

                  const totalAmt = bDetail.total ?? b.total;
                  const totalPaid = bDetail.totalPaid ?? 0;
                  const totalDue = bDetail.totalDue ?? totalAmt;

                  return (
                    <tr key={b.resId} className="hover:bg-apple-surface-pearl/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-apple-primary font-mono">{b.resId}</td>
                      <td className="px-6 py-4 font-semibold text-apple-ink">{b.guestName || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-apple-ink">{formatVND(totalAmt)}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">{formatVND(totalPaid)}</td>
                      <td
                        className={`px-6 py-4 font-semibold ${
                          totalDue > 0 ? 'text-amber-500' : 'text-apple-ink-muted-48'
                        }`}
                      >
                        {formatVND(totalDue)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-1.5 rounded-full text-apple-primary hover:bg-apple-primary/10 transition-colors active-scale"
                            onClick={() => openDetailModal(b.resId)}
                            title="Xem chi tiết hóa đơn"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="p-1.5 rounded-full text-apple-ink-muted-80 hover:bg-apple-divider-soft transition-colors active-scale"
                            onClick={() => navigate(`/booking-detail/${b.resId}`)}
                            title="Tới chi tiết đặt phòng"
                          >
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-apple-ink-muted-48">
                    Không tìm thấy hóa đơn nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Invoice Detail Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={`Hóa Đơn Chi Tiết: ${selectedBill?.reservationId || ''}`}
        maxWidth="650px"
        footer={
          <>
            {selectedBill && selectedBill.totalDue > 0 && (
              <Button variant="primary" onClick={() => handleConfirmPayment(selectedBill.reservationId)}>
                💳 Xác Nhận Thanh Toán {formatVND(selectedBill.totalDue)}
              </Button>
            )}
            <Button variant="pearl-capsule" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
          </>
        }
      >
        {selectedBill && (
          <div className="space-y-6 text-left">
            <div className="bg-apple-canvas-parchment rounded-apple-sm p-4 text-[14px] leading-relaxed space-y-1.5 border border-apple-divider-soft">
              <p className="text-apple-ink">
                Khách hàng: <strong className="font-semibold">{selectedBill.guestName}</strong>
              </p>
              <p className="text-apple-ink">
                Số điện thoại: <strong className="font-semibold">{selectedBill.guestPhone || '-'}</strong> | CCCD:{' '}
                <strong className="font-semibold">{selectedBill.guestIdentityNum || '-'}</strong>
              </p>
              <p className="text-apple-ink">
                Thời gian: <strong className="font-semibold">{formatDate(selectedBill.checkIn)}</strong> →{' '}
                <strong className="font-semibold">{formatDate(selectedBill.checkOut)}</strong>
              </p>
            </div>

            <div>
              <h4 className="text-[14px] font-bold text-apple-primary uppercase tracking-wide mb-3">
                Danh Sách Khoản Phí Phòng
              </h4>
              <div className="overflow-hidden border border-apple-divider-soft rounded-apple-sm">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl font-semibold text-apple-ink-muted-48 uppercase">
                      <th className="px-4 py-2.5">Phòng</th>
                      <th className="px-4 py-2.5">Chi Tiết Khoản Phí</th>
                      <th className="px-4 py-2.5">Trạng Thái</th>
                      <th className="px-4 py-2.5 text-right">Số Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-apple-divider-soft">
                    {selectedBill.resRoomBill &&
                      selectedBill.resRoomBill.map((rb, i) => {
                        const roomInfo = roomsLookup[rb.roomId] || {};
                        return (
                          <React.Fragment key={i}>
                            <tr className="bg-apple-canvas-parchment/60 font-semibold">
                              <td className="px-4 py-2.5 text-apple-ink" colSpan={3}>
                                Phòng {roomInfo.roomNumber || rb.roomId}
                              </td>
                              <td className="px-4 py-2.5 text-right text-apple-ink">{formatVND(rb.total)}</td>
                            </tr>
                            {rb.roomBills &&
                              rb.roomBills.map((bItem, bIdx) => (
                                <tr key={`${i}-${bIdx}`} className="hover:bg-apple-surface-pearl/20">
                                  <td></td>
                                  <td className="px-4 py-2 text-apple-ink-muted-80">
                                    {bItem.reason === 'ROOM_CHARGE'
                                      ? 'Tiền Phòng'
                                      : bItem.reason === 'SERVICE'
                                      ? 'Tiền Dịch Vụ sử dụng'
                                      : 'Hoàn Tiền/Hủy'}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                        bItem.status === 'PAID'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {bItem.status === 'PAID' ? 'Đã thu' : 'Chưa thu'}
                                    </span>
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-right ${
                                      bItem.reason === 'REFUND' ? 'text-red-600' : 'text-apple-ink'
                                    }`}
                                  >
                                    {bItem.reason === 'REFUND' ? '-' : ''}
                                    {formatVND(bItem.totalAmount)}
                                  </td>
                                </tr>
                              ))}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-apple-divider-soft pt-4">
              <table className="w-full text-[14px]">
                <tbody className="space-y-1">
                  <tr>
                    <td className="py-1 text-apple-ink-muted-80 font-medium">Doanh Thu Đã Thu (Paid)</td>
                    <td className="py-1 text-right font-semibold text-green-600">{formatVND(selectedBill.totalPaid)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-apple-ink-muted-80 font-medium">Tiền Còn Nợ (Due)</td>
                    <td className="py-1 text-right font-semibold text-amber-500">{formatVND(selectedBill.totalDue)}</td>
                  </tr>
                  <tr className="border-t border-apple-hairline pt-2 text-[16px]">
                    <td className="py-3 font-bold text-apple-ink">Tổng Cộng Hóa Đơn (Grand Total)</td>
                    <td className="py-3 text-right font-bold text-apple-primary">{formatVND(selectedBill.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
