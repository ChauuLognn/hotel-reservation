import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Coffee } from 'lucide-react';
import Layout from '@layout/Layout';
import serviceApi from '@features/services/api/serviceApi';
import { formatVND } from '@shared/utils/format';
import { useToast } from '@context/ToastContext';
import { useConfirm } from '@context/ConfirmContext';
import Button from '@shared/ui/Button';
import SearchBox from '@shared/ui/SearchBox';
import Modal from '@shared/ui/Modal';
import StatCard from '@shared/ui/StatCard';

interface ServiceItem {
  name: string;
  serviceName: string;
  price: number;
  status: string;
}

export default function Services() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editSvc, setEditSvc] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState({ serviceName: '', price: '', status: 'ACTIVE' });

  useEffect(() => {
    const controller = new AbortController();
    fetchServices(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  async function fetchServices(signal?: AbortSignal) {
    setLoading(true);
    try {
      const res = await serviceApi.getAll(signal);
      const rawServices = Array.isArray(res.data) ? res.data : [];
      const mapped = rawServices.map((s: any) => ({
        name: s.name,
        serviceName: s.name,
        price: s.price,
        status: s.status,
      }));
      setServices(mapped);
    } catch (e: any) {
      if (e.name === 'CanceledError' || e.name === 'AbortError') return;
      console.error(e);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    return s.serviceName.toLowerCase().includes(q) || s.status.toLowerCase().includes(q);
  });

  function openAdd() {
    setEditSvc(null);
    setForm({ serviceName: '', price: '', status: 'ACTIVE' });
    setShowModal(true);
  }

  function openEdit(s: ServiceItem) {
    setEditSvc(s);
    setForm({ serviceName: s.serviceName, price: String(s.price), status: s.status || 'ACTIVE' });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: form.serviceName,
        price: Number(form.price),
        status: form.status,
      };
      if (editSvc) {
        await serviceApi.update(editSvc.serviceName, payload);
        showToast('Đã cập nhật dịch vụ!', 'success');
      } else {
        await serviceApi.create(payload);
        showToast('Đã thêm dịch vụ mới!', 'success');
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleDelete(name: string) {
    const isConfirmed = await confirm({
      title: 'Xóa Dịch Vụ',
      message: `Bạn có chắc chắn muốn xóa dịch vụ "${name}"?`,
    });
    if (!isConfirmed) return;
    try {
      await serviceApi.delete(name);
      showToast('Đã xóa dịch vụ thành công!', 'success');
      fetchServices();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  const avgPrice = services.length ? services.reduce((s, v) => s + (v.price || 0), 0) / services.length : 0;

  return (
    <Layout title="Quản Lý Dịch Vụ">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <StatCard
          label="Tổng Số Dịch Vụ"
          value={services.length}
          icon={<Coffee size={20} />}
          iconBg="bg-blue-50 text-blue-600 border border-blue-100"
        />
        <StatCard
          label="Giá Dịch Vụ Trung Bình"
          value={formatVND(avgPrice)}
          icon={<Coffee size={20} />}
          iconBg="bg-green-50 text-green-600 border border-green-100"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-apple-divider-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
          <h3 className="font-display font-semibold text-[16px] text-apple-ink">Danh Sách Dịch Vụ</h3>
          <div className="flex gap-3 w-full sm:w-auto">
            <SearchBox value={search} onChange={setSearch} placeholder="Tìm dịch vụ..." className="flex-grow sm:flex-grow-0" />
            <Button variant="primary" onClick={openAdd} className="flex-shrink-0 flex items-center gap-1.5 h-11 text-sm font-semibold">
              <Plus size={16} /> Thêm Dịch Vụ
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-apple-surface-pearl border-b border-apple-divider-soft text-[11px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                <th className="px-6 py-3">Tên Dịch Vụ</th>
                <th className="px-6 py-3">Giá Dịch Vụ</th>
                <th className="px-6 py-3">Trạng Thái</th>
                <th className="px-6 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-divider-soft text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-apple-ink-muted-48">
                    Đang tải danh sách dịch vụ...
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((s, i) => (
                  <tr key={i} className="hover:bg-apple-surface-pearl/40">
                    <td className="px-6 py-3.5 font-semibold text-apple-ink">{s.serviceName}</td>
                    <td className="px-6 py-3.5 font-bold text-apple-primary">{formatVND(s.price)}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          s.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {s.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-apple-primary/10 hover:text-apple-primary text-apple-ink-muted-80 transition-colors active-scale"
                          onClick={() => openEdit(s)}
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-apple-ink-muted-80 transition-colors active-scale"
                          onClick={() => handleDelete(s.serviceName)}
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-apple-ink-muted-48">
                    {search ? 'Không tìm thấy dịch vụ khớp từ khóa.' : 'Chưa có thông tin dịch vụ.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editSvc ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
        footer={
          <div className="flex gap-2.5">
            <Button variant="pearl-capsule" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Lưu dịch vụ
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Tên Dịch Vụ *</label>
            <input
              className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium disabled:opacity-50"
              required
              value={form.serviceName}
              onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
              placeholder="Ví dụ: Giặt ủi"
              disabled={!!editSvc}
            />
            {editSvc && <small className="text-[11px] text-apple-ink-muted-48">Tên dịch vụ không thể thay đổi</small>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Đơn Giá (VNĐ) *</label>
            <input
              type="number"
              className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
              required
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Ví dụ: 50000"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Trạng Thái Hoạt Động</label>
            <select
              className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="STOP">STOP</option>
            </select>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
