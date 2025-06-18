// Check if user is admin
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = '/index.html';
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Fetch admin dashboard data
async function fetchDashboardData() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        // Update stats
        document.getElementById('totalUsers').textContent = data.data.totalUsers;
        
        // Update recent users list
        const usersList = document.getElementById('usersTableBody');
        usersList.innerHTML = data.data.recentUsers.map(user => `
            <tr>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <span class="status-badge ${user.isVerified ? 'active' : 'inactive'}">
                        ${user.isVerified ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewUser('${user._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editUser('${user._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteUser('${user._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// User management functions
async function viewUser(userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch user details');

        const data = await response.json();
        const user = data.data;

        const detailsContent = document.getElementById('userDetailsContent');
        detailsContent.innerHTML = `
            <div style="padding: 1rem;">
                <h3 style="margin-bottom: 1rem;">${user.firstName} ${user.lastName}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Status:</strong> ${user.isVerified ? 'Active' : 'Inactive'}</p>
                <p><strong>Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
        `;

        document.getElementById('userDetailsModal').style.display = 'flex';
    } catch (error) {
        showNotification('Error loading user details', 'error');
    }
}

async function editUser(userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch user details');

        const data = await response.json();
        const user = data.data;

        document.getElementById('editUserId').value = user._id;
        document.getElementById('editUserName').value = `${user.firstName} ${user.lastName}`;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;

        document.getElementById('editUserModal').style.display = 'flex';
    } catch (error) {
        showNotification('Error loading user details', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete user');

        showNotification('User deleted successfully', 'success');
        fetchDashboardData();
    } catch (error) {
        showNotification('Error deleting user', 'error');
    }
}

// Modal functions
function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').style.display = 'none';
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'flex';
}

// Form submission handlers
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        firstName: document.getElementById('userName').value.split(' ')[0],
        lastName: document.getElementById('userName').value.split(' ').slice(1).join(' '),
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to add user');

        showNotification('User added successfully', 'success');
        closeAddUserModal();
        fetchDashboardData();
    } catch (error) {
        showNotification('Error adding user', 'error');
    }
});

document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('editUserId').value;
    const formData = {
        firstName: document.getElementById('editUserName').value.split(' ')[0],
        lastName: document.getElementById('editUserName').value.split(' ').slice(1).join(' '),
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value
    };

    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to update user');

        showNotification('User updated successfully', 'success');
        closeEditUserModal();
        fetchDashboardData();
    } catch (error) {
        showNotification('Error updating user', 'error');
    }
});

// Initialize dashboard
checkAdminAuth();
fetchDashboardData(); 