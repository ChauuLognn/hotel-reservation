/**
 * Users Management - Complete Employee API Integration
 */

// ==================== EMPLOYEE API MODULE ====================
const EmployeeAPI = {
    baseURL: 'http://localhost:8080/hotel_reservation_premium/api/emps',
    
    async _fetch(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API Error: ${response.status} - ${error}`);
            }
            
            if (response.status === 204) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    async getAllEmployees() {
        return this._fetch('');
    },
    
    async getEmployeeById(id) {
        return this._fetch(`/${id}`);
    },
    
    async createEmployee(empData) {
        return this._fetch('', {
            method: 'POST',
            body: JSON.stringify(empData)
        });
    },
    
    async updateEmployee(id, empData) {
        return this._fetch(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(empData)
        });
    },
    
    async deleteEmployee(id) {
        return this._fetch(`/${id}`, {
            method: 'DELETE'
        });
    }
};

// ==================== EMPLOYEE UI MODULE ====================
const EmployeeUI = {
    roleMapping: {
        'MANAGER': 'Quản lý',
        'EMPLOYEE': 'Nhân Viên'
    },
    
    roleValueMap: {
        1: 'MANAGER',
        2: 'EMPLOYEE'
    },
    
    getRoleVietnamName(roleString) {
        return this.roleMapping[roleString] || roleString;
    },
    
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    },
    
    parseDate(dateString) {
        if (!dateString) return '';
        return dateString; // Already in YYYY-MM-DD format
    },
    
    getRoleBadgeClass(roleString) {
        switch(roleString) {
            case 'MANAGER': return 'badge-warning';
            case 'EMPLOYEE': return 'badge-success';
            default: return 'badge';
        }
    },
    
    getInitials(firstName, lastName) {
        const first = (firstName || '').charAt(0).toUpperCase();
        const last = (lastName || '').charAt(0).toUpperCase();
        return (first + last) || 'U';
    },
    
    getAvatarColor(id) {
        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return colors[Math.abs(id) % colors.length];
    },
    
    renderEmployeesTable(employees) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        
        if (!employees || employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-4">No employees found</td></tr>';
            return;
        }
        
        tbody.innerHTML = employees.map(emp => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            const roleVN = this.getRoleVietnamName(emp.role);
            const badgeClass = this.getRoleBadgeClass(emp.role);
            const initials = this.getInitials(emp.firstName, emp.lastName);
            const avatarColor = this.getAvatarColor(emp.id);
            const dateOfBirth = this.formatDate(emp.dateOfBirth);
            
            return `
                <tr class="user-card" data-emp-id="${emp.id}">
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background-color: ${avatarColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.875rem;">
                                ${initials}
                            </div>
                            <div>
                                <div class="font-medium">${fullName}</div>
                                <div class="text-sm text-gray-500">${emp.email}</div>
                            </div>
                        </div>
                    </td>
                    <td>${emp.email}</td>
                    <td>
                        <span class="badge ${badgeClass}">${roleVN}</span>
                    </td>
                    <td>${dateOfBirth}</td>
                    <td class="text-sm text-gray-600">${emp.phone || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" data-emp-id="${emp.id}" title="Edit">
                                <i data-feather="edit" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="action-btn delete" data-emp-id="${emp.id}" title="Delete">
                                <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        this.bindRowEvents();
    },
    
    bindRowEvents() {
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const empId = btn.dataset.empId;
                EmployeeManager.openEditModal(empId);
            };
        });
        
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const empId = btn.dataset.empId;
                EmployeeManager.showDeleteConfirm(empId);
            };
        });
    }
};

// ==================== EMPLOYEE MANAGER ====================
const EmployeeManager = {
    allEmployees: [],
    searchTimeout: null,
    
    async loadEmployees() {
        try {
            const employees = await EmployeeAPI.getAllEmployees();
            this.allEmployees = employees;
            EmployeeUI.renderEmployeesTable(employees);
            this.showNotification('Employees loaded successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to load employees: ' + error.message, 'error');
        }
    },
    
    showNotification(message, type = 'info') {
        if (typeof window.hotelApp?.showNotification === 'function') {
            window.hotelApp.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    },
    
    async openEditModal(empId) {
        try {
            const employee = await EmployeeAPI.getEmployeeById(empId);
            const modal = document.getElementById('userModal');
            const form = document.getElementById('userForm');
            
            // Set form to edit mode
            form.dataset.isEdit = 'true';
            form.dataset.empId = empId;
            
            // Populate form with employee data
            document.getElementById('firstName').value = employee.firstName || '';
            document.getElementById('lastName').value = employee.lastName || '';
            document.getElementById('identityNum').value = employee.identityNum || '';
            document.getElementById('phone').value = employee.phone || '';
            document.getElementById('email').value = employee.email || '';
            document.getElementById('address').value = employee.address || '';
            document.getElementById('dateOfBirth').value = EmployeeUI.parseDate(employee.dateOfBirth) || '';
            document.getElementById('role').value = employee.role || '';
            
            // Disable ID field for editing
            document.getElementById('firstName').disabled = false;
            
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        } catch (error) {
            this.showNotification('Failed to load employee: ' + error.message, 'error');
        }
    },
    
    showDeleteConfirm(empId) {
        const employee = this.allEmployees.find(e => e.id === parseInt(empId));
        const name = employee ? `${employee.firstName} ${employee.lastName}` : 'this employee';
        const message = `Are you sure you want to delete ${name}?`;
        
        if (confirm(message)) {
            this.deleteEmployee(empId);
        }
    },
    
    async deleteEmployee(empId) {
        try {
            await EmployeeAPI.deleteEmployee(empId);
            this.showNotification('Employee deleted successfully', 'success');
            await this.loadEmployees();
        } catch (error) {
            this.showNotification('Failed to delete employee: ' + error.message, 'error');
        }
    },
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            const form = document.getElementById('userForm');
            const isEdit = form.dataset.isEdit === 'true';
            const empId = form.dataset.empId;
            
            // Get form values
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const identityNum = document.getElementById('identityNum').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const address = document.getElementById('address').value.trim();
            const dateOfBirth = document.getElementById('dateOfBirth').value;
            const role = document.getElementById('role').value;
            
            // Validation
            if (!firstName) {
                this.showNotification('Please enter first name', 'error');
                return;
            }
            if (!lastName) {
                this.showNotification('Please enter last name', 'error');
                return;
            }
            if (!this.validateIdentityNum(identityNum)) {
                this.showNotification('Identity number must be 9 or 12 digits', 'error');
                return;
            }
            if (!this.validatePhone(phone)) {
                this.showNotification('Invalid Vietnam phone number format', 'error');
                return;
            }
            if (email && !this.validateEmail(email)) {
                this.showNotification('Invalid email format', 'error');
                return;
            }
            if (!dateOfBirth) {
                this.showNotification('Please select date of birth', 'error');
                return;
            }
            if (!this.validateDateOfBirth(dateOfBirth)) {
                this.showNotification('Date of birth must be before today', 'error');
                return;
            }
            if (!role) {
                this.showNotification('Please select a role', 'error');
                return;
            }
            
            // Prepare employee data
            const empData = {
                firstName: firstName,
                lastName: lastName,
                identityNum: identityNum,
                phone: phone,
                email: email,
                address: address,
                dateOfBirth: dateOfBirth,
                role: role
            };
            
            console.log('Saving employee:', empData, 'isEdit:', isEdit);
            
            if (isEdit) {
                await EmployeeAPI.updateEmployee(empId, empData);
                this.showNotification('Employee updated successfully', 'success');
            } else {
                await EmployeeAPI.createEmployee(empData);
                this.showNotification('Employee created successfully', 'success');
            }
            
            this.closeModal();
            await this.loadEmployees();
        } catch (error) {
            console.error('Error saving employee:', error);
            this.showNotification(`Failed to save employee: ${error.message}`, 'error');
        }
    },
    
    validateIdentityNum(id) {
        const cleaned = String(id || '').replace(/\s|-/g, '');
        return /^(\d{9}|\d{12})$/.test(cleaned);
    },
    
    validatePhone(phone) {
        const cleaned = String(phone || '').replace(/\s|-/g, '');
        return /^(\+84|0)(3|5|7|8|9)\d{8}$/.test(cleaned);
    },
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validateDateOfBirth(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        return date < today;
    },
    
    closeModal() {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        
        modal.classList.add('hidden');
        modal.style.display = 'none';
        form.reset();
        form.dataset.isEdit = 'false';
        form.dataset.empId = '';
    },
    
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.oninput = () => this.debounceSearch();
        }
    },
    
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.performSearch(), 300);
    },
    
    performSearch() {
        const searchInput = document.querySelector('.search-input');
        const query = searchInput.value.toLowerCase();
        
        const filtered = this.allEmployees.filter(emp => 
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query) ||
            (emp.email && emp.email.toLowerCase().includes(query)) ||
            (emp.phone && emp.phone.includes(query)) ||
            (emp.identityNum && emp.identityNum.includes(query))
        );
        
        EmployeeUI.renderEmployeesTable(filtered);
    }
};

// ==================== FORM FIELD MODIFICATIONS ====================
function updateFormFields() {
    const form = document.getElementById('userForm');
    if (!form) return;
    
    // Find the fullName field
    const fullNameField = document.getElementById('fullName');
    if (fullNameField && fullNameField.parentElement) {
        // Replace fullName with firstName and lastName
        const fullNameGroup = fullNameField.parentElement;
        
        fullNameGroup.innerHTML = `
            <div class="form-group">
                <label class="form-label" for="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" class="form-input" placeholder="John" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" class="form-input" placeholder="Doe" required>
            </div>
        `;
        fullNameGroup.style.gridColumn = 'span 2';
    }
    
    // Replace CCCD with identityNum
    const cccdField = document.getElementById('cccd');
    if (cccdField) {
        cccdField.id = 'identityNum';
        cccdField.name = 'identityNum';
        cccdField.parentElement.querySelector('label').htmlFor = 'identityNum';
    }
    
    // Add dateOfBirth field
    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.parentElement.parentElement) {
        const phoneGroup = phoneField.parentElement.parentElement;
        
        // Insert dateOfBirth after phone
        const dateGroup = document.createElement('div');
        dateGroup.className = 'form-group';
        dateGroup.innerHTML = `
            <label class="form-label" for="dateOfBirth">Date of Birth</label>
            <input type="date" id="dateOfBirth" name="dateOfBirth" class="form-input" required>
        `;
        phoneGroup.insertBefore(dateGroup, phoneGroup.children[1]);
    }
    
    // Update role options to use integer values (1=MANAGER, 2=EMPLOYEE)
    const roleField = document.getElementById('role');
    if (roleField) {
        roleField.innerHTML = `
            <option value="">-- Select Role --</option>
            <option value="1">Quản lý (MANAGER)</option>
            <option value="2">Nhân Viên (EMPLOYEE)</option>
        `;
    }
    
    // Remove status field (not in backend)
    const statusField = document.getElementById('status');
    if (statusField) {
        statusField.parentElement.style.display = 'none';
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    updateUserGreeting();
    updateFormFields();
    
    // Setup modal handlers
    const modal = document.getElementById('userModal');
    const openBtn = document.getElementById('addUserBtn');
    const closeBtn = document.getElementById('closeUserModal');
    const cancelBtn = document.getElementById('cancelUser');
    const form = document.getElementById('userForm');
    
    function resetForm() {
        form.reset();
        form.dataset.isEdit = 'false';
        form.dataset.empId = '';
    }
    
    function openModal() {
        resetForm();
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
    
    function closeModal() {
        EmployeeManager.closeModal();
    }
    
    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('mousedown', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    form?.addEventListener('submit', (e) => EmployeeManager.handleFormSubmit(e));
    
    // Load employees
    await EmployeeManager.loadEmployees();
    
    // Setup search
    EmployeeManager.setupSearch();
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
