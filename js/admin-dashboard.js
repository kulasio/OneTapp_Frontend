const API_BASE = 'https://onetapp-backend.onrender.com';

// DOM Elements
const usersTableBody = document.getElementById('usersTableBody');
const addUserForm = document.getElementById('addUserForm');
const editUserForm = document.getElementById('editUserForm');
const addUserModal = document.getElementById('addUserModal');
const editUserModal = document.getElementById('editUserModal');

// Mock data for static admin
const MOCK_USERS = [
    {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        status: 'active'
    },
    {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active'
    },
    {
        _id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'user',
        status: 'inactive'
    },
    // Additional sample users
    { _id: '4', name: 'Alice Brown', email: 'alice.brown@example.com', role: 'admin', status: 'active' },
    { _id: '5', name: 'Charlie Green', email: 'charlie.green@example.com', role: 'user', status: 'inactive' },
    { _id: '6', name: 'Diana Prince', email: 'diana.prince@example.com', role: 'admin', status: 'active' },
    { _id: '7', name: 'Ethan Hunt', email: 'ethan.hunt@example.com', role: 'user', status: 'active' },
    { _id: '8', name: 'Fiona Gallagher', email: 'fiona.gallagher@example.com', role: 'user', status: 'inactive' },
    { _id: '9', name: 'George Miller', email: 'george.miller@example.com', role: 'admin', status: 'active' },
    { _id: '10', name: 'Hannah Lee', email: 'hannah.lee@example.com', role: 'user', status: 'active' },
    { _id: '11', name: 'Ian Wright', email: 'ian.wright@example.com', role: 'user', status: 'inactive' },
    { _id: '12', name: 'Julia Roberts', email: 'julia.roberts@example.com', role: 'admin', status: 'active' },
    { _id: '13', name: 'Kevin Durant', email: 'kevin.durant@example.com', role: 'user', status: 'active' }
];

// Pagination state
let currentPage = 1;
const USERS_PER_PAGE = 5;
let filteredUsers = [];

// Utility: get filtered/searched users
function getFilteredUsers() {
    let users = isStaticAdmin() ? MOCK_USERS : window._allUsers || [];
    const search = document.getElementById('userSearchInput')?.value.trim().toLowerCase() || '';
    const role = document.getElementById('roleFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    return users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search);
        const matchesRole = !role || user.role === role;
        const matchesStatus = !status || user.status === status;
        return matchesSearch && matchesRole && matchesStatus;
    });
}

// Render users with pagination
function renderUsersTable() {
    filteredUsers = getFilteredUsers();
    const startIdx = (currentPage - 1) * USERS_PER_PAGE;
    const endIdx = startIdx + USERS_PER_PAGE;
    const usersToShow = filteredUsers.slice(startIdx, endIdx);
    usersTableBody.innerHTML = '';
    usersToShow.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role || 'user'}</td>
            <td>
                <span class="status-badge ${user.status === 'active' ? 'active' : 'inactive'}">
                    ${user.status || 'active'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewUser('${user._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="showEditUserModal('${user._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        usersTableBody.appendChild(tr);
    });
    renderPaginationControls();
}

// Render pagination controls
function renderPaginationControls() {
    const pagination = document.getElementById('paginationControls');
    if (!pagination) return;
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
    pagination.innerHTML = '';
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.className = 'btn btn-outline';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderUsersTable(); };
    pagination.appendChild(prevBtn);
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = 'btn' + (i === currentPage ? ' btn-primary' : ' btn-outline');
        pageBtn.disabled = i === currentPage;
        pageBtn.onclick = () => { currentPage = i; renderUsersTable(); };
        pagination.appendChild(pageBtn);
    }
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.className = 'btn btn-outline';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderUsersTable(); };
    pagination.appendChild(nextBtn);
}

// Hook up search and filter events
function setupUserSearchAndFilter() {
    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderUsersTable(); });
    if (roleFilter) roleFilter.addEventListener('change', () => { currentPage = 1; renderUsersTable(); });
    if (statusFilter) statusFilter.addEventListener('change', () => { currentPage = 1; renderUsersTable(); });
}

// Override displayUsers to use pagination
function displayUsers(users) {
    // For API users, store in window for filtering
    if (!isStaticAdmin()) window._allUsers = users;
    renderUsersTable();
}

// Check if using static admin
function isStaticAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const decoded = JSON.parse(atob(token));
        return decoded.isStatic === true;
    } catch {
        return false;
    }
}

// Load all users
async function loadUsers() {
    try {
        if (isStaticAdmin()) {
            // Use mock data for static admin
            displayUsers(MOCK_USERS);
            return;
        }

        const response = await fetch(`${API_BASE}/api/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

// Show Add User Modal
function showAddUserModal() {
    addUserModal.style.display = 'flex';
}

// Close Add User Modal
function closeAddUserModal() {
    addUserModal.style.display = 'none';
    addUserForm.reset();
}

// Show Edit User Modal
async function showEditUserModal(userId) {
    try {
        let user;
        if (isStaticAdmin()) {
            user = MOCK_USERS.find(u => u._id === userId);
        } else {
            const response = await fetch(`${API_BASE}/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            user = await response.json();
        }
        
        document.getElementById('editUserId').value = user._id;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role || 'user';
        
        editUserModal.style.display = 'flex';
    } catch (error) {
        console.error('Error loading user details:', error);
        showNotification('Error loading user details', 'error');
    }
}

// Close Edit User Modal
function closeEditUserModal() {
    editUserModal.style.display = 'none';
    editUserForm.reset();
}

// Add User
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value
    };

    try {
        if (isStaticAdmin()) {
            // Mock adding user for static admin
            const newUser = {
                _id: Date.now().toString(),
                ...userData,
                status: 'active'
            };
            MOCK_USERS.push(newUser);
            showNotification('User added successfully', 'success');
            closeAddUserModal();
            loadUsers();
            return;
        }

        const response = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            showNotification('User added successfully', 'success');
            closeAddUserModal();
            loadUsers();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Error adding user', 'error');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showNotification('Error adding user', 'error');
    }
});

// Edit User
editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const userData = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value
    };

    try {
        if (isStaticAdmin()) {
            // Mock updating user for static admin
            const userIndex = MOCK_USERS.findIndex(u => u._id === userId);
            if (userIndex !== -1) {
                MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...userData };
                showNotification('User updated successfully', 'success');
                closeEditUserModal();
                loadUsers();
            }
            return;
        }

        const response = await fetch(`${API_BASE}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            showNotification('User updated successfully', 'success');
            closeEditUserModal();
            loadUsers();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Error updating user', 'error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Error updating user', 'error');
    }
});

// Delete User
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        if (isStaticAdmin()) {
            // Mock deleting user for static admin
            const userIndex = MOCK_USERS.findIndex(u => u._id === userId);
            if (userIndex !== -1) {
                MOCK_USERS.splice(userIndex, 1);
                showNotification('User deleted successfully', 'success');
                loadUsers();
            }
            return;
        }

        const response = await fetch(`${API_BASE}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            showNotification('User deleted successfully', 'success');
            loadUsers();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Error deleting user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user', 'error');
    }
}

// View User Details
async function viewUser(userId) {
    let user;
    if (isStaticAdmin()) {
        user = MOCK_USERS.find(u => u._id === userId);
    } else {
        user = (window._allUsers || []).find(u => u._id === userId);
    }
    if (!user) return;
    const modal = document.getElementById('userDetailsModal');
    const content = document.getElementById('userDetailsContent');
    content.innerHTML = `
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Status:</strong> ${user.status}</p>
    `;
    modal.style.display = 'flex';
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon;
    switch(type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'exclamation-circle';
            break;
        default:
            icon = 'info-circle';
    }
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        // Remove the element after animation completes
        notification.addEventListener('animationend', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }, 3000);
}

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/admin-login.html';
        return;
    }

    // Add static admin indicator if using static admin
    if (isStaticAdmin()) {
        const staticAdminIndicator = document.createElement('div');
        staticAdminIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #fff3cd;
            color: #856404;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            border: 1px solid #ffeeba;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            display: flex;
            align-items: center;
            gap: 0.5em;
        `;
        staticAdminIndicator.innerHTML = `
            <i class=\"fas fa-info-circle\"></i>
            Using Static Admin Account
        `;
        document.body.appendChild(staticAdminIndicator);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUsers();
    setupUserSearchAndFilter();
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/admin-login.html';
}

// NFC Card Management Functions
let nfcCards = [];

// Load NFC Cards
async function loadNFCCards() {
    try {
        const response = await fetch('/api/nfc-cards');
        nfcCards = await response.json();
        renderNFCCardsTable();
    } catch (error) {
        showNotification('Error loading NFC cards', 'error');
    }
}

// Render NFC Cards Table
function renderNFCCardsTable() {
    const tableBody = document.getElementById('nfcCardsTableBody');
    tableBody.innerHTML = '';

    nfcCards.forEach(card => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${card.cardId}</td>
            <td>${card.owner.name}</td>
            <td>${card.content.title}</td>
            <td>${card.content.company}</td>
            <td>
                <span class="status-badge ${card.settings.isActive ? 'active' : 'inactive'}">
                    ${card.settings.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${card.analytics.totalTaps}</td>
            <td>${card.analytics.lastTap ? new Date(card.analytics.lastTap).toLocaleDateString() : 'Never'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="showCardAnalytics('${card.cardId}')">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="showEditCardModal('${card.cardId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteCard('${card.cardId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show Add Card Modal
function showAddCardModal() {
    document.getElementById('addCardModal').style.display = 'flex';
}

// Close Add Card Modal
function closeAddCardModal() {
    document.getElementById('addCardModal').style.display = 'none';
    document.getElementById('addCardForm').reset();
}

// Show Edit Card Modal
function showEditCardModal(cardId) {
    const card = nfcCards.find(c => c.cardId === cardId);
    if (!card) return;

    document.getElementById('editCardId').value = card.cardId;
    document.getElementById('editCardOwnerName').value = card.owner.name;
    document.getElementById('editCardOwnerEmail').value = card.owner.email;
    document.getElementById('editCardOwnerRole').value = card.owner.role;
    document.getElementById('editCardTitle').value = card.content.title;
    document.getElementById('editCardCompany').value = card.content.company;
    document.getElementById('editCardPhone').value = card.content.phone;
    document.getElementById('editCardWebsite').value = card.content.website || '';
    document.getElementById('editCardLinkedin').value = card.content.linkedin || '';
    document.getElementById('editCardTheme').value = card.settings.theme;

    document.getElementById('editCardModal').style.display = 'flex';
}

// Close Edit Card Modal
function closeEditCardModal() {
    document.getElementById('editCardModal').style.display = 'none';
    document.getElementById('editCardForm').reset();
}

// Show Card Analytics Modal
function showCardAnalytics(cardId) {
    const card = nfcCards.find(c => c.cardId === cardId);
    if (!card) return;

    document.getElementById('totalTaps').textContent = card.analytics.totalTaps;
    document.getElementById('lastTap').textContent = card.analytics.lastTap 
        ? new Date(card.analytics.lastTap).toLocaleString() 
        : 'Never';

    const locationsList = document.getElementById('locationsList');
    locationsList.innerHTML = card.analytics.locations.length 
        ? card.analytics.locations.map(loc => `
            <div class="location-item">
                <p>${loc}</p>
            </div>
        `).join('')
        : '<p>No location data available</p>';

    document.getElementById('cardAnalyticsModal').style.display = 'flex';
}

// Close Card Analytics Modal
function closeCardAnalyticsModal() {
    document.getElementById('cardAnalyticsModal').style.display = 'none';
}

// Add New Card
async function addCard(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('owner', JSON.stringify({
        name: document.getElementById('cardOwnerName').value,
        email: document.getElementById('cardOwnerEmail').value,
        role: document.getElementById('cardOwnerRole').value
    }));
    formData.append('content', JSON.stringify({
        name: document.getElementById('cardOwnerName').value,
        title: document.getElementById('cardTitle').value,
        email: document.getElementById('cardOwnerEmail').value,
        phone: document.getElementById('cardPhone').value,
        company: document.getElementById('cardCompany').value,
        website: document.getElementById('cardWebsite').value,
        linkedin: document.getElementById('cardLinkedin').value
    }));
    formData.append('settings', JSON.stringify({
        theme: document.getElementById('cardTheme').value,
        isActive: true
    }));
    
    const profilePicture = document.getElementById('cardProfilePicture').files[0];
    if (profilePicture) {
        formData.append('profilePicture', profilePicture);
    }

    try {
        const response = await fetch('/api/nfc-cards', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showNotification('Card added successfully', 'success');
            closeAddCardModal();
            loadNFCCards();
        } else {
            throw new Error('Failed to add card');
        }
    } catch (error) {
        showNotification('Error adding card', 'error');
    }
}

// Update Card
async function updateCard(event) {
    event.preventDefault();
    
    const cardId = document.getElementById('editCardId').value;
    const formData = new FormData();
    formData.append('owner', JSON.stringify({
        name: document.getElementById('editCardOwnerName').value,
        email: document.getElementById('editCardOwnerEmail').value,
        role: document.getElementById('editCardOwnerRole').value
    }));
    formData.append('content', JSON.stringify({
        name: document.getElementById('editCardOwnerName').value,
        title: document.getElementById('editCardTitle').value,
        email: document.getElementById('editCardOwnerEmail').value,
        phone: document.getElementById('editCardPhone').value,
        company: document.getElementById('editCardCompany').value,
        website: document.getElementById('editCardWebsite').value,
        linkedin: document.getElementById('editCardLinkedin').value
    }));
    formData.append('settings', JSON.stringify({
        theme: document.getElementById('editCardTheme').value,
        isActive: true
    }));
    
    const profilePicture = document.getElementById('editCardProfilePicture').files[0];
    if (profilePicture) {
        formData.append('profilePicture', profilePicture);
    }

    try {
        const response = await fetch(`/api/nfc-cards/${cardId}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            showNotification('Card updated successfully', 'success');
            closeEditCardModal();
            loadNFCCards();
        } else {
            throw new Error('Failed to update card');
        }
    } catch (error) {
        showNotification('Error updating card', 'error');
    }
}

// Delete Card
async function deleteCard(cardId) {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
        const response = await fetch(`/api/nfc-cards/${cardId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Card deleted successfully', 'success');
            loadNFCCards();
        } else {
            throw new Error('Failed to delete card');
        }
    } catch (error) {
        showNotification('Error deleting card', 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add form submit event listeners
    document.getElementById('addCardForm').addEventListener('submit', addCard);
    document.getElementById('editCardForm').addEventListener('submit', updateCard);

    // Add search and filter event listeners
    document.getElementById('cardSearchInput').addEventListener('input', filterCards);
    document.getElementById('statusFilter').addEventListener('change', filterCards);
});

// Filter Cards
function filterCards() {
    const searchTerm = document.getElementById('cardSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    const filteredCards = nfcCards.filter(card => {
        const matchesSearch = 
            card.owner.name.toLowerCase().includes(searchTerm) ||
            card.owner.email.toLowerCase().includes(searchTerm) ||
            card.content.title.toLowerCase().includes(searchTerm) ||
            card.content.company.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || 
            (statusFilter === 'active' && card.settings.isActive) ||
            (statusFilter === 'inactive' && !card.settings.isActive);

        return matchesSearch && matchesStatus;
    });

    renderFilteredCards(filteredCards);
}

// Render Filtered Cards
function renderFilteredCards(cards) {
    const tableBody = document.getElementById('nfcCardsTableBody');
    tableBody.innerHTML = '';

    cards.forEach(card => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${card.cardId}</td>
            <td>${card.owner.name}</td>
            <td>${card.content.title}</td>
            <td>${card.content.company}</td>
            <td>
                <span class="status-badge ${card.settings.isActive ? 'active' : 'inactive'}">
                    ${card.settings.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${card.analytics.totalTaps}</td>
            <td>${card.analytics.lastTap ? new Date(card.analytics.lastTap).toLocaleDateString() : 'Never'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="showCardAnalytics('${card.cardId}')">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="showEditCardModal('${card.cardId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteCard('${card.cardId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}