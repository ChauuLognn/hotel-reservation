import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserPlus, Key } from 'lucide-react';
import Layout from '@layout/Layout';
import userApi from './userApi';
import { ROLE_BADGE } from '@shared/constants/statusMaps';
import { ROLE_LABELS, ROLE_IDS } from '@shared/constants/roleConstants';
import { useAuth } from '@app/AuthContext';
import { useToast } from '@context/ToastContext';
import { useConfirm } from '@context/ConfirmContext';
import Button from '@shared/ui/Button';
import Modal from '@shared/ui/Modal';
import SearchBox from '@shared/ui/SearchBox';
import StatCard from '@shared/ui/StatCard';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  identityNum: string;
  email: string;
  phone: string;
  address?: string;
  role: { id: number; name: string } | string;
}

interface UserAccount {
  id: number;
  account: string;
  emp: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    identityNum: string;
    address?: string;
    role: { id: number; name: string } | string;
  };
}

export default function Employees() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<'employees' | 'accounts'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Employee CRUD states
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    identityNum: '',
    email: '',
    phone: '',
    address: '',
    role: 2,
  });

  // User Account CRUD states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const [userForm, setUserForm] = useState({
    account: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    identityNum: '',
    roleName: 'EMPLOYEE',
  });

  // Reset Password states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [tab]);

  async function fetchData(signal?: AbortSignal) {
    setLoading(true);
    try {
      if (tab === 'employees') {
        const res = await userApi.getAllEmps(signal);
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await userApi.getAllUsers(signal);
        const accountsList = res.data || [];
        setUserAccounts(Array.isArray(accountsList) ? accountsList : []);
      }
    } catch (e: any) {
      if (e.name === 'CanceledError' || e.name === 'AbortError') return;
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
    setEmpForm({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      identityNum: '',
      email: '',
      phone: '',
      address: '',
      role: 2,
    });
    setShowEmpModal(true);
  }

  function openEditEmp(emp: Employee) {
    setEditEmp(emp);
    const roleName = typeof emp.role === 'object' ? emp.role?.name : emp.role;
    const roleId = typeof emp.role === 'object' ? emp.role?.id : (ROLE_IDS[roleName as keyof typeof ROLE_IDS] || 2);
    setEmpForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      dateOfBirth: emp.dateOfBirth || '',
      identityNum: emp.identityNum || '',
      email: emp.email || '',
      phone: emp.phone || '',
      address: emp.address || '',
      role: Number(roleId),
    });
    setShowEmpModal(true);
  }

  async function handleEmpSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const roleName = Number(empForm.role) === 1 ? 'MANAGER' : 'EMPLOYEE';
      const payload = {
        ...empForm,
        dateOfBirth: empForm.dateOfBirth || null,
        roleName: roleName,
      };
      if (editEmp) {
        await userApi.updateEmp(editEmp.id, payload);
      } else {
        await userApi.createEmp(payload);
      }
      setShowEmpModal(false);
      fetchData();
      showToast('Đã lưu hồ sơ nhân viên thành công!', 'success');
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleEmpDelete(id: number, name: string) {
    const isConfirmed = await confirm({
      title: 'Xóa Hồ Sơ Nhân Viên',
      message: `Bạn có chắc muốn xóa hồ sơ nhân viên "${name}"?`,
    });
    if (!isConfirmed) return;
    try {
      await userApi.deleteEmp(id);
      showToast('Đã xóa nhân viên thành công!', 'success');
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message;
      showToast('Lỗi xóa nhân viên: ' + msg, 'error');
    }
  }

  // User Account Handlers
  function openAddUser() {
    setEditUser(null);
    setUserForm({
      account: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      identityNum: '',
      roleName: 'EMPLOYEE',
    });
    setShowUserModal(true);
  }

  function openEditUser(user: UserAccount) {
    setEditUser(user);
    const emp = user.emp || {};
    const roleName = typeof emp.role === 'object' ? emp.role?.name : emp.role;
    setUserForm({
      account: user.account || '',
      password: '',
      fullName: (emp.firstName || '') + ' ' + (emp.lastName || ''),
      email: emp.email || '',
      phone: emp.phone || '',
      address: emp.address || '',
      identityNum: emp.identityNum || '',
      roleName: roleName || 'EMPLOYEE',
    });
    setShowUserModal(true);
  }

  async function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editUser) {
        await userApi.updateUser(editUser.id, {
          account: userForm.account,
          fullName: userForm.fullName,
          email: userForm.email,
          phone: userForm.phone,
          address: userForm.address,
          identityNum: userForm.identityNum,
          roleName: userForm.roleName,
        });
      } else {
        await userApi.createUser(userForm);
      }
      setShowUserModal(false);
      fetchData();
      showToast('Đã lưu tài khoản thành công!', 'success');
    } catch (err: any) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  async function handleUserDelete(id: number, account: string) {
    const isConfirmed = await confirm({
      title: 'Xóa Tài Khoản',
      message: `Bạn có chắc muốn xóa tài khoản đăng nhập "${account}"?`,
    });
    if (!isConfirmed) return;
    try {
      await userApi.deleteUser(id);
      showToast('Đã xóa tài khoản thành công!', 'success');
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message;
      showToast('Lỗi xóa tài khoản: ' + msg, 'error');
    }
  }

  // Reset Password Handlers
  function openResetPassword(userId: number) {
    setResetUserId(userId);
    setNewPassword('');
    setShowResetModal(true);
  }

  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || resetUserId === null) return;
    try {
      await userApi.resetUserPassword(resetUserId, newPassword);
      showToast('Đã đặt lại mật khẩu thành công!', 'success');
      setShowResetModal(false);
    } catch (err: any) {
      showToast('Lỗi đặt lại mật khẩu: ' + (err?.response?.data?.message || err.message), 'error');
    }
  }

  // Filtering
  const filteredEmployees = employees.filter((u) => {
    const q = search.toLowerCase();
    const roleName = typeof u.role === 'object' ? u.role?.name : u.role;
    const roleLabel = ROLE_LABELS[roleName as keyof typeof ROLE_LABELS] || roleName || '';
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q) ||
      roleLabel.toLowerCase().includes(q)
    );
  });

  const filteredUsers = userAccounts.filter((u) => {
    const q = search.toLowerCase();
    const emp = u.emp || {};
    return (
      (u.account || '').toLowerCase().includes(q) ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
      (emp.email || '').toLowerCase().includes(q) ||
      (emp.phone || '').includes(q)
    );
  });

  return (
    <Layout title="Quản Lý Người Dùng">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label={tab === 'employees' ? 'Tổng Số Nhân Viên' : 'Tổng Tài Khoản Đăng Nhập'}
          value={tab === 'employees' ? employees.length : userAccounts.length}
          icon={<UserPlus size={20} className="text-apple-primary" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-apple-divider-soft mb-6 gap-6">
        <button
          className={`pb-3 text-[16px] font-sans font-medium transition-all ${
            tab === 'employees'
              ? 'border-b-2 border-apple-primary text-apple-primary'
              : 'text-apple-ink-muted-48 hover:text-apple-ink'
          }`}
          onClick={() => {
            setTab('employees');
            setSearch('');
          }}
        >
          📂 Hồ Sơ Nhân Viên
        </button>
        <button
          className={`pb-3 text-[16px] font-sans font-medium transition-all ${
            tab === 'accounts'
              ? 'border-b-2 border-apple-primary text-apple-primary'
              : 'text-apple-ink-muted-48 hover:text-apple-ink'
          }`}
          onClick={() => {
            setTab('accounts');
            setSearch('');
          }}
        >
          🔑 Tài Khoản Hệ Thống
        </button>
      </div>

      {/* Employees CRUD tab */}
      {tab === 'employees' && (
        <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline overflow-hidden">
          <div className="p-6 border-b border-apple-divider-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-apple-ink">Danh Sách Hồ Sơ Nhân Viên</h3>
              <p className="text-[13px] text-apple-ink-muted-48">Quản lý hồ sơ và chức vụ của nhân sự khách sạn</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Tìm theo tên, email, sđt..."
                className="w-full sm:w-64"
              />
              <Button variant="primary" onClick={openAddEmp}>
                <Plus size={16} className="mr-1.5" /> Thêm Nhân Viên
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl text-[13px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Họ Tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Điện Thoại</th>
                  <th className="px-6 py-4">CMND/CCCD</th>
                  <th className="px-6 py-4">Ngày Sinh</th>
                  <th className="px-6 py-4">Địa Chỉ</th>
                  <th className="px-6 py-4">Chức Vụ</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-divider-soft text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-apple-ink-muted-48">
                      <div className="flex justify-center items-center gap-2">
                        <span className="w-5 h-5 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
                        Đang tải danh sách nhân viên...
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length ? (
                  filteredEmployees.map((u) => {
                    const roleName = typeof u.role === 'object' ? u.role?.name : u.role;
                    const roleLabel = ROLE_LABELS[roleName as keyof typeof ROLE_LABELS] || roleName || 'EMPLOYEE';
                    return (
                      <tr key={u.id} className="hover:bg-apple-surface-pearl/40 transition-colors">
                        <td className="px-6 py-4 text-apple-ink-muted-48 font-mono">#{u.id}</td>
                        <td className="px-6 py-4 font-semibold text-apple-ink">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="px-6 py-4 text-apple-ink-muted-80">{u.email || '-'}</td>
                        <td className="px-6 py-4 text-apple-ink-muted-80">{u.phone || '-'}</td>
                        <td className="px-6 py-4 text-apple-ink-muted-80">{u.identityNum || '-'}</td>
                        <td className="px-6 py-4 text-apple-ink-muted-80">{u.dateOfBirth || '-'}</td>
                        <td className="px-6 py-4 text-apple-ink-muted-80 max-w-[150px] truncate">
                          {u.address || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ROLE_BADGE[roleLabel as keyof typeof ROLE_BADGE] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {roleLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {u.email !== 'system@hotelhaven.com' ? (
                              <>
                                <button
                                  className="p-1.5 rounded-full text-apple-primary hover:bg-apple-primary/10 transition-colors active-scale"
                                  onClick={() => openEditEmp(u)}
                                  title="Sửa"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors active-scale"
                                  onClick={() => handleEmpDelete(u.id, u.firstName + ' ' + u.lastName)}
                                  title="Xóa"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-apple-ink-muted-48 italic pr-2">Hệ thống</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-apple-ink-muted-48">
                      Không tìm thấy nhân viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Accounts CRUD tab */}
      {tab === 'accounts' && (
        <div className="bg-apple-canvas rounded-apple-lg border border-apple-hairline overflow-hidden">
          <div className="p-6 border-b border-apple-divider-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-apple-ink">Danh Sách Tài Khoản Đăng Nhập</h3>
              <p className="text-[13px] text-apple-ink-muted-48">Quản lý quyền truy cập hệ thống của nhân sự</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Tìm theo tên đăng nhập, nhân viên..."
                className="w-full sm:w-64"
              />
              <Button variant="primary" onClick={openAddUser}>
                <Plus size={16} className="mr-1.5" /> Tạo Tài Khoản Mới
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-apple-divider-soft bg-apple-surface-pearl text-[13px] font-semibold text-apple-ink-muted-48 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tên Đăng Nhập</th>
                  <th className="px-6 py-4">Nhân Viên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Chức Vụ</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-divider-soft text-[14px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-apple-ink-muted-48">
                      <div className="flex justify-center items-center gap-2">
                        <span className="w-5 h-5 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
                        Đang tải danh sách tài khoản...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length ? (
                  filteredUsers.map((u) => {
                    const emp = u.emp || {};
                    const roleName = typeof emp.role === 'object' ? emp.role?.name : emp.role;
                    const roleLabel = ROLE_LABELS[roleName as keyof typeof ROLE_LABELS] || roleName || 'EMPLOYEE';
                    return (
                      <tr key={u.id} className="hover:bg-apple-surface-pearl/40 transition-colors">
                        <td className="px-6 py-4 text-apple-ink-muted-48 font-mono">#{u.id}</td>
                        <td className="px-6 py-4 font-bold text-apple-primary font-mono">{u.account}</td>
                        <td className="px-6 py-4 font-semibold text-apple-ink">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="px-6 py-4 text-apple-ink-muted-80">{emp.email || '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ROLE_BADGE[roleLabel as keyof typeof ROLE_BADGE] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {roleLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {u.account === 'system' ? (
                              <span className="text-xs text-apple-ink-muted-48 italic pr-2">Hệ thống</span>
                            ) : (
                              <>
                                <button
                                  className="p-1.5 rounded-full text-apple-primary hover:bg-apple-primary/10 transition-colors active-scale"
                                  onClick={() => openEditUser(u)}
                                  title="Sửa"
                                >
                                  <Edit2 size={15} />
                                </button>
                                {currentUser && currentUser.account !== u.account && (
                                  <>
                                    <button
                                      className="p-1.5 rounded-full text-apple-ink-muted-80 hover:bg-apple-divider-soft transition-colors active-scale"
                                      onClick={() => openResetPassword(u.id)}
                                      title="Đổi Mật Khẩu"
                                    >
                                      <Key size={15} />
                                    </button>
                                    <button
                                      className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors active-scale"
                                      onClick={() => handleUserDelete(u.id, u.account)}
                                      title="Xóa"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-apple-ink-muted-48">
                      Không tìm thấy tài khoản nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Employee */}
      <Modal
        open={showEmpModal}
        onClose={() => setShowEmpModal(false)}
        title={editEmp ? 'Sửa Hồ Sơ Nhân Viên' : 'Thêm Nhân Viên Mới'}
        footer={
          <>
            <Button variant="pearl-capsule" onClick={() => setShowEmpModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="empFormElement">
              💾 Lưu Hồ Sơ
            </Button>
          </>
        }
      >
        <form id="empFormElement" onSubmit={handleEmpSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Họ *</label>
              <input
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                required
                value={empForm.firstName}
                onChange={(e) => setEmpForm({ ...empForm, firstName: e.target.value })}
                placeholder="Nguyễn"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Tên *</label>
              <input
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                required
                value={empForm.lastName}
                onChange={(e) => setEmpForm({ ...empForm, lastName: e.target.value })}
                placeholder="Duy"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Ngày Sinh</label>
              <input
                type="date"
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                value={empForm.dateOfBirth}
                onChange={(e) => setEmpForm({ ...empForm, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">CMND/CCCD *</label>
              <input
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                required
                value={empForm.identityNum}
                onChange={(e) => setEmpForm({ ...empForm, identityNum: e.target.value })}
                placeholder="12 chữ số"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Email *</label>
              <input
                type="email"
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                required
                value={empForm.email}
                onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                placeholder="email@domain.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Số Điện Thoại *</label>
              <input
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                required
                value={empForm.phone}
                onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                placeholder="0901234567"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Địa Chỉ</label>
            <input
              className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
              value={empForm.address}
              onChange={(e) => setEmpForm({ ...empForm, address: e.target.value })}
              placeholder="Hà Nội"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Chức Vụ *</label>
            <select
              className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
              value={empForm.role}
              onChange={(e) => setEmpForm({ ...empForm, role: Number(e.target.value) })}
              required
            >
              <option value={1}>MANAGER (Quản Lý)</option>
              <option value={2}>EMPLOYEE (Nhân Viên)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal: Create/Edit User System Account */}
      <Modal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editUser ? 'Sửa Tài Khoản Nhân Viên' : 'Tạo Tài Khoản & Hồ Sơ Mới'}
        footer={
          <>
            <Button variant="pearl-capsule" onClick={() => setShowUserModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="userFormElement">
              💾 Lưu Tài Khoản
            </Button>
          </>
        }
      >
        <form id="userFormElement" onSubmit={handleUserSubmit} className="space-y-4 text-left">
          <h4 className="text-[14px] font-bold text-apple-primary uppercase tracking-wide border-b border-apple-divider-soft pb-1">
            Thông Tin Đăng Nhập
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Tài Khoản (Username) *</label>
              <input
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all disabled:opacity-50"
                required
                value={userForm.account}
                onChange={(e) => setUserForm({ ...userForm, account: e.target.value })}
                placeholder="admin"
                disabled={!!editUser}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Mật Khẩu *</label>
              <input
                type="password"
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all disabled:opacity-50"
                required={!editUser}
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder={editUser ? '••••••••' : 'Nhập mật khẩu...'}
                disabled={!!editUser}
              />
              {editUser && <small className="text-apple-ink-muted-48">Mật khẩu đặt lại tại menu ngoài</small>}
            </div>
          </div>

          <h4 className="text-[14px] font-bold text-apple-primary uppercase tracking-wide border-b border-apple-divider-soft pt-2 pb-1">
            Hồ Sơ Nhân Viên Tương Ứng
          </h4>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Họ Tên Nhân Viên *</label>
            <input
              className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
              required
              value={userForm.fullName}
              onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Số CMND/CCCD *</label>
              <input
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                required
                value={userForm.identityNum}
                onChange={(e) => setUserForm({ ...userForm, identityNum: e.target.value })}
                placeholder="12 số"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Chức Vụ Hệ Thống *</label>
              <select
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                value={userForm.roleName}
                onChange={(e) => setUserForm({ ...userForm, roleName: e.target.value })}
                required
              >
                <option value="MANAGER">MANAGER (Quản Lý)</option>
                <option value="EMPLOYEE">EMPLOYEE (Nhân Viên)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Email *</label>
              <input
                type="email"
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="example@domain.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-apple-ink-muted-80">Số Điện Thoại *</label>
              <input
                className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
                required
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="0901234567"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Địa Chỉ</label>
            <input
              className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
              value={userForm.address}
              onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
              placeholder="Hải Phòng"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Reset Password */}
      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Đặt Lại Mật Khẩu"
        footer={
          <>
            <Button variant="pearl-capsule" onClick={() => setShowResetModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" form="resetFormElement">
              💾 Đặt Lại Mật Khẩu
            </Button>
          </>
        }
      >
        <form id="resetFormElement" onSubmit={handleResetPasswordSubmit} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-apple-ink-muted-80">Mật Khẩu Mới *</label>
            <input
              type="password"
              minLength={4}
              className="w-full bg-apple-canvas-parchment text-apple-ink text-[15px] hairline-border rounded-apple-sm px-3.5 py-2 focus:outline-none focus:border-apple-primary transition-all"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới..."
            />
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
