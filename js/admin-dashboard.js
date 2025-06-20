// Sidebar navigation
const dashboardNav = document.getElementById('dashboardNav');
const usersNav = document.getElementById('usersNav');
const cardsNav = document.getElementById('cardsNav');
const subscriptionsNav = document.getElementById('subscriptionsNav');
const analyticsNav = document.getElementById('analyticsNav');
const templatesNav = document.getElementById('templatesNav');
const reportsNav = document.getElementById('reportsNav');
const settingsNav = document.getElementById('settingsNav');

const dashboardSection = document.getElementById('dashboardSection');
const usersSection = document.getElementById('usersSection');
const cardsSection = document.getElementById('cardsSection');
const subscriptionsSection = document.getElementById('subscriptionsSection');
const analyticsSection = document.getElementById('analyticsSection');
const templatesSection = document.getElementById('templatesSection');
const reportsSection = document.getElementById('reportsSection');
const settingsSection = document.getElementById('settingsSection');

function showSection(section) {
    // Hide all sections
    dashboardSection.style.display = 'none';
    usersSection.style.display = 'none';
    cardsSection.style.display = 'none';
    subscriptionsSection.style.display = 'none';
    analyticsSection.style.display = 'none';
    templatesSection.style.display = 'none';
    reportsSection.style.display = 'none';
    settingsSection.style.display = 'none';

    // Remove active class from all nav items
    dashboardNav.classList.remove('active');
    usersNav.classList.remove('active');
    cardsNav.classList.remove('active');
    subscriptionsNav.classList.remove('active');
    analyticsNav.classList.remove('active');
    templatesNav.classList.remove('active');
    reportsNav.classList.remove('active');
    settingsNav.classList.remove('active');

    // Show selected section and activate nav item
    if (section === 'dashboard') {
        dashboardSection.style.display = '';
        dashboardNav.classList.add('active');
    } else if (section === 'users') {
        usersSection.style.display = '';
        usersNav.classList.add('active');
    } else if (section === 'cards') {
        cardsSection.style.display = '';
        cardsNav.classList.add('active');
    } else if (section === 'subscriptions') {
        subscriptionsSection.style.display = '';
        subscriptionsNav.classList.add('active');
    } else if (section === 'analytics') {
        analyticsSection.style.display = '';
        analyticsNav.classList.add('active');
    } else if (section === 'templates') {
        templatesSection.style.display = '';
        templatesNav.classList.add('active');
    } else if (section === 'reports') {
        reportsSection.style.display = '';
        reportsNav.classList.add('active');
    } else if (section === 'settings') {
        settingsSection.style.display = '';
        settingsNav.classList.add('active');
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

subscriptionsNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('subscriptions');
});

analyticsNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('analytics');
});

templatesNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('templates');
});

reportsNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('reports');
});

settingsNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('settings');
});

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Clear the admin token from localStorage
    localStorage.removeItem('adminToken');
    
    // Redirect to admin login page
    window.location.href = './admin-login.html';
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

// Fetch subscriptions when Subscriptions section is shown
subscriptionsNav.addEventListener('click', () => {
    fetchSubscriptions();
});

// --- Subscription Management Logic ---
const subscriptionsTableBody = document.getElementById('subscriptionsTableBody');
const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
const addSubscriptionModal = document.getElementById('addSubscriptionModal');
const editSubscriptionModal = document.getElementById('editSubscriptionModal');

addSubscriptionBtn.addEventListener('click', () => {
    addSubscriptionModal.style.display = 'flex';
});

// Close subscription modals when clicking outside modal content
window.addEventListener('click', (e) => {
    if (e.target === addSubscriptionModal) {
        addSubscriptionModal.style.display = 'none';
    }
    if (e.target === editSubscriptionModal) {
        editSubscriptionModal.style.display = 'none';
    }
});

const addSubscriptionForm = document.getElementById('addSubscriptionForm');

addSubscriptionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addSubscriptionForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('https://onetapp-backend.onrender.com/api/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to add subscription.' }));
            throw new Error(errorData.message);
        }

        addSubscriptionModal.style.display = 'none';
        addSubscriptionForm.reset();
        await fetchSubscriptions(); // Refresh the table

    } catch (err) {
        alert(`Error: ${err.message}`); // Simple error feedback
    }
});

async function fetchSubscriptions() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('https://onetapp-backend.onrender.com/api/subscriptions', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch subscriptions and could not parse error response.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderSubscriptionsTable(data.subscriptions);
    } catch (err) {
        subscriptionsTableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error loading subscriptions: ${err.message}</td></tr>`;
    }
}

function renderSubscriptionsTable(subscriptions) {
    if (!subscriptions || subscriptions.length === 0) {
        subscriptionsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No subscriptions found.</td></tr>';
        return;
    }
    subscriptionsTableBody.innerHTML = subscriptions.map(subscription => {
        const statusClass = subscription.status === 'active' ? 'active' : 
                           subscription.status === 'pending' ? 'pending' : 
                           subscription.status === 'cancelled' ? 'cancelled' : 'expired';
        return `
        <tr>
            <td>${subscription.email}</td>
            <td>${subscription.phone || 'N/A'}</td>
            <td>${subscription.plan}</td>
            <td>${subscription.billingPeriod}</td>
            <td><span class="status-badge status-${statusClass}">${subscription.status}</span></td>
            <td>${subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A'}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit" data-id="${subscription._id}">Edit</button>
                <button class="btn-action btn-delete" data-id="${subscription._id}">Delete</button>
            </td>
        </tr>
    `}).join('');
}

// Optionally, fetch subscriptions on page load if Subscriptions section is default
// fetchSubscriptions(); 