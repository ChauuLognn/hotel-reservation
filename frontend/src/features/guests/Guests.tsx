import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import Layout from '@layout/Layout';
import guestApi from './api/guestApi';
import { useToast } from '@context/ToastContext';
import { useConfirm } from '@context/ConfirmContext';
import Button from '@shared/ui/Button';
import SearchBox from '@shared/ui/SearchBox';
import Modal from '@shared/ui/Modal';
import StatCard from '@shared/ui/StatCard';

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  identityNum: string;
  dateOfBirth: string;
  createdAt?: string;
}

export default function Guests() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', identityNum: '', dateOfBirth: '' });

  useEffect(() => {
    fetchGuests();
  }, []);

  async function fetchGuests() {
    setLoading(true);
    try {
      const res = await guestApi.getAll();
      setGuests(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Lỗi tải khách:', e);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = guests.filter((g) => {
    const q = search.toLowerCase();
    return (
      ((g.firstName || '') + (g.lastName || '')).toLowerCase().includes(q) ||
      (g.phone || '').toLowerCase().includes(q) ||
      (g.identityNum || '').toLowerCase().includes(q) ||
      (g.dateOfBirth || '').toLowerCase().includes(q)
    );
  });

  function openAdd() {
    setEditGuest(null);
    setForm({ firstName: '', lastName: '', phone: '', identityNum: '', dateOfBirth: '' });
    setShowModal(true);
  }

  function openEdit(g: Guest) {
    setEditGuest(g);
    setForm({
      firstName: g.firstName || '',
      lastName: g.lastName || '',
      phone: g.phone || '',
      identityNum: g.identityNum || '',
      dateOfBirth: g.dateOfBirth || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      dateOfBirth: form.dateOfBirth || null,
    };
    try {
      if (editGuest) {
        await guestApi.update(editGuest.id, payload);
        showToast('Đã cập nhật thông tin khách hàng!', 'success');
      } else {
        await guestApi.create(payload);
        showToast('Đã thêm khách hàng mới!', 'success');
      }
      setShowModal(false);
      fetchGuests();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleDelete(id: number) {
    const isConfirmed = await confirm({
      title: 'Xóa Khách Hàng',
      message: 'Bạn có chắc chắn muốn xóa khách hàng này?',
    });
    if (!isConfirmed) return;
    try {
      await guestApi.delete(id);
      showToast('Đã xóa khách hàng thành công!', 'success');
      fetchGuests();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  return (
    <Layout title="Quản Lý Khách Hàng">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <StatCard
          label="Tổng Số Khách Hàng"
          value={guests.length}
          icon={<Users size={20} />}
          iconBg="bg-blue-50 text-blue-600 border border-blue-100"
        />
        <StatCard
          label="Khách Mới Trong Tháng"
          value={
            guests.filter((g) => {
              const dateStr = g.createdAt || new Date().toISOString();
              return new Date(dateStr).getMonth() === new Date().getMonth();
            }).length
          }
          icon={<Users size={20} />}
          iconBg="bg-green-50 text-green-600 border border-green-100"
        />
      </div>

      {/* Main Guest Table Card */}
      <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-apple-divider-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
          <h3 className="font-display font-semibold text-[16px] text-apple-ink">Danh Sách Khách Hàng</h3>
          <div className="flex gap-3 w-full sm:w-auto">
            <SearchBox value={search} onChange={setSearch} placeholder="Tìm khách hàng..." className="flex-grow sm:flex-grow-0" />
            <Button variant="primary" onClick={openAdd} className="flex-shrink-0 flex items-center gap-1.5 h-11 text-sm font-semibold">
              <Plus size={16} /> Thêm Khách
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-apple-surface-pearl border-b border-apple-divider-soft text-[11px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Họ Tên</th>
                <th className="px-6 py-3">Điện Thoại</th>
                <th className="px-6 py-3">CMND/CCCD</th>
                <th className="px-6 py-3">Ngày Sinh</th>
                <th className="px-6 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-divider-soft text-[14px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-apple-ink-muted-48">
                    Đang tải dữ liệu hồ sơ khách hàng...
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-apple-surface-pearl/40">
                    <td className="px-6 py-3.5 text-xs font-mono text-apple-ink-muted-48">#{g.id}</td>
                    <td className="px-6 py-3.5 font-semibold text-apple-ink">{g.firstName} {g.lastName}</td>
                    <td className="px-6 py-3.5">{g.phone || '-'}</td>
                    <td className="px-6 py-3.5">{g.identityNum || '-'}</td>
                    <td className="px-6 py-3.5">{g.dateOfBirth || '-'}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-apple-primary/10 hover:text-apple-primary text-apple-ink-muted-80 transition-colors active-scale"
                          onClick={() => openEdit(g)}
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-apple-ink-muted-80 transition-colors active-scale"
                          onClick={() => handleDelete(g.id)}
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
                  <td colSpan={6} className="text-center py-10 text-apple-ink-muted-48">
                    {search ? 'Không tìm thấy khách hàng khớp từ khóa.' : 'Chưa có thông tin khách hàng.'}
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
        title={editGuest ? 'Chỉnh Sửa Hồ Sơ Khách' : 'Thêm Khách Hàng Mới'}
        footer={
          <div className="flex gap-2.5">
            <Button variant="pearl-capsule" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Họ *</label>
              <input
                className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Ví dụ: Nguyễn"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Tên *</label>
              <input
                className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Ví dụ: Văn A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Điện Thoại</label>
              <input
                className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Ví dụ: 0912345678"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">CMND / CCCD</label>
              <input
                className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                value={form.identityNum}
                onChange={(e) => setForm({ ...form, identityNum: e.target.value })}
                placeholder="CCCD/CMND 12 số"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Ngày Sinh</label>
            <input
              type="date"
              className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
