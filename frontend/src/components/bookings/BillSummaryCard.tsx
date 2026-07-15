import React from 'react';
import { DollarSign } from 'lucide-react';
import { formatVND } from '@utils/format';
import { BookingBill } from '@hooks/useBookingDetail';

interface BillSummaryCardProps {
  bill: BookingBill;
  roomsLookup: Record<number, any>;
  overallStatus: string;
  confirmPaymentForRoom: (resRoomId: number, roomNum: string | number) => void;
}

export default function BillSummaryCard({
  bill,
  roomsLookup,
  overallStatus,
  confirmPaymentForRoom,
}: BillSummaryCardProps) {
  return (
    <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline p-5 space-y-4 text-left">
      <div className="flex items-center gap-2 border-b border-apple-divider-soft pb-3">
        <DollarSign size={18} className="text-apple-primary" />
        <h3 className="font-semibold text-[16px] text-apple-ink">Hóa Đơn Tổng Hợp</h3>
      </div>
      <div className="space-y-4">
        <table className="w-full text-[13px] border-collapse">
          <tbody>
            {bill.resRoomBill &&
              bill.resRoomBill.map((rb, i) => {
                const roomInfo = roomsLookup[rb.roomId] || {};
                return (
                  <React.Fragment key={i}>
                    <tr className="border-b border-apple-divider-soft font-semibold bg-apple-surface-pearl/50">
                      <td className="py-2 px-2 text-apple-primary">Phòng {roomInfo.roomNumber || rb.roomId}</td>
                      <td className="py-2 px-2 text-right text-apple-ink">{formatVND(rb.total)}</td>
                    </tr>

                    {rb.roomBills &&
                      rb.roomBills.map((bItem, bIdx) => (
                        <tr key={`${i}-${bIdx}`} className="text-apple-ink-muted-80 text-[12px]">
                          <td className="py-1.5 pl-6">
                            •{' '}
                            {bItem.reason === 'ROOM_CHARGE'
                              ? 'Tiền Phòng'
                              : bItem.reason === 'SERVICE'
                              ? 'Dịch vụ đã dùng'
                              : 'Hoàn Tiền'}
                            <span
                              className={`inline-flex items-center px-1.5 py-0.25 rounded text-[9px] font-bold ml-2 ${
                                bItem.status === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {bItem.status === 'PAID' ? 'PAID' : 'UNPAID'}
                            </span>
                          </td>
                          <td className="py-1.5 pr-2 text-right font-mono">
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

        {/* Grand totals breakdown */}
        <div className="border-t border-apple-divider-soft pt-3 space-y-2 text-[13px]">
          <div className="flex justify-between font-medium text-green-600">
            <span>Đã Thanh Toán (Paid)</span>
            <span className="font-semibold">{formatVND(bill.totalPaid)}</span>
          </div>
          <div className="flex justify-between font-medium text-amber-500">
            <span>Chưa Thanh Toán (Due)</span>
            <span className="font-semibold">{formatVND(bill.totalDue)}</span>
          </div>
          <div className="flex justify-between border-t border-apple-hairline pt-2 text-[15px] font-bold text-apple-ink">
            <span>Tổng Cộng</span>
            <span className="text-apple-primary font-mono">{formatVND(bill.total)}</span>
          </div>
        </div>
      </div>

      {bill.resRoomBill &&
        bill.resRoomBill.map((rb) => {
          const roomInfo = roomsLookup[rb.roomId] || {};
          const hasDue = rb.roomBills?.some((b) => b.status === 'UNPAID');
          return (
            hasDue &&
            overallStatus === 'CHECK_OUT' && (
              <div className="flex justify-end pt-2 border-t border-apple-divider-soft/50" key={rb.resRoomId}>
                <button
                  type="button"
                  className="py-1 px-3 text-xs font-semibold rounded border border-apple-primary/40 bg-white text-apple-primary hover:bg-apple-primary/5 transition-all active-scale"
                  onClick={() => confirmPaymentForRoom(rb.resRoomId, roomInfo.roomNumber)}
                >
                  💳 Thanh Toán Riêng Phòng {roomInfo.roomNumber || rb.roomId}
                </button>
              </div>
            )
          );
        })}
    </div>
  );
}
