// Toast notification function
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  const toastId = `toast-${Date.now()}`;
  const bgClass = type === 'success' ? 'bg-success text-white' : 'bg-danger text-white';
  const toast = document.createElement('div');
  toast.className = `toast align-items-center ${bgClass}`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3500 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

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
    let target = e.target;
    // If the click is on the <i> icon, get the parent button
    if (target.tagName === 'I' && target.parentElement.classList.contains('btn-action')) {
        target = target.parentElement;
    }
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
const profileNameFilter = document.getElementById('profileNameFilter');

let allProfiles = [];



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
        const userId = profile.userId && profile.userId._id ? profile.userId._id : profile.userId;
        const user = allUsers.find(u => u._id === userId);
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



// === Edit Profile Modal Logic ===
const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
const editProfileForm = document.getElementById('editProfileForm');

window.openEditProfileModal = async function(profileId) {
  // Find the profile object from allProfiles
  const profile = allProfiles.find(p => p._id === profileId);
  if (!profile) {
    showToast('Profile not found', 'error');
    return;
  }
  // Always close the modal before opening it for a new user
  const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
  if (modalInstance) modalInstance.hide();
  croppedBlob = null;
  editProfileForm.reset();
  editProfileForm.elements['profileImage'].value = '';
  editProfileForm.elements['profileId'].value = profileId;
  // Always set userId hidden field
  editProfileForm.elements['userId'].value = (profile.userId && profile.userId._id) ? profile.userId._id : profile.userId || '';

  // Remove user dropdown and show read-only user display
  let userDisplay = editProfileForm.querySelector('[name="userDisplay"]');
  if (!userDisplay) {
    userDisplay = document.createElement('input');
    userDisplay.type = 'text';
    userDisplay.name = 'userDisplay';
    userDisplay.className = 'form-control';
    userDisplay.disabled = true;
    const userFieldContainer = editProfileForm.querySelector('#profileUserFieldContainer');
    if (userFieldContainer) {
      userFieldContainer.innerHTML = '';
      userFieldContainer.appendChild(userDisplay);
    }
  }
  // Fetch user details from allUsers or via API if not present
  let userId = (profile.userId && profile.userId._id) ? profile.userId._id : profile.userId || '';
  let user = allUsers && allUsers.find(u => u._id === userId);
  if (!user) {
    // Fallback: fetch user from API
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) user = (await res.json()).user;
    } catch {}
  }
  userDisplay.value = user ? `${user.username} (${user.email})` : 'Unknown User';
  userDisplay.style.display = '';

  // Populate other fields
  editProfileForm.elements['fullName'].value = profile.fullName || '';
  editProfileForm.elements['jobTitle'].value = profile.jobTitle || '';
  editProfileForm.elements['company'].value = profile.company || '';
  editProfileForm.elements['bio'].value = profile.bio || '';
  editProfileForm.elements['contactEmail'].value = (profile.contact && profile.contact.email) || profile.contactEmail || '';
  editProfileForm.elements['contactPhone'].value = (profile.contact && profile.contact.phone) || profile.contactPhone || '';
  editProfileForm.elements['contactLocation'].value = (profile.contact && profile.contact.location) || profile.contactLocation || '';
  editProfileForm.elements['linkedin'].value = (profile.socialLinks && profile.socialLinks.linkedin) || '';
  editProfileForm.elements['twitter'].value = (profile.socialLinks && profile.socialLinks.twitter) || '';
  editProfileForm.elements['github'].value = (profile.socialLinks && profile.socialLinks.github) || '';
  editProfileForm.elements['facebook'].value = (profile.socialLinks && profile.socialLinks.facebook) || '';
  editProfileForm.elements['instagram'].value = (profile.socialLinks && profile.socialLinks.instagram) || '';
  editProfileForm.elements['tiktok'].value = (profile.socialLinks && profile.socialLinks.tiktok) || '';
  editProfileForm.elements['youtube'].value = (profile.socialLinks && profile.socialLinks.youtube) || '';
  editProfileForm.elements['whatsapp'].value = (profile.socialLinks && profile.socialLinks.whatsapp) || '';
  editProfileForm.elements['telegram'].value = (profile.socialLinks && profile.socialLinks.telegram) || '';
  editProfileForm.elements['snapchat'].value = (profile.socialLinks && profile.socialLinks.snapchat) || '';
  editProfileForm.elements['pinterest'].value = (profile.socialLinks && profile.socialLinks.pinterest) || '';
  editProfileForm.elements['reddit'].value = (profile.socialLinks && profile.socialLinks.reddit) || '';
  editProfileForm.elements['website'].value = (profile.socialLinks && profile.socialLinks.website) || profile.website || '';
  editProfileForm.elements['other'].value = (profile.socialLinks && profile.socialLinks.other) || '';

  // Featured Links
  featuredLinks = Array.isArray(profile.featuredLinks) ? profile.featuredLinks.map(l => ({...l})) : [];
  renderFeaturedLinks();
  // Gallery
  galleryItems = Array.isArray(profile.gallery) ? profile.gallery.map(i => ({...i})) : [];
  renderGalleryItems();
  // Recent Activity
  recentActivities = Array.isArray(profile.recentActivity) ? profile.recentActivity.map(i => ({...i})) : [];
  renderRecentActivities();

  // Verification Status
  if (profile.verificationStatus) {
    editProfileForm.elements['verificationStatusType'].value = profile.verificationStatus.type || 'unverified';
    if (editProfileForm.elements['verificationStatusVerifiedAt'])
      editProfileForm.elements['verificationStatusVerifiedAt'].value = profile.verificationStatus.verifiedAt ? profile.verificationStatus.verifiedAt.split('T')[0] : '';
    if (editProfileForm.elements['verificationStatusVerifiedBy'])
      editProfileForm.elements['verificationStatusVerifiedBy'].value = profile.verificationStatus.verifiedBy || '';
  } else {
    editProfileForm.elements['verificationStatusType'].value = 'unverified';
    if (editProfileForm.elements['verificationStatusVerifiedAt'])
      editProfileForm.elements['verificationStatusVerifiedAt'].value = '';
    if (editProfileForm.elements['verificationStatusVerifiedBy'])
      editProfileForm.elements['verificationStatusVerifiedBy'].value = '';
  }
  // QR URL
  if (editProfileForm.elements['qrUrl'])
    editProfileForm.elements['qrUrl'].value = profile.qrUrl || '';

  // Profile image preview
  if (profile.profileImageId || (profile.profileImage && profile.profileImage.data)) {
    // If you have a URL or can construct one, set it here
    // Otherwise, handle base64 or blob as needed
    // Example: editProfileForm.querySelector('#profileImagePreview').src = ...
    // For now, just show the preview if available
    editProfileForm.querySelector('#profileImagePreview').style.display = '';
  } else {
    editProfileForm.querySelector('#profileImagePreview').style.display = 'none';
  }

  // Set the userId display field
  editProfileForm.elements['userIdDisplay'].value = (profile.userId && profile.userId._id) ? profile.userId._id : profile.userId || '';

  const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
  modal.show();
};

editProfileForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(editProfileForm);
  
  // Add custom field serialization
  formData.append('featuredLinks', JSON.stringify(featuredLinks));
  formData.append('gallery', JSON.stringify(galleryItems));
  formData.append('recentActivity', JSON.stringify(recentActivities));
  
  // Add verification status
  const verificationStatus = {
    type: editProfileForm.elements['verificationStatusType'].value,
    verifiedAt: editProfileForm.elements['verificationStatusVerifiedAt'].value,
    verifiedBy: editProfileForm.elements['verificationStatusVerifiedBy'].value
  };
  formData.append('verificationStatus', JSON.stringify(verificationStatus));
  
  // Ensure only one file is sent as profileImage
  if (croppedBlob) {
    formData.delete('profileImage'); // Remove any file input
    formData.append('profileImage', croppedBlob, 'profile-image.jpg');
    editProfileForm.elements['profileImage'].value = '';
  }
  
  const profileId = editProfileForm.elements['profileId'].value;
  console.log('Submitting profile update for:', profileId, 'croppedBlob:', croppedBlob);
  
  try {
  const res = await fetch(`${API_BASE}/profiles/${profileId}`, {
    method: 'PUT',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
  });
    
  if (res.ok) {
      // Always close modal on success
      const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
      if (modal) modal.hide();
    fetchAndRenderProfiles();
      croppedBlob = null;
      showToast('Profile updated successfully!', 'success');
    } else {
      let errorText = await res.text();
      let errorMsg = '';
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorData.error || errorText;
      } catch {
        errorMsg = errorText;
      }
      showToast(`Error: ${errorMsg}`, 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
});

// Delete profile function
window.deleteProfile = async function(profileId) {
  if (!confirm('Are you sure you want to delete this profile?')) return;
  
  try {
    const res = await fetch(`${API_BASE}/profiles/${profileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (res.ok) {
      fetchAndRenderProfiles();
    } else {
      const errorData = await res.json().catch(() => ({ message: 'Failed to delete profile.' }));
      alert(`Error: ${errorData.message}`);
    }
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};

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
const addFeaturedLinkBtnAdd = document.getElementById('addFeaturedLinkBtnAdd');
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

if (addFeaturedLinkBtnAdd) {
  addFeaturedLinkBtnAdd.addEventListener('click', function() {
    featuredLinks.push({ label: '', url: '', icon: '', order: featuredLinks.length });
    renderFeaturedLinks();
  });
}

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



// === Gallery/Media Logic ===
const gallerySection = document.getElementById('gallerySection');
const addGalleryItemBtnAdd = document.getElementById('addGalleryItemBtnAdd');
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
        <div class="col-md-4">
          <label class="form-label mb-0">Media</label>
          ${item.type === 'image' ? 
            `<input type="file" class="form-control mb-1" accept="image/*" data-gfile idx="${idx}" placeholder="Upload image file">
             <div class="progress mb-1" style="display:none;" id="gallery-upload-progress-${idx}">
               <div class="progress-bar" role="progressbar" style="width: 0%"></div>
             </div>` : 
            `<input type="url" class="form-control mb-1" value="${item.url || ''}" data-gurl idx="${idx}" placeholder="Paste video URL">`
          }
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Thumbnail</label>
          <input type="url" class="form-control" value="${item.thumbnail || ''}" data-gthumb idx="${idx}" placeholder="(optional)">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Title</label>
          <input type="text" class="form-control" value="${item.title || ''}" data-gtitle idx="${idx}">
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

  // Handle type change is now handled in the input event listener above

  // Handle image file upload
  document.querySelectorAll('input[data-gfile]').forEach(input => {
    input.addEventListener('change', async function(e) {
      const idx = e.target.getAttribute('idx');
      const file = e.target.files[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Show progress bar
      const progressBar = document.getElementById(`gallery-upload-progress-${idx}`);
      progressBar.style.display = 'block';
      const bar = progressBar.querySelector('.progress-bar');
      bar.style.width = '0%';
      
      // Upload to backend
      const formData = new FormData();
      formData.append('image', file);
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://onetapp-backend.onrender.com/api/profiles/gallery/upload-image');
        xhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            bar.style.width = percent + '%';
          }
        });
        xhr.onload = function() {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            galleryItems[idx].url = response.url;
            renderGalleryItems();
            // Only add a new blank item if the last one is not blank
            const lastItem = galleryItems[galleryItems.length - 1];
            if (lastItem && lastItem.url) {
              galleryItems.push({ type: 'image', url: '', thumbnail: '', title: '', description: '', order: galleryItems.length });
              renderGalleryItems();
            }
          } else {
            alert('Upload failed: ' + xhr.responseText);
            progressBar.style.display = 'none';
          }
        };
        xhr.onerror = function() {
          alert('Upload failed.');
          progressBar.style.display = 'none';
        };
        xhr.send(formData);
      } catch (err) {
        alert('Upload error: ' + err.message);
        progressBar.style.display = 'none';
      }
    });
  });
}

if (addGalleryItemBtnAdd) {
  addGalleryItemBtnAdd.addEventListener('click', function() {
    galleryItems.push({ type: 'image', url: '', thumbnail: '', title: '', description: '', order: galleryItems.length });
    renderGalleryItems();
  });
}

// Helper: Get YouTube thumbnail from URL
function getYouTubeThumbnail(url) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return '';
}

// Helper: Get Vimeo thumbnail from URL (async)
async function getVimeoThumbnail(url) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match && match[1]) {
    const videoId = match[1];
    const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`);
    const data = await response.json();
    return data[0].thumbnail_large;
  }
  return '';
}

gallerySection.addEventListener('input', async function(e) {
  const idx = e.target.getAttribute('idx');
  if (e.target.hasAttribute('data-gtype')) {
    galleryItems[idx].type = e.target.value;
    renderGalleryItems();
  }
  if (e.target.hasAttribute('data-gurl')) {
    let url = e.target.value.trim();
    // Only add https:// if not already present for video URLs
    if (galleryItems[idx].type === 'video' && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    galleryItems[idx].url = url;
    // Auto-fetch thumbnail for video URLs
    if (galleryItems[idx].type === 'video' && url) {
      // Validate video URL format
      const videoUrlPatterns = [
        /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
        /^https?:\/\/(www\.)?(vimeo\.com)\/.+/,
        /^https?:\/\/(www\.)?(dailymotion\.com)\/.+/,
        /^https?:\/\/(www\.)?(facebook\.com)\/.+/,
        /^https?:\/\/(www\.)?(instagram\.com)\/.+/
      ];
      
      const isValidVideoUrl = videoUrlPatterns.some(pattern => pattern.test(url));
      if (!isValidVideoUrl) {
        alert('Please enter a valid video URL (YouTube, Vimeo, Dailymotion, Facebook, or Instagram)');
        return;
      }
      
      let thumb = getYouTubeThumbnail(galleryItems[idx].url);
      if (!thumb && galleryItems[idx].url.includes('vimeo.com')) {
        thumb = await getVimeoThumbnail(galleryItems[idx].url);
      }
      if (thumb) {
        galleryItems[idx].thumbnail = thumb;
        renderGalleryItems();
      }
    }
  }
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



 

// === Recent Activity Logic ===
const recentActivitySection = document.getElementById('recentActivitySection');
const addRecentActivityBtnAdd = document.getElementById('addRecentActivityBtnAdd');
let recentActivities = [];

function renderRecentActivities() {
  recentActivitySection.innerHTML = '';
  recentActivities.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'card p-2 mb-2';
    div.innerHTML = `
      <div class="row g-2 align-items-end">
        <div class="col-md-2">
          <label class="form-label mb-0">Type</label>
          <input type="text" class="form-control" value="${item.type || ''}" data-rtype idx="${idx}" placeholder="e.g. blog_post">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Title</label>
          <input type="text" class="form-control" value="${item.title || ''}" data-rtitle idx="${idx}">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Description</label>
          <input type="text" class="form-control" value="${item.description || ''}" data-rdesc idx="${idx}" placeholder="(optional)">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">URL</label>
          <input type="url" class="form-control" value="${item.url || ''}" data-rurl idx="${idx}" placeholder="(optional)">
        </div>
        <div class="col-md-2">
          <label class="form-label mb-0">Date</label>
          <input type="date" class="form-control" value="${item.date ? item.date.split('T')[0] : ''}" data-rdate idx="${idx}">
        </div>
        <div class="col-md-1">
          <label class="form-label mb-0">Icon</label>
          <input type="text" class="form-control" value="${item.icon || ''}" data-ricon idx="${idx}" placeholder="fa-solid fa-award">
        </div>
        <div class="col-md-1 text-end">
          <button type="button" class="btn btn-danger btn-sm" data-remove-recent-activity="${idx}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    recentActivitySection.appendChild(div);
  });
}

if (addRecentActivityBtnAdd) {
  addRecentActivityBtnAdd.addEventListener('click', function() {
    recentActivities.push({ type: '', title: '', description: '', url: '', date: '', icon: '', order: recentActivities.length });
    renderRecentActivities();
  });
}

recentActivitySection.addEventListener('input', function(e) {
  const idx = e.target.getAttribute('idx');
  if (e.target.hasAttribute('data-rtype')) recentActivities[idx].type = e.target.value;
  if (e.target.hasAttribute('data-rtitle')) recentActivities[idx].title = e.target.value;
  if (e.target.hasAttribute('data-rdesc')) recentActivities[idx].description = e.target.value;
  if (e.target.hasAttribute('data-rurl')) recentActivities[idx].url = e.target.value;
  if (e.target.hasAttribute('data-rdate')) recentActivities[idx].date = e.target.value;
  if (e.target.hasAttribute('data-ricon')) recentActivities[idx].icon = e.target.value;
});

recentActivitySection.addEventListener('click', function(e) {
  if (e.target.closest('[data-remove-recent-activity]')) {
    const idx = e.target.closest('[data-remove-recent-activity]').getAttribute('data-remove-recent-activity');
    recentActivities.splice(idx, 1);
    renderRecentActivities();
  }
});



 

// === Verification Status Logic ===
// These selectors will be used within the edit profile modal context



 