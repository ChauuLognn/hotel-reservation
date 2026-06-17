/**
 * Settings Page - JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    updateUserGreeting();
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
