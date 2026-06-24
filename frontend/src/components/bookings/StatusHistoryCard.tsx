import { Clock } from 'lucide-react';
import { formatDateTime } from '@shared/utils/format';
import { RESERVATION_STATUS } from '@shared/constants/statusMaps';
import { StatusHistoryItem } from '../hooks/useBookingDetail';

interface StatusHistoryCardProps {
  statusHistory: StatusHistoryItem[];
}

export default function StatusHistoryCard({ statusHistory }: StatusHistoryCardProps) {
  return (
    <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline p-5 space-y-4 text-left">
      <div className="flex items-center gap-2 border-b border-apple-divider-soft pb-3">
        <Clock size={18} className="text-apple-ink-muted-48" />
        <h3 className="font-semibold text-[16px] text-apple-ink">Lịch Sử Trạng Thế</h3>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {statusHistory.length ? (
          [...statusHistory].reverse().map((h, i) => {
            const hSt = RESERVATION_STATUS[h.newStatus] || {
              label: h.newStatus,
              cls: 'bg-gray-100 text-gray-800',
            };
            return (
              <div key={i} className="py-2.5 border-b border-apple-divider-soft last:border-b-0 space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${hSt.cls}`}>
                    {hSt.label}
                  </span>
                  <span className="text-[11px] text-apple-ink-muted-48">{formatDateTime(h.updatedAt)}</span>
                </div>
                {h.reason && <p className="text-[12px] text-apple-ink-muted-80">Lý do: {h.reason}</p>}
                <p className="text-[11px] text-apple-ink-muted-48">Mã phòng: {h.roomId}</p>
              </div>
            );
          })
        ) : (
          <p className="text-apple-ink-muted-48 text-[13px] text-center py-4">Chưa có lịch sử</p>
        )}
      </div>
    </div>
  );
}
