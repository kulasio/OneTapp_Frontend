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
});

// Signup Modal Logic
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        let messageDiv = document.getElementById('signupMessage');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'signupMessage';
            signupForm.appendChild(messageDiv);
        }
        messageDiv.textContent = '';
        messageDiv.className = '';
        // Basic validation
        if (!name || !email || !password) {
            messageDiv.className = 'error';
            messageDiv.textContent = 'All fields are required.';
            return;
        }
        // Show loading
        messageDiv.className = '';
        messageDiv.textContent = 'Creating account...';
        try {
            const response = await fetch('https://onetapp-backend.onrender.com/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                messageDiv.className = 'success';
                messageDiv.textContent = 'Account created successfully! You can now log in.';
                signupForm.reset();
                setTimeout(() => {
                    document.getElementById('signupModal').style.display = 'none';
                }, 1500);
            } else {
                messageDiv.className = 'error';
                messageDiv.textContent = data.message || 'Signup failed.';
            }
        } catch (error) {
            messageDiv.className = 'error';
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });
} 