// Toggle between login and signup forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

// Handle login form submission
const loginForm = document.getElementById('login');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.textContent = '';
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                messageDiv.className = 'success';
                messageDiv.textContent = 'Login successful!';
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to dashboard or home page
                // window.location.href = '/dashboard.html';
            } else {
                messageDiv.className = 'error';
                messageDiv.textContent = data.message || 'Login failed';
            }
        } catch (error) {
            messageDiv.className = 'error';
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });
}

// Handle signup form submission
const signupForm = document.getElementById('signup');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const messageDiv = document.getElementById('signupMessage');
        messageDiv.textContent = '';
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                messageDiv.className = 'success';
                messageDiv.textContent = 'Signup successful!';
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to dashboard or home page
                // window.location.href = '/dashboard.html';
            } else {
                messageDiv.className = 'error';
                messageDiv.textContent = data.message || 'Signup failed';
            }
        } catch (error) {
            messageDiv.className = 'error';
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });
} 