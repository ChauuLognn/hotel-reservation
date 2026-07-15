import React, { useState, useEffect } from 'react';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import { formatVND } from '@utils/format';
import { ServiceInfo } from '@hooks/useBookingDetail';

interface AddServiceModalProps {
  open: boolean;
  onClose: () => void;
  servicesList: ServiceInfo[];
  onAddService: (serviceName: string, quantity: number) => Promise<void>;
}

export default function AddServiceModal({
  open,
  onClose,
  servicesList,
  onAddService,
}: AddServiceModalProps) {
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [serviceQty, setServiceQty] = useState(1);

  const activeServices = servicesList.filter((s) => s.status === 'ACTIVE');

  useEffect(() => {
    if (activeServices.length > 0) {
      setSelectedServiceName(activeServices[0].serviceName);
    } else {
      setSelectedServiceName('');
    }
    setServiceQty(1);
  }, [servicesList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceName) return;
    if (serviceQty < 1 || serviceQty > 100) return;
    try {
      await onAddService(selectedServiceName, serviceQty);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm Dịch Vụ Vào Phòng"
      footer={
        <div className="flex gap-2">
          <Button variant="pearl-capsule" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} type="button" disabled={!selectedServiceName}>
            💾 Thêm Dịch Vụ
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-apple-ink-muted-80">Chọn Dịch Vụ *</label>
          <select
            className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all font-medium"
            value={selectedServiceName}
            onChange={(e) => setSelectedServiceName(e.target.value)}
            required
          >
            {activeServices.map((s) => (
              <option key={s.id} value={s.serviceName}>
                {s.serviceName} - {formatVND(s.price)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-apple-ink-muted-80">Số Lượng *</label>
          <input
            type="number"
            min="1"
            max="100"
            className="w-full bg-apple-canvas-parchment text-apple-ink text-[14px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all font-semibold"
            required
            value={serviceQty}
            onChange={(e) => setServiceQty(Number(e.target.value))}
          />
        </div>
      </form>
    </Modal>
  );
}
