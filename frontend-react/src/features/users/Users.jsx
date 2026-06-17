import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, UserPlus, Key, Settings, ClipboardList } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import userApi from '../../api/userApi';

const ROLE_BADGE = {
  MANAGER: 'badge-warning',
  EMPLOYEE: 'badge-secondary',
};

const ROLE_LABELS = {
  1: 'MANAGER',
  2: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
};

export default function Users() {
  const [tab, setTab] = useState('employees'); // 'employees' or 'accounts'
  const [employees, setEmployees] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Employee CRUD states
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [empForm, setEmpForm] = useState({ firstName:'', lastName:'', dateOfBirth:'', identityNum:'', email:'', phone:'', address:'', role: 2 });

  // User Account CRUD states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState({ account:'', password:'', fullName:'', email:'', phone:'', address:'', identityNum:'', roleName:'EMPLOYEE' });

  // Reset Password states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => { 
    fetchData(); 
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (tab === 'employees') {
        const res = await userApi.getAllEmps();
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await userApi.getAllUsers();
        // Backend returns ApiResponse<List<User>>: res.data.data
        const accountsList = res.data?.data || res.data || [];
        setUserAccounts(Array.isArray(accountsList) ? accountsList : []);
      }
    } catch(e) { 
      console.error(e); 
      setEmployees([]);
      setUserAccounts([]);
    } finally { 
      setLoading(false); 
    }
  }

  // Employee Handlers
  function openAddEmp() {
    setEditEmp(null);
    setEmpForm({ firstName:'', lastName:'', dateOfBirth:'', identityNum:'', email:'', phone:'', address:'', role: 2 });
    setShowEmpModal(true);
  }

  function openEditEmp(emp) {
    setEditEmp(emp);
    // role is role ID or role object
    const roleId = emp.role?.id || emp.role || 2;
    setEmpForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      dateOfBirth: emp.dateOfBirth || '',
      identityNum: emp.identityNum || '',
      email: emp.email || '',
      phone: emp.phone || '',
      address: emp.address || '',
      role: roleId
    });
    setShowEmpModal(true);
  }

  async function handleEmpSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ...empForm,
        role: Number(empForm.role)
      };
      if (editEmp) {
        await userApi.updateEmp(editEmp.id, payload);
      } else {
        await userApi.createEmp(payload);
      }
      setShowEmpModal(false);
      fetchData();
    } catch(err) {
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    }
  }

  async function handleEmpDelete(id, name) {
    if (!confirm(`Xóa hồ sơ nhân viên "${name}"?`)) return;
    try {
      await userApi.deleteEmp(id);
      fetchData();
    } catch(err) {
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    }
  }

  // User Account Handlers
  function openAddUser() {
    setEditUser(null);
    setUserForm({ account:'', password:'', fullName:'', email:'', phone:'', address:'', identityNum:'', roleName:'EMPLOYEE' });
    setShowUserModal(true);
  }

  function openEditUser(user) {
    setEditUser(user);
    const emp = user.emp || {};
    setUserForm({
      account: user.account || '',
      password: '', // do not fill password on update
      fullName: (emp.firstName || '') + ' ' + (emp.lastName || ''),
      email: emp.email || '',
      phone: emp.phone || '',
      address: emp.address || '',
      identityNum: emp.identityNum || '',
      roleName: emp.role?.name || 'EMPLOYEE'
    });
    setShowUserModal(true);
  }

  async function handleUserSubmit(e) {
    e.preventDefault();
    try {
      if (editUser) {
        // Update user account (emp profiles)
        await userApi.updateUser(editUser.id, {
          fullName: userForm.fullName,
          email: userForm.email,
          phone: userForm.phone,
          address: userForm.address,
          identityNum: userForm.identityNum,
          roleName: userForm.roleName
        });
      } else {
        // Create user account
        await userApi.createUser(userForm);
      }
      setShowUserModal(false);
      fetchData();
    } catch(err) {
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    }
  }

  async function handleUserDelete(id, account) {
    if (!confirm(`Xóa tài khoản đăng nhập "${account}"?`)) return;
    try {
      await userApi.deleteUser(id);
      fetchData();
    } catch(err) {
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    }
  }

  // Reset Password Handlers
  function openResetPassword(userId) {
    setResetUserId(userId);
    setNewPassword('');
    setShowResetModal(true);
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!newPassword) return;
    try {
      await userApi.resetUserPassword(resetUserId, newPassword);
      alert('Đã đặt lại mật khẩu thành công!');
      setShowResetModal(false);
    } catch(err) {
      alert('Lỗi đặt lại mật khẩu: ' + (err?.response?.data?.message || err.message));
    }
  }

  // Filtering
  const filteredEmployees = employees.filter(u => {
    const q = search.toLowerCase();
    return `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
      || (u.email||'').toLowerCase().includes(q)
      || (u.phone||'').includes(q)
      || (ROLE_LABELS[u.role?.name] || ROLE_LABELS[u.role] || '').toLowerCase().includes(q);
  });

  const filteredUsers = userAccounts.filter(u => {
    const q = search.toLowerCase();
    const emp = u.emp || {};
    return (u.account||'').toLowerCase().includes(q)
      || `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q)
      || (emp.email||'').toLowerCase().includes(q)
      || (emp.phone||'').includes(q);
  });

  return (
    <Layout title="Quản Lý Người Dùng">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>{tab === 'employees' ? 'Tổng Số Nhân Viên' : 'Tổng Tài Khoản Đăng Nhập'}</p>
              <h3>{tab === 'employees' ? employees.length : userAccounts.length}</h3>
            </div>
            <div className="stat-icon"><UserPlus size={22} color="#6366f1" /></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab==='employees'?'active':''}`} onClick={() => { setTab('employees'); setSearch(''); }}>
          📂 Hồ Sơ Nhân Viên
        </button>
        <button className={`tab-btn ${tab==='accounts'?'active':''}`} onClick={() => { setTab('accounts'); setSearch(''); }}>
          🔑 Tài Khoản Hệ Thống
        </button>
      </div>

      {/* Employees CRUD tab */}
      {tab === 'employees' && (
        <div className="table-container">
          <div className="table-header">
            <h3>Danh Sách Hồ Sơ Nhân Viên</h3>
            <div className="flex gap-2">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input className="search-input" placeholder="Tìm theo tên, email, sđt..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={openAddEmp}>
                <Plus size={16} /> Thêm Nhân Viên
              </button>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ Tên</th>
                  <th>Email</th>
                  <th>Điện Thoại</th>
                  <th>CMND/CCCD</th>
                  <th>Ngày Sinh</th>
                  <th>Địa Chỉ</th>
                  <th>Chức Vụ</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải nhân viên...</td></tr>
                ) : filteredEmployees.length ? filteredEmployees.map(u => {
                  const roleName = ROLE_LABELS[u.role?.name] || ROLE_LABELS[u.role] || 'EMPLOYEE';
                  return (
                    <tr key={u.id}>
                      <td style={{color:'#9ca3af', fontSize:'0.8rem'}}>#{u.id}</td>
                      <td style={{ fontWeight:600 }}>{u.firstName} {u.lastName}</td>
                      <td>{u.email || '-'}</td>
                      <td>{u.phone || '-'}</td>
                      <td>{u.identityNum || '-'}</td>
                      <td>{u.dateOfBirth || '-'}</td>
                      <td style={{maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{u.address || '-'}</td>
                      <td><span className={`badge-status ${ROLE_BADGE[roleName]||'badge-secondary'}`}>{roleName}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="action-btn edit" onClick={() => openEditEmp(u)} title="Sửa"><Edit2 size={14} /></button>
                          <button className="action-btn delete" onClick={() => handleEmpDelete(u.id, u.firstName+' '+u.lastName)} title="Xóa"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={9} className="text-center text-gray" style={{padding:'2rem'}}>Không có nhân viên nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Accounts CRUD tab */}
      {tab === 'accounts' && (
        <div className="table-container">
          <div className="table-header">
            <h3>Danh Sách Tài Khoản Đăng Nhập</h3>
            <div className="flex gap-2">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input className="search-input" placeholder="Tìm theo tên đăng nhập, nhân viên..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={openAddUser}>
                <Plus size={16} /> Tạo Tài Khoản Mới
              </button>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Đăng Nhập</th>
                  <th>Nhân Viên</th>
                  <th>Email</th>
                  <th>Chức Vụ</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-gray" style={{padding:'2rem'}}>Đang tải tài khoản...</td></tr>
                ) : filteredUsers.length ? filteredUsers.map(u => {
                  const emp = u.emp || {};
                  const roleName = emp.role?.name || 'EMPLOYEE';
                  return (
                    <tr key={u.id}>
                      <td style={{color:'#9ca3af', fontSize:'0.8rem'}}>#{u.id}</td>
                      <td style={{ fontWeight:700, color:'#4f46e5' }}>{u.account}</td>
                      <td style={{ fontWeight:600 }}>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.email || '-'}</td>
                      <td><span className={`badge-status ${ROLE_BADGE[roleName]||'badge-secondary'}`}>{roleName}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="action-btn edit" onClick={() => openEditUser(u)} title="Sửa"><Edit2 size={14} /></button>
                          <button className="action-btn view" onClick={() => openResetPassword(u.id)} title="Đổi Mật Khẩu"><Key size={14} /></button>
                          <button className="action-btn delete" onClick={() => handleUserDelete(u.id, u.account)} title="Xóa"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6} className="text-center text-gray" style={{padding:'2rem'}}>Không có tài khoản đăng nhập nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Employee */}
      {showEmpModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowEmpModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editEmp ? 'Sửa Hồ Sơ Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3>
              <button className="action-btn" onClick={() => setShowEmpModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEmpSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Họ *</label>
                    <input className="form-input" required value={empForm.firstName} onChange={e => setEmpForm({...empForm, firstName:e.target.value})} placeholder="Nguyễn" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên *</label>
                    <input className="form-input" required value={empForm.lastName} onChange={e => setEmpForm({...empForm, lastName:e.target.value})} placeholder="Duy" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Ngày Sinh</label>
                    <input type="date" className="form-input" value={empForm.dateOfBirth} onChange={e => setEmpForm({...empForm, dateOfBirth:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CMND/CCCD *</label>
                    <input className="form-input" required value={empForm.identityNum} onChange={e => setEmpForm({...empForm, identityNum:e.target.value})} placeholder="12 chữ số" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" required value={empForm.email} onChange={e => setEmpForm({...empForm, email:e.target.value})} placeholder="email@domain.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số Điện Thoại *</label>
                    <input className="form-input" required value={empForm.phone} onChange={e => setEmpForm({...empForm, phone:e.target.value})} placeholder="0901234567" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Địa Chỉ</label>
                  <input className="form-input" value={empForm.address} onChange={e => setEmpForm({...empForm, address:e.target.value})} placeholder="Hà Nội" />
                </div>
                <div className="form-group">
                  <label className="form-label">Chức Vụ *</label>
                  <select className="form-input" value={empForm.role} onChange={e => setEmpForm({...empForm, role:e.target.value})} required>
                    <option value={1}>MANAGER (Quản Lý)</option>
                    <option value={2}>EMPLOYEE (Nhân Viên)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowEmpModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Lưu Hồ Sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit User System Account */}
      {showUserModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowUserModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editUser ? 'Sửa Tài Khoản Nhân Viên' : 'Tạo Tài Khoản & Hồ Sơ Mới'}</h3>
              <button className="action-btn" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUserSubmit}>
              <div className="modal-body">
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4f46e5' }}>Thông Tin Đăng Nhập</h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tài Khoản (Username) *</label>
                    <input className="form-input" required value={userForm.account} onChange={e => setUserForm({...userForm, account:e.target.value})} placeholder="admin" disabled={!!editUser} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mật Khẩu *</label>
                    <input type="password" className="form-input" required={!editUser} value={userForm.password} onChange={e => setUserForm({...userForm, password:e.target.value})} placeholder="••••••••" disabled={!!editUser} />
                    {editUser && <small style={{color:'#9ca3af'}}>Mật khẩu không thể thay đổi tại đây</small>}
                  </div>
                </div>

                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#4f46e5' }}>Hồ Sơ Nhân Viên Tương Ứng</h4>
                <div className="form-group">
                  <label className="form-label">Họ Tên Nhân Viên *</label>
                  <input className="form-input" required value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName:e.target.value})} placeholder="Nguyễn Văn A" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Số CMND/CCCD *</label>
                    <input className="form-input" required value={userForm.identityNum} onChange={e => setUserForm({...userForm, identityNum:e.target.value})} placeholder="12 số" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chức Vụ Hệ Thống *</label>
                    <select className="form-input" value={userForm.roleName} onChange={e => setUserForm({...userForm, roleName:e.target.value})} required>
                      <option value="MANAGER">MANAGER (Quản Lý)</option>
                      <option value="EMPLOYEE">EMPLOYEE (Nhân Viên)</option>
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" required value={userForm.email} onChange={e => setUserForm({...userForm, email:e.target.value})} placeholder="example@domain.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số Điện Thoại *</label>
                    <input className="form-input" required value={userForm.phone} onChange={e => setUserForm({...userForm, phone:e.target.value})} placeholder="0901234567" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Địa Chỉ</label>
                  <input className="form-input" value={userForm.address} onChange={e => setUserForm({...userForm, address:e.target.value})} placeholder="Hải Phòng" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowUserModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Lưu Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {showResetModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowResetModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Đặt Lại Mật Khẩu</h3>
              <button className="action-btn" onClick={() => setShowResetModal(false)}>✕</button>
            </div>
            <form onSubmit={handleResetPasswordSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Mật Khẩu Mới *</label>
                  <input type="password" minLength={4} className="form-input" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowResetModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Đặt Lại Mật Khẩu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
