// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Modal Functions
function showSignupModal() {
    document.getElementById('signupModal').classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeSignupModal() {
    document.getElementById('signupModal').classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function showHelpModal() {
    document.getElementById('helpModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeHelpModal() {
    document.getElementById('helpModal').classList.remove('show');
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
const API_BASE = 'https://onetapp-backend.onrender.com';

document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const firstName = document.getElementById('signupFirstName').value;
    const lastName = document.getElementById('signupLastName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
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
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                phone,
                password
            })
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }

        if (response.ok) {
            alert('Account created successfully!');
            // Automatically log in the user
            try {
                const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                let loginData;
                const loginContentType = loginResponse.headers.get('content-type');
                if (loginContentType && loginContentType.includes('application/json')) {
                    loginData = await loginResponse.json();
                } else {
                    loginData = { message: await loginResponse.text() };
                }
                if (loginResponse.ok) {
                    localStorage.setItem('token', loginData.token);
                    localStorage.setItem('user', JSON.stringify(loginData.user));
                    window.location.href = 'pages/dashboard.html';
                } else {
                    alert(loginData.message || 'Login after signup failed. Please log in manually.');
                }
            } catch (loginError) {
                alert('An error occurred during automatic login. Please log in manually.');
            }
        } else {
            alert(data.message || 'Error creating account');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        // Reset button state
        const submitButton = this.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
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
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: data._id,
                username: data.username,
                email: data.email,
                role: data.role
            }));
            if (data.role === 'admin') {
                window.location.href = 'pages/admin-dashboard.html';
            } else {
                window.location.href = 'pages/dashboard.html';
            }
        } else {
            // Stay on index and show error popup
            const loginError = document.getElementById('loginError');
            if (loginError) {
                loginError.textContent = data.message || 'Invalid credentials';
                loginError.style.display = 'block';
                setTimeout(() => {
                    loginError.style.display = 'none';
                }, 4000);
            } else {
                alert(data.message || 'Invalid credentials');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Pricing Toggle Functionality for Three Plans (Starter, Pro, Power)
document.addEventListener('DOMContentLoaded', function() {
    const monthlyBtn = document.getElementById('monthlyBtn');
    const yearlyBtn = document.getElementById('yearlyBtn');
    const starterPrice = document.getElementById('starterPrice');
    const proPrice = document.getElementById('proPrice');
    const powerPrice = document.getElementById('powerPrice');

    function setMonthly() {
        if (monthlyBtn && yearlyBtn && starterPrice && proPrice && powerPrice) {
            monthlyBtn.classList.add('btn-primary');
            monthlyBtn.classList.remove('btn-outline');
            yearlyBtn.classList.remove('btn-primary');
            yearlyBtn.classList.add('btn-outline');
            starterPrice.textContent = '₱99/mo';
            proPrice.textContent = '₱299/mo';
            powerPrice.textContent = '₱899/mo';
        }
    }

    function setYearly() {
        if (monthlyBtn && yearlyBtn && starterPrice && proPrice && powerPrice) {
            yearlyBtn.classList.add('btn-primary');
            yearlyBtn.classList.remove('btn-outline');
            monthlyBtn.classList.remove('btn-primary');
            monthlyBtn.classList.add('btn-outline');
            starterPrice.textContent = '₱999/yr';
            proPrice.textContent = '₱2,999/yr';
            powerPrice.textContent = '₱8,999/yr';
        }
    }

    if (monthlyBtn && yearlyBtn && starterPrice && proPrice && powerPrice) {
        setMonthly(); // Default to monthly
        monthlyBtn.addEventListener('click', setMonthly);
        yearlyBtn.addEventListener('click', setYearly);
    }
});

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Subscription Modal Logic
function openSubscribeModal(planName) {
    document.getElementById('subscribePlanName').textContent = planName;
    document.getElementById('subscribeModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSubscribeModal() {
    document.getElementById('subscribeModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Payment Modal Functions
function getCurrentBillingPeriod() {
    const monthlyBtn = document.getElementById('monthlyBtn');
    if (monthlyBtn && monthlyBtn.classList.contains('btn-primary')) {
        return 'monthly';
    }
    return 'yearly';
}

function openPaymentModal(planName) {
    document.getElementById('paymentModal').classList.add('show');
    document.getElementById('paymentPlanName').textContent = planName;
    document.getElementById('paymentPlan').value = planName;
    document.getElementById('paymentBillingPeriod').value = getCurrentBillingPeriod();
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Payment Form Submission
const paymentForm = document.getElementById('paymentForm');
if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('paymentEmail').value;
        const phone = document.getElementById('paymentPhone').value;
        const plan = document.getElementById('paymentPlan').value;
        const billingPeriod = document.getElementById('paymentBillingPeriod').value;
        try {
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = 'Processing...';
            submitButton.disabled = true;

            const response = await fetch('https://onetapp-backend.onrender.com/maya-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, plan, billingPeriod })
            });
            const data = await response.json();
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                alert('Payment initiation failed');
            }
        } catch (err) {
            alert('An error occurred. Please try again.');
        } finally {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.innerHTML = 'Proceed to Checkout';
                submitButton.disabled = false;
            }
            closePaymentModal();
        }
    });
} 