document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('https://onetapp-backend.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.role !== 'admin') {
            throw new Error('You are not authorized to access this page.');
        }

        // Store the token and redirect
        localStorage.setItem('adminToken', data.token);
        window.location.href = './admin-dashboard.html';

    } catch (err) {
        errorMessage.textContent = err.message;
        errorMessage.style.display = 'block';
    }
}); 