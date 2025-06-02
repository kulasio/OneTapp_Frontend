const API_BASE = 'https://onetapp-backend.onrender.com';

// Load all users
async function loadUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    try {
        const res = await fetch(`${API_BASE}/api/users`);
        const users = await res.json();
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button onclick="showEditModal('${user._id}', '${user.name}', '${user.email}')">Edit</button>
                    <button onclick="deleteUser('${user._id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="3">Failed to load users</td></tr>';
    }
}

// Add user
const addUserForm = document.getElementById('addUserForm');
if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('addName').value;
        const email = document.getElementById('addEmail').value;
        const password = document.getElementById('addPassword').value;
        const messageDiv = document.getElementById('addUserMessage');
        messageDiv.textContent = '';
        try {
            const res = await fetch(`${API_BASE}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                messageDiv.className = 'success';
                messageDiv.textContent = 'User added!';
                addUserForm.reset();
                loadUsers();
            } else {
                messageDiv.className = 'error';
                messageDiv.textContent = data.message || 'Failed to add user';
            }
        } catch (err) {
            messageDiv.className = 'error';
            messageDiv.textContent = 'An error occurred.';
        }
    });
}

// Show edit modal
function showEditModal(id, name, email) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editEmail').value = email;
    document.getElementById('editUserModal').style.display = 'block';
}
function closeEditModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

// Edit user
const editUserForm = document.getElementById('editUserForm');
if (editUserForm) {
    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editUserId').value;
        const name = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        const messageDiv = document.getElementById('editUserMessage');
        messageDiv.textContent = '';
        try {
            const res = await fetch(`${API_BASE}/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if (res.ok) {
                messageDiv.className = 'success';
                messageDiv.textContent = 'User updated!';
                closeEditModal();
                loadUsers();
            } else {
                messageDiv.className = 'error';
                messageDiv.textContent = data.message || 'Failed to update user';
            }
        } catch (err) {
            messageDiv.className = 'error';
            messageDiv.textContent = 'An error occurred.';
        }
    });
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadUsers();
        } else {
            alert('Failed to delete user');
        }
    } catch (err) {
        alert('An error occurred.');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Initial load
loadUsers();
window.closeEditModal = closeEditModal;
window.showEditModal = showEditModal;
window.deleteUser = deleteUser;
window.logout = logout; 