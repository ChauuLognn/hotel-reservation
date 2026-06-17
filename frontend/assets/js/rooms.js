/**
 * Rooms Page - Complete API Integration
 */

// ==================== ROOM API MODULE ====================
const RoomAPI = {
    baseURL: 'http://localhost:8080/hotel_reservation_premium/api/rooms',
    
    // Utility function for API calls
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
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // ========== ROOM OPERATIONS ==========
    
    async getAllRooms() {
        return this._fetch('');
    },
    
    async getRoomById(id) {
        return this._fetch(`/${id}`);
    },
    
    async createRoom(roomData) {
        return this._fetch('', {
            method: 'POST',
            body: JSON.stringify(roomData)
        });
    },
    
    async updateRoom(id, roomData) {
        return this._fetch(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(roomData)
        });
    },
    
    async deleteRoom(id) {
        return this._fetch(`/${id}`, {
            method: 'DELETE'
        });
    },
    
    async findAvailableRooms(name, checkIn, checkOut) {
        const params = new URLSearchParams();
        if (name && name.trim()) {
            params.append('name', name.trim());
        }
        if (checkIn) {
            params.append('checkIn', checkIn);
        }
        if (checkOut) {
            params.append('checkOut', checkOut);
        }
        
        const queryString = params.toString();
        const endpoint = queryString ? `/available?${queryString}` : '/available';
        console.log('Finding available rooms with endpoint:', endpoint);
        
        return this._fetch(endpoint);
    },
    
    // ========== ROOM TYPE OPERATIONS ==========
    
    async getAllRoomTypes() {
        return this._fetch('/roomTypes');
    },
    
    async getRoomTypeByName(name) {
        return this._fetch(`/roomTypes/${encodeURIComponent(name)}`);
    },
    
    async createRoomType(typeData) {
        return this._fetch('/roomTypes', {
            method: 'POST',
            body: JSON.stringify(typeData)
        });
    },
    
    async updateRoomType(name, typeData) {
        return this._fetch(`/roomTypes/${encodeURIComponent(name)}`, {
            method: 'PUT',
            body: JSON.stringify(typeData)
        });
    },
    
    async deleteRoomType(name) {
        return this._fetch(`/roomTypes/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
    }
};

// ==================== ROOM UI MODULE ====================
const RoomUI = {
    formatCurrency(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    },
    
    getStatusBadgeClass(status) {
        switch(status) {
            case 'AVAILABLE': return 'badge-success';
            case 'OCCUPIED': return 'badge-danger';
            case 'MAINTENANCE': return 'badge-warning';
            default: return 'badge-secondary';
        }
    },
    
    getStatusDisplay(status) {
        const map = {
            'AVAILABLE': 'Available',
            'OCCUPIED': 'Occupied',
            'MAINTENANCE': 'Maintenance'
        };
        return map[status] || status;
    },
    
    renderRoomsTable(rooms) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        
        if (!rooms || rooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-4">No rooms found</td></tr>';
            return;
        }
        
        tbody.innerHTML = rooms.map(room => `
            <tr class="room-card">
                <td class="font-medium text-gray-900">${room.id}</td>
                <td>${room.typeName}</td>
                <td>
                    <div style="display: flex; align-items: center;">
                        <i data-feather="user" style="width: 12px; height: 12px; margin-right: 4px;"></i>
                        <span id="capacity-${room.id}">-</span>
                    </div>
                </td>
                <td class="text-gray-500" id="price-${room.id}">$0</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(room.status)}">${this.getStatusDisplay(room.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-room-id="${room.id}" title="Edit">
                            <i data-feather="edit" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button class="action-btn view" data-room-id="${room.id}" title="View Details">
                            <i data-feather="eye" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button class="action-btn delete" data-room-id="${room.id}" title="Delete">
                            <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        // Load room type details and bind events
        this.loadRoomTypeDetails(rooms);
        this.bindRowEvents();
    },
    
    async loadRoomTypeDetails(rooms) {
        try {
            const roomTypes = await RoomAPI.getAllRoomTypes();
            const typeMap = {};
            roomTypes.forEach(type => {
                typeMap[type.name] = type;
            });
            
            rooms.forEach(room => {
                const type = typeMap[room.typeName];
                if (type) {
                    const capacityEl = document.getElementById(`capacity-${room.id}`);
                    const priceEl = document.getElementById(`price-${room.id}`);
                    
                    if (capacityEl) {
                        capacityEl.textContent = `${type.capacity} Guests`;
                    }
                    if (priceEl) {
                        priceEl.textContent = this.formatCurrency(type.basePrice);
                    }
                }
            });
        } catch (error) {
            console.warn('Could not load room type details:', error);
        }
    },
    
    updateStats(rooms) {
        const stats = {
            total: rooms.length,
            available: rooms.filter(r => r.status === 'AVAILABLE').length,
            occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
            maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length
        };
        
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[0]) statCards[0].querySelector('h3').textContent = stats.total;
        if (statCards[1]) statCards[1].querySelector('h3').textContent = stats.available;
        if (statCards[2]) statCards[2].querySelector('h3').textContent = stats.occupied;
        if (statCards[3]) statCards[3].querySelector('h3').textContent = stats.maintenance;
    },
    
    bindRowEvents() {
        // Edit button
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const roomId = btn.dataset.roomId;
                RoomManager.openEditRoomModal(roomId);
            };
        });
        
        // View button
        document.querySelectorAll('.action-btn.view').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const roomId = btn.dataset.roomId;
                RoomManager.openViewDetailsModal(roomId);
            };
        });
        
        // Delete button
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const roomId = btn.dataset.roomId;
                RoomManager.showDeleteConfirm(roomId);
            };
        });
    }
};

// ==================== ROOM MANAGER ====================
const RoomManager = {
    currentRoomData: null,
    searchTimeout: null,
    
    async loadRooms() {
        try {
            const rooms = await RoomAPI.getAllRooms();
            RoomUI.renderRoomsTable(rooms);
            RoomUI.updateStats(rooms);
            this.showNotification('Rooms loaded successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to load rooms: ' + error.message, 'error');
        }
    },
    
    async loadRoomTypes() {
        try {
            return await RoomAPI.getAllRoomTypes();
        } catch (error) {
            this.showNotification('Failed to load room types: ' + error.message, 'error');
            return [];
        }
    },
    
    showNotification(message, type = 'info') {
        if (typeof window.hotelApp?.showNotification === 'function') {
            window.hotelApp.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    },
    
    async openAddRoomModal() {
        const modal = document.getElementById('addRoomModal');
        if (!modal) {
            this.createAddRoomModal();
            // Wait a moment for modal to be created
            await new Promise(resolve => setTimeout(resolve, 100));
            return this.openAddRoomModal();
        }
        
        document.getElementById('addRoomForm').reset();
        
        // Populate room types dropdown
        const roomTypeSelect = document.getElementById('roomTypeField');
        if (roomTypeSelect) {
            try {
                const roomTypes = await RoomAPI.getAllRoomTypes();
                roomTypeSelect.innerHTML = '<option value="">-- Select Room Type --</option>' +
                    roomTypes.map(type => `<option value="${type.name}">${type.name} (${type.capacity} guests) - ${RoomUI.formatCurrency(type.basePrice)}</option>`).join('');
            } catch (error) {
                console.error('Failed to load room types:', error);
                roomTypeSelect.innerHTML = '<option value="">-- Error loading types --</option>';
            }
        }
        
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    },
    
    async openEditRoomModal(roomId) {
        try {
            const room = await RoomAPI.getRoomById(roomId);
            const modal = document.getElementById('addRoomModal') || this.createAddRoomModal();
            
            // Wait if modal was just created
            if (!document.getElementById('roomIdField')) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Populate room types dropdown first
            const roomTypeSelect = document.getElementById('roomTypeField');
            if (roomTypeSelect) {
                try {
                    const roomTypes = await RoomAPI.getAllRoomTypes();
                    roomTypeSelect.innerHTML = '<option value="">-- Select Room Type --</option>' +
                        roomTypes.map(type => `<option value="${type.name}">${type.name} (${type.capacity} guests) - ${RoomUI.formatCurrency(type.basePrice)}</option>`).join('');
                    roomTypeSelect.value = room.typeName;
                } catch (error) {
                    console.error('Failed to load room types:', error);
                }
            }
            
            // Fill form with room data
            document.getElementById('addRoomFormTitle').textContent = 'Edit Room';
            document.getElementById('roomIdField').value = room.id;
            document.getElementById('roomStatusField').value = room.status;
            document.getElementById('addRoomForm').dataset.isEdit = 'true';
            document.getElementById('addRoomForm').dataset.roomId = room.id;
            
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        } catch (error) {
            this.showNotification('Failed to load room: ' + error.message, 'error');
        }
    },
    
    async openViewDetailsModal(roomId) {
        const modal = document.getElementById('roomDetailsModal');
        if (modal) {
            const titleEl = document.getElementById('roomDetailsTitle');
            const metaEl = document.getElementById('roomMeta');
            
            try {
                const room = await RoomAPI.getRoomById(roomId);
                const type = await RoomAPI.getRoomTypeByName(room.typeName);
                
                titleEl.textContent = `Room ${room.id}`;
                metaEl.innerHTML = `
                    <div>
                        <strong>Type:</strong> ${room.typeName}<br>
                        <strong>Status:</strong> <span class="badge ${RoomUI.getStatusBadgeClass(room.status)}">${RoomUI.getStatusDisplay(room.status)}</span><br>
                        <strong>Capacity:</strong> ${type.capacity} Guests<br>
                        <strong>Price/Night:</strong> ${RoomUI.formatCurrency(type.basePrice)}<br>
                        <strong>Description:</strong> ${type.description}
                    </div>
                `;
                
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            } catch (error) {
                this.showNotification('Failed to load room details: ' + error.message, 'error');
            }
        }
    },
    
    showDeleteConfirm(roomId) {
        const message = `Are you sure you want to delete room ${roomId}?`;
        if (confirm(message)) {
            this.deleteRoom(roomId);
        }
    },
    
    async deleteRoom(roomId) {
        try {
            await RoomAPI.deleteRoom(roomId);
            this.showNotification('Room deleted successfully', 'success');
            this.loadRooms();
        } catch (error) {
            this.showNotification('Failed to delete room: ' + error.message, 'error');
        }
    },
    
    createAddRoomModal() {
        const modalHtml = `
            <div id="addRoomModal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:none; align-items:center; justify-content:center; z-index: 1000;">
                <div class="card" style="width:100%; max-width: 500px;">
                    <div class="card-header" style="display:flex; align-items:center; justify-content:space-between;">
                        <h3 class="card-title" id="addRoomFormTitle">Add Room</h3>
                        <button id="closeAddRoomModal" class="action-btn" aria-label="Close"><i data-feather="x"></i></button>
                    </div>
                    <form id="addRoomForm" class="card-body" style="display:flex; flex-direction:column; gap:1rem;">
                        <div class="form-group">
                            <label class="form-label" for="roomIdField">Room Number</label>
                            <input type="number" id="roomIdField" class="form-input" placeholder="Room number" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="roomTypeField">Room Type</label>
                            <select id="roomTypeField" class="form-input" required></select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="roomStatusField">Status</label>
                            <select id="roomStatusField" class="form-input" required>
                                <option value="">-- Select Status --</option>
                                <option value="READY">READY</option>
                                <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                            </select>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                            <button type="button" id="cancelAddRoomBtn" class="btn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Room</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('addRoomModal');
        const form = document.getElementById('addRoomForm');
        const closeBtn = document.getElementById('closeAddRoomModal');
        const cancelBtn = document.getElementById('cancelAddRoomBtn');
        
        const self = this;
        
        closeBtn.onclick = () => self.closeAddRoomModal();
        cancelBtn.onclick = () => self.closeAddRoomModal();
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            self.handleAddRoomSubmit();
        });
        
        modal.onclick = (e) => {
            if (e.target === modal) self.closeAddRoomModal();
        };
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        return modal;
    },
    
    closeAddRoomModal() {
        const modal = document.getElementById('addRoomModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            document.getElementById('addRoomForm').dataset.isEdit = 'false';
            document.getElementById('addRoomFormTitle').textContent = 'Add Room';
        }
    },
    
    async handleAddRoomSubmit() {
        const form = document.getElementById('addRoomForm');
        const isEdit = form.dataset.isEdit === 'true';
        const roomId = document.getElementById('roomIdField').value.trim();
        const typeName = document.getElementById('roomTypeField').value.trim();
        const status = document.getElementById('roomStatusField').value.trim();

        // Validate
        const validStatuses = ['READY', 'UNDER_REPAIR'];
        if (!roomId || !typeName || !status) {
            RoomManager.showNotification('Vui lòng điền đầy đủ thông tin.', 'error');
            return;
        }
        if (!validStatuses.includes(status)) {
            RoomManager.showNotification('Trạng thái phòng không hợp lệ. Chỉ chọn READY hoặc UNDER_REPAIR.', 'error');
            return;
        }

        const roomData = {
            id: parseInt(roomId),
            typeName,
            status
        };

        try {
            if (isEdit) {
                await RoomAPI.updateRoom(roomData.id, roomData);
                RoomManager.showNotification('Room updated successfully', 'success');
            } else {
                await RoomAPI.createRoom(roomData);
                RoomManager.showNotification('Room created successfully', 'success');
            }
            this.closeAddRoomModal();
            await RoomManager.loadRooms();
        } catch (error) {
            RoomManager.showNotification(`Failed to save room: ${error.message}`, 'error');
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
    
    async performSearch() {
        const searchInput = document.querySelector('.search-input');
        const query = searchInput.value.toLowerCase();
        
        try {
            const rooms = await RoomAPI.getAllRooms();
            const filtered = rooms.filter(room => 
                room.id.toString().includes(query) || 
                room.typeName.toLowerCase().includes(query) ||
                room.status.toLowerCase().includes(query)
            );
            RoomUI.renderRoomsTable(filtered);
            RoomUI.updateStats(filtered);
        } catch (error) {
            this.showNotification('Search failed: ' + error.message, 'error');
        }
    }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    updateUserGreeting();
    
    // Initialize Add Room button
    const addRoomBtn = document.querySelector('.btn-primary');
    if (addRoomBtn && addRoomBtn.textContent.includes('Add Room')) {
        addRoomBtn.onclick = (e) => {
            e.preventDefault();
            RoomManager.openAddRoomModal();
        };
    }
    
    // Load rooms
    await RoomManager.loadRooms();
    
    // Populate room types in form
    const roomTypeSelect = document.getElementById('roomTypeField');
    if (roomTypeSelect) {
        const roomTypes = await RoomManager.loadRoomTypes();
        roomTypeSelect.innerHTML = '<option value="">-- Select Room Type --</option>' +
            roomTypes.map(type => `<option value="${type.name}">${type.name} (${type.capacity} guests) - ${RoomUI.formatCurrency(type.basePrice)}</option>`).join('');
    }
    
    // Setup search
    RoomManager.setupSearch();
    
    // Close modals on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            RoomManager.closeAddRoomModal();
            const modal = document.getElementById('roomDetailsModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
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

// ==================== ROOM TYPES MANAGEMENT ====================
const RoomTypeManager = {
    async loadRoomTypes() {
        try {
            const types = await RoomAPI.getAllRoomTypes();
            this.renderRoomTypesTable(types);
        } catch (error) {
            RoomManager.showNotification('Failed to load room types: ' + error.message, 'error');
        }
    },
    
    renderRoomTypesTable(types) {
        const tbody = document.getElementById('roomTypesTbody');
        if (!tbody) return;
        
        if (!types || types.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-4">No room types found</td></tr>';
            return;
        }
        
        tbody.innerHTML = types.map(type => `
            <tr>
                <td class="font-medium text-gray-900">${type.name}</td>
                <td>${type.capacity} Guests</td>
                <td>${RoomUI.formatCurrency(type.basePrice)}</td>
                <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${type.description}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-type-name="${type.name}" title="Edit" onclick="RoomTypeManager.openEditRoomTypeModal('${type.name}')">
                            <i data-feather="edit" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button class="action-btn delete" data-type-name="${type.name}" title="Delete" onclick="RoomTypeManager.showDeleteTypeConfirm('${type.name}')">
                            <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    },
    
    openAddRoomTypeModal() {
        const modal = document.getElementById('addRoomTypeModal');
        if (!modal) {
            this.createAddRoomTypeModal();
            return;
        }
        
        document.getElementById('addRoomTypeForm').reset();
        document.getElementById('addRoomTypeForm').dataset.isEdit = 'false';
        document.getElementById('addRoomTypeFormTitle').textContent = 'Add Room Type';
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    },
    
    async openEditRoomTypeModal(name) {
        try {
            const type = await RoomAPI.getRoomTypeByName(name);
            const modal = document.getElementById('addRoomTypeModal') || this.createAddRoomTypeModal();
            
            document.getElementById('addRoomTypeFormTitle').textContent = 'Edit Room Type';
            document.getElementById('roomTypeNameField').value = type.name;
            document.getElementById('roomTypeNameField').disabled = true;
            document.getElementById('roomTypeCapacityField').value = type.capacity;
            document.getElementById('roomTypePriceField').value = type.basePrice;
            document.getElementById('roomTypeDescField').value = type.description;
            document.getElementById('addRoomTypeForm').dataset.isEdit = 'true';
            
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        } catch (error) {
            RoomManager.showNotification('Failed to load room type: ' + error.message, 'error');
        }
    },
    
    showDeleteTypeConfirm(name) {
        const message = `Are you sure you want to delete room type "${name}"?`;
        if (confirm(message)) {
            this.deleteRoomType(name);
        }
    },
    
    async deleteRoomType(name) {
        try {
            await RoomAPI.deleteRoomType(name);
            RoomManager.showNotification('Room type deleted successfully', 'success');
            this.loadRoomTypes();
        } catch (error) {
            RoomManager.showNotification('Failed to delete room type: ' + error.message, 'error');
        }
    },
    
    closeAddRoomTypeModal() {
        const modal = document.getElementById('addRoomTypeModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            document.getElementById('roomTypeNameField').disabled = false;
        }
    },
    
    async handleAddRoomTypeSubmit(e) {
        e.preventDefault();
        const form = document.getElementById('addRoomTypeForm');
        const isEdit = form.dataset.isEdit === 'true';
        
        const typeData = {
            name: document.getElementById('roomTypeNameField').value,
            capacity: parseInt(document.getElementById('roomTypeCapacityField').value),
            basePrice: parseFloat(document.getElementById('roomTypePriceField').value),
            description: document.getElementById('roomTypeDescField').value
        };
        
        try {
            if (isEdit) {
                await RoomAPI.updateRoomType(typeData.name, typeData);
                RoomManager.showNotification('Room type updated successfully', 'success');
            } else {
                await RoomAPI.createRoomType(typeData);
                RoomManager.showNotification('Room type created successfully', 'success');
            }
            this.closeAddRoomTypeModal();
            this.loadRoomTypes();
        } catch (error) {
            RoomManager.showNotification(`Failed to save room type: ${error.message}`, 'error');
        }
    },
    
    createAddRoomTypeModal() {
        const modalHtml = `
            <div id="addRoomTypeModal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:none; align-items:center; justify-content:center; z-index: 1000;">
                <div class="card" style="width:100%; max-width: 600px;">
                    <div class="card-header" style="display:flex; align-items:center; justify-content:space-between;">
                        <h3 class="card-title" id="addRoomTypeFormTitle">Add Room Type</h3>
                        <button id="closeAddRoomTypeModal" class="action-btn" aria-label="Close"><i data-feather="x"></i></button>
                    </div>
                    <form id="addRoomTypeForm" class="card-body" style="display:flex; flex-direction:column; gap:1rem;">
                        <div class="form-group">
                            <label class="form-label" for="roomTypeNameField">Type Name</label>
                            <input type="text" id="roomTypeNameField" class="form-input" placeholder="e.g., Deluxe Room" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="roomTypeCapacityField">Capacity (Guests)</label>
                            <input type="number" id="roomTypeCapacityField" class="form-input" placeholder="2" min="1" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="roomTypePriceField">Base Price ($)</label>
                            <input type="number" id="roomTypePriceField" class="form-input" placeholder="199.99" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="roomTypeDescField">Description</label>
                            <textarea id="roomTypeDescField" class="form-input" placeholder="Room description..." rows="3" required></textarea>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                            <button type="button" id="cancelAddRoomTypeBtn" class="btn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Room Type</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('addRoomTypeModal');
        const form = document.getElementById('addRoomTypeForm');
        const closeBtn = document.getElementById('closeAddRoomTypeModal');
        const cancelBtn = document.getElementById('cancelAddRoomTypeBtn');
        
        closeBtn.onclick = () => this.closeAddRoomTypeModal();
        cancelBtn.onclick = () => this.closeAddRoomTypeModal();
        
        form.onsubmit = (e) => this.handleAddRoomTypeSubmit(e);
        
        modal.onclick = (e) => {
            if (e.target === modal) this.closeAddRoomTypeModal();
        };
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        return modal;
    }
};

// ==================== AVAILABLE ROOMS SEARCH ====================
const AvailableRoomsManager = {
    async searchAvailableRooms(e) {
        e.preventDefault();
        
        const roomTypeSelect = document.getElementById('availableRoomType');
        const checkInInput = document.getElementById('availableCheckIn');
        const checkOutInput = document.getElementById('availableCheckOut');
        
        // Get values
        const roomType = roomTypeSelect ? (roomTypeSelect.value || null) : null;
        const checkIn = checkInInput ? checkInInput.value : null;
        const checkOut = checkOutInput ? checkOutInput.value : null;
        
        console.log('Search params - roomType:', roomType, 'checkIn:', checkIn, 'checkOut:', checkOut);
        
        // Validate dates only if both are provided
        if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
            RoomManager.showNotification('Vui lòng nhập cả ngày check-in và check-out, hoặc để trống để tìm tất cả phòng', 'error');
            return;
        }
        
        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            
            if (checkInDate >= checkOutDate) {
                RoomManager.showNotification('Ngày check-out phải sau ngày check-in', 'error');
                return;
            }
        }
        
        try {
            RoomManager.showNotification('Đang tìm phòng trống...', 'info');
            console.log('Calling findAvailableRooms with:', roomType, checkIn, checkOut);
            
            const rooms = await RoomAPI.findAvailableRooms(roomType, checkIn, checkOut);
            
            console.log('Available rooms response:', rooms);
            this.renderAvailableRooms(rooms);
            
            if (rooms && rooms.length > 0) {
                RoomManager.showNotification(`Tìm thấy ${rooms.length} phòng trống`, 'success');
            } else {
                RoomManager.showNotification('Không tìm thấy phòng trống phù hợp', 'info');
            }
        } catch (error) {
            console.error('Search error:', error);
            RoomManager.showNotification('Lỗi khi tìm phòng: ' + error.message, 'error');
            // Show empty results
            const tbody = document.getElementById('availableRoomsTbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-4">Tìm kiếm thất bại - vui lòng thử lại</td></tr>';
            }
        }
    },
    
    renderAvailableRooms(rooms) {
        const tbody = document.getElementById('availableRoomsTbody');
        if (!tbody) return;
        
        if (!rooms || rooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-4">Không tìm thấy phòng trống phù hợp</td></tr>';
            return;
        }
        
        tbody.innerHTML = rooms.map(room => `
            <tr>
                <td class="font-medium text-gray-900">${room.roomId}</td>
                <td>${room.name}</td>
                <td>
                    <div style="display: flex; align-items: center;">
                        <i data-feather="user" style="width: 12px; height: 12px; margin-right: 4px;"></i>
                        <span>${room.capacity || 0} Khách</span>
                    </div>
                </td>
                <td class="text-gray-500">${RoomUI.formatCurrency(room.baseprice || 0)}</td>
                <td>
                    <span class="badge badge-success">Còn Trống</span>
                </td>
            </tr>
        `).join('');
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    },
    
    async loadRoomTypeDetailsForAvailable(rooms) {
        // Not needed anymore since API returns all data
        console.log('Available rooms already include all necessary data');
    }
};

// ==================== TAB MANAGEMENT ====================
const TabManager = {
    setupTabs() {
        const roomsBtn = document.getElementById('roomsTabBtn');
        const typesBtn = document.getElementById('roomTypesTabBtn');
        const availableBtn = document.getElementById('availableTabBtn');
        
        if (roomsBtn) {
            roomsBtn.onclick = () => this.switchTab('rooms');
        }
        if (typesBtn) {
            typesBtn.onclick = () => this.switchTab('types');
        }
        if (availableBtn) {
            availableBtn.onclick = () => this.switchTab('available');
        }
    },
    
    switchTab(tabName) {
        // Hide all tabs
        const tabs = ['roomsTab', 'roomTypesTab', 'availableTab'];
        tabs.forEach(tab => {
            const el = document.getElementById(tab);
            if (el) {
                el.classList.add('hidden');
                el.style.display = 'none';
            }
        });
        
        // Remove active styling
        ['roomsTabBtn', 'roomTypesTabBtn', 'availableTabBtn'].forEach(btn => {
            const el = document.getElementById(btn);
            if (el) {
                el.style.borderBottomColor = 'transparent';
            }
        });
        
        // Show selected tab
        if (tabName === 'rooms') {
            document.getElementById('roomsTab').classList.remove('hidden');
            document.getElementById('roomsTab').style.display = '';
            document.getElementById('roomsTabBtn').style.borderBottomColor = '#6366f1';
        } else if (tabName === 'types') {
            document.getElementById('roomTypesTab').classList.remove('hidden');
            document.getElementById('roomTypesTab').style.display = '';
            document.getElementById('roomTypesTabBtn').style.borderBottomColor = '#6366f1';
            RoomTypeManager.loadRoomTypes();
        } else if (tabName === 'available') {
            document.getElementById('availableTab').classList.remove('hidden');
            document.getElementById('availableTab').style.display = '';
            document.getElementById('availableTabBtn').style.borderBottomColor = '#6366f1';
            
            // Populate room type dropdown for available search
            const availableTypeSelect = document.getElementById('availableRoomType');
            if (availableTypeSelect && availableTypeSelect.innerHTML.includes('Loading')) {
                RoomAPI.getAllRoomTypes().then(roomTypes => {
                    availableTypeSelect.innerHTML = '<option value="">-- All Room Types --</option>' +
                        roomTypes.map(type => `<option value="${type.name}">${type.name} (${type.capacity} guests)</option>`).join('');
                }).catch(error => {
                    console.error('Failed to load room types for available search:', error);
                });
            }
        }
    }
};

// ==================== ENHANCED INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    updateUserGreeting();
    
    // Initialize Add Room button
    const addRoomBtn = document.querySelector('.btn-primary');
    if (addRoomBtn && addRoomBtn.textContent.includes('Add Room')) {
        addRoomBtn.onclick = (e) => {
            e.preventDefault();
            RoomManager.openAddRoomModal();
        };
    }
    
    // Initialize Add Room Type button
    const addRoomTypeBtn = document.getElementById('addRoomTypeBtn');
    if (addRoomTypeBtn) {
        addRoomTypeBtn.onclick = (e) => {
            e.preventDefault();
            RoomTypeManager.openAddRoomTypeModal();
        };
    }
    
    // Setup tabs
    TabManager.setupTabs();
    
    // Load rooms
    await RoomManager.loadRooms();
    
    // Populate room types in form
    const roomTypeSelect = document.getElementById('roomTypeField');
    if (roomTypeSelect) {
        const roomTypes = await RoomManager.loadRoomTypes();
        roomTypeSelect.innerHTML = '<option value="">-- Select Room Type --</option>' +
            roomTypes.map(type => `<option value="${type.name}">${type.name} (${type.capacity} guests) - ${RoomUI.formatCurrency(type.basePrice)}</option>`).join('');
    }
    
    // Populate available room type filter
    const availableTypeSelect = document.getElementById('availableRoomType');
    if (availableTypeSelect) {
        const roomTypes = await RoomManager.loadRoomTypes();
        availableTypeSelect.innerHTML = '<option value="">-- All Room Types --</option>' +
            roomTypes.map(type => `<option value="${type.name}">${type.name} (${type.capacity} guests)</option>`).join('');
    }
    
    // Setup available rooms search
    const availableForm = document.getElementById('availableSearchForm');
    if (availableForm) {
        availableForm.onsubmit = (e) => AvailableRoomsManager.searchAvailableRooms(e);
    }
    
    // Setup search
    RoomManager.setupSearch();
    
    // Close modals on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            RoomManager.closeAddRoomModal();
            RoomTypeManager.closeAddRoomTypeModal();
            const modal = document.getElementById('roomDetailsModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        }
    });
});
