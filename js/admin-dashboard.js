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

// --- User Management Logic ---
const usersTableBody = document.getElementById('usersTableBody');

async function fetchUsers() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('https://onetapp-backend.onrender.com/api/users', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        renderUsersTable(data.users);
    } catch (err) {
        usersTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error loading users</td></tr>`;
    }
}

function renderUsersTable(users) {
    if (!users || users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
        return;
    }
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.status}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</td>
            <td>
                <button class="edit-user-btn" data-id="${user._id}" style="background:#e3f2fd;color:#1976d2;border:none;padding:0.4rem 0.8rem;border-radius:6px;cursor:pointer;margin-right:0.5rem;">Edit</button>
                <button class="delete-user-btn" data-id="${user._id}" style="background:#ffebee;color:#d32f2f;border:none;padding:0.4rem 0.8rem;border-radius:6px;cursor:pointer;">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Fetch users when Users section is shown
usersNav.addEventListener('click', () => {
    fetchUsers();
});

// Optionally, fetch users on page load if Users section is default
// fetchUsers(); 