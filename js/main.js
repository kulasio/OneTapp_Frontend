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
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const signupModal = document.getElementById('signupModal');
    if (event.target === signupModal) {
        closeSignupModal();
    }
}