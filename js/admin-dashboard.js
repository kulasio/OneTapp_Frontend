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

// NFC Cards Management
let nfcCards = [];
let nfcCurrentPage = 1;
const nfcItemsPerPage = 10;

// Settings Management
let settings = {
    general: {
        siteName: 'OneTapp NFC',
        siteDescription: '',
        timezone: 'UTC'
    },
    organization: {
        name: '',
        logo: '',
        maxCardsPerUser: 5,
        allowCardCreation: true
    },
    cards: {
        defaultTemplate: 'template1',
        allowedFileTypes: ['jpg', 'png', 'gif'],
        maxFileSize: 5
    },
    security: {
        passwordPolicy: {
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: true
        },
        minPasswordLength: 8,
        sessionTimeout: 30
    },
    notifications: {
        emailNotifications: {
            newUser: true,
            cardTap: true,
            systemAlert: true
        },
        notificationEmail: '',
        emailTemplate: 'default'
    }
};

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

// Modal Functions
function showAddNFCCardModal() {
    document.getElementById('addNFCCardModal').style.display = 'flex';
}

function closeAddNFCCardModal() {
    document.getElementById('addNFCCardModal').style.display = 'none';
    document.getElementById('addNFCCardForm').reset();
}

function showEditNFCCardModal(cardId) {
    const card = nfcCards.find(c => c.id === cardId);
    if (card) {
        document.getElementById('editCardId').value = card.id;
        document.getElementById('editCardName').value = card.name;
        document.getElementById('editCardOrganization').value = card.organization;
        document.getElementById('editCardStatus').value = card.status;
        document.getElementById('editNFCCardModal').style.display = 'flex';
    }
}

function closeEditNFCCardModal() {
    document.getElementById('editNFCCardModal').style.display = 'none';
    document.getElementById('editNFCCardForm').reset();
}

function showNFCCardDetailsModal(cardId) {
    const card = nfcCards.find(c => c.id === cardId);
    if (card) {
        const detailsContent = document.getElementById('nfcCardDetailsContent');
        detailsContent.innerHTML = `
            <div style="padding: 1rem;">
                <h3 style="margin-bottom: 1rem;">${card.name}</h3>
                <div style="display: grid; gap: 1rem;">
                    <div>
                        <strong>Card ID:</strong> ${card.id}
                    </div>
                    <div>
                        <strong>Organization:</strong> ${card.organization}
                    </div>
                    <div>
                        <strong>Status:</strong> ${card.status}
                    </div>
                    <div>
                        <strong>Last Tap:</strong> ${card.lastTap || 'Never'}
                    </div>
                    <div>
                        <strong>Total Taps:</strong> ${card.totalTaps || 0}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('nfcCardDetailsModal').style.display = 'flex';
    }
}

function closeNFCCardDetailsModal() {
    document.getElementById('nfcCardDetailsModal').style.display = 'none';
}

// Form Handlers
document.getElementById('addNFCCardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newCard = {
        id: generateCardId(),
        name: document.getElementById('cardName').value,
        organization: document.getElementById('cardOrganization').value,
        status: document.getElementById('cardStatus').value,
        lastTap: null,
        totalTaps: 0
    };
    
    // Handle image upload if needed
    const imageFile = document.getElementById('cardImage').files[0];
    if (imageFile) {
        // Add image upload logic here
    }
    
    nfcCards.push(newCard);
    closeAddNFCCardModal();
    renderNFCCards();
});

document.getElementById('editNFCCardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const cardId = document.getElementById('editCardId').value;
    const cardIndex = nfcCards.findIndex(c => c.id === cardId);
    
    if (cardIndex !== -1) {
        nfcCards[cardIndex] = {
            ...nfcCards[cardIndex],
            name: document.getElementById('editCardName').value,
            organization: document.getElementById('editCardOrganization').value,
            status: document.getElementById('editCardStatus').value
        };
        
        // Handle image upload if needed
        const imageFile = document.getElementById('editCardImage').files[0];
        if (imageFile) {
            // Add image upload logic here
        }
        
        closeEditNFCCardModal();
        renderNFCCards();
    }
});

// Utility Functions
function generateCardId() {
    return 'NFC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function renderNFCCards() {
    const tbody = document.getElementById('nfcCardsTableBody');
    const startIndex = (nfcCurrentPage - 1) * nfcItemsPerPage;
    const endIndex = startIndex + nfcItemsPerPage;
    const filteredCards = filterNFCCards();
    const paginatedCards = filteredCards.slice(startIndex, endIndex);
    
    tbody.innerHTML = paginatedCards.map(card => `
        <tr>
            <td>${card.id}</td>
            <td>${card.name}</td>
            <td>${card.organization}</td>
            <td>
                <span class="status-badge ${card.status}">
                    ${card.status}
                </span>
            </td>
            <td>${card.lastTap || 'Never'}</td>
            <td>${card.totalTaps || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="showNFCCardDetailsModal('${card.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="showEditNFCCardModal('${card.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteNFCCard('${card.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    renderPagination(filteredCards.length);
}

function filterNFCCards() {
    const searchTerm = document.getElementById('nfcCardSearchInput').value.toLowerCase();
    const organizationFilter = document.getElementById('organizationFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    return nfcCards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm) || 
                            card.id.toLowerCase().includes(searchTerm);
        const matchesOrganization = !organizationFilter || card.organization === organizationFilter;
        const matchesStatus = !statusFilter || card.status === statusFilter;
        
        return matchesSearch && matchesOrganization && matchesStatus;
    });
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / nfcItemsPerPage);
    const paginationControls = document.getElementById('nfcPaginationControls');
    
    let paginationHTML = '';
    
    if (totalPages > 1) {
        paginationHTML += `
            <button class="btn btn-outline" 
                    onclick="changeNFCPage(${nfcCurrentPage - 1})"
                    ${nfcCurrentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="btn ${nfcCurrentPage === i ? 'btn-primary' : 'btn-outline'}"
                        onclick="changeNFCPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        paginationHTML += `
            <button class="btn btn-outline"
                    onclick="changeNFCPage(${nfcCurrentPage + 1})"
                    ${nfcCurrentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;
    }
    
    paginationControls.innerHTML = paginationHTML;
}

function changeNFCPage(page) {
    const totalPages = Math.ceil(filterNFCCards().length / nfcItemsPerPage);
    if (page >= 1 && page <= totalPages) {
        nfcCurrentPage = page;
        renderNFCCards();
    }
}

function deleteNFCCard(cardId) {
    if (confirm('Are you sure you want to delete this NFC card?')) {
        nfcCards = nfcCards.filter(card => card.id !== cardId);
        renderNFCCards();
    }
}

// Event Listeners for Filters
document.getElementById('nfcCardSearchInput').addEventListener('input', renderNFCCards);
document.getElementById('organizationFilter').addEventListener('change', renderNFCCards);
document.getElementById('statusFilter').addEventListener('change', renderNFCCards);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    // This would typically be an API call
    nfcCards = [
        {
            id: 'NFC-123456789',
            name: 'John Doe',
            organization: 'org1',
            status: 'active',
            lastTap: '2024-03-20 14:30',
            totalTaps: 15
        },
        {
            id: 'NFC-987654321',
            name: 'Jane Smith',
            organization: 'org2',
            status: 'inactive',
            lastTap: '2024-03-19 09:15',
            totalTaps: 8
        }
    ];
    
    renderNFCCards();
});

// Load Settings
function loadSettings() {
    // Load General Settings
    document.getElementById('siteName').value = settings.general.siteName;
    document.getElementById('siteDescription').value = settings.general.siteDescription;
    document.getElementById('timezone').value = settings.general.timezone;

    // Load Organization Settings
    document.getElementById('orgName').value = settings.organization.name;
    document.getElementById('maxCardsPerUser').value = settings.organization.maxCardsPerUser;
    document.getElementById('allowCardCreation').value = settings.organization.allowCardCreation;

    // Load Card Settings
    document.getElementById('defaultCardTemplate').value = settings.cards.defaultTemplate;
    settings.cards.allowedFileTypes.forEach(type => {
        const checkbox = document.querySelector(`input[value="${type}"]`);
        if (checkbox) checkbox.checked = true;
    });
    document.getElementById('maxFileSize').value = settings.cards.maxFileSize;

    // Load Security Settings
    document.getElementById('requireUppercase').checked = settings.security.passwordPolicy.requireUppercase;
    document.getElementById('requireNumbers').checked = settings.security.passwordPolicy.requireNumbers;
    document.getElementById('requireSpecialChars').checked = settings.security.passwordPolicy.requireSpecialChars;
    document.getElementById('minPasswordLength').value = settings.security.minPasswordLength;
    document.getElementById('sessionTimeout').value = settings.security.sessionTimeout;

    // Load Notification Settings
    document.getElementById('newUserNotification').checked = settings.notifications.emailNotifications.newUser;
    document.getElementById('cardTapNotification').checked = settings.notifications.emailNotifications.cardTap;
    document.getElementById('systemAlertNotification').checked = settings.notifications.emailNotifications.systemAlert;
    document.getElementById('notificationEmail').value = settings.notifications.notificationEmail;
    document.getElementById('emailTemplate').value = settings.notifications.emailTemplate;
}

// Save Settings
function saveSettings(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        switch(formId) {
            case 'generalSettingsForm':
                settings.general = {
                    siteName: document.getElementById('siteName').value,
                    siteDescription: document.getElementById('siteDescription').value,
                    timezone: document.getElementById('timezone').value
                };
                break;

            case 'organizationSettingsForm':
                settings.organization = {
                    name: document.getElementById('orgName').value,
                    maxCardsPerUser: parseInt(document.getElementById('maxCardsPerUser').value),
                    allowCardCreation: document.getElementById('allowCardCreation').value === 'true'
                };
                break;

            case 'cardSettingsForm':
                const allowedFileTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(checkbox => checkbox.value);
                settings.cards = {
                    defaultTemplate: document.getElementById('defaultCardTemplate').value,
                    allowedFileTypes: allowedFileTypes,
                    maxFileSize: parseInt(document.getElementById('maxFileSize').value)
                };
                break;

            case 'securitySettingsForm':
                settings.security = {
                    passwordPolicy: {
                        requireUppercase: document.getElementById('requireUppercase').checked,
                        requireNumbers: document.getElementById('requireNumbers').checked,
                        requireSpecialChars: document.getElementById('requireSpecialChars').checked
                    },
                    minPasswordLength: parseInt(document.getElementById('minPasswordLength').value),
                    sessionTimeout: parseInt(document.getElementById('sessionTimeout').value)
                };
                break;

            case 'notificationSettingsForm':
                settings.notifications = {
                    emailNotifications: {
                        newUser: document.getElementById('newUserNotification').checked,
                        cardTap: document.getElementById('cardTapNotification').checked,
                        systemAlert: document.getElementById('systemAlertNotification').checked
                    },
                    notificationEmail: document.getElementById('notificationEmail').value,
                    emailTemplate: document.getElementById('emailTemplate').value
                };
                break;
        }

        // Show success message
        showNotification('Settings saved successfully', 'success');
        
        // Here you would typically make an API call to save the settings
        console.log('Settings updated:', settings);
    });
}

// Initialize Settings Forms
document.addEventListener('DOMContentLoaded', () => {
    // Load initial settings
    loadSettings();

    // Initialize all settings forms
    saveSettings('generalSettingsForm');
    saveSettings('organizationSettingsForm');
    saveSettings('cardSettingsForm');
    saveSettings('securitySettingsForm');
    saveSettings('notificationSettingsForm');
});