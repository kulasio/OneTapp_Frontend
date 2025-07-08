const API_BASE = "https://onetapp-backend.onrender.com/api"; // or your deployed backend URL

// Sidebar navigation
const dashboardNav = document.getElementById('dashboardNav');
const usersNav = document.getElementById('usersNav');
const cardsNav = document.getElementById('cardsNav');
const analyticsNav = document.getElementById('analyticsNav');
const reportsNav = document.getElementById('reportsNav');
const settingsNav = document.getElementById('settingsNav');
const profilesNav = document.getElementById('profilesNav');

const dashboardSection = document.getElementById('dashboardSection');
const usersSection = document.getElementById('usersSection');
const cardsSection = document.getElementById('cardsSection');
const analyticsSection = document.getElementById('analyticsSection');
const reportsSection = document.getElementById('reportsSection');
const settingsSection = document.getElementById('settingsSection');
const profilesSection = document.getElementById('profilesSection');

function showSection(section) {
    // Hide all sections
    dashboardSection.style.display = 'none';
    usersSection.style.display = 'none';
    cardsSection.style.display = 'none';
    analyticsSection.style.display = 'none';
    reportsSection.style.display = 'none';
    settingsSection.style.display = 'none';
    profilesSection.style.display = 'none';

    // Remove active class from all nav items
    dashboardNav.classList.remove('active');
    usersNav.classList.remove('active');
    cardsNav.classList.remove('active');
    analyticsNav.classList.remove('active');
    reportsNav.classList.remove('active');
    settingsNav.classList.remove('active');
    profilesNav.classList.remove('active');

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
    } else if (section === 'analytics') {
        analyticsSection.style.display = '';
        analyticsNav.classList.add('active');
    } else if (section === 'reports') {
        reportsSection.style.display = '';
        reportsNav.classList.add('active');
    } else if (section === 'settings') {
        settingsSection.style.display = '';
        settingsNav.classList.add('active');
    } else if (section === 'profiles') {
        profilesSection.style.display = '';
        profilesNav.classList.add('active');
        fetchAndRenderProfiles();
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

analyticsNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('analytics');
});

reportsNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('reports');
});

settingsNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('settings');
});

profilesNav.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('profiles');
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
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
});

const addUserForm = document.getElementById('addUserForm');
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addUserForm);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        status: 'active' // Always set status for new users
    };
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add user');
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        if (modal) modal.hide();
        // Refresh user list
        fetchUsers();
        addUserForm.reset();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// Remove old window click handler for modals (Bootstrap handles this)
// window.addEventListener('click', (e) => { ... });

// On page load, show dashboard by default
showSection('dashboard');

// --- User Management Logic ---
const usersTableBody = document.getElementById('usersTableBody');
let allUsers = [];

async function fetchUsers() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE}/users`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        allUsers = data.users;
        renderUsersTable(allUsers);
    } catch (err) {
        usersTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error loading users</td></tr>`;
    }
}

function renderUsersTable(users) {
    if (!users || users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No users found.</td></tr>';
        return;
    }
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit" data-id="${user._id}"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete" data-id="${user._id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Filter users by email
const userEmailFilter = document.getElementById('userEmailFilter');
userEmailFilter.addEventListener('input', function() {
    const filterValue = this.value.trim().toLowerCase();
    const filtered = allUsers.filter(user =>
        user.email && user.email.toLowerCase().includes(filterValue)
    );
    renderUsersTable(filterValue ? filtered : allUsers);
});

// Fetch users when Users section is shown
usersNav.addEventListener('click', () => {
    fetchUsers();
});

// Event delegation for user actions (Edit, Delete)
usersTableBody.addEventListener('click', async (e) => {
    const target = e.target;
    const id = target.dataset.id;
    const token = localStorage.getItem('adminToken');

    if (target.classList.contains('btn-delete')) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`${API_BASE}/users/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to delete user.' }));
                    throw new Error(errorData.message);
                }
                
                await fetchUsers(); // Refresh the table
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    }

    if (target.classList.contains('btn-edit')) {
        try {
            const response = await fetch(`${API_BASE}/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user data.' }));
                throw new Error(errorData.message);
            }

            // Support both { user: {...} } and { ... } response formats
            const userResponse = await response.json();
            const user = userResponse.user || userResponse;
            
            // Populate and show the modal
            const form = document.getElementById('editUserForm');
            form.elements.userId.value = user._id || '';
            form.elements.email.value = user.email || '';
            form.elements.role.value = user.role || '';
            form.elements.status.value = user.status || '';
            
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    }
});

const editUserForm = document.getElementById('editUserForm');

editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = e.target.elements.userId.value;
    const role = e.target.elements.role.value;
    const status = e.target.elements.status.value;
    const token = localStorage.getItem('adminToken');

    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role, status })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to update user.' }));
            throw new Error(errorData.message);
        }

        // editUserModal.style.display = 'none';
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        if (modal) modal.hide();
        await fetchUsers(); // Refresh the table

    } catch (err) {
        alert(`Error: ${err.message}`);
    }
});

// Optionally, fetch users on page load if Users section is default
// fetchUsers(); 

// --- Card Management Logic ---
const cardsTableBody = document.getElementById('cardsTableBody');
const addCardBtn = document.getElementById('addCardBtn');
const addEditCardModal = document.getElementById('addEditCardModal');
const addEditCardForm = document.getElementById('addEditCardForm');
const cardModalTitle = document.getElementById('cardModalTitle');

let allCards = [];
let allCardUsers = [];
let allCardProfiles = [];

function fetchAndRenderCards() {
    const token = localStorage.getItem('adminToken');
    fetch(`${API_BASE}/cards`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            allCards = data.cards || data;
            renderCardsTable(allCards);
        });
}

function renderCardsTable(cards) {
    cardsTableBody.innerHTML = '';
    cards.forEach(card => {
        // Use populated userId object
        const user = card.userId;
        const profile = allCardProfiles.find(p => p._id === card.defaultProfileId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${card.cardUid || ''}</td>
            <td>${user ? user.username + ' (' + user.email + ')' : ''}</td>
            <td>${card.label || ''}</td>
            <td>${card.assignedUrl || ''}</td>
            <td>${card.status || ''}</td>
            <td>${card.createdAt ? new Date(card.createdAt).toLocaleString() : ''}</td>
            <td>
                <button class="btn-edit" onclick="openEditCardModal('${card._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteCard('${card._id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        cardsTableBody.appendChild(tr);
    });
}

function fetchUsersForCardDropdown() {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            const users = data.users || data;
            allCardUsers = users;
            const userSelect = addEditCardForm.elements['userId'];
            userSelect.innerHTML = '';
            users.forEach(user => {
                const opt = document.createElement('option');
                opt.value = user._id;
                opt.textContent = user.username + ' (' + user.email + ')';
                userSelect.appendChild(opt);
            });
        });
}

function fetchProfilesForCardDropdown() {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_BASE}/profiles`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            const profiles = data;
            allCardProfiles = profiles;
            const profileSelect = addEditCardForm.elements['defaultProfileId'];
            profileSelect.innerHTML = '<option value="">None</option>';
            profiles.forEach(profile => {
                const opt = document.createElement('option');
                opt.value = profile._id;
                opt.textContent = profile.fullName + (profile.jobTitle ? ' - ' + profile.jobTitle : '');
                profileSelect.appendChild(opt);
            });
        });
}

// Generate a random 10-character hex UID
function generateCardUid(length = 10) {
    const chars = '0123456789ABCDEF';
    let uid = '';
    for (let i = 0; i < length; i++) {
        uid += chars[Math.floor(Math.random() * chars.length)];
    }
    return uid;
}

addCardBtn.addEventListener('click', async () => {
    addEditCardForm.reset();
    addEditCardForm.elements['cardId'].value = '';
    // Auto-generate cardUid
    addEditCardForm.elements['cardUid'].value = generateCardUid(10);
    cardModalTitle.textContent = 'Add Card';
    await fetchUsersForCardDropdown();
    await fetchProfilesForCardDropdown();
    // Show dropdown, hide plain text
    addEditCardForm.elements['userId'].style.display = '';
    addEditCardForm.elements['userDisplay'].style.display = 'none';
    const modal = new bootstrap.Modal(document.getElementById('addEditCardModal'));
    modal.show();
});

window.openEditCardModal = async function(cardId) {
    const card = allCards.find(c => c._id === cardId);
    if (!card) return;
    addEditCardForm.reset();
    addEditCardForm.elements['cardId'].value = card._id;
    await fetchUsersForCardDropdown();
    await fetchProfilesForCardDropdown();
    // Hide dropdown, show plain text
    addEditCardForm.elements['userId'].style.display = 'none';
    addEditCardForm.elements['userDisplay'].style.display = '';
    // Find user object
    let user = card.userId;
    if (!user && allCardUsers && card.userId) {
        user = allCardUsers.find(u => u._id === card.userId);
    }
    addEditCardForm.elements['userDisplay'].value = user ? (user.username + ' (' + user.email + ')') : '';
    addEditCardForm.elements['cardUid'].value = card.cardUid || '';
    addEditCardForm.elements['label'].value = card.label || '';
    addEditCardForm.elements['assignedUrl'].value = card.assignedUrl || '';
    addEditCardForm.elements['defaultProfileId'].value = card.defaultProfileId || '';
    addEditCardForm.elements['status'].value = card.status || 'active';
    cardModalTitle.textContent = 'Edit Card';
    const modal = new bootstrap.Modal(document.getElementById('addEditCardModal'));
    modal.show();
};

addEditCardForm.onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(addEditCardForm);
    const cardId = formData.get('cardId');
    const method = cardId ? 'PUT' : 'POST';
    const url = cardId ? `${API_BASE}/cards/${cardId}` : `${API_BASE}/cards`;
    const data = {};
    formData.forEach((value, key) => {
        if (value) data[key] = value;
    });
    // Remove cardId from data
    delete data.cardId;
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
        // addEditCardModal.style.display = 'none';
        const modal = bootstrap.Modal.getInstance(document.getElementById('addEditCardModal'));
        if (modal) modal.hide();
        fetchAndRenderCards();
    });
};

window.deleteCard = function(cardId) {
    if (!confirm('Are you sure you want to delete this card?')) return;
    fetch(`${API_BASE}/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
        if (status >= 400) {
            alert(data.message || 'Failed to delete card');
        } else {
            fetchAndRenderCards();
        }
    })
    .catch(err => alert('Network error: ' + err.message));
};

// Filter cards by assigned user's email
const cardEmailFilter = document.getElementById('cardEmailFilter');
cardEmailFilter.addEventListener('input', function() {
    const filterValue = this.value.trim().toLowerCase();
    const filtered = allCards.filter(card => {
        const user = allCardUsers.find(u => u._id === card.userId);
        return user && user.email && user.email.toLowerCase().includes(filterValue);
    });
    renderCardsTable(filterValue ? filtered : allCards);
});

// Fetch cards and users/profiles on page load for the Cards section
function showCardsSection() {
    // Hide all sections
    dashboardSection.style.display = 'none';
    usersSection.style.display = 'none';
    cardsSection.style.display = 'none';
    analyticsSection.style.display = 'none';
    reportsSection.style.display = 'none';
    settingsSection.style.display = 'none';
    profilesSection.style.display = 'none';

    cardsSection.style.display = 'block';
    Promise.all([fetchUsersForCardDropdown(), fetchProfilesForCardDropdown()]).then(fetchAndRenderCards);
}

const cardsSidebarBtn = document.getElementById('cardsNav');
if (cardsSidebarBtn) {
    cardsSidebarBtn.addEventListener('click', showCardsSection);
}

// --- Profiles Section Logic ---
const profilesTableBody = document.getElementById('profilesTableBody');
const addProfileBtn = document.getElementById('addProfileBtn');
const addEditProfileModal = document.getElementById('addEditProfileModal');
const addEditProfileForm = document.getElementById('addEditProfileForm');
const profileNameFilter = document.getElementById('profileNameFilter');
const profileModalTitle = document.getElementById('profileModalTitle');
const profileUserSelect = addEditProfileForm.elements['userId'];

let allProfiles = [];

async function fetchUsersForProfileDropdown() {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const users = data.users || data;
    profileUserSelect.innerHTML = '';
    users.forEach(user => {
        const opt = document.createElement('option');
        opt.value = user._id;
        opt.textContent = user.username + ' (' + user.email + ')';
        profileUserSelect.appendChild(opt);
    });
    // Always update the global allUsers array
    allUsers = users;
    return users;
}

function showProfilesSection() {
    // Hide all sections (replace hideAllSections)
    dashboardSection.style.display = 'none';
    usersSection.style.display = 'none';
    cardsSection.style.display = 'none';
    analyticsSection.style.display = 'none';
    reportsSection.style.display = 'none';
    settingsSection.style.display = 'none';
    profilesSection.style.display = 'none';
    // Show profiles section
    profilesSection.style.display = 'block';
    fetchAndRenderProfiles();
}

function fetchAndRenderProfiles() {
    fetch(`${API_BASE}/profiles`)
        .then(res => res.json())
        .then(data => {
            allProfiles = data;
            renderProfilesTable(data);
        });
}

function renderProfilesTable(profiles) {
    profilesTableBody.innerHTML = '';
    profiles.forEach(profile => {
        const user = allUsers.find(u => u._id === profile.userId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${profile.fullName || ''}</td>
            <td>${user ? user.username : ''}</td>
            <td>${profile.jobTitle || ''}</td>
            <td>${profile.company || ''}</td>
            <td>${profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : ''}</td>
            <td>
                <button class="btn-edit" onclick="openEditProfileModal('${profile._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteProfile('${profile._id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        profilesTableBody.appendChild(tr);
    });
}

addProfileBtn.addEventListener('click', async () => {
    addEditProfileForm.reset();
    addEditProfileForm.elements['profileId'].value = '';
    profileModalTitle.textContent = 'Add Profile';
    await fetchUsersForProfileDropdown();
    profileUserSelect.style.display = '';
    // Show the dropdown, hide the plain text
    let userDisplay = addEditProfileForm.querySelector('[name="userDisplay"]');
    if (!userDisplay) {
        userDisplay = document.createElement('input');
        userDisplay.type = 'text';
        userDisplay.name = 'userDisplay';
        userDisplay.className = 'form-control';
        userDisplay.disabled = true;
        userDisplay.style.display = 'none';
        profileUserSelect.parentNode.appendChild(userDisplay);
    }
    userDisplay.style.display = 'none';
    featuredLinks = [];
    renderFeaturedLinks();
    galleryItems = [];
    renderGalleryItems();
    const modal = new bootstrap.Modal(document.getElementById('addEditProfileModal'));
    modal.show();
});

window.openEditProfileModal = async function(profileId) {
    const profile = allProfiles.find(p => p._id === profileId);
    if (!profile) return;
    addEditProfileForm.reset();
    addEditProfileForm.elements['profileId'].value = profile._id;
    await fetchUsersForProfileDropdown();
    // Hide the dropdown, show the plain text
    profileUserSelect.style.display = 'none';
    let userDisplay = addEditProfileForm.querySelector('[name="userDisplay"]');
    if (!userDisplay) {
        userDisplay = document.createElement('input');
        userDisplay.type = 'text';
        userDisplay.name = 'userDisplay';
        userDisplay.className = 'form-control';
        userDisplay.disabled = true;
        profileUserSelect.parentNode.appendChild(userDisplay);
    }
    // Set the plain text value to the user's name/email
    let userId = (profile.userId && profile.userId._id) ? profile.userId._id : profile.userId || '';
    let user = allUsers.find(u => u._id === userId);
    userDisplay.value = user ? (user.username + ' (' + user.email + ')') : '';
    userDisplay.style.display = '';
    addEditProfileForm.elements['fullName'].value = profile.fullName || '';
    addEditProfileForm.elements['jobTitle'].value = profile.jobTitle || '';
    addEditProfileForm.elements['company'].value = profile.company || '';
    addEditProfileForm.elements['bio'].value = profile.bio || '';
    addEditProfileForm.elements['contactEmail'].value = (profile.contact && profile.contact.email) || profile.contactEmail || '';
    addEditProfileForm.elements['contactPhone'].value = (profile.contact && profile.contact.phone) || profile.contactPhone || '';
    addEditProfileForm.elements['contactLocation'].value = (profile.contact && profile.contact.location) || profile.contactLocation || '';
    addEditProfileForm.elements['facebook'].value = (profile.socialLinks && profile.socialLinks.facebook) || '';
    addEditProfileForm.elements['instagram'].value = (profile.socialLinks && profile.socialLinks.instagram) || '';
    addEditProfileForm.elements['tiktok'].value = (profile.socialLinks && profile.socialLinks.tiktok) || '';
    addEditProfileForm.elements['youtube'].value = (profile.socialLinks && profile.socialLinks.youtube) || '';
    addEditProfileForm.elements['whatsapp'].value = (profile.socialLinks && profile.socialLinks.whatsapp) || '';
    addEditProfileForm.elements['telegram'].value = (profile.socialLinks && profile.socialLinks.telegram) || '';
    addEditProfileForm.elements['snapchat'].value = (profile.socialLinks && profile.socialLinks.snapchat) || '';
    addEditProfileForm.elements['pinterest'].value = (profile.socialLinks && profile.socialLinks.pinterest) || '';
    addEditProfileForm.elements['reddit'].value = (profile.socialLinks && profile.socialLinks.reddit) || '';
    addEditProfileForm.elements['other'].value = (profile.socialLinks && profile.socialLinks.other) || '';
    addEditProfileForm.elements['linkedin'].value = (profile.socialLinks && profile.socialLinks.linkedin) || '';
    addEditProfileForm.elements['twitter'].value = (profile.socialLinks && profile.socialLinks.twitter) || '';
    addEditProfileForm.elements['github'].value = (profile.socialLinks && profile.socialLinks.github) || '';
    addEditProfileForm.elements['website'].value = (profile.socialLinks && profile.socialLinks.website) || profile.website || '';
    featuredLinks = Array.isArray(profile.featuredLinks) ? profile.featuredLinks.map(l => ({...l})) : [];
    renderFeaturedLinks();
    galleryItems = Array.isArray(profile.gallery) ? profile.gallery.map(i => ({...i})) : [];
    renderGalleryItems();
    profileModalTitle.textContent = 'Edit Profile';
    const modal = new bootstrap.Modal(document.getElementById('addEditProfileModal'));
    modal.show();
};

addEditProfileForm.onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(addEditProfileForm);
    // Remove profileImageUrl from FormData if present
    formData.delete('profileImageUrl');
    if (croppedBlob) {
      formData.set('profileImage', croppedBlob, 'profile.jpg');
    }
    // Set up method and URL
    const profileId = formData.get('profileId');
    const method = profileId ? 'PUT' : 'POST';
    const url = profileId ? `${API_BASE}/profiles/${profileId}` : `${API_BASE}/profiles`;
    formData.delete('featuredLinks');
    formData.append('featuredLinks', JSON.stringify(featuredLinks));
    formData.delete('gallery');
    formData.append('gallery', JSON.stringify(galleryItems));
    fetch(url, {
        method,
        headers: {
            // 'Content-Type' is NOT set here so browser uses multipart/form-data
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
    })
    .then(res => res.json())
    .then(() => {
        const modalEl = document.getElementById('addEditProfileModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        fetchAndRenderProfiles();
    });
};

window.deleteProfile = function(profileId) {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    fetch(`${API_BASE}/profiles/${profileId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => fetchAndRenderProfiles());
};

profileNameFilter.addEventListener('input', function() {
    const val = this.value.toLowerCase();
    renderProfilesTable(allProfiles.filter(p => (p.fullName || '').toLowerCase().includes(val)));
});

// Add logic to show the Profiles section when sidebar option is clicked
const profilesSidebarBtn = document.getElementById('profilesNav');
if (profilesSidebarBtn) {
    profilesSidebarBtn.addEventListener('click', showProfilesSection);
} 

// === Profile Image Cropping Logic ===
let cropper;
let croppedBlob = null;
const profileImageInput = document.querySelector('input[name="profileImage"]');
const cropperModalEl = document.getElementById('cropperModal');
const cropperModal = cropperModalEl ? new bootstrap.Modal(cropperModalEl) : null;
const cropperImage = document.getElementById('cropperImage');
const profileImagePreview = document.getElementById('profileImagePreview');

if (profileImageInput) {
  profileImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
      cropperImage.src = event.target.result;
      if (cropperModal) cropperModal.show();
      setTimeout(() => {
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropperImage, {
          aspectRatio: 7 / 8,
          viewMode: 1,
          autoCropArea: 1,
          movable: false,
          zoomable: true,
          rotatable: false,
          scalable: false,
          responsive: true,
          background: false
        });
      }, 300);
    };
    reader.readAsDataURL(file);
  });
}

const cropImageBtn = document.getElementById('cropImageBtn');
if (cropImageBtn) {
  cropImageBtn.addEventListener('click', function() {
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob(blob => {
      croppedBlob = blob;
      // Show preview
      if (profileImagePreview) {
        profileImagePreview.src = URL.createObjectURL(blob);
        profileImagePreview.style.display = '';
      }
      if (cropperModal) cropperModal.hide();
    }, 'image/jpeg');
  });
} 

// === Featured Links Logic ===
const featuredLinksSection = document.getElementById('featuredLinksSection');
const addFeaturedLinkBtn = document.getElementById('addFeaturedLinkBtn');
let featuredLinks = [];

function renderFeaturedLinks() {
  featuredLinksSection.innerHTML = '';
  featuredLinks.forEach((link, idx) => {
    const div = document.createElement('div');
    div.className = 'card p-2 mb-2';
    div.innerHTML = `
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label mb-0">Label</label>
          <input type="text" class="form-control" value="${link.label || ''}" data-flabel idx="${idx}">
        </div>
        <div class="col-md-4">
          <label class="form-label mb-0">URL</label>
          <input type="url" class="form-control" value="${link.url || ''}" data-furl idx="${idx}">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Icon</label>
          <input type="text" class="form-control" value="${link.icon || ''}" data-ficon idx="${idx}" placeholder="fa-solid fa-link">
        </div>
        <div class="col-md-1">
          <label class="form-label mb-0">Order</label>
          <input type="number" class="form-control" value="${link.order || idx}" data-forder idx="${idx}">
        </div>
        <div class="col-md-1 text-end">
          <button type="button" class="btn btn-danger btn-sm" data-remove-featured-link="${idx}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    featuredLinksSection.appendChild(div);
  });
}

addFeaturedLinkBtn.addEventListener('click', function() {
  featuredLinks.push({ label: '', url: '', icon: '', order: featuredLinks.length });
  renderFeaturedLinks();
});

featuredLinksSection.addEventListener('input', function(e) {
  const idx = e.target.getAttribute('idx');
  if (e.target.hasAttribute('data-flabel')) featuredLinks[idx].label = e.target.value;
  if (e.target.hasAttribute('data-furl')) featuredLinks[idx].url = e.target.value;
  if (e.target.hasAttribute('data-ficon')) featuredLinks[idx].icon = e.target.value;
  if (e.target.hasAttribute('data-forder')) featuredLinks[idx].order = parseInt(e.target.value) || 0;
});

featuredLinksSection.addEventListener('click', function(e) {
  if (e.target.closest('[data-remove-featured-link]')) {
    const idx = e.target.closest('[data-remove-featured-link]').getAttribute('data-remove-featured-link');
    featuredLinks.splice(idx, 1);
    renderFeaturedLinks();
  }
});

// Clear featuredLinks when adding a new profile
addProfileBtn.addEventListener('click', async () => {
    featuredLinks = [];
    renderFeaturedLinks();
});

// On form submit, add featuredLinks to FormData
addEditProfileForm.addEventListener('submit', function(e) {
    formData.delete('featuredLinks');
    formData.append('featuredLinks', JSON.stringify(featuredLinks));
}, true); 

// === Gallery/Media Logic ===
const gallerySection = document.getElementById('gallerySection');
const addGalleryItemBtn = document.getElementById('addGalleryItemBtn');
let galleryItems = [];

function renderGalleryItems() {
  gallerySection.innerHTML = '';
  galleryItems.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'card p-2 mb-2';
    div.innerHTML = `
      <div class="row g-2 align-items-end">
        <div class="col-md-2">
          <label class="form-label mb-0">Type</label>
          <select class="form-select" data-gtype idx="${idx}">
            <option value="image" ${item.type === 'image' ? 'selected' : ''}>Image</option>
            <option value="video" ${item.type === 'video' ? 'selected' : ''}>Video</option>
            <option value="document" ${item.type === 'document' ? 'selected' : ''}>Document</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label mb-0">URL</label>
          <input type="url" class="form-control" value="${item.url || ''}" data-gurl idx="${idx}">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Thumbnail</label>
          <input type="url" class="form-control" value="${item.thumbnail || ''}" data-gthumb idx="${idx}" placeholder="(optional)">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Title</label>
          <input type="text" class="form-control" value="${item.title || ''}" data-gtitle idx="${idx}">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Description</label>
          <input type="text" class="form-control" value="${item.description || ''}" data-gdesc idx="${idx}" placeholder="(optional)">
        </div>
        <div class="col-md-1">
          <label class="form-label mb-0">Order</label>
          <input type="number" class="form-control" value="${item.order || idx}" data-gorder idx="${idx}">
        </div>
        <div class="col-md-1 text-end">
          <button type="button" class="btn btn-danger btn-sm" data-remove-gallery-item="${idx}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    gallerySection.appendChild(div);
  });
}

addGalleryItemBtn.addEventListener('click', function() {
  galleryItems.push({ type: 'image', url: '', thumbnail: '', title: '', description: '', order: galleryItems.length });
  renderGalleryItems();
});

gallerySection.addEventListener('input', function(e) {
  const idx = e.target.getAttribute('idx');
  if (e.target.hasAttribute('data-gtype')) galleryItems[idx].type = e.target.value;
  if (e.target.hasAttribute('data-gurl')) galleryItems[idx].url = e.target.value;
  if (e.target.hasAttribute('data-gthumb')) galleryItems[idx].thumbnail = e.target.value;
  if (e.target.hasAttribute('data-gtitle')) galleryItems[idx].title = e.target.value;
  if (e.target.hasAttribute('data-gdesc')) galleryItems[idx].description = e.target.value;
  if (e.target.hasAttribute('data-gorder')) galleryItems[idx].order = parseInt(e.target.value) || 0;
});

gallerySection.addEventListener('click', function(e) {
  if (e.target.closest('[data-remove-gallery-item]')) {
    const idx = e.target.closest('[data-remove-gallery-item]').getAttribute('data-remove-gallery-item');
    galleryItems.splice(idx, 1);
    renderGalleryItems();
  }
});

// Populate galleryItems when editing a profile
window.openEditProfileModal = async function(profileId) {
    const profile = allProfiles.find(p => p._id === profileId);
    if (!profile) return;
    addEditProfileForm.reset();
    addEditProfileForm.elements['profileId'].value = profile._id;
    await fetchUsersForProfileDropdown();
    // Hide the dropdown, show the plain text
    profileUserSelect.style.display = 'none';
    let userDisplay = addEditProfileForm.querySelector('[name="userDisplay"]');
    if (!userDisplay) {
        userDisplay = document.createElement('input');
        userDisplay.type = 'text';
        userDisplay.name = 'userDisplay';
        userDisplay.className = 'form-control';
        userDisplay.disabled = true;
        profileUserSelect.parentNode.appendChild(userDisplay);
    }
    // Set the plain text value to the user's name/email
    let userId = (profile.userId && profile.userId._id) ? profile.userId._id : profile.userId || '';
    let user = allUsers.find(u => u._id === userId);
    userDisplay.value = user ? (user.username + ' (' + user.email + ')') : '';
    userDisplay.style.display = '';
    addEditProfileForm.elements['fullName'].value = profile.fullName || '';
    addEditProfileForm.elements['jobTitle'].value = profile.jobTitle || '';
    addEditProfileForm.elements['company'].value = profile.company || '';
    addEditProfileForm.elements['bio'].value = profile.bio || '';
    addEditProfileForm.elements['contactEmail'].value = (profile.contact && profile.contact.email) || profile.contactEmail || '';
    addEditProfileForm.elements['contactPhone'].value = (profile.contact && profile.contact.phone) || profile.contactPhone || '';
    addEditProfileForm.elements['contactLocation'].value = (profile.contact && profile.contact.location) || profile.contactLocation || '';
    addEditProfileForm.elements['facebook'].value = (profile.socialLinks && profile.socialLinks.facebook) || '';
    addEditProfileForm.elements['instagram'].value = (profile.socialLinks && profile.socialLinks.instagram) || '';
    addEditProfileForm.elements['tiktok'].value = (profile.socialLinks && profile.socialLinks.tiktok) || '';
    addEditProfileForm.elements['youtube'].value = (profile.socialLinks && profile.socialLinks.youtube) || '';
    addEditProfileForm.elements['whatsapp'].value = (profile.socialLinks && profile.socialLinks.whatsapp) || '';
    addEditProfileForm.elements['telegram'].value = (profile.socialLinks && profile.socialLinks.telegram) || '';
    addEditProfileForm.elements['snapchat'].value = (profile.socialLinks && profile.socialLinks.snapchat) || '';
    addEditProfileForm.elements['pinterest'].value = (profile.socialLinks && profile.socialLinks.pinterest) || '';
    addEditProfileForm.elements['reddit'].value = (profile.socialLinks && profile.socialLinks.reddit) || '';
    addEditProfileForm.elements['other'].value = (profile.socialLinks && profile.socialLinks.other) || '';
    addEditProfileForm.elements['linkedin'].value = (profile.socialLinks && profile.socialLinks.linkedin) || '';
    addEditProfileForm.elements['twitter'].value = (profile.socialLinks && profile.socialLinks.twitter) || '';
    addEditProfileForm.elements['github'].value = (profile.socialLinks && profile.socialLinks.github) || '';
    addEditProfileForm.elements['website'].value = (profile.socialLinks && profile.socialLinks.website) || profile.website || '';
    featuredLinks = Array.isArray(profile.featuredLinks) ? profile.featuredLinks.map(l => ({...l})) : [];
    renderFeaturedLinks();
    galleryItems = Array.isArray(profile.gallery) ? profile.gallery.map(i => ({...i})) : [];
    renderGalleryItems();
    profileModalTitle.textContent = 'Edit Profile';
    const modal = new bootstrap.Modal(document.getElementById('addEditProfileModal'));
    modal.show();
};

// Clear galleryItems when adding a new profile
addProfileBtn.addEventListener('click', async () => {
    galleryItems = [];
    renderGalleryItems();
});

// On form submit, add gallery to FormData
addEditProfileForm.addEventListener('submit', function(e) {
    formData.delete('gallery');
    formData.append('gallery', JSON.stringify(galleryItems));
}, true); 