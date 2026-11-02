async function initSearch() {
    recheckAuthOnHistoryRestore();
    const viewer = await requireUser();
    if (!viewer) return;
    mountNavigation(viewer, 'search');
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-query');
    const status = document.getElementById('search-status');
    const results = document.getElementById('search-results');
    const submit = form.querySelector('button[type="submit"]');
    let timer;
    let requestNumber = 0;

    async function search() {
        const query = input.value.trim();
        const currentRequest = ++requestNumber;
        results.replaceChildren();
        if (!query) {
            status.classList.remove('loading-status');
            status.textContent = 'Search for a username or display name.';
            submit.disabled = false;
            return;
        }
        status.textContent = 'Searching…';
        status.classList.add('loading-status');
        submit.disabled = true;
        try {
            const result = await apiRequest(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (currentRequest !== requestNumber) return;
            status.classList.remove('loading-status');
            status.textContent = result.users.length ? '' : 'No users found.';
            for (const user of result.users) results.appendChild(createUserCard(user, viewer.id));
        } catch (error) {
            if (currentRequest === requestNumber) {
                status.classList.remove('loading-status');
                status.textContent = error.message;
                handleProtectedError(error);
            }
        } finally {
            if (currentRequest === requestNumber) submit.disabled = false;
        }
    }

    input.addEventListener('input', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(search, 300);
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        window.clearTimeout(timer);
        search();
    });
}

initSearch();
