import { Room } from '@hooks/useRoomSearch';
import Button from '@components/ui/Button';
import { formatVND } from '@utils/format';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export default function RoomCard({ room, onBook }: RoomCardProps) {
  return (
    <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Room photography space */}
      <div className="relative aspect-[16/10] bg-apple-surface-tile-1 flex items-center justify-center text-[72px] select-none text-white/10 group-hover:scale-102 transition-transform duration-300">
        🏨
        <div className="absolute top-4 left-4 bg-apple-surface-black/60 text-white text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-[2px]">
          Phòng {room.roomNumber}
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-display font-semibold text-lg text-apple-ink tracking-apple-tight">
              {room.roomType?.name || 'Standard Room'}
            </h3>
            <span className="text-[12px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold border border-green-100">
              Có Sẵn
            </span>
          </div>

          <div className="text-[13px] text-apple-ink-muted-80 flex items-center gap-4 mb-4 select-none">
            <span>
              👤 Tối đa: <strong>{room.roomType?.capacity || '?'} khách</strong>
            </span>
            <span className="text-apple-divider-soft">|</span>
            <span>
              🏢 Vị trí: <strong>Tầng {room.floorNumber || '?'}</strong>
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-apple-divider-soft flex items-center justify-between">
          <div>
            <span className="text-xs text-apple-ink-muted-48 block">Giá mỗi đêm</span>
            <span className="text-[17px] font-bold text-apple-ink font-display">
              {formatVND(room.roomType?.basePrice)}
              <span className="text-xs text-apple-ink-muted-48 font-normal">/đêm</span>
            </span>
          </div>
          <Button variant="primary" onClick={() => onBook(room)} className="!py-2 text-xs font-semibold">
            Đặt Phòng
          </Button>
        </div>
      </div>
    </div>
  );
}
