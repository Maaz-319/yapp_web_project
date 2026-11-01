async function initHome() {
    recheckAuthOnHistoryRestore();
    const user = await requireUser();
    if (!user) return;

    mountNavigation(user, 'home');
    document.getElementById('greeting').textContent = `Welcome, ${user.display_name}`;
    const form = document.getElementById('tweet-form');
    const content = document.getElementById('tweet-content');
    const count = document.getElementById('tweet-count');
    const submit = document.getElementById('tweet-submit');
    const list = document.getElementById('home-tweets');
    const empty = document.getElementById('home-empty');
    const feedStatus = document.getElementById('home-feed-status');
    const more = document.getElementById('home-more');
    const loader = createCursorLoader(more, async (cursor) => {
        const path = cursor ? `/api/feed?cursor=${encodeURIComponent(cursor)}` : '/api/feed';
        return apiRequest(path);
    }, (tweets) => {
        for (const tweet of tweets) {
            list.appendChild(createTweetCard(tweet, onTweetDeleted));
        }
        if (tweets.length > 0) empty.hidden = true;
    }, 'tweets');
    const updateCount = () => {
        const length = Array.from(content.value.trim()).length;
        count.textContent = `${length}/280`;
        submit.disabled = length < 1 || length > 280;
    };
    content.addEventListener('input', updateCount);
    updateCount();
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (submit.disabled) return;
        submit.disabled = true;
        try {
            const result = await apiRequest('/api/tweets', {
                method: 'POST',
                body: JSON.stringify({ content: content.value }),
            });
            list.prepend(createTweetCard(result.tweet, onTweetDeleted));
            empty.hidden = true;
            content.value = '';
            updateCount();
        } catch (error) {
            handleProtectedError(error);
        } finally {
            updateCount();
        }
    });

    try {
        const result = await apiRequest('/api/feed');
        for (const tweet of result.tweets) list.appendChild(createTweetCard(tweet, onTweetDeleted));
        feedStatus.hidden = true;
        empty.hidden = result.tweets.length > 0;
        loader.setCursor(result.next_cursor);
    } catch (error) {
        feedStatus.textContent = error.status === 401 ? 'Please log in to load your feed.' : error.message;
        feedStatus.classList.remove('loading-status');
        handleProtectedError(error);
    }

    function onTweetDeleted() {
        empty.hidden = list.children.length > 0 || !more.hidden;
    }
}

initHome();
