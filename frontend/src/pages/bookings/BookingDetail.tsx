import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Layout from '@layouts/Layout';
import { formatDate, formatVND } from '@utils/format';
import { RESERVATION_STATUS } from '@constants/statusMaps';
import Button from '@components/ui/Button';

// Extracted Custom Hook & Components
import { useBookingDetail } from '@hooks/useBookingDetail';
import BillSummaryCard from '@components/bookings/BillSummaryCard';
import StatusHistoryCard from '@components/bookings/StatusHistoryCard';
import AddGuestModal from '@components/bookings/AddGuestModal';
import AddServiceModal from '@components/bookings/AddServiceModal';
import RoomStaySection from '@components/bookings/RoomStaySection';

export default function BookingDetail() {
  const { resId } = useParams<{ resId: string }>();
  const navigate = useNavigate();

  const {
    detail,
    statusHistory,
    bill,
    roomsList,
    servicesList,
    allGuests,
    resRooms,
    loading,
    changingStatus,
    roomDetailsMap,
    roomServicesMap,
    loadingRoomData,
    fetchAll,
    changeStatus,
    confirmPayment,
    confirmPaymentForRoom,
    fetchAllGuests,
    handleAddGuest,
    handleQuickGuest,
    handleCheckIn,
    handleCheckOut,
    handleAddService,
    handleDeleteService,
  } = useBookingDetail(resId);

  // Modals state management
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [activeResRoomId, setActiveResRoomId] = useState<number | null>(null);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    if (resId) {
      fetchAll(controller.signal);
    }
    return () => {
      controller.abort();
    };
  }, [resId]);

  if (loading) {
    return (
      <Layout title="Chi Tiết Đặt Phòng">
        <div className="flex justify-center items-center h-64 text-apple-ink-muted-48 gap-2">
          <span className="w-6 h-6 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
          Đang tải chi tiết đặt phòng...
        </div>
      </Layout>
    );
  }

  if (!detail || !resId) {
    return (
      <Layout title="Chi Tiết Đặt Phòng">
        <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline p-10 text-center">
          <p className="text-apple-ink-muted-48">Không tìm thấy đặt phòng #{resId}</p>
          <Button variant="primary" onClick={() => navigate('/bookings')} className="mt-4">
            Quay Lại Danh Sách
          </Button>
        </div>
      </Layout>
    );
  }

  const st = RESERVATION_STATUS[detail.overallRoomStatus || detail.status] || {
    label: detail.status,
    cls: 'bg-gray-100 text-gray-800',
  };

  const nextStatuses: Record<string, string[]> = {
    PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CANCELLED'],
    CANCELLED: [],
    PENDING_EXPIRED: [],
  };
  const availableStatuses = nextStatuses[detail.status] || [];

  const roomsLookup = roomsList.reduce<Record<number, any>>((acc, r) => {
    acc[r.id] = {
      ...r,
      roomNumber: r.roomNumber || String(r.id),
      roomTypeName: r.typeName,
      floorNumber: r.floorId || Math.floor(r.id / 100) || 1,
    };
    return acc;
  }, {});

  const handleOpenAddGuest = async (resRoomId: number) => {
    setActiveResRoomId(resRoomId);
    await fetchAllGuests();
    setShowAddGuestModal(true);
  };

  const handleOpenAddService = (resRoomId: number) => {
    setActiveResRoomId(resRoomId);
    setShowAddServiceModal(true);
  };

  return (
    <Layout title={`Chi Tiết Đặt Phòng: ${resId}`}>
      <Button variant="pearl-capsule" className="mb-6 py-2 px-4" onClick={() => navigate('/bookings')}>
        <ArrowLeft size={16} className="mr-1.5" /> Quay Lại
      </Button>

      {/* Header card info */}
      <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <h2 className="text-xl font-bold text-apple-ink">Đặt Phòng #{resId}</h2>
            <p className="text-[14px] text-apple-ink-muted-80">
              Khách hàng đặt: <strong className="font-semibold text-apple-ink">{detail.guestName || '-'}</strong>
            </p>
            <p className="text-[14px] text-apple-ink-muted-48">
              Thời gian lưu trú: <strong>{formatDate(detail.checkIn)}</strong> →{' '}
              <strong>{formatDate(detail.checkOut)}</strong>
            </p>
            {detail.note && (
              <p className="text-[13px] bg-apple-canvas-parchment text-apple-ink-muted-80 px-3 py-1.5 rounded border border-apple-divider-soft">
                Ghi chú: {detail.note}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3 text-right">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[14px] font-semibold ${st.cls}`}>
              {st.label}
            </span>

            {/* Action status change buttons */}
            {availableStatuses.length > 0 && (
              <div className="flex gap-2">
                {availableStatuses.map((s) => (
                  <button
                    key={s}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full active-scale transition-all ${
                      s === 'CANCELLED'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-apple-primary/10 text-apple-primary hover:bg-apple-primary/20'
                    }`}
                    onClick={() => changeStatus(s)}
                    disabled={changingStatus}
                  >
                    {RESERVATION_STATUS[s]?.label || s}
                  </button>
                ))}
              </div>
            )}

            {((detail.overallRoomStatus || detail.status) === 'CHECK_OUT' || detail.status === 'CONFIRMED') &&
              bill &&
              bill.totalDue > 0 && (
                <Button variant="primary" className="py-1.5 px-4 text-xs font-semibold" onClick={confirmPayment}>
                  <CheckCircle size={14} className="mr-1" /> Xác Nhận Thanh Toán Toàn Bộ
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Main grids: Room Detail, Stays, Services, Bills, Status History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Room list card detail stays & services */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-apple-ink text-left">🚪 Chi Tiết Phòng Lưu Trú & Dịch Vụ</h3>

          {resRooms.map((rr) => {
            const roomInfo = roomsLookup[rr.roomId] || {};
            const registeredGuests = roomDetailsMap[rr.id] || [];
            const usedServices = roomServicesMap[rr.id] || [];
            const isRoomLoading = loadingRoomData[rr.id];

            return (
              <RoomStaySection
                key={rr.id}
                bookingRoom={rr}
                roomInfo={roomInfo}
                overallStatus={detail.overallRoomStatus || detail.status}
                registeredGuests={registeredGuests}
                usedServices={usedServices}
                isRoomLoading={isRoomLoading}
                onOpenAddGuest={handleOpenAddGuest}
                onOpenAddService={handleOpenAddService}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onDeleteService={handleDeleteService}
              />
            );
          })}
        </div>

        {/* Right Side: Bill & Status History */}
        <div className="space-y-6">
          {bill && (
            <BillSummaryCard
              bill={bill}
              roomsLookup={roomsLookup}
              overallStatus={detail.overallRoomStatus || detail.status}
              confirmPaymentForRoom={confirmPaymentForRoom}
            />
          )}

          <StatusHistoryCard statusHistory={statusHistory} />
        </div>
      </div>

      {showAddGuestModal && activeResRoomId !== null && (
        <AddGuestModal
          open={showAddGuestModal}
          onClose={() => setShowAddGuestModal(false)}
          allGuests={allGuests}
          onAddGuest={(guestId) => handleAddGuest(activeResRoomId, guestId)}
          onQuickGuest={handleQuickGuest}
        />
      )}

      {showAddServiceModal && activeResRoomId !== null && (
        <AddServiceModal
          open={showAddServiceModal}
          onClose={() => setShowAddServiceModal(false)}
          servicesList={servicesList}
          onAddService={(serviceName, quantity) => handleAddService(activeResRoomId, serviceName, quantity)}
        />
      )}
    </Layout>
  );
}
