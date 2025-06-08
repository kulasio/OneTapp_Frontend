// Global variables
let currentUser = null;
let cards = [];
let users = [];
let analytics = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeNavigation();
    loadDashboardData();
    setupEventListeners();
});

// Authentication check
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }
        currentUser = await response.json();
        updateUserInterface();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login.html';
    }
}

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Show selected section
function showSection(section) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.style.display = 'none');
    
    const selectedSection = document.getElementById(`${section}Section`);
    if (selectedSection) {
        selectedSection.style.display = '';
        if (section === 'dashboard') {
            loadDashboardData();
        } else if (section === 'cards') {
            loadCards();
        } else if (section === 'analytics') {
            loadAnalytics();
        } else if (section === 'users') {
            loadUsers();
        } else if (section === 'settings') {
            loadSettings();
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const [cardsResponse, analyticsResponse] = await Promise.all([
            fetch('/api/admin/cards'),
            fetch('/api/admin/analytics/summary')
        ]);

        if (!cardsResponse.ok || !analyticsResponse.ok) {
            throw new Error('Failed to load dashboard data');
        }

        cards = await cardsResponse.json();
        analytics = await analyticsResponse.json();

        updateDashboardStats();
        initializeActivityChart();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('totalCards').textContent = cards.length;
    document.getElementById('totalTaps').textContent = analytics.totalTaps || 0;
    document.getElementById('activeCards').textContent = cards.filter(card => card.status === 'active').length;
    document.getElementById('todayTaps').textContent = analytics.todayTaps || 0;
}

// Initialize activity chart
function initializeActivityChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: analytics.activityLabels || [],
            datasets: [{
                label: 'Card Taps',
                data: analytics.activityData || [],
                borderColor: '#1976d2',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Load cards
async function loadCards() {
    try {
        const response = await fetch('/api/admin/cards');
        if (!response.ok) {
            throw new Error('Failed to load cards');
        }
        cards = await response.json();
        renderCards();
    } catch (error) {
        console.error('Error loading cards:', error);
        showNotification('Error loading cards', 'error');
    }
}

// Render cards
function renderCards() {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        cardElement.innerHTML = `
            <div class="card-header">
                <h3>${card.content.name}</h3>
                <span class="status-badge ${card.status}">${card.status}</span>
            </div>
            <div class="card-body">
                <p><strong>Title:</strong> ${card.content.title}</p>
                <p><strong>Company:</strong> ${card.content.company}</p>
                <p><strong>Email:</strong> ${card.content.email}</p>
                <p><strong>Phone:</strong> ${card.content.phone}</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-secondary" onclick="showCardAnalytics('${card.cardId}')">
                    <i class="fas fa-chart-bar"></i>
                </button>
                <button class="btn btn-primary" onclick="showEditCardModal('${card.cardId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteCard('${card.cardId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cardsGrid.appendChild(cardElement);
    });
}

// Show add card modal
function showAddCardModal() {
    document.getElementById('addCardModal').style.display = 'flex';
}

// Close add card modal
function closeAddCardModal() {
    document.getElementById('addCardModal').style.display = 'none';
    document.getElementById('addCardForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
}

// Handle card image upload
document.getElementById('cardImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Add new card
async function addCard(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('content', JSON.stringify({
        name: document.getElementById('cardName').value,
        title: document.getElementById('cardTitle').value,
        company: document.getElementById('cardCompany').value,
        email: document.getElementById('cardEmail').value,
        phone: document.getElementById('cardPhone').value,
        website: document.getElementById('cardWebsite').value,
        socialLinks: {
            linkedin: document.getElementById('cardLinkedin').value,
            github: document.getElementById('cardGithub').value,
            twitter: document.getElementById('cardTwitter').value
        }
    }));

    const imageFile = document.getElementById('cardImage').files[0];
    if (imageFile) {
        formData.append('profilePicture', imageFile);
    }

    try {
        const response = await fetch('/api/admin/cards', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to create card');
        }

        showNotification('Card created successfully', 'success');
        closeAddCardModal();
        loadCards();
    } catch (error) {
        console.error('Error creating card:', error);
        showNotification('Error creating card', 'error');
    }
}

// Show edit card modal
function showEditCardModal(cardId) {
    const card = cards.find(c => c.cardId === cardId);
    if (!card) return;

    document.getElementById('editCardId').value = card.cardId;
    document.getElementById('editCardName').value = card.content.name;
    document.getElementById('editCardTitle').value = card.content.title;
    document.getElementById('editCardCompany').value = card.content.company;
    document.getElementById('editCardEmail').value = card.content.email;
    document.getElementById('editCardPhone').value = card.content.phone;
    document.getElementById('editCardWebsite').value = card.content.website || '';
    document.getElementById('editCardLinkedin').value = card.content.socialLinks?.linkedin || '';
    document.getElementById('editCardGithub').value = card.content.socialLinks?.github || '';
    document.getElementById('editCardTwitter').value = card.content.socialLinks?.twitter || '';

    document.getElementById('editCardModal').style.display = 'flex';
}

// Update card
async function updateCard(event) {
    event.preventDefault();
    
    const cardId = document.getElementById('editCardId').value;
    const formData = new FormData();
    formData.append('content', JSON.stringify({
        name: document.getElementById('editCardName').value,
        title: document.getElementById('editCardTitle').value,
        company: document.getElementById('editCardCompany').value,
        email: document.getElementById('editCardEmail').value,
        phone: document.getElementById('editCardPhone').value,
        website: document.getElementById('editCardWebsite').value,
        socialLinks: {
            linkedin: document.getElementById('editCardLinkedin').value,
            github: document.getElementById('editCardGithub').value,
            twitter: document.getElementById('editCardTwitter').value
        }
    }));

    const imageFile = document.getElementById('editCardImage').files[0];
    if (imageFile) {
        formData.append('profilePicture', imageFile);
    }

    try {
        const response = await fetch(`/api/admin/cards/${cardId}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update card');
        }

        showNotification('Card updated successfully', 'success');
        closeEditCardModal();
        loadCards();
    } catch (error) {
        console.error('Error updating card:', error);
        showNotification('Error updating card', 'error');
    }
}

// Delete card
async function deleteCard(cardId) {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
        const response = await fetch(`/api/admin/cards/${cardId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete card');
        }

        showNotification('Card deleted successfully', 'success');
        loadCards();
    } catch (error) {
        console.error('Error deleting card:', error);
        showNotification('Error deleting card', 'error');
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch('/api/admin/analytics/summary');
        if (!response.ok) {
            throw new Error('Failed to load analytics');
        }
        analytics = await response.json();
        initializeAnalyticsCharts();
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Error loading analytics', 'error');
    }
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
    // Taps over time chart
    const tapsCtx = document.getElementById('tapsChart').getContext('2d');
    new Chart(tapsCtx, {
        type: 'line',
        data: {
            labels: analytics.timeLabels || [],
            datasets: [{
                label: 'Card Taps',
                data: analytics.tapsData || [],
                borderColor: '#1976d2',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Initialize map
    initializeMap();
}

// Initialize map
function initializeMap() {
    // Implementation depends on the map library you're using
    // Example with Google Maps:
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: { lat: 0, lng: 0 }
    });

    // Add markers for each location
    analytics.locations?.forEach(location => {
        new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map: map,
            title: location.name
        });
    });
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        users = await response.json();
        renderUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

// Render users
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${new Date(user.lastLogin).toLocaleString()}</td>
            <td>
                <button class="btn btn-secondary" onclick="editUser('${user._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteUser('${user._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Load settings
async function loadSettings() {
    try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        const settings = await response.json();
        
        document.getElementById('siteName').value = settings.siteName;
        document.getElementById('defaultTheme').value = settings.defaultTheme;
        document.getElementById('apiKey').value = settings.apiKey;
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Error loading settings', 'error');
    }
}

// Save settings
async function saveSettings(event) {
    event.preventDefault();
    
    const settings = {
        siteName: document.getElementById('siteName').value,
        defaultTheme: document.getElementById('defaultTheme').value
    };

    try {
        const response = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });

        if (!response.ok) {
            throw new Error('Failed to save settings');
        }

        showNotification('Settings saved successfully', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings', 'error');
    }
}

// Regenerate API key
async function regenerateApiKey() {
    if (!confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) return;

    try {
        const response = await fetch('/api/admin/settings/api-key', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to regenerate API key');
        }

        const { apiKey } = await response.json();
        document.getElementById('apiKey').value = apiKey;
        showNotification('API key regenerated successfully', 'success');
    } catch (error) {
        console.error('Error regenerating API key:', error);
        showNotification('Error regenerating API key', 'error');
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

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    document.getElementById('addCardForm').addEventListener('submit', addCard);
    document.getElementById('editCardForm').addEventListener('submit', updateCard);
    document.getElementById('generalSettingsForm').addEventListener('submit', saveSettings);

    // Search and filter
    document.getElementById('cardSearch').addEventListener('input', filterCards);
    document.getElementById('cardFilter').addEventListener('change', filterCards);
    document.getElementById('timeRange').addEventListener('change', loadAnalytics);

    // Image upload preview
    document.getElementById('cardImage').addEventListener('change', handleImagePreview);
    document.getElementById('editCardImage').addEventListener('change', handleImagePreview);
}

// Handle image preview
function handleImagePreview(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = event.target.id === 'cardImage' ? 
                document.getElementById('imagePreview') : 
                document.getElementById('editImagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Filter cards
function filterCards() {
    const searchTerm = document.getElementById('cardSearch').value.toLowerCase();
    const statusFilter = document.getElementById('cardFilter').value;

    const filteredCards = cards.filter(card => {
        const matchesSearch = 
            card.content.name.toLowerCase().includes(searchTerm) ||
            card.content.title.toLowerCase().includes(searchTerm) ||
            card.content.company.toLowerCase().includes(searchTerm) ||
            card.content.email.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || card.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    renderFilteredCards(filteredCards);
}

// Render filtered cards
function renderFilteredCards(filteredCards) {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';

    filteredCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        cardElement.innerHTML = `
            <div class="card-header">
                <h3>${card.content.name}</h3>
                <span class="status-badge ${card.status}">${card.status}</span>
            </div>
            <div class="card-body">
                <p><strong>Title:</strong> ${card.content.title}</p>
                <p><strong>Company:</strong> ${card.content.company}</p>
                <p><strong>Email:</strong> ${card.content.email}</p>
                <p><strong>Phone:</strong> ${card.content.phone}</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-secondary" onclick="showCardAnalytics('${card.cardId}')">
                    <i class="fas fa-chart-bar"></i>
                </button>
                <button class="btn btn-primary" onclick="showEditCardModal('${card.cardId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteCard('${card.cardId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cardsGrid.appendChild(cardElement);
    });
}

// Logout
function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '/login.html';
        })
        .catch(error => {
            console.error('Logout failed:', error);
            showNotification('Error logging out', 'error');
        });
} 