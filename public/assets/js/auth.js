// Auth Guard and Session Manager
const Auth = {
    getUser() {
        const userStr = localStorage.getItem('flood_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isLoggedIn() {
        return !!this.getUser();
    },

    login(userData) {
        localStorage.setItem('flood_user', JSON.stringify(userData));
    },

    logout() {
        localStorage.removeItem('flood_user');
        Toast.success('Logged out successfully');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 600);
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },

    initNavUI() {
        const userContainer = document.getElementById('nav-user-container');
        if (!userContainer) return;

        const user = this.getUser();
        if (user) {
            userContainer.innerHTML = `
                <div class="user-badge">
                    <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <span>${user.username}</span>
                </div>
                <button class="btn-logout" onclick="Auth.logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;
        } else {
            userContainer.innerHTML = `
                <a href="login.html" class="btn btn-primary btn-sm">
                    <i class="fas fa-sign-in-alt"></i> Admin Login
                </a>
            `;
        }

        // Mobile menu toggle
        const toggleBtn = document.querySelector('.mobile-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (toggleBtn && navLinks) {
            toggleBtn.addEventListener('click', () => {
                navLinks.classList.toggle('show');
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Auth.initNavUI();
});
