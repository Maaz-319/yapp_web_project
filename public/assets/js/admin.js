async function initAdmin() {
    recheckAuthOnHistoryRestore(true);
    const user = await requireUser();
    if (!user) return;
    mountNavigation(user, 'admin');

    if (user.role !== 'admin') {
        document.getElementById('admin-content').textContent = 'You do not have permission to view this page.';
        return;
    }

    try {
        const result = await apiRequest('/api/admin/users');
        const body = document.getElementById('user-rows');
        for (const userRow of result.users) {
            const row = document.createElement('tr');
            for (const value of [userRow.id, userRow.username, userRow.display_name, userRow.email, userRow.role]) {
                const cell = document.createElement('td');
                cell.textContent = String(value);
                row.appendChild(cell);
            }
            body.appendChild(row);
        }
        const count = document.getElementById('user-count');
        count.classList.remove('loading-status');
        count.textContent = `${result.users.length} users`;
    } catch (error) {
        handleProtectedError(error);
        const count = document.getElementById('user-count');
        count.classList.remove('loading-status');
        count.textContent = error.message;
    }
}

initAdmin();
