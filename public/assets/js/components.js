function formatRelativeTime(value) {
    const date = new Date(`${String(value).replace(' ', 'T')}Z`);
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function createCursorLoader(button, fetchPage, appendItems, itemKey = 'users', onError = null) {
    let cursor = null;
    let hasMore = true;
    let loading = false;
    button.hidden = true;
    button.addEventListener('click', () => loadNext());

    async function loadNext() {
        if (loading || !hasMore) return;
        loading = true;
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Loading…';
        try {
            const result = await fetchPage(cursor);
            appendItems(result[itemKey] || []);
            cursor = result.next_cursor;
            hasMore = cursor !== null && cursor !== undefined;
            button.hidden = !hasMore;
        } catch (error) {
            if (!handleProtectedError(error) && onError) onError(error);
            button.hidden = false;
        } finally {
            loading = false;
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    function setCursor(value) {
        cursor = value;
        hasMore = cursor !== null && cursor !== undefined;
        button.hidden = !hasMore;
    }

    return { loadNext, setCursor };
}

function mountNavigation(user, active = '') {
    const mount = document.getElementById('site-nav');
    if (!mount) return;
    const nav = document.createElement('nav');
    nav.className = 'nav';
    const logo = document.createElement('a');
    logo.href = '/';
    logo.className = 'nav-logo';
    logo.textContent = 'Yapp';
    const actions = document.createElement('div');
    actions.className = 'nav-actions';
    const links = [
        ['Home', '/', 'home'],
        ['Search', '/search.html', 'search'],
        ['My Profile', `/profile.html?u=${encodeURIComponent(user.username)}`, 'profile'],
    ];
    if (user.role === 'admin') links.push(['Admin', '/admin.html', 'admin']);
    for (const [label, href, key] of links) {
        const link = document.createElement('a');
        link.href = href;
        link.className = 'nav-link';
        link.textContent = label;
        if (active === key) link.setAttribute('aria-current', 'page');
        actions.appendChild(link);
    }
    const username = document.createElement('span');
    username.className = 'nav-user';
    username.textContent = `@${user.username}`;
    actions.appendChild(username);
    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = 'btn btn-secondary';
    logout.textContent = 'Log out';
    logout.addEventListener('click', async () => {
        logout.disabled = true;
        try {
            await apiRequest('/api/auth/logout', { method: 'POST', body: '{}' });
        } catch (error) {
            handleProtectedError(error);
        } finally {
            window.location.replace('/login.html');
        }
    });
    actions.appendChild(logout);
    nav.append(logo, actions);
    mount.replaceChildren(nav);
}
