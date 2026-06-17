/**
 * Hotel Haven Hub - Main JavaScript
 * Common functionality and utilities
 */

class HotelApp {
    constructor() {
        this.init();
    }

    init() {
        this.initReusableSidebar();
        this.initFeatherIcons();
        this.initNavigation();
        this.initAnimations();
        this.initSearch();
        this.initToggles();
        this.initMobileMenu();
        this.initOverviewSync();
    }

    /**
     * Initialize Feather Icons
     */
    initFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Initialize Navigation
     */
    initNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.sidebar-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage) {
                item.classList.add('active');
            }

    /**
     * Sync dashboard overview widgets with page data
     */
    initOverviewSync() {
        const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        try {
            if (page.includes('guests')) this.syncGuestsOverview();
            if (page.includes('rooms')) this.syncRoomsOverview();
            if (page.includes('services')) this.syncServicesOverview();
            if (page.includes('users')) this.syncUsersOverview();
        } catch (_) {}
    }

    syncGuestsOverview() {
        const list = JSON.parse(localStorage.getItem('guests:list') || '[]');
        if (!list.length) return;
        const total = list.length;
        const active = list.filter(g => g.checkinDate).length;
        const vip = list.filter(g => (g.note||'').toLowerCase().includes('vip')).length;
        const month = new Date().getMonth();
        const newMonth = list.filter(g => new Date(g.createdAt||Date.now()).getMonth() === month).length;
        this.fillStatCards([total, active, vip, newMonth]);
    }

    syncRoomsOverview() {
        // Count from existing table badges
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        const total = rows.length;
        const available = rows.filter(r => /Available|badge-success/i.test(r.innerText)).length;
        const occupied = rows.filter(r => /Occupied|badge-danger/i.test(r.innerText)).length;
        const maintenance = rows.filter(r => /Maintenance|badge-warning/i.test(r.innerText)).length;
        this.fillStatCards([total, available, occupied, maintenance]);
    }

    syncServicesOverview() {
        const list = JSON.parse(localStorage.getItem('services:list') || '[]');
        if (!list.length) return;
        const activeServices = list.length;
        // Approximate requests = total per-room charges
        const roomKeys = Object.keys(localStorage).filter(k => k.startsWith('roomCharges:'));
        const serviceRequests = roomKeys.reduce((sum, k) => sum + JSON.parse(localStorage.getItem(k)||'[]').length, 0);
        const revenue = roomKeys.reduce((sum, k) => sum + JSON.parse(localStorage.getItem(k)||'[]').reduce((s, i) => s + Number(i.subtotal||0), 0), 0);
        this.fillStatCards([activeServices, serviceRequests, this.formatCurrencyVN(revenue)]);
    }

    syncUsersOverview() {
        const list = JSON.parse(localStorage.getItem('users:list') || '[]');
        if (!list.length) return;
        const total = list.length;
        const active = list.filter(u => (u.status||'Active') === 'Active').length;
        const managers = list.filter(u => u.role === 'Manager').length;
        const newMonth = list.filter(u => new Date(u.createdAt||Date.now()).getMonth() === new Date().getMonth()).length;
        this.fillStatCards([total, active, managers, newMonth]);
    }

    formatCurrencyVN(amount) {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount||0));
        } catch {
            return amount;
        }
    }

    fillStatCards(values) {
        const cards = Array.from(document.querySelectorAll('.stats-grid .stat-card .stat-info h3'));
        values.forEach((v, i) => { if (cards[i]) cards[i].textContent = String(v); });
    }
        });
    }

    /**
     * Initialize Animations
     */
    initAnimations() {
        // Animate cards on load
        const cards = document.querySelectorAll('.card, .stat-card, .user-card, .room-card, .service-card, .setting-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Animate table rows
        const tableRows = document.querySelectorAll('tbody tr');
        tableRows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.5s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    /**
     * Initialize Search Functionality
     */
    initSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.performSearch(e.target.value, e.target.closest('.table-container'));
            });
        });
    }

    /**
     * Perform search in table
     */
    performSearch(query, tableContainer) {
        if (!tableContainer) return;

        const rows = tableContainer.querySelectorAll('tbody tr');
        const searchTerm = query.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    /**
     * Initialize Toggle Switches
     */
    initToggles() {
        const toggles = document.querySelectorAll('.switch input');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const slider = e.target.nextElementSibling;
                if (e.target.checked) {
                    slider.style.backgroundColor = '#4f46e5';
                } else {
                    slider.style.backgroundColor = '#ccc';
                }
                
                // Trigger custom event for specific toggle actions
                const event = new CustomEvent('toggleChange', {
                    detail: {
                        id: e.target.id,
                        checked: e.target.checked
                    }
                });
                document.dispatchEvent(event);
            });
        });
    }

    /**
     * Initialize Mobile Menu
     */
    initMobileMenu() {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<i data-feather="menu"></i>';
        menuToggle.style.cssText = `
            display: none;
            background: none;
            border: none;
            color: #374151;
            cursor: pointer;
            padding: 0.5rem;
        `;

        // Add menu toggle to header on mobile
        const header = document.querySelector('.app-header');
        if (header) {
            header.insertBefore(menuToggle, header.firstChild);
        }

        // Show/hide menu toggle on resize
        const checkScreenSize = () => {
            if (window.innerWidth <= 768) {
                menuToggle.style.display = 'block';
            } else {
                menuToggle.style.display = 'none';
                document.querySelector('.sidebar')?.classList.remove('open');
            }
        };

        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();

        // Toggle sidebar on mobile
        menuToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            sidebar?.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 768 && 
                sidebar?.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Confirm dialog
     */
    confirm(message, callback) {
        if (window.confirm(message)) {
            callback();
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    /**
     * Format date
     */
    formatDate(date) {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date));
    }

    /**
     * Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
}

// Utility functions
const utils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hotelApp = new HotelApp();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .menu-toggle {
            display: block !important;
        }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HotelApp, utils };
}