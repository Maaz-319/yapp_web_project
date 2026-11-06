function createUserCard(user, currentUserId, onFollowChange) {
    const card = document.createElement('article');
    card.className = 'user-card';
    const details = document.createElement('div');
    details.className = 'user-card-details';
    const name = document.createElement('a');
    name.className = 'user-card-name';
    name.href = `/profile.html?u=${encodeURIComponent(user.username)}`;
    name.textContent = user.display_name;
    const username = document.createElement('div');
    username.className = 'muted';
    username.textContent = `@${user.username}`;
    const bio = document.createElement('p');
    bio.textContent = user.bio || '';
    details.append(name, username, bio);
    card.appendChild(details);

    if (Number(user.id) !== Number(currentUserId)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = user.is_following ? 'btn btn-secondary' : 'btn btn-primary';
        button.textContent = user.is_following ? 'Following' : 'Follow';
        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                const method = user.is_following ? 'DELETE' : 'POST';
                const result = await apiRequest(`/api/users/follow?username=${encodeURIComponent(user.username)}`, { method });
                user.is_following = result.is_following;
                button.textContent = user.is_following ? 'Following' : 'Follow';
                button.className = user.is_following ? 'btn btn-secondary' : 'btn btn-primary';
                if (onFollowChange) onFollowChange(result, card, user);
            } catch (error) {
                handleProtectedError(error);
            } finally {
                button.disabled = false;
            }
        });
        card.appendChild(button);
    }
    return card;
}

function formatRelativeTime(value) {
    const date = new Date(`${String(value).replace(' ', 'T')}Z`);
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function confirmPostDelete() {
    return new Promise((resolve) => {
        const dialog = document.createElement('dialog');
        const form = document.createElement('form');
        form.method = 'dialog';
        const title = document.createElement('h2');
        title.id = 'delete-post-title';
        title.textContent = 'Delete this post?';
        dialog.setAttribute('aria-labelledby', title.id);
        const description = document.createElement('p');
        description.textContent = 'This post will be removed from Yapp.';
        const actions = document.createElement('div');
        actions.className = 'modal-actions';
        const cancel = document.createElement('button');
        cancel.className = 'btn btn-secondary';
        cancel.value = 'cancel';
        cancel.textContent = 'Cancel';
        const remove = document.createElement('button');
        remove.className = 'btn btn-danger-solid';
        remove.value = 'delete';
        remove.textContent = 'Delete';
        actions.append(cancel, remove);
        form.append(title, description, actions);
        dialog.appendChild(form);
        document.body.appendChild(dialog);
        dialog.addEventListener('close', () => {
            resolve(dialog.returnValue === 'delete');
            dialog.remove();
        });
        dialog.showModal();
        cancel.focus();
    });
}

function createTweetCard(tweet, onDeleted = null) {
    let liked = Boolean(tweet.liked_by_me);
    let likeCount = Number(tweet.like_count) || 0;
    const card = document.createElement('article');
    card.className = 'tweet-card';
    const top = document.createElement('div');
    top.className = 'tweet-top';
    const author = document.createElement('a');
    author.href = `/profile.html?u=${encodeURIComponent(tweet.author.username)}`;
    author.className = 'tweet-author';
    const authorName = document.createElement('span');
    authorName.textContent = tweet.author.display_name;
    const authorHandle = document.createElement('span');
    authorHandle.className = 'tweet-handle';
    authorHandle.textContent = `@${tweet.author.username}`;
    author.append(authorName, authorHandle);
    const time = document.createElement('time');
    time.dateTime = `${String(tweet.created_at).replace(' ', 'T')}Z`;
    time.textContent = formatRelativeTime(tweet.created_at);
    top.append(author, time);
    card.appendChild(top);

    const content = document.createElement('p');
    content.className = 'tweet-content';
    content.textContent = tweet.content;
    card.appendChild(content);
    if (tweet.is_edited) {
        const edited = document.createElement('span');
        edited.className = 'muted edited-label';
        edited.textContent = 'Edited';
        card.appendChild(edited);
    }

    const likeActions = document.createElement('div');
    likeActions.className = 'tweet-actions tweet-like-actions';
    const like = document.createElement('button');
    like.type = 'button';
    like.className = 'tweet-like-button';
    like.setAttribute('aria-pressed', String(liked));
    const heart = document.createElement('span');
    heart.className = 'tweet-heart';
    heart.setAttribute('aria-hidden', 'true');
    const count = document.createElement('span');
    count.className = 'tweet-like-count';
    function renderLike() {
        heart.textContent = liked ? '♥' : '♡';
        like.setAttribute('aria-label', `${liked ? 'Unlike' : 'Like'} tweet; ${likeCount} likes`);
        like.setAttribute('aria-pressed', String(liked));
        count.textContent = String(likeCount);
    }
    renderLike();
    like.append(heart, count);
    like.addEventListener('click', async () => {
        const oldLiked = liked;
        const oldCount = likeCount;
        liked = !liked;
        likeCount = Math.max(0, likeCount + (liked ? 1 : -1));
        renderLike();
        like.disabled = true;
        try {
            const result = await apiRequest(`/api/tweets/like?id=${encodeURIComponent(tweet.id)}`, {
                method: liked ? 'POST' : 'DELETE',
            });
            liked = Boolean(result.liked_by_me);
            likeCount = Number(result.like_count) || 0;
            renderLike();
        } catch (error) {
            liked = oldLiked;
            likeCount = oldCount;
            renderLike();
            handleProtectedError(error);
        } finally {
            like.disabled = false;
        }
    });
    likeActions.appendChild(like);
    card.appendChild(likeActions);

    if (tweet.is_mine) {
        const actions = document.createElement('div');
        actions.className = 'tweet-actions tweet-owner-actions';
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'btn btn-secondary';
        edit.textContent = 'Edit';
        edit.addEventListener('click', () => beginEdit());
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn btn-secondary btn-danger';
        remove.textContent = 'Delete';
        remove.addEventListener('click', async () => {
            if (!await confirmPostDelete()) return;
            remove.disabled = true;
            try {
                await apiRequest(`/api/tweets.php?id=${tweet.id}`, { method: 'DELETE' });
                card.remove();
                if (onDeleted) onDeleted();
            } catch (error) {
                handleProtectedError(error);
                remove.disabled = false;
            }
        });
        actions.append(edit, remove);
        card.appendChild(actions);
    }

    function beginEdit() {
        const editor = document.createElement('textarea');
        editor.id = `tweet-edit-${tweet.id}`;
        editor.value = tweet.content;
        const editorLabel = document.createElement('label');
        editorLabel.className = 'visually-hidden';
        editorLabel.htmlFor = editor.id;
        editorLabel.textContent = 'Edit post content';
        const count = document.createElement('span');
        count.className = 'muted';
        const save = document.createElement('button');
        save.type = 'button';
        save.className = 'btn btn-primary';
        save.textContent = 'Save';
        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'btn btn-secondary';
        cancel.textContent = 'Cancel';
        const form = document.createElement('div');
        form.className = 'tweet-editor';
        form.append(editorLabel, editor, count, save, cancel);
        content.replaceWith(form);
        card.querySelector('.tweet-owner-actions').hidden = true;
        const update = () => {
            const length = Array.from(editor.value.trim()).length;
            count.textContent = `${length}/280`;
            save.disabled = !length || editor.value.trim() === tweet.content || length > 280;
        };
        editor.addEventListener('input', update);
        update();
        cancel.addEventListener('click', () => card.replaceWith(createTweetCard(tweet, onDeleted)));
        save.addEventListener('click', async () => {
            save.disabled = true;
            try {
                const result = await apiRequest(`/api/tweets.php?id=${tweet.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ content: editor.value }),
                });
                card.replaceWith(createTweetCard(result.tweet, onDeleted));
            } catch (error) {
                handleProtectedError(error);
                update();
            }
        });
    }

    return card;
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
    const mark = document.createElement('span');
    mark.className = 'nav-logo-mark';
    mark.textContent = 'Y';
    const logoText = document.createElement('span');
    logoText.className = 'nav-logo-text';
    logoText.textContent = 'Yapp';
    logo.append(mark, logoText);
    const actions = document.createElement('div');
    actions.className = 'nav-actions';
    const links = [
        ['Home', '/', 'home'],
        ['Search', '/search.html', 'search'],
        ['My Profile', `/profile.html?u=${encodeURIComponent(user.username)}`, 'profile'],
    ];
    const icons = {
        home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
        search: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16m6 14 5 5',
        profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0',
        admin: 'M4 4h16v16H4zM4 10h16M10 10v10',
    };
    if (user.role === 'admin') links.push(['Admin', '/admin.html', 'admin']);
    for (const [label, href, key] of links) {
        const link = document.createElement('a');
        link.href = href;
        link.className = 'nav-link';
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('aria-hidden', 'true');
        icon.classList.add('nav-icon');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', icons[key]);
        icon.appendChild(path);
        const linkText = document.createElement('span');
        linkText.textContent = label;
        link.append(icon, linkText);
        if (active === key) link.setAttribute('aria-current', 'page');
        actions.appendChild(link);
    }
    const username = document.createElement('span');
    username.className = 'nav-user';
    username.textContent = `@${user.username}`;
    actions.appendChild(username);
    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = 'btn btn-secondary nav-logout';
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
