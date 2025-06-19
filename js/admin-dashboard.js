// Sidebar navigation
const dashboardNav = document.getElementById('dashboardNav');
const usersNav = document.getElementById('usersNav');
const dashboardSection = document.getElementById('dashboardSection');
const usersSection = document.getElementById('usersSection');

function showSection(section) {
    if (section === 'dashboard') {
        dashboardSection.style.display = '';
        usersSection.style.display = 'none';
        dashboardNav.classList.add('active');
        usersNav.classList.remove('active');
    } else if (section === 'users') {
        dashboardSection.style.display = 'none';
        usersSection.style.display = '';
        dashboardNav.classList.remove('active');
        usersNav.classList.add('active');
    }
}

dashboardNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('dashboard');
});
usersNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('users');
});

// Modal logic
const addUserBtn = document.getElementById('addUserBtn');
const addUserModal = document.getElementById('addUserModal');
const editUserModal = document.getElementById('editUserModal');

addUserBtn.addEventListener('click', () => {
    addUserModal.style.display = 'flex';
});

// Close modals when clicking outside modal content
window.addEventListener('click', (e) => {
    if (e.target === addUserModal) {
        addUserModal.style.display = 'none';
    }
    if (e.target === editUserModal) {
        editUserModal.style.display = 'none';
    }
});

// On page load, show dashboard by default
showSection('dashboard'); 