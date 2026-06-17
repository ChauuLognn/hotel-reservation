/**
 * Admin Page - JavaScript
 * Quản lý tài khoản nhân viên (User Management)
 */

const API_BASE_URL = 'http://localhost:8080/hotel_reservation_premium/api';
let allUsers = [];
let editingUserId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    updateUserGreeting();
    loadAllUsers();
    setupEventListeners();
});

function updateUserGreeting() {
    const authUser = localStorage.getItem('authAdmin') || sessionStorage.getItem('authAdmin');
    const userNameEl = document.querySelector('.user-name');
    
    if (authUser && userNameEl) {
        try {
            const user = JSON.parse(authUser);
            userNameEl.textContent = user.username ? user.username.split('@')[0] : 'Admin';
        } catch (e) {
            userNameEl.textContent = 'Admin';
        }
    }
}

// ==================== API Functions ====================

function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function loadAllUsers() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const result = await response.json();
        allUsers = result.data || [];
        renderUserTable(allUsers);
        updateStats();
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Không thể tải danh sách nhân viên', 'error');
    } finally {
        hideLoading();
    }
}

async function createUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create user');
        }

        showNotification('Thêm nhân viên thành công!', 'success');
        await loadAllUsers();
        closeUserModal();
    } catch (error) {
        console.error('Error creating user:', error);
        showNotification(error.message || 'Không thể thêm nhân viên', 'error');
    }
}

async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update user');
        }

        showNotification('Cập nhật nhân viên thành công!', 'success');
        await loadAllUsers();
        closeUserModal();
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification(error.message || 'Không thể cập nhật nhân viên', 'error');
    }
}

async function resetPassword(userId, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ newPassword })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to reset password');
        }

        showNotification('Reset mật khẩu thành công!', 'success');
        await loadAllUsers();
        closeUserModal();
    } catch (error) {
        console.error('Error resetting password:', error);
        showNotification(error.message || 'Không thể reset mật khẩu', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete user');
        }

        showNotification('Xóa nhân viên thành công!', 'success');
        await loadAllUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification(error.message || 'Không thể xóa nhân viên', 'error');
    }
}

// ==================== UI Functions ====================

function renderUserTable(users) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    Không có dữ liệu
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const emp = user.emp || {};
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A';
        const email = emp.email || 'N/A';
        const roleName = emp.role?.name || 'N/A';
        const initials = getInitials(fullName);
        const avatarColor = getAvatarColor(user.id);

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style="background-color: ${avatarColor};">
                            ${initials}
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${fullName}</div>
                            <div class="text-sm text-gray-500">${user.account}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${email}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(roleName)}">${roleName}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                        <button onclick="openEditUserModal(${user.id})" class="text-indigo-600 hover:text-indigo-900 p-1" title="Chỉnh sửa">
                            <i data-feather="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="openResetPasswordModal(${user.id})" class="text-yellow-600 hover:text-yellow-900 p-1" title="Reset mật khẩu">
                            <i data-feather="key" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900 p-1" title="Xóa">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    feather.replace();
}

function updateStats() {
    const stats = calculateStats();
    
    const statCards = document.querySelectorAll('.grid h3');
    if (statCards.length >= 3) {
        statCards[0].textContent = stats.total;
        statCards[1].textContent = stats.managers;
        statCards[2].textContent = stats.employees;
    }
}

function calculateStats() {
    const total = allUsers.length;
    const managers = allUsers.filter(u => u.emp?.role?.name?.toUpperCase() === 'MANAGER').length;
    const employees = allUsers.filter(u => u.emp?.role?.name?.toUpperCase() === 'EMPLOYEE').length;
    
    return { total, managers, employees };
}

function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(id) {
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[id % colors.length];
}

function getRoleBadgeClass(role) {
    const roleUpper = role.toUpperCase();
    if (roleUpper === 'MANAGER') return 'bg-purple-100 text-purple-800';
    if (roleUpper === 'EMPLOYEE') return 'bg-blue-100 text-blue-800';
    if (roleUpper === 'ADMIN') return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
}

// ==================== Event Listeners ====================

function setupEventListeners() {
    // Add Admin button
    const addBtn = document.querySelector('.header-actions .btn-primary');
    if (addBtn) {
        addBtn.onclick = openAddUserModal;
    }

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // User form submit
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter(user => {
        const emp = user.emp || {};
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        const email = (emp.email || '').toLowerCase();
        const account = (user.account || '').toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm) || account.includes(searchTerm);
    });
    renderUserTable(filteredUsers);
}

// ==================== Modal Functions ====================

function openAddUserModal() {
    editingUserId = null;
    showUserModal('Thêm Nhân Viên Mới');
}

function openEditUserModal(userId) {
    editingUserId = userId;
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    showUserModal('Chỉnh Sửa Nhân Viên', user, 'edit');
}

function openResetPasswordModal(userId) {
    editingUserId = userId;
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    showUserModal('Reset Mật Khẩu', user, 'reset');
}

function showUserModal(title, userData = null, mode = 'add') {
    // mode: 'add', 'edit', 'reset'
    const isEdit = mode === 'edit';
    const isReset = mode === 'reset';
    const isAdd = mode === 'add';
    
    const emp = userData?.emp || {};
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    const roleName = emp.role?.name || '';
    
    const modalHTML = `
        <div id="userModal" class="modal-overlay" onclick="closeUserModalOnOverlay(event)">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeUserModal()">
                        <i data-feather="x"></i>
                    </button>
                </div>
                <form id="userForm" onsubmit="handleUserFormSubmit(event, '${mode}')">
                    <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                        ${isReset ? `
                            <div class="form-group">
                                <label class="form-label">Tài khoản</label>
                                <input type="text" class="form-input" value="${userData.account}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="text" class="form-input" value="${emp.email || ''}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Mật khẩu mới <span style="color: red;">*</span></label>
                                <input type="password" id="password" class="form-input" placeholder="Nhập mật khẩu mới" required>
                            </div>
                        ` : isEdit ? `
                            <div class="form-group">
                                <label class="form-label">Tài khoản</label>
                                <input type="text" class="form-input" value="${userData.account}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Họ và tên <span style="color: red;">*</span></label>
                                <input type="text" id="fullName" class="form-input" value="${fullName}" placeholder="Nguyễn Văn A" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email <span style="color: red;">*</span></label>
                                <input type="email" id="email" class="form-input" value="${emp.email || ''}" placeholder="email@example.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Số điện thoại <span style="color: red;">*</span></label>
                                <input type="tel" id="phone" class="form-input" value="${emp.phone || ''}" placeholder="0123456789" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Địa chỉ <span style="color: red;">*</span></label>
                                <input type="text" id="address" class="form-input" value="${emp.address || ''}" placeholder="Nhập địa chỉ" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">CCCD/CMND <span style="color: red;">*</span></label>
                                <input type="text" id="identityNum" class="form-input" value="${emp.identityNum || ''}" placeholder="012345678901" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Vai trò <span style="color: red;">*</span></label>
                                <select id="roleName" class="form-input" required>
                                    <option value="">Chọn vai trò</option>
                                    <option value="MANAGER" ${roleName === 'MANAGER' ? 'selected' : ''}>Quản lý</option>
                                    <option value="EMPLOYEE" ${roleName === 'EMPLOYEE' ? 'selected' : ''}>Nhân viên</option>
                                </select>
                            </div>
                        ` : `
                            <div class="form-group">
                                <label class="form-label">Tài khoản <span style="color: red;">*</span></label>
                                <input type="text" id="account" class="form-input" placeholder="Nhập tên tài khoản" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Mật khẩu <span style="color: red;">*</span></label>
                                <input type="password" id="password" class="form-input" placeholder="Nhập mật khẩu" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Họ và tên <span style="color: red;">*</span></label>
                                <input type="text" id="fullName" class="form-input" placeholder="Nguyễn Văn A" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email <span style="color: red;">*</span></label>
                                <input type="email" id="email" class="form-input" placeholder="email@example.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Số điện thoại <span style="color: red;">*</span></label>
                                <input type="tel" id="phone" class="form-input" placeholder="0123456789" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Địa chỉ <span style="color: red;">*</span></label>
                                <input type="text" id="address" class="form-input" placeholder="Nhập địa chỉ" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">CCCD/CMND <span style="color: red;">*</span></label>
                                <input type="text" id="identityNum" class="form-input" placeholder="012345678901" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Vai trò <span style="color: red;">*</span></label>
                                <select id="roleName" class="form-input" required>
                                    <option value="">Chọn vai trò</option>
                                    <option value="MANAGER">Quản lý</option>
                                    <option value="EMPLOYEE">Nhân viên</option>
                                </select>
                            </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeUserModal()">Hủy</button>
                        <button type="submit" class="btn btn-primary">${isReset ? 'Reset mật khẩu' : isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    feather.replace();
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.remove();
    }
    editingUserId = null;
}

function closeUserModalOnOverlay(event) {
    if (event.target.id === 'userModal') {
        closeUserModal();
    }
}

async function handleUserFormSubmit(event, mode) {
    event.preventDefault();
    
    if (mode === 'reset') {
        // Reset password
        const password = document.getElementById('password').value;
        await resetPassword(editingUserId, password);
    } else if (mode === 'edit') {
        // Update user info
        const userData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            identityNum: document.getElementById('identityNum').value,
            roleName: document.getElementById('roleName').value
        };
        await updateUser(editingUserId, userData);
    } else {
        // Create new user
        const userData = {
            account: document.getElementById('account').value,
            password: document.getElementById('password').value,
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            identityNum: document.getElementById('identityNum').value,
            roleName: document.getElementById('roleName').value
        };
        await createUser(userData);
    }
}

// ==================== Utility Functions ====================

function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
    loading.innerHTML = '<div style="background: white; padding: 2rem; border-radius: 0.5rem;">Đang tải...</div>';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.remove();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .modal-content {
        background: white;
        border-radius: 0.5rem;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    }
    .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }
    .modal-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-body {
        padding: 1.5rem;
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid #e5e7eb;
    }
    .form-group {
        margin-bottom: 1rem;
    }
    .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
    }
    .form-input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }
    .form-input:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    .form-input:disabled {
        background-color: #f3f4f6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);
