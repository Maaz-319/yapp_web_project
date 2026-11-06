async function initProfile() {
    recheckAuthOnHistoryRestore();
    const viewer = await requireUser();
    if (!viewer) return;
    mountNavigation(viewer, 'profile');
    const username = new URLSearchParams(location.search).get('u') || viewer.username;
    const status = document.getElementById('profile-status');
    const content = document.getElementById('profile-content');
    const list = document.getElementById('profile-tweets');
    const empty = document.getElementById('profile-empty');
    let profile;

    try {
        const result = await apiRequest(`/api/users?username=${encodeURIComponent(username)}`);
        profile = result.profile;
    } catch (error) {
        status.textContent = error.status === 404 ? 'User not found.' : error.message;
        status.classList.remove('loading-status');
        document.getElementById('profile-tweets-section').hidden = true;
        if (error.status === 404) document.title = 'Profile not found - Yapp';
        if (error.status !== 404) handleProtectedError(error);
        return;
    }
    document.title = `${profile.display_name} (@${profile.username}) - Yapp`;
    document.querySelector('.page-heading h1').textContent = profile.display_name;
    status.hidden = true;
    content.hidden = false;
    const heading = document.createElement('h1');
    heading.textContent = profile.display_name;
    const handle = document.createElement('p');
    handle.className = 'muted';
    handle.textContent = `@${profile.username}`;
    const bio = document.createElement('p');
    bio.className = 'profile-bio';
    bio.textContent = profile.bio || '';
    const joined = document.createElement('p');
    joined.className = 'muted';
    joined.textContent = `Joined ${new Date(`${String(profile.created_at).replace(' ', 'T')}Z`).toLocaleDateString()}`;
    const meta = document.createElement('div');
    meta.className = 'profile-meta';
    const following = document.createElement('a');
    following.href = `/connections.html?u=${encodeURIComponent(profile.username)}&tab=following`;
    following.id = 'following-count';
    const followers = document.createElement('a');
    followers.href = `/connections.html?u=${encodeURIComponent(profile.username)}&tab=followers`;
    followers.id = 'follower-count';
    const tweets = document.createElement('span');
    following.textContent = `${profile.following_count} Following`;
    followers.textContent = `${profile.follower_count} Followers`;
    tweets.textContent = `${profile.tweet_count} Posts`;
    meta.append(following, followers, tweets);
    content.append(heading, handle, bio, joined, meta);

    if (profile.is_me) {
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'btn btn-secondary';
        edit.textContent = 'Edit profile';
        edit.addEventListener('click', openEditor);
        content.appendChild(edit);
    } else {
        const follow = document.createElement('button');
        follow.type = 'button';
        follow.className = profile.is_following ? 'btn btn-secondary' : 'btn btn-primary';
        follow.textContent = profile.is_following ? 'Following' : 'Follow';
        follow.addEventListener('click', async () => {
            follow.disabled = true;
            try {
                const method = profile.is_following ? 'DELETE' : 'POST';
                const result = await apiRequest(`/api/users/follow?username=${encodeURIComponent(profile.username)}`, { method });
                profile.is_following = result.is_following;
                profile.follower_count = result.follower_count;
                followers.textContent = `${profile.follower_count} Followers`;
                follow.textContent = profile.is_following ? 'Following' : 'Follow';
                follow.className = profile.is_following ? 'btn btn-secondary' : 'btn btn-primary';
            } catch (error) {
                handleProtectedError(error);
            } finally {
                follow.disabled = false;
            }
        });
        content.appendChild(follow);
    }

    const more = document.getElementById('tweets-more');
    const loader = createCursorLoader(more, async (cursor) => {
        const query = new URLSearchParams({ username: profile.username });
        if (cursor) query.set('cursor', cursor);
        return apiRequest(`/api/users/tweets?${query}`);
    }, (items) => {
        for (const tweet of items) list.appendChild(createTweetCard(tweet, onTweetDeleted));
        if (list.children.length > 0) empty.hidden = true;
        document.getElementById('profile-tweets-status').hidden = true;
    }, 'tweets', (error) => {
        const tweetStatus = document.getElementById('profile-tweets-status');
        tweetStatus.classList.remove('loading-status');
        tweetStatus.textContent = error.message;
    });
    try {
        const firstPage = await apiRequest(`/api/users/tweets?username=${encodeURIComponent(profile.username)}`);
        for (const tweet of firstPage.tweets) list.appendChild(createTweetCard(tweet, onTweetDeleted));
        document.getElementById('profile-tweets-status').hidden = true;
        empty.hidden = firstPage.tweets.length > 0;
        loader.setCursor(firstPage.next_cursor);
    } catch (error) {
        const tweetStatus = document.getElementById('profile-tweets-status');
        tweetStatus.classList.remove('loading-status');
        tweetStatus.textContent = error.message;
        handleProtectedError(error);
    }

    function onTweetDeleted() {
        profile.tweet_count = Math.max(0, profile.tweet_count - 1);
        tweets.textContent = `${profile.tweet_count} Posts`;
        empty.hidden = list.children.length > 0 || !more.hidden;
    }

    function openEditor() {
        const dialog = document.getElementById('edit-dialog');
        const nameInput = document.getElementById('display_name');
        const bioInput = document.getElementById('bio');
        const nameCount = document.getElementById('name-count');
        const bioCount = document.getElementById('bio-count');
        const save = document.getElementById('edit-save');
        const updateCounts = () => {
            const nameLength = Array.from(nameInput.value.trim()).length;
            const bioLength = Array.from(bioInput.value).length;
            nameCount.textContent = `${nameLength}/50`;
            bioCount.textContent = `${bioLength}/160`;
            save.disabled = nameLength < 1 || nameLength > 50 || bioLength > 160;
        };
        nameInput.value = profile.display_name;
        bioInput.value = profile.bio || '';
        updateCounts();
        nameInput.oninput = updateCounts;
        bioInput.oninput = updateCounts;
        dialog.showModal();
    }

    document.getElementById('edit-cancel').addEventListener('click', () => document.getElementById('edit-dialog').close());
    document.getElementById('edit-profile-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const save = document.getElementById('edit-save');
        if (save.disabled) return;
        save.disabled = true;
        try {
            const result = await apiRequest('/api/users/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    display_name: document.getElementById('display_name').value,
                    bio: document.getElementById('bio').value,
                }),
            });
            profile = { ...profile, ...result.profile };
            heading.textContent = profile.display_name;
            bio.textContent = profile.bio || '';
            document.getElementById('edit-dialog').close();
            showToast('Profile updated.', 'success');
        } catch (error) {
            handleProtectedError(error);
        } finally {
            const nameLength = Array.from(document.getElementById('display_name').value.trim()).length;
            const bioLength = Array.from(document.getElementById('bio').value).length;
            save.disabled = nameLength < 1 || nameLength > 50 || bioLength > 160;
        }
    });
}

initProfile();
