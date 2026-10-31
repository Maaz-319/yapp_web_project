(async function initLogin() {
    if (!await requireGuest()) return;

    const form = document.getElementById('login-form');
    const fields = ['identifier', 'password'];
    const registered = new URLSearchParams(window.location.search).get('registered');
    if (registered === '1') showToast('Account created. You can log in now.', 'success');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFieldErrors(fields);

        const payload = {
            identifier: document.getElementById('identifier').value.trim(),
            password: document.getElementById('password').value,
            remember_me: document.getElementById('remember-me').checked,
        };
        const errors = {};
        if (!payload.identifier) errors.identifier = 'Username or email is required.';
        if (!payload.password) errors.password = 'Password is required.';
        if (Object.keys(errors).length) {
            showFieldErrors(errors);
            return;
        }

        const button = document.getElementById('login-btn');
        button.disabled = true;
        button.textContent = 'Logging in…';
        try {
            await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            window.location.replace('/');
        } catch (error) {
            document.getElementById('password').value = '';
            if (error.fields && Object.keys(error.fields).length) {
                showFieldErrors(error.fields);
            } else {
                showToast(error.message, 'error');
            }
        } finally {
            button.disabled = false;
            button.textContent = 'Log in';
        }
    });
})();
