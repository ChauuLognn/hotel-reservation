/**
 * Services Management - Complete API Integration
 */

// ==================== SERVICE API MODULE ====================
const ServiceAPI = {
    baseURL: 'http://localhost:8080/hotel_reservation_premium/api/services',
    
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
            
            // Handle empty responses (204 No Content for DELETE)
            if (response.status === 204) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    async getAllServices() {
        return this._fetch('');
    },
    
    async getServiceByName(name) {
        return this._fetch(`/${encodeURIComponent(name)}`);
    },
    
    async createService(serviceData) {
        return this._fetch('', {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });
    },
    
    async updateService(name, serviceData) {
        return this._fetch(`/${encodeURIComponent(name)}`, {
            method: 'PUT',
            body: JSON.stringify(serviceData)
        });
    },
    
    async deleteService(name) {
        return this._fetch(`/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
    }
};

// ==================== SERVICE UI MODULE ====================
const ServiceUI = {
    formatCurrency(value) {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(value || 0);
    },
    
    getServiceIcon(category) {
        const iconMap = {
            'Dining': 'coffee',
            'Wellness': 'activity',
            'Transport': 'map-pin',
            'Housekeeping': 'wind',
            'Entertainment': 'star',
            'Concierge': 'users'
        };
        return iconMap[category] || 'briefcase';
    },
    
    getIconColor(category) {
        const colorMap = {
            'Dining': '#f59e0b',
            'Wellness': '#ec4899',
            'Transport': '#4f46e5',
            'Housekeeping': '#10b981',
            'Entertainment': '#f97316',
            'Concierge': '#06b6d4'
        };
        return colorMap[category] || '#6b7280';
    },
    
    renderServicesTable(services) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        
        if (!services || services.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-4">No services found</td></tr>';
            return;
        }
        
        tbody.innerHTML = services.map(service => {
            const status = service.status || 'ACTIVE';
            const statusClass = status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
            
            return `
                <tr class="service-card">
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div>
                                <div class="font-medium">${service.name}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td class="font-medium">${this.formatCurrency(service.price)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" data-service-name="${service.name}" title="Edit">
                                <i data-feather="edit" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="action-btn view" data-service-name="${service.name}" title="View">
                                <i data-feather="eye" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="action-btn delete" data-service-name="${service.name}" title="Delete">
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
        // Edit button
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const serviceName = btn.dataset.serviceName;
                ServiceManager.openEditServiceModal(serviceName);
            };
        });
        
        // View button
        document.querySelectorAll('.action-btn.view').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const serviceName = btn.dataset.serviceName;
                ServiceManager.openViewDetailsModal(serviceName);
            };
        });
        
        // Delete button
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const serviceName = btn.dataset.serviceName;
                ServiceManager.showDeleteConfirm(serviceName);
            };
        });
    },
    
    updateStats(services) {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length < 1) return;
        
        // Active Services count
        const activeCount = services.filter(s => s.status === 'ACTIVE').length;
        if (statCards[0]) {
            statCards[0].querySelector('h3').textContent = activeCount;
        }
        
        // Service Requests (placeholder - would need separate API)
        // if (statCards[1]) {
        //     statCards[1].querySelector('h3').textContent = '...';
        // }
        
        // Service Revenue (total of all prices)
        const totalRevenue = services.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
        if (statCards[2]) {
            statCards[2].querySelector('h3').textContent = ServiceUI.formatCurrency(totalRevenue);
        }
    }
};

// ==================== SERVICE MANAGER ====================
const ServiceManager = {
    currentServiceData: null,
    allServices: [],
    searchTimeout: null,
    
    async loadServices() {
        try {
            const services = await ServiceAPI.getAllServices();
            this.allServices = services;
            ServiceUI.renderServicesTable(services);
            ServiceUI.updateStats(services);
            this.showNotification('Services loaded successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to load services: ' + error.message, 'error');
        }
    },
    
    showNotification(message, type = 'info') {
        if (typeof window.hotelApp?.showNotification === 'function') {
            window.hotelApp.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    },
    
    openAddServiceModal() {
        const modal = document.getElementById('addServiceModal');
        if (!modal) {
            this.createAddServiceModal();
            return;
        }
        
        document.getElementById('addServiceForm').reset();
        document.getElementById('addServiceForm').dataset.isEdit = 'false';
        document.getElementById('addServiceFormTitle').textContent = 'Add Service';
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    },
    
    async openEditServiceModal(serviceName) {
        try {
            const service = await ServiceAPI.getServiceByName(serviceName);
            const modal = document.getElementById('addServiceModal') || this.createAddServiceModal();
            
            // Wait for modal elements if just created
            if (!document.getElementById('serviceNameField')) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            document.getElementById('addServiceFormTitle').textContent = 'Edit Service';
            document.getElementById('serviceNameField').value = service.name;
            document.getElementById('serviceNameField').disabled = true;
            document.getElementById('servicePriceField').value = service.price;
            document.getElementById('serviceStatusField').value = service.status || 'ACTIVE';
            document.getElementById('addServiceForm').dataset.isEdit = 'true';
            document.getElementById('addServiceForm').dataset.serviceName = service.name;
            
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        } catch (error) {
            this.showNotification('Failed to load service: ' + error.message, 'error');
        }
    },
    
    async openViewDetailsModal(serviceName) {
        try {
            const service = await ServiceAPI.getServiceByName(serviceName);
            
            // Create or reuse modal
            let modal = document.getElementById('viewServiceModal');
            if (!modal) {
                this.createViewServiceModal();
                modal = document.getElementById('viewServiceModal');
            }
            
            // Populate view modal
            document.getElementById('viewServiceName').textContent = service.name;
            document.getElementById('viewServicePrice').textContent = ServiceUI.formatCurrency(service.price);
            document.getElementById('viewServiceStatus').textContent = (service.status || 'ACTIVE');
            
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        } catch (error) {
            this.showNotification('Failed to load service details: ' + error.message, 'error');
        }
    },
    
    showDeleteConfirm(serviceName) {
        const message = `Are you sure you want to delete the service "${serviceName}"?`;
        if (confirm(message)) {
            this.deleteService(serviceName);
        }
    },
    
    async deleteService(serviceName) {
        try {
            await ServiceAPI.deleteService(serviceName);
            this.showNotification('Service deleted successfully', 'success');
            await this.loadServices();
        } catch (error) {
            this.showNotification('Failed to delete service: ' + error.message, 'error');
        }
    },
    
    createAddServiceModal() {
        const modalHtml = `
            <div id="addServiceModal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:none; align-items:center; justify-content:center; z-index: 1000;">
                <div class="card" style="width:100%; max-width: 500px;">
                    <div class="card-header" style="display:flex; align-items:center; justify-content:space-between;">
                        <h3 class="card-title" id="addServiceFormTitle">Add Service</h3>
                        <button id="closeAddServiceModal" class="action-btn" aria-label="Close"><i data-feather="x"></i></button>
                    </div>
                    <form id="addServiceForm" class="card-body" style="display:flex; flex-direction:column; gap:1rem;">
                        <div class="form-group">
                            <label class="form-label" for="serviceNameField">Service Name</label>
                            <input type="text" id="serviceNameField" class="form-input" placeholder="Service name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="servicePriceField">Price</label>
                            <input type="number" id="servicePriceField" class="form-input" placeholder="0" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="serviceStatusField">Status</label>
                            <select id="serviceStatusField" class="form-input" required>
                                <option value="">-- Select Status --</option>
                                <option value="ACTIVE">Active</option>
                                <option value="STOP">Stop</option>
                            </select>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                            <button type="button" id="cancelAddServiceBtn" class="btn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Service</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('addServiceModal');
        const form = document.getElementById('addServiceForm');
        const closeBtn = document.getElementById('closeAddServiceModal');
        const cancelBtn = document.getElementById('cancelAddServiceBtn');
        
        const self = this;
        
        closeBtn.onclick = () => self.closeAddServiceModal();
        cancelBtn.onclick = () => self.closeAddServiceModal();
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            self.handleAddServiceSubmit();
        });
        
        modal.onclick = (e) => {
            if (e.target === modal) self.closeAddServiceModal();
        };
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        return modal;
    },
    
    createViewServiceModal() {
        const modalHtml = `
            <div id="viewServiceModal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:none; align-items:center; justify-content:center; z-index: 1000;">
                <div class="card" style="width:100%; max-width: 500px;">
                    <div class="card-header" style="display:flex; align-items:center; justify-content:space-between;">
                        <h3 class="card-title">Service Details</h3>
                        <button id="closeViewServiceModal" class="action-btn" aria-label="Close"><i data-feather="x"></i></button>
                    </div>
                    <div class="card-body" style="display:flex; flex-direction:column; gap:1rem;">
                        <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
                            <div style="margin-bottom: 0.75rem;">
                                <strong>Service Name:</strong><br>
                                <span id="viewServiceName">-</span>
                            </div>
                            <div style="margin-bottom: 0.75rem;">
                                <strong>Price:</strong><br>
                                <span id="viewServicePrice">$0</span>
                            </div>
                            <div>
                                <strong>Status:</strong><br>
                                <span id="viewServiceStatus" style="display: inline-block; padding: 0.25rem 0.75rem; background: #d1fae5; color: #065f46; border-radius: 0.25rem; font-size: 0.875rem;">ACTIVE</span>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-end;">
                            <button type="button" id="closeViewServiceBtn" class="btn">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('viewServiceModal');
        const closeBtn = document.getElementById('closeViewServiceModal');
        const closeBtn2 = document.getElementById('closeViewServiceBtn');
        
        const self = this;
        
        closeBtn.onclick = () => self.closeViewServiceModal();
        closeBtn2.onclick = () => self.closeViewServiceModal();
        
        modal.onclick = (e) => {
            if (e.target === modal) self.closeViewServiceModal();
        };
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        return modal;
    },
    
    closeAddServiceModal() {
        const modal = document.getElementById('addServiceModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            document.getElementById('addServiceForm').dataset.isEdit = 'false';
            document.getElementById('serviceNameField').disabled = false;
            document.getElementById('addServiceFormTitle').textContent = 'Add Service';
        }
    },
    
    closeViewServiceModal() {
        const modal = document.getElementById('viewServiceModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    },
    
    async handleAddServiceSubmit() {
        try {
            const form = document.getElementById('addServiceForm');
            const isEdit = form.dataset.isEdit === 'true';
            
            const nameField = document.getElementById('serviceNameField');
            const priceField = document.getElementById('servicePriceField');
            const statusField = document.getElementById('serviceStatusField');
            
            if (!nameField || !priceField || !statusField) {
                this.showNotification('Form fields not found', 'error');
                return;
            }
            
            const name = nameField.value;
            const price = parseFloat(priceField.value);
            const status = statusField.value;
            
            if (!name || !price || !status) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            const validStatuses = ['ACTIVE', 'STOP'];
            if (!validStatuses.includes(status)) {
                this.showNotification('Status must be ACTIVE or STOP', 'error');
                return;
            }
            
            const serviceData = {
                name: name,
                price: price,
                status: status
            };
            
            console.log('Saving service:', serviceData, 'isEdit:', isEdit);
            
            if (isEdit) {
                await ServiceAPI.updateService(name, serviceData);
                this.showNotification('Service updated successfully', 'success');
            } else {
                await ServiceAPI.createService(serviceData);
                this.showNotification('Service created successfully', 'success');
            }
            
            this.closeAddServiceModal();
            await this.loadServices();
        } catch (error) {
            console.error('Error saving service:', error);
            this.showNotification(`Failed to save service: ${error.message}`, 'error');
        }
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
        
        const filtered = this.allServices.filter(service =>
            service.name.toLowerCase().includes(query) ||
            (service.status && service.status.toLowerCase().includes(query))
        );        ServiceUI.renderServicesTable(filtered);
    }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    updateUserGreeting();
    
    // Initialize Add Service button
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) {
        addServiceBtn.onclick = (e) => {
            e.preventDefault();
            ServiceManager.openAddServiceModal();
        };
    }
    
    // Load services
    await ServiceManager.loadServices();
    
    // Setup search
    ServiceManager.setupSearch();
    
    // Close modals on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ServiceManager.closeAddServiceModal();
            ServiceManager.closeViewServiceModal();
        }
    });
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
