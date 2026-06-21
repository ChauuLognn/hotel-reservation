import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Coffee } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import serviceApi from '../../api/serviceApi';
import { formatVND } from '@shared/utils/format';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

export default function Services() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [form, setForm] = useState({ serviceName:'', price:'', status:'ACTIVE' });

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const res = await serviceApi.getAll();
      const rawServices = Array.isArray(res.data) ? res.data : [];
      const mapped = rawServices.map(s => ({
        ...s,
        serviceName: s.name
      }));
      setServices(mapped);
    } catch(e) { console.error(e); setServices([]); }
    finally { setLoading(false); }
  }

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    return (s.serviceName||'').toLowerCase().includes(q)
      || (s.status||'').toLowerCase().includes(q);
  });

  function openAdd() { setEditSvc(null); setForm({ serviceName:'', price:'', status:'ACTIVE' }); setShowModal(true); }
  function openEdit(s) { 
    setEditSvc(s); 
    setForm({ serviceName:s.serviceName||'', price:String(s.price||''), status:s.status || 'ACTIVE' });
    setShowModal(true); 
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = { 
        name: form.serviceName, 
        price: Number(form.price), 
        status: form.status
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
    } catch(err) { showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error'); }
  }

  async function handleDelete(name) {
    const isConfirmed = await confirm({
      title: 'Xóa Dịch Vụ',
      message: `Bạn có chắc chắn muốn xóa dịch vụ "${name}"?`
    });
    if (!isConfirmed) return;
    try { 
      await serviceApi.delete(name); 
      showToast('Đã xóa dịch vụ thành công!', 'success');
      fetchServices(); 
    }
    catch(err) { showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error'); }
  }

  const avgPrice = services.length 
    ? services.reduce((s,v) => s + (v.price||0), 0) / services.length 
    : 0;

  return (
    <Layout title="Quản Lý Dịch Vụ">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info"><p>Tổng Dịch Vụ</p><h3>{services.length}</h3></div>
            <div className="stat-icon"><Coffee size={22} color="#6366f1" /></div>
          </div>
        </div>
        <div className="stat-card" style={{borderColor:'#10b981'}}>
          <div className="stat-content">
            <div className="stat-info"><p>Giá Trung Bình</p><h3 style={{fontSize:'1rem'}}>{formatVND(avgPrice)}</h3></div>
            <div className="stat-icon" style={{background:'#d1fae5'}}><Coffee size={22} color="#10b981" /></div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Danh Sách Dịch Vụ</h3>
          <div className="flex gap-2">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input className="search-input" placeholder="Tìm dịch vụ..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Thêm Dịch Vụ</button>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Tên Dịch Vụ</th><th>Giá</th><th>Trạng Thái</th><th>Thao Tác</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải...</td></tr>
              ) : filtered.length ? filtered.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{s.serviceName}</td>
                  <td style={{ color:'#4f46e5', fontWeight:600 }}>{formatVND(s.price)}</td>
                  <td><span className={`badge-status ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>{s.status || '-'}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="action-btn edit" onClick={() => openEdit(s)} title="Sửa"><Edit2 size={15} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(s.serviceName)} title="Xóa"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center text-gray" style={{padding:'2rem'}}>
                  {search ? 'Không tìm thấy kết quả' : 'Chưa có dịch vụ nào'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editSvc ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</h3>
              <button className="action-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên Dịch Vụ *</label>
                  <input className="form-input" required value={form.serviceName} 
                    onChange={e => setForm({...form, serviceName:e.target.value})} 
                    placeholder="Giặt ủi" 
                    disabled={!!editSvc} // Không cho sửa tên vì là key
                  />
                  {editSvc && <small style={{color:'#9ca3af'}}>Tên dịch vụ không thể thay đổi</small>}
                </div>
                <div className="form-group">
                  <label className="form-label">Giá (VNĐ) *</label>
                  <input type="number" className="form-input" required min="0" value={form.price} 
                    onChange={e => setForm({...form, price:e.target.value})} placeholder="50000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng Thái</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="STOP">STOP</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
