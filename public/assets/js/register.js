(async function initRegister() {
    if (!await requireGuest()) return;

    const form = document.getElementById('register-form');
    const fields = ['display_name', 'username', 'email', 'password', 'confirm_password'];

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFieldErrors(fields);

        const payload = {
            display_name: document.getElementById('display_name').value.trim(),
            username: document.getElementById('username').value.trim().toLowerCase(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            password: document.getElementById('password').value,
        };
        const errors = {};
        const confirmPassword = document.getElementById('confirm_password').value;

        if (!payload.display_name || payload.display_name.length > 50) {
            errors.display_name = 'Display name must be 1–50 characters.';
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(payload.username)) {
            errors.username = 'Username must be 3–20 letters, numbers, or underscores.';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 255) {
            errors.email = 'Enter a valid email address.';
        }
        if (payload.password.length < 8 || payload.password.length > 72
            || !/[A-Za-z]/.test(payload.password) || !/[0-9]/.test(payload.password)) {
            errors.password = 'Password must be 8–72 characters and include a letter and a number.';
        }
        if (confirmPassword !== payload.password) {
            errors.confirm_password = 'Passwords do not match.';
        }
        if (Object.keys(errors).length) {
            showFieldErrors(errors);
            return;
        }

        const button = document.getElementById('register-btn');
        button.disabled = true;
        button.textContent = 'Creating account…';
        try {
            await apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            window.location.replace('/login.html?registered=1');
        } catch (error) {
            if (error.fields && Object.keys(error.fields).length) {
                showFieldErrors(error.fields);
            } else {
                showToast(error.message, 'error');
            }
        } finally {
            button.disabled = false;
            button.textContent = 'Create account';
        }
    });
})();
