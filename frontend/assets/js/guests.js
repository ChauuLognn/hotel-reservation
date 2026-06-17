/**
 * Guests Page - Main JavaScript Module
 * Handles guest management with backend API integration
 */

class GuestManager {
    constructor() {
        this.guests = [];
        this.filteredGuests = [];
        this.editingId = null;
        this.init();
    }

    /**
     * Initialize the page
     */
    async init() {
        this.cacheElements();
        this.attachEventListeners();
        await this.loadGuests();
        this.initializeFeatherIcons();
        updateUserGreeting();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            modal: document.getElementById('guestModal'),
            stayModal: document.getElementById('stayHistoryModal'),
            form: document.getElementById('guestForm'),
            tbody: document.getElementById('guestTableBody'),
            addBtn: document.getElementById('addGuestBtn'),
            searchInput: document.getElementById('guestSearchInput'),
            statTotal: document.getElementById('statTotalGuests'),
            statNew: document.getElementById('statNewGuests'),
            statVip: document.getElementById('statVipGuests'),
            statActive: document.getElementById('statActiveGuests')
        };
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Modal open/close
        this.elements.addBtn?.addEventListener('click', () => this.openModal());
        document.getElementById('closeGuestModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelGuest')?.addEventListener('click', () => this.closeModal());
        document.getElementById('closeStayModal')?.addEventListener('click', () => this.closeStayModal());
        this.elements.modal?.addEventListener('mousedown', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });
        this.elements.stayModal?.addEventListener('mousedown', (e) => {
            if (e.target === this.elements.stayModal) this.closeStayModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // Form submission
        this.elements.form?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search
        this.elements.searchInput?.addEventListener('input', (e) => this.filterGuests(e.target.value));

        // Use event delegation for action buttons (attach once)
        if (this.elements.tbody) {
            this.elements.tbody.addEventListener('click', (e) => {
                const btn = e.target.closest('.action-btn');
                if (!btn) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const id = parseInt(btn.getAttribute('data-id'));
                if (isNaN(id)) {
                    console.warn('Invalid guest ID:', btn.getAttribute('data-id'));
                    return;
                }
                
                if (btn.classList.contains('edit')) {
                    this.handleEdit(id);
                } else if (btn.classList.contains('view')) {
                    this.handleViewHistory(id);
                } else if (btn.classList.contains('delete')) {
                    this.handleDelete(id);
                }
            });
        }
    }

    /**
     * Load guests from API
     */
    async loadGuests() {
        try {
            this.elements.tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;"><p style="color: #9ca3af;">Đang tải...</p></td></tr>';
            this.guests = await GuestAPI.getAll();
            this.filteredGuests = [...this.guests];
            this.renderGuests();
            this.updateStats();
        } catch (error) {
            window.hotelApp?.showNotification('Lỗi tải danh sách khách: ' + error.message, 'error');
            this.renderEmptyState();
        }
    }

    /**
     * Render guests table
     */
    renderGuests() {
        if (this.filteredGuests.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.elements.tbody.innerHTML = this.filteredGuests.map(guest => {
            const initials = this.getInitials(guest.firstName, guest.lastName);
            const color = this.getColorForInitials(initials);
            const dobDisplay = guest.dateOfBirth ? new Date(guest.dateOfBirth).toLocaleDateString('vi-VN') : '';

            return `
                <tr data-guest-id="${guest.id || ''}">
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background-color: ${color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.875rem;">
                                ${initials}
                            </div>
                            <div>
                                <div class="font-medium">${this.escapeHtml(guest.firstName || '')} ${this.escapeHtml(guest.lastName || '')}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">ID: #${guest.id || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div style="font-size: 0.875rem; color: #6b7280;">${this.escapeHtml(guest.phone || '')}</div>
                    </td>
                    <td style="font-size: 0.875rem;">${this.escapeHtml(guest.identityNum || '')}</td>
                    <td style="font-size: 0.875rem;">${dobDisplay || '-'}</td>
                    <td><span class="badge badge-success">Active</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" data-id="${guest.id || ''}" title="Edit" type="button">
                                <i data-feather="edit" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="action-btn view" data-id="${guest.id || ''}" title="View History" type="button">
                                <i data-feather="eye" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="action-btn delete" data-id="${guest.id || ''}" title="Delete" type="button">
                                <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.attachRowEventListeners();
        this.initializeFeatherIcons();
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        this.elements.tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <p style="color: #9ca3af;">Không có dữ liệu khách</p>
                </td>
            </tr>
        `;
    }

    /**
     * Attach event listeners to table rows
     * Note: Event delegation is now handled in attachEventListeners()
     * This method is kept for compatibility but does nothing
     */
    attachRowEventListeners() {
        // Event listeners are attached via delegation in attachEventListeners()
        // No need to attach here to avoid duplicates
    }

    /**
     * Handle form submission (create or update)
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = Object.fromEntries(new FormData(this.elements.form).entries());
        const errors = this.validateForm(formData);

        if (errors.length) {
            window.hotelApp?.showNotification(errors.join('\n'), 'error');
            return;
        }

        try {
            // Prepare API data (only send fields that match backend)
            const apiData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                identityNum: formData.identityNum.trim(),
                phone: formData.phone.trim(),
                dateOfBirth: formData.dateOfBirth
            };

            if (this.editingId) {
                await GuestAPI.update(this.editingId, apiData);
                window.hotelApp?.showNotification('Cập nhật khách thành công', 'success');
            } else {
                await GuestAPI.create(apiData);
                window.hotelApp?.showNotification('Tạo khách mới thành công', 'success');
            }

            this.closeModal();
            await this.loadGuests();
        } catch (error) {
            window.hotelApp?.showNotification('Lỗi: ' + error.message, 'error');
        }
    }

    /**
     * Validate form data
     */
    validateForm(data) {
        const errors = [];

        if (!data.firstName?.trim()) errors.push('Tên là bắt buộc');
        if (!data.lastName?.trim()) errors.push('Họ là bắt buộc');
        if (!data.identityNum?.trim()) errors.push('Số CMND/CCCD/Passport là bắt buộc');
        if (!data.phone?.trim()) errors.push('Số điện thoại là bắt buộc');
        if (!data.dateOfBirth) errors.push('Ngày sinh là bắt buộc');

        // Validate identity number (9, 12 digits, or passport-like)
        if (data.identityNum && !/^(\d{9}|\d{12}|[A-Z0-9]{5,})$/.test(data.identityNum.trim())) {
            errors.push('CMND/CCCD/Passport không hợp lệ');
        }

        // Validate phone (Vietnam format)
        if (data.phone && !/^(\+84|0)(3|5|7|8|9)\d{8}$/.test(data.phone.replace(/\s|-/g, ''))) {
            errors.push('Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx)');
        }

        return errors;
    }

    /**
     * Open modal for creating new guest
     */
    openModal() {
        if (!this.editingId) {
            this.elements.form.reset();
            this.elements.modal.querySelector('.card-title').textContent = 'Thêm Khách Mới';
        }
        this.elements.modal.classList.remove('hidden');
        this.elements.modal.style.display = 'flex';
        // Reinitialize icons after modal is shown
        setTimeout(() => {
            this.initializeFeatherIcons();
        }, 100);
    }

    /**
     * Close modal
     */
    closeModal() {
        this.elements.modal.classList.add('hidden');
        this.elements.modal.style.display = 'none';
        this.elements.form.reset();
        this.editingId = null;
    }

    /**
     * Close stay history modal
     */
    closeStayModal() {
        this.elements.stayModal.classList.add('hidden');
        this.elements.stayModal.style.display = 'none';
    }

    /**
     * Handle edit action
     */
    async handleEdit(id) {
        try {
            // Try to get from cached list first
            let guest = this.guests.find(g => g.id === id);
            
            // If not found, fetch from API
            if (!guest) {
                guest = await GuestAPI.getById(id);
            }
            
            if (!guest) {
                window.hotelApp?.showNotification('Không tìm thấy khách', 'error');
                return;
            }

            this.editingId = id;

            // Populate form with backend data only
            this.elements.form.firstName.value = guest.firstName || '';
            this.elements.form.lastName.value = guest.lastName || '';
            this.elements.form.identityNum.value = guest.identityNum || '';
            this.elements.form.phone.value = guest.phone || '';
            this.elements.form.dateOfBirth.value = guest.dateOfBirth || '';

            this.elements.modal.querySelector('.card-title').textContent = 'Sửa Thông Tin Khách';
            this.openModal();
        } catch (error) {
            window.hotelApp?.showNotification('Lỗi khi tải thông tin khách: ' + error.message, 'error');
        }
    }

    /**
     * Handle delete action
     */
    handleDelete(id) {
        if (!window.hotelApp) {
            if (!confirm(`Xóa khách #${id}?`)) return;
        } else {
            window.hotelApp.confirm(`Xóa khách #${id}?`, async () => {
                await this.performDelete(id);
            });
            return;
        }
        this.performDelete(id);
    }

    /**
     * Perform the actual delete operation
     */
    async performDelete(id) {
        try {
            await GuestAPI.delete(id);
            if (window.hotelApp) {
                window.hotelApp.showNotification('Xóa khách thành công', 'success');
            } else {
                alert('Xóa khách thành công');
            }
            await this.loadGuests();
        } catch (error) {
            const errorMsg = error.message || 'Lỗi không xác định';
            if (window.hotelApp) {
                window.hotelApp.showNotification('Lỗi xóa: ' + errorMsg, 'error');
            } else {
                alert('Lỗi xóa: ' + errorMsg);
            }
        }
    }

    /**
     * Handle view stay history
     */
    async handleViewHistory(id) {
        try {
            const guest = this.guests.find(g => g.id === id);
            if (!guest) return;

            const stays = await GuestAPI.getStayHistory(id);
            this.displayStayHistory(guest, stays);
        } catch (error) {
            window.hotelApp?.showNotification('Lỗi tải lịch sử: ' + error.message, 'error');
        }
    }

    /**
     * Display stay history in modal
     */
    displayStayHistory(guest, stayData) {
        const historyContent = document.getElementById('stayHistoryContent');

        if (!stayData || !stayData.items || stayData.items.length === 0) {
            historyContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #9ca3af;">
                    <p>Không có lịch sử lưu trú</p>
                </div>
            `;
            this.elements.stayModal.classList.remove('hidden');
            this.elements.stayModal.style.display = 'flex';
            return;
        }

        const itemsHTML = stayData.items.map((item, idx) => {
            const checkIn = new Date(item.checkInAt).toLocaleString('vi-VN');
            const checkOut = item.checkOutAt ? new Date(item.checkOutAt).toLocaleString('vi-VN') : 'Chưa checkout';
            const duration = item.checkOutAt ? Math.ceil((new Date(item.checkOutAt) - new Date(item.checkInAt)) / (1000 * 60 * 60 * 24)) + ' ngày' : 'Đang ở';

            return `
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <div style="font-weight: 600; color: #1f2937;">Lần lưu trú #${idx + 1} - Phòng #${item.roomId}</div>
                        <span class="badge badge-info" style="background-color: #dbeafe; color: #1e40af;">${duration}</span>
                    </div>
                    <div style="font-size: 0.875rem; color: #6b7280;">
                        <div><strong>Check-in:</strong> ${checkIn}</div>
                        <div><strong>Check-out:</strong> ${checkOut}</div>
                    </div>
                </div>
            `;
        }).join('');

        historyContent.innerHTML = `
            <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
                <div style="font-weight: 600; font-size: 1.125rem; color: #1f2937;">${stayData.guestName || `${guest.firstName} ${guest.lastName}`}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">CMND/CCCD: ${stayData.IdentityNum}</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Tổng lần lưu trú: ${stayData.items.length}</div>
            </div>
            ${itemsHTML}
        `;

        this.elements.stayModal.classList.remove('hidden');
        this.elements.stayModal.style.display = 'flex';
        this.initializeFeatherIcons();
    }

    /**
     * Filter guests by search term
     */
    filterGuests(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredGuests = this.guests.filter(g => {
            const fullName = `${g.firstName} ${g.lastName}`.toLowerCase();
            return fullName.includes(term) || g.phone.includes(term) || g.identityNum.includes(term);
        });
        this.renderGuests();
    }

    /**
     * Update statistics
     */
    updateStats() {
        const total = this.guests.length;
        const currentMonth = new Date().getMonth();
        const newThisMonth = this.guests.filter(g => {
            const createdMonth = new Date().getMonth();
            return createdMonth === currentMonth;
        }).length;

        this.elements.statTotal.textContent = total;
        this.elements.statNew.textContent = newThisMonth;
        this.elements.statVip.textContent = 0; // Not available in backend
        this.elements.statActive.textContent = Math.min(total, 5);
    }

    /**
     * Get initials from first and last name
     */
    getInitials(firstName, lastName) {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return (first + last) || '?';
    }

    /**
     * Get consistent color for initials
     */
    getColorForInitials(initials) {
        const colors = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#14b8a6'];
        const charCode = (initials[0] || 'A').charCodeAt(0);
        return colors[charCode % colors.length];
    }

    /**
     * Initialize Feather icons
     */
    initializeFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.guestManager = new GuestManager();
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
