async function apiRequest(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(path, {
        ...options,
        headers,
        credentials: 'same-origin',
    });

    let envelope;
    try {
        envelope = await response.json();
    } catch {
        throw {
            status: response.status,
            code: 'INVALID_RESPONSE',
            message: 'The server returned an invalid response.',
            fields: {},
        };
    }

    if (!response.ok || envelope.success !== true) {
        const error = envelope.error || {};
        throw {
            status: response.status,
            code: error.code || 'REQUEST_FAILED',
            message: error.message || 'The request could not be completed.',
            fields: error.fields || {},
        };
    }

    return envelope.data || {};
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3500);
}

