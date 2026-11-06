async function initConnections() {
    recheckAuthOnHistoryRestore();
    const viewer = await requireUser();
    if (!viewer) return;
    mountNavigation(viewer);
    const params = new URLSearchParams(location.search);
    const username = params.get('u') || '';
    const tab = params.get('tab') === 'following' ? 'following' : 'followers';
    const title = document.getElementById('connections-title');
    const tabs = document.getElementById('connection-tabs');
    const status = document.getElementById('connections-status');
    const list = document.getElementById('connection-list');
    const empty = document.getElementById('connections-empty');
    const more = document.getElementById('connections-more');
    if (!username) {
        status.classList.remove('loading-status');
        status.textContent = 'A username is required.';
        return;
    }
    title.textContent = `@${username}`;
    for (const [key, label] of [['followers', 'Followers'], ['following', 'Following']]) {
        const link = document.createElement('a');
        link.href = `/connections.html?u=${encodeURIComponent(username)}&tab=${key}`;
        link.textContent = label;
        if (tab === key) link.setAttribute('aria-current', 'page');
        tabs.appendChild(link);
    }

    const loader = createCursorLoader(more, (cursor) => {
        const query = new URLSearchParams({ username });
        if (cursor) query.set('cursor', String(cursor));
        return apiRequest(`/api/users/${tab}?${query}`);
    }, (users) => {
        for (const user of users) {
            const card = createUserCard(user, viewer.id, (result, element) => {
                if (tab === 'following' && username === viewer.username && !result.is_following) {
                    element.remove();
                    empty.hidden = list.children.length > 0 || !more.hidden;
                }
            });
            list.appendChild(card);
        }
        if (list.children.length) {
            empty.hidden = true;
            status.textContent = '';
        } else {
            empty.hidden = false;
            status.textContent = '';
        }
        status.classList.remove('loading-status');
    }, 'users', (error) => {
        status.classList.remove('loading-status');
        status.textContent = error.message;
    });
    status.textContent = 'Loading…';
    await loader.loadNext();
}

initConnections();
