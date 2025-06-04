// Pricing Toggle Functionality for Three Plans (Starter, Pro, Power)

document.addEventListener('DOMContentLoaded', function() {
    const monthlyBtn = document.getElementById('monthlyBtn');
    const yearlyBtn = document.getElementById('yearlyBtn');
    const starterPrice = document.getElementById('starterPrice');
    const proPrice = document.getElementById('proPrice');
    const powerPrice = document.getElementById('powerPrice');

    function setMonthly() {
        monthlyBtn.classList.add('btn-primary');
        monthlyBtn.classList.remove('btn-outline');
        yearlyBtn.classList.remove('btn-primary');
        yearlyBtn.classList.add('btn-outline');
        starterPrice.textContent = '₱99/mo';
        proPrice.textContent = '₱299/mo';
        powerPrice.textContent = '₱899/mo';
    }

    function setYearly() {
        yearlyBtn.classList.add('btn-primary');
        yearlyBtn.classList.remove('btn-outline');
        monthlyBtn.classList.remove('btn-primary');
        monthlyBtn.classList.add('btn-outline');
        starterPrice.textContent = '₱999/yr';
        proPrice.textContent = '₱2,999/yr';
        powerPrice.textContent = '₱8,999/yr';
    }

    if (monthlyBtn && yearlyBtn && starterPrice && proPrice && powerPrice) {
        setMonthly(); // Default to monthly
        monthlyBtn.addEventListener('click', setMonthly);
        yearlyBtn.addEventListener('click', setYearly);
    }

    // Signup Modal Functionality
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('signupConfirmPassword');
    const strengthLevel = document.querySelector('.strength-level');
    const strengthText = document.querySelector('.strength-text');

    if (signupForm) {
        // Password strength checker
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            let feedback = '';

            // Length check
            if (password.length >= 8) strength += 25;
            // Uppercase check
            if (/[A-Z]/.test(password)) strength += 25;
            // Lowercase check
            if (/[a-z]/.test(password)) strength += 25;
            // Number/Special character check
            if (/[0-9!@#$%^&*]/.test(password)) strength += 25;

            // Update strength bar
            strengthLevel.style.width = strength + '%';

            // Update strength text and color
            if (strength <= 25) {
                strengthLevel.style.backgroundColor = '#ff4444';
                feedback = 'Weak';
            } else if (strength <= 50) {
                strengthLevel.style.backgroundColor = '#ffbb33';
                feedback = 'Fair';
            } else if (strength <= 75) {
                strengthLevel.style.backgroundColor = '#00C851';
                feedback = 'Good';
            } else {
                strengthLevel.style.backgroundColor = '#007E33';
                feedback = 'Strong';
            }

            strengthText.textContent = feedback;
        });

        // Password confirmation check
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });

        // Form submission
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Basic validation
            if (!this.checkValidity()) {
                return;
            }

            const formData = {
                firstName: document.getElementById('signupFirstName').value.trim(),
                lastName: document.getElementById('signupLastName').value.trim(),
                email: document.getElementById('signupEmail').value.trim(),
                phone: document.getElementById('signupPhone').value.trim(),
                password: passwordInput.value
            };

            try {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating Account...';

                // API call would go here
                // const response = await fetch('your-api-endpoint', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(formData)
                // });

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Success handling
                closeSignupModal();
                // Show success message or redirect
                
            } catch (error) {
                console.error('Signup error:', error);
                // Show error message
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// Modal Functions
function showSignupModal() {
    document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function togglePassword(inputId, toggleBtn) {
    const input = document.getElementById(inputId);
    const icon = toggleBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const signupModal = document.getElementById('signupModal');
    if (event.target === signupModal) {
        closeSignupModal();
    }
}