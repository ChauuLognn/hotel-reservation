import React, { useState } from 'react';
import Button from '@shared/ui/Button';
import Modal from '@shared/ui/Modal';

interface AddGuestModalProps {
  open: boolean;
  onClose: () => void;
  allGuests: any[];
  onAddGuest: (guestId: number) => Promise<void>;
  onQuickGuest: (guestForm: any) => Promise<any>;
}

export default function AddGuestModal({
  open,
  onClose,
  allGuests,
  onAddGuest,
  onQuickGuest,
}: AddGuestModalProps) {
  const [showQuickGuest, setShowQuickGuest] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    identityNum: '',
  });

  const filteredAllGuests = allGuests.filter((g) => {
    const q = guestSearch.toLowerCase();
    return (
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) || (g.phone || '').includes(q)
    );
  });

  // Pre-select guest if search yields results and none is selected
  React.useEffect(() => {
    if (filteredAllGuests.length > 0) {
      setSelectedGuestId(String(filteredAllGuests[0].id));
    } else {
      setSelectedGuestId('');
    }
  }, [guestSearch, allGuests]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestId) return;
    try {
      await onAddGuest(Number(selectedGuestId));
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGuest = await onQuickGuest(guestForm);
      setSelectedGuestId(String(newGuest.id));
      setShowQuickGuest(false);
      setGuestForm({ firstName: '', lastName: '', phone: '', identityNum: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đăng Ký Khách Vào Phòng"
      footer={
        <div className="flex gap-2">
          <Button variant="pearl-capsule" onClick={onClose} type="button">
            Hủy
          </Button>
          {!showQuickGuest && (
            <Button variant="primary" onClick={handleRegisterSubmit} type="button" disabled={!selectedGuestId}>
              💾 Đăng Ký
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4 text-left">
        <div className="bg-apple-canvas-parchment border border-apple-divider-soft rounded-apple-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-apple-ink">Chọn Khách Hàng</label>
            <button
              type="button"
              className="inline-flex items-center px-2.5 py-1 bg-apple-primary/10 hover:bg-apple-primary/20 text-apple-primary text-[11px] font-semibold rounded active-scale transition-all"
              onClick={() => setShowQuickGuest(!showQuickGuest)}
            >
              {showQuickGuest ? 'Chọn Khách Có Sẵn' : 'Thêm Mới Khách'}
            </button>
          </div>

          {!showQuickGuest ? (
            <div className="space-y-3">
              <input
                type="text"
                className="w-full bg-apple-canvas text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3 py-2 focus:outline-none focus:border-apple-primary transition-all"
                placeholder="🔍 Tìm tên hoặc SĐT..."
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
              />
              <select
                className="w-full bg-apple-canvas text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all font-medium"
                required
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
              >
                {filteredAllGuests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.firstName} {g.lastName} - {g.phone || 'Không có SĐT'} ({g.identityNum || 'Không có CMND'})
                  </option>
                ))}
                {!filteredAllGuests.length && <option value="">-- Không tìm thấy khách --</option>}
              </select>
            </div>
          ) : (
            <form onSubmit={handleQuickGuestSubmit} className="bg-apple-canvas p-4 rounded border border-apple-divider-soft space-y-4">
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
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="pearl-capsule" type="button" onClick={() => setShowQuickGuest(false)} className="py-1 px-3 text-xs">
                  Hủy
                </Button>
                <Button variant="primary" type="submit" className="py-1 px-3 text-xs">
                  💾 Lưu Khách
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}
