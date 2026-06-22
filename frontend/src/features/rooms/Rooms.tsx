import React, { useState, useEffect } from 'react';
import { Plus, Home, Key, Wrench, Edit2, Trash2, Eye } from 'lucide-react';
import Layout from '@layout/Layout';
import roomApi from '@features/rooms/api/roomApi';
import { formatVND } from '@shared/utils/format';
import { ROOM_STATUS } from '@shared/constants/statusMaps';
import { useAuth } from '@app/AuthContext';
import { useToast } from '@context/ToastContext';
import { useConfirm } from '@context/ConfirmContext';
import Button from '@shared/ui/Button';
import Badge from '@shared/ui/Badge';
import SearchBox from '@shared/ui/SearchBox';
import Modal from '@shared/ui/Modal';
import StatCard from '@shared/ui/StatCard';

interface Room {
  id: number;
  roomNumber: number;
  roomTypeName: string;
  floorNumber: number;
  capacity: number;
  basePrice: number;
  status: string;
}

interface RoomType {
  name: string;
  capacity: number;
  basePrice: number;
  description: string;
}

interface AvailRoom {
  roomId: number;
  name: string;
  capacity: number;
  basePrice: number;
}

export default function Rooms() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const isManager = user?.role === 'MANAGER';
  const [tab, setTab] = useState<'rooms' | 'types' | 'available'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  
  // Modal states for Rooms
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({ roomNumber: '', roomTypeName: '', status: 'READY', floorNumber: '' });
  const [viewRoom, setViewRoom] = useState<Room | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);

  // Modal states for Room Types
  const [showTypeModal, setShowTypeModal] = useState<boolean>(false);
  const [editType, setEditType] = useState<RoomType | null>(null);
  const [typeForm, setTypeForm] = useState({ name: '', capacity: '', basePrice: '', description: '' });

  // Available room search states
  const [availSearch, setAvailSearch] = useState({ name: '', checkIn: '', checkOut: '' });
  const [availRooms, setAvailRooms] = useState<AvailRoom[]>([]);
  const [availLoading, setAvailLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchAll(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  async function fetchAll(signal?: AbortSignal) {
    setLoading(true);
    try {
      const [rRes, rtRes] = await Promise.all([
        roomApi.getAll(signal),
        roomApi.getAllTypes(signal),
      ]);
      const rawRooms = rRes.data || [];
      const rawTypes = rtRes.data || [];

      const mappedRooms: Room[] = rawRooms.map((r: any) => {
        const typeInfo = rawTypes.find((t: any) => t.name === r.typeName);
        return {
          id: r.id,
          roomNumber: r.id,
          roomTypeName: r.typeName,
          floorNumber: Math.floor(r.id / 100) || 1,
          capacity: typeInfo ? typeInfo.capacity : 1,
          basePrice: typeInfo ? typeInfo.basePrice : 0,
          status: r.status,
        };
      });
      setRooms(mappedRooms);
      setRoomTypes(rawTypes);
    } catch (e: any) {
      if (e.name === 'CanceledError' || e.name === 'AbortError') return;
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function searchAvailableRooms(e: React.FormEvent) {
    e.preventDefault();
    if (availSearch.checkIn && availSearch.checkOut && new Date(availSearch.checkIn) >= new Date(availSearch.checkOut)) {
      showToast('Ngày check-out phải sau ngày check-in!', 'warning');
      return;
    }
    setAvailLoading(true);
    try {
      const params: any = {};
      if (availSearch.name) params.name = availSearch.name;
      if (availSearch.checkIn) params.checkIn = availSearch.checkIn;
      if (availSearch.checkOut) params.checkOut = availSearch.checkOut;
      const res = await roomApi.findAvailable(params);
      const list = res.data || [];
      setAvailRooms(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setAvailRooms([]);
    } finally {
      setAvailLoading(false);
    }
  }

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    return (
      String(r.roomNumber || '').toLowerCase().includes(q) ||
      (r.roomTypeName || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q)
    );
  });

  const stats = {
    total: rooms.length,
    ready: rooms.filter((r) => r.status === 'READY').length,
    underRepair: rooms.filter((r) => r.status === 'UNDER_REPAIR').length,
  };

  function openAdd() {
    setEditRoom(null);
    setForm({ roomNumber: '', roomTypeName: roomTypes[0]?.name || '', status: 'READY', floorNumber: '' });
    setShowModal(true);
  }

  function openViewRoom(r: Room) {
    setViewRoom(r);
    setShowViewModal(true);
  }

  function openEdit(r: Room) {
    setEditRoom(r);
    setForm({
      roomNumber: String(r.roomNumber || ''),
      roomTypeName: r.roomTypeName || '',
      status: r.status || 'READY',
      floorNumber: String(r.floorNumber || ''),
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        id: Number(form.roomNumber),
        typeName: form.roomTypeName,
        status: form.status,
      };
      if (editRoom) {
        await roomApi.update(editRoom.id, payload);
        showToast('Đã cập nhật thông tin phòng thành công!', 'success');
      } else {
        await roomApi.create(payload);
        showToast('Đã thêm phòng mới thành công!', 'success');
      }
      setShowModal(false);
      fetchAll();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleDeleteRoom(id: number, roomNumber: number) {
    const isConfirmed = await confirm({
      title: 'Xóa Phòng',
      message: `Bạn có chắc chắn muốn xóa phòng ${roomNumber}?`,
    });
    if (!isConfirmed) return;
    try {
      await roomApi.delete(id);
      showToast('Đã xóa phòng thành công!', 'success');
      fetchAll();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  // Room Types CRUD handlers
  function openAddType() {
    setEditType(null);
    setTypeForm({ name: '', capacity: '', basePrice: '', description: '' });
    setShowTypeModal(true);
  }

  function openEditType(rt: RoomType) {
    setEditType(rt);
    setTypeForm({
      name: rt.name,
      capacity: String(rt.capacity || ''),
      basePrice: String(rt.basePrice || ''),
      description: rt.description || '',
    });
    setShowTypeModal(true);
  }

  async function handleTypeSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: typeForm.name,
        capacity: Number(typeForm.capacity),
        basePrice: Number(typeForm.basePrice),
        description: typeForm.description,
      };
      if (editType) {
        await roomApi.updateType(editType.name, payload);
        showToast('Đã cập nhật loại phòng thành công!', 'success');
      } else {
        await roomApi.createType(payload);
        showToast('Đã thêm loại phòng mới thành công!', 'success');
      }
      setShowTypeModal(false);
      fetchAll();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleDeleteType(name: string) {
    const isConfirmed = await confirm({
      title: 'Xóa Loại Phòng',
      message: `Bạn có chắc chắn muốn xóa loại phòng "${name}"?`,
    });
    if (!isConfirmed) return;
    try {
      await roomApi.deleteType(name);
      showToast('Đã xóa loại phòng thành công!', 'success');
      fetchAll();
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  return (
    <Layout title="Quản Lý Phòng">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <StatCard
          label="Tổng Số Phòng"
          value={stats.total}
          icon={<Home size={20} />}
          iconBg="bg-blue-50 text-blue-600 border border-blue-100"
        />
        <StatCard
          label="Phòng Sẵn Sàng"
          value={stats.ready}
          icon={<Key size={20} />}
          iconBg="bg-green-50 text-green-600 border border-green-100"
        />
        <StatCard
          label="Đang Bảo Trì"
          value={stats.underRepair}
          icon={<Wrench size={20} />}
          iconBg="bg-yellow-50 text-yellow-600 border border-yellow-100"
        />
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-1 border-b-2 border-apple-divider-soft mb-6 select-none">
        <button
          className={`px-5 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-[2px] ${
            tab === 'rooms' ? 'border-apple-primary text-apple-primary font-semibold' : 'border-transparent text-apple-ink-muted-48 hover:text-apple-ink'
          }`}
          onClick={() => setTab('rooms')}
        >
          Danh Sách Phòng
        </button>
        <button
          className={`px-5 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-[2px] ${
            tab === 'types' ? 'border-apple-primary text-apple-primary font-semibold' : 'border-transparent text-apple-ink-muted-48 hover:text-apple-ink'
          }`}
          onClick={() => setTab('types')}
        >
          Loại Phòng
        </button>
        <button
          className={`px-5 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-[2px] ${
            tab === 'available' ? 'border-apple-primary text-apple-primary font-semibold' : 'border-transparent text-apple-ink-muted-48 hover:text-apple-ink'
          }`}
          onClick={() => setTab('available')}
        >
          Tìm Phòng Trống
        </button>
      </div>

      {/* Rooms Tab */}
      {tab === 'rooms' && (
        <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-apple-divider-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
            <h3 className="font-display font-semibold text-[16px] text-apple-ink">Tất Cả Phòng</h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <SearchBox value={search} onChange={setSearch} placeholder="Tìm phòng..." className="flex-grow sm:flex-grow-0" />
              {isManager && (
                <Button variant="primary" onClick={openAdd} className="flex-shrink-0 flex items-center gap-1.5 h-11 text-sm font-semibold">
                  <Plus size={16} /> Thêm Phòng
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-apple-surface-pearl border-b border-apple-divider-soft text-[11px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                  <th className="px-6 py-3">Số Phòng</th>
                  <th className="px-6 py-3">Loại</th>
                  <th className="px-6 py-3">Tầng</th>
                  <th className="px-6 py-3">Sức Chứa</th>
                  <th className="px-6 py-3">Giá / Đêm</th>
                  <th className="px-6 py-3">Trạng Thái</th>
                  <th className="px-6 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-divider-soft text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-apple-ink-muted-48">
                      Đang tải danh sách phòng...
                    </td>
                  </tr>
                ) : filtered.length ? (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-apple-surface-pearl/40">
                      <td className="px-6 py-3.5 font-bold text-apple-ink">{r.roomNumber}</td>
                      <td className="px-6 py-3.5">{r.roomTypeName || '-'}</td>
                      <td className="px-6 py-3.5">Tầng {r.floorNumber || '-'}</td>
                      <td className="px-6 py-3.5">{r.capacity ? r.capacity + ' khách' : '-'}</td>
                      <td className="px-6 py-3.5 font-semibold text-apple-primary">{formatVND(r.basePrice)}</td>
                      <td className="px-6 py-3.5">
                        <Badge status={r.status} statusMap={ROOM_STATUS} />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-apple-primary/10 hover:text-apple-primary text-apple-ink-muted-80 transition-colors active-scale"
                            onClick={() => openViewRoom(r)}
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                          </button>
                          {isManager && (
                            <>
                              <button
                                  className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-apple-primary/10 hover:text-apple-primary text-apple-ink-muted-80 transition-colors active-scale"
                                  onClick={() => openEdit(r)}
                                  title="Chỉnh sửa"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                  className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-apple-ink-muted-80 transition-colors active-scale"
                                  onClick={() => handleDeleteRoom(r.id, r.roomNumber)}
                                  title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-apple-ink-muted-48">
                      Chưa có dữ liệu phòng nào được tạo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Room Types Tab */}
      {tab === 'types' && (
        <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-apple-divider-soft flex justify-between items-center select-none">
            <h3 className="font-display font-semibold text-[16px] text-apple-ink">Danh Mục Loại Phòng</h3>
            {isManager && (
              <Button variant="primary" onClick={openAddType} className="flex items-center gap-1.5 h-11 text-sm font-semibold">
                <Plus size={16} /> Thêm Loại Phòng
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-apple-surface-pearl border-b border-apple-divider-soft text-[11px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                  <th className="px-6 py-3">Tên Loại Phòng</th>
                  <th className="px-6 py-3">Sức Chứa</th>
                  <th className="px-6 py-3">Giá Cơ Bản</th>
                  <th className="px-6 py-3">Mô Tả</th>
                  <th className="px-6 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-divider-soft text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-apple-ink-muted-48">
                      Đang tải danh mục loại phòng...
                    </td>
                  </tr>
                ) : roomTypes.length ? (
                  roomTypes.map((rt, i) => (
                    <tr key={i} className="hover:bg-apple-surface-pearl/40">
                      <td className="px-6 py-3.5 font-semibold text-apple-ink">{rt.name}</td>
                      <td className="px-6 py-3.5">{rt.capacity} khách</td>
                      <td className="px-6 py-3.5 font-semibold text-apple-primary">{formatVND(rt.basePrice)}</td>
                      <td className="px-6 py-3.5 text-apple-ink-muted-80 max-w-sm truncate" title={rt.description}>
                        {rt.description || '-'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex gap-2">
                          {isManager && (
                            <>
                              <button
                                className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-apple-primary/10 hover:text-apple-primary text-apple-ink-muted-80 transition-colors active-scale"
                                onClick={() => openEditType(rt)}
                                title="Chỉnh sửa"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="w-8 h-8 rounded-apple-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 text-apple-ink-muted-80 transition-colors active-scale"
                                onClick={() => handleDeleteType(rt.name)}
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-apple-ink-muted-48">
                      Chưa có loại phòng nào được tạo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Rooms Tab */}
      {tab === 'available' && (
        <div className="flex flex-col gap-6">
          {/* Flat Horizontal Filter Form */}
          <form
            onSubmit={searchAvailableRooms}
            className="bg-white p-5 rounded-apple-lg border border-apple-hairline shadow-sm flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80">Loại Phòng</label>
                <select
                  className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
                  value={availSearch.name}
                  onChange={(e) => setAvailSearch({ ...availSearch, name: e.target.value })}
                >
                  <option value="">Tất cả loại phòng</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.name} value={rt.name}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80">Ngày Check-in</label>
                <input
                  type="date"
                  className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
                  value={availSearch.checkIn}
                  onChange={(e) => setAvailSearch({ ...availSearch, checkIn: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-apple-ink-muted-80">Ngày Check-out</label>
                <input
                  type="date"
                  className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
                  value={availSearch.checkOut}
                  onChange={(e) => setAvailSearch({ ...availSearch, checkOut: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" variant="primary" className="h-10 w-full md:w-auto font-semibold">
              Tìm Phòng
            </Button>
          </form>

          {/* Search Result Table */}
          <div className="bg-white rounded-apple-lg border border-apple-hairline overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-apple-divider-soft select-none">
              <h3 className="font-display font-semibold text-[16px] text-apple-ink">Kết Quả Phòng Trống</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-apple-surface-pearl border-b border-apple-divider-soft text-[11px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                    <th className="px-6 py-3">Số Phòng</th>
                    <th className="px-6 py-3">Loại</th>
                    <th className="px-6 py-3">Sức Chứa</th>
                    <th className="px-6 py-3">Giá / Đêm</th>
                    <th className="px-6 py-3">Trạng Trái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-divider-soft text-[14px]">
                  {availLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-apple-ink-muted-48">
                        Đang rà soát phòng trống trên hệ thống...
                      </td>
                    </tr>
                  ) : availRooms.length ? (
                    availRooms.map((r, i) => (
                      <tr key={i} className="hover:bg-apple-surface-pearl/40">
                        <td className="px-6 py-3.5 font-bold text-apple-ink">{r.roomId}</td>
                        <td className="px-6 py-3.5">{r.name}</td>
                        <td className="px-6 py-3.5">{r.capacity} khách</td>
                        <td className="px-6 py-3.5 font-semibold text-apple-primary">{formatVND(r.basePrice)}</td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                            Khả Dụng
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-apple-ink-muted-48">
                        Nhập ngày nhận/trả phòng và nhấn Tìm Kiếm để kiểm tra phòng trống.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Room */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editRoom ? `Cập Nhật Phòng ${editRoom.roomNumber}` : 'Thêm Phòng Mới'}
        footer={
          <div className="flex gap-2.5">
            <Button variant="pearl-capsule" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Lưu phòng
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Số Phòng *</label>
              <input
                type="number"
                className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
                required
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                placeholder="Ví dụ: 101"
                disabled={!!editRoom}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Tầng</label>
              <input
                type="number"
                className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all"
                value={form.floorNumber}
                onChange={(e) => setForm({ ...form, floorNumber: e.target.value })}
                placeholder="Ví dụ: 1"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Loại Phòng *</label>
            <select
              className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
              value={form.roomTypeName}
              onChange={(e) => setForm({ ...form, roomTypeName: e.target.value })}
              required
            >
              <option value="">-- Chọn loại phòng --</option>
              {roomTypes.map((rt) => (
                <option key={rt.name} value={rt.name}>
                  {rt.name} — ({formatVND(rt.basePrice)}/đêm)
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Trạng Thái</label>
            <select
              className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {Object.entries(ROOM_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal View Room Details */}
      <Modal open={showViewModal} onClose={() => setShowViewModal(false)} title={`Thông Tin Phòng ${viewRoom?.roomNumber || ''}`}>
        {viewRoom && (
          <div className="divide-y divide-apple-divider-soft text-sm">
            <div className="flex justify-between py-3">
              <span className="font-semibold text-apple-ink-muted-80">Loại Phòng</span>
              <span className="font-bold text-apple-ink">{viewRoom.roomTypeName}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-semibold text-apple-ink-muted-80">Vị Trí Tầng</span>
              <span className="text-apple-ink">Tầng {viewRoom.floorNumber}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-semibold text-apple-ink-muted-80">Sức Chứa Tối Đa</span>
              <span className="text-apple-ink">{viewRoom.capacity} khách</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-semibold text-apple-ink-muted-80">Đơn Giá Phòng</span>
              <span className="font-bold text-apple-primary">{formatVND(viewRoom.basePrice)} / đêm</span>
            </div>
            <div className="flex justify-between py-3 items-center">
              <span className="font-semibold text-apple-ink-muted-80">Trạng Thái Hiện Tại</span>
              <Badge status={viewRoom.status} statusMap={ROOM_STATUS} />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Add/Edit Room Type */}
      <Modal
        open={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        title={editType ? 'Chỉnh Sửa Loại Phòng' : 'Tạo Loại Phòng Mới'}
        footer={
          <div className="flex gap-2.5">
            <Button variant="pearl-capsule" onClick={() => setShowTypeModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleTypeSubmit}>
              Lưu loại phòng
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Tên Loại Phòng *</label>
            <input
              className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium disabled:opacity-50"
              required
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
              placeholder="Ví dụ: VIP Suite"
              disabled={!!editType}
            />
            {editType && <small className="text-[11px] text-apple-ink-muted-48">Tên loại phòng không thể thay đổi</small>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Sức Chứa (người) *</label>
              <input
                type="number"
                min="1"
                className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
                required
                value={typeForm.capacity}
                onChange={(e) => setTypeForm({ ...typeForm, capacity: e.target.value })}
                placeholder="2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Giá Cơ Bản (VNĐ) *</label>
              <input
                type="number"
                min="0"
                className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium"
                required
                value={typeForm.basePrice}
                onChange={(e) => setTypeForm({ ...typeForm, basePrice: e.target.value })}
                placeholder="1000000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Mô Tả Chi Tiết</label>
            <textarea
              className="bg-apple-surface-pearl text-apple-ink text-[14px] border border-apple-hairline rounded-apple-sm px-3.5 py-2.5 focus:outline-none focus:border-apple-primary focus:ring-2 focus:ring-apple-primary/10 transition-all font-medium resize-y"
              rows={3}
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
              placeholder="Mô tả các đặc trưng của loại phòng..."
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
