// Sidebar navigation
const dashboardNav = document.getElementById('dashboardNav');
const usersNav = document.getElementById('usersNav');
const cardsNav = document.getElementById('cardsNav');
const dashboardSection = document.getElementById('dashboardSection');
const usersSection = document.getElementById('usersSection');
const cardsSection = document.getElementById('cardsSection');

function showSection(section) {
    dashboardSection.style.display = 'none';
    usersSection.style.display = 'none';
    cardsSection.style.display = 'none';
    dashboardNav.classList.remove('active');
    usersNav.classList.remove('active');
    cardsNav.classList.remove('active');

    if (section === 'dashboard') {
        dashboardSection.style.display = '';
        dashboardNav.classList.add('active');
    } else if (section === 'users') {
        usersSection.style.display = '';
        usersNav.classList.add('active');
    } else if (section === 'cards') {
        cardsSection.style.display = '';
        cardsNav.classList.add('active');
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
cardsNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('cards');
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
        usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No users found.</td></tr>';
        return;
    }
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit" data-id="${user._id}">Edit</button>
                <button class="btn-action btn-delete" data-id="${user._id}">Delete</button>
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

// --- Card Management Logic ---
const cardsTableBody = document.getElementById('cardsTableBody');

async function fetchCards() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('https://onetapp-backend.onrender.com/api/cards', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) {
            // Try to get a more detailed error from the response body
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch cards and could not parse error response.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderCardsTable(data.cards);
    } catch (err) {
        cardsTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error loading cards: ${err.message}</td></tr>`;
    }
}

function renderCardsTable(cards) {
    if (!cards || cards.length === 0) {
        cardsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No cards found.</td></tr>';
        return;
    }
    cardsTableBody.innerHTML = cards.map(card => {
        const status = card.isActive ? 'active' : 'inactive';
        return `
        <tr>
            <td>${card.nfcId}</td>
            <td>${card.user ? card.user.email : 'Unassigned'}</td>
            <td><span class="status-badge status-${status}">${status}</span></td>
            <td>${new Date(card.createdAt).toLocaleDateString()}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit" data-id="${card._id}">Edit</button>
                <button class="btn-action btn-delete" data-id="${card._id}">Delete</button>
            </td>
        </tr>
    `}).join('');
}

// Fetch cards when Cards section is shown
cardsNav.addEventListener('click', () => {
    fetchCards();
}); 