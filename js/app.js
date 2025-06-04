// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Modal Functions
function showSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : 'auto';
}

// Back to Top Button
const backToTopButton = document.getElementById('backToTop');

window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
};

backToTopButton.onclick = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Cookie Consent
function acceptCookies() {
    const cookieConsent = document.getElementById('cookieConsent');
    cookieConsent.style.display = 'none';
    localStorage.setItem('cookieConsent', 'accepted');
}

// Check if cookie consent was already accepted
if (localStorage.getItem('cookieConsent') === 'accepted') {
    document.getElementById('cookieConsent').style.display = 'none';
}

// Form Submissions
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Validate password strength
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = 'Creating Account...';
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `${firstName} ${lastName}`,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Success
            alert('Account created successfully!');
            // closeSignupModal(); // Don't close the modal automatically
            showLoginModal();
        } else {
            // Error
            alert(data.message || 'Error creating account');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
});

// Password strength indicator
document.getElementById('signupPassword').addEventListener('input', function(e) {
    const password = e.target.value;
    const strengthBar = document.querySelector('.strength-level');
    const strengthText = document.querySelector('.strength-text');
    
    // Calculate password strength
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]+/)) strength += 1;

    // Update strength bar
    const strengthPercentage = (strength / 5) * 100;
    strengthBar.style.width = `${strengthPercentage}%`;

    // Update strength text and color
    let strengthMessage = '';
    let strengthColor = '';
    switch(strength) {
        case 0:
        case 1:
            strengthMessage = 'Very Weak';
            strengthColor = '#ff4444';
            break;
        case 2:
            strengthMessage = 'Weak';
            strengthColor = '#ffbb33';
            break;
        case 3:
            strengthMessage = 'Medium';
            strengthColor = '#ffeb3b';
            break;
        case 4:
            strengthMessage = 'Strong';
            strengthColor = '#00C851';
            break;
        case 5:
            strengthMessage = 'Very Strong';
            strengthColor = '#007E33';
            break;
    }
    
    strengthBar.style.backgroundColor = strengthColor;
    strengthText.textContent = strengthMessage;
    strengthText.style.color = strengthColor;
});

// Toggle password visibility
function togglePassword(inputId, toggleButton) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    toggleButton.classList.toggle('fa-eye');
    toggleButton.classList.toggle('fa-eye-slash');
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Success
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard.html'; // Redirect to dashboard
        } else {
            // Error
            alert(data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Pricing Toggle
const monthlyBtn = document.getElementById('monthlyBtn');
const yearlyBtn = document.getElementById('yearlyBtn');
const starterPrice = document.getElementById('starterPrice');
const proPrice = document.getElementById('proPrice');
const enterprisePrice = document.getElementById('enterprisePrice');

const prices = {
    monthly: {
        starter: '₱99/mo',
        pro: '₱199/mo',
        enterprise: '₱499/mo'
    },
    yearly: {
        starter: '₱990/yr',
        pro: '₱1,990/yr',
        enterprise: '₱4,990/yr'
    }
};

monthlyBtn.addEventListener('click', function() {
    monthlyBtn.classList.add('active');
    yearlyBtn.classList.remove('active');
    starterPrice.textContent = prices.monthly.starter;
    proPrice.textContent = prices.monthly.pro;
    enterprisePrice.textContent = prices.monthly.enterprise;
});

yearlyBtn.addEventListener('click', function() {
    yearlyBtn.classList.add('active');
    monthlyBtn.classList.remove('active');
    starterPrice.textContent = prices.yearly.starter;
    proPrice.textContent = prices.yearly.pro;
    enterprisePrice.textContent = prices.yearly.enterprise;
});

// Set initial pricing to monthly
monthlyBtn.click();

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}); 