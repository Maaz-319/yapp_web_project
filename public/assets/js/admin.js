function createAdminCell(value, className = '') {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    cell.textContent = String(value);
    return cell;
}

function renderAdminUsers(users, currentUserId) {
    const body = document.getElementById('user-rows');
    body.replaceChildren();

    for (const userRow of users) {
        const row = document.createElement('tr');
        row.append(
            createAdminCell(userRow.id, 'user-id'),
            createAdminCell(userRow.username, 'user-handle'),
            createAdminCell(userRow.display_name, 'user-name'),
            createAdminCell(userRow.email, 'user-email')
        );

        const roleCell = createAdminCell('', 'role-cell');
        const roleBadge = document.createElement('span');
        roleBadge.className = `role-badge role-${userRow.role}`;
        roleBadge.textContent = userRow.role;
        roleCell.appendChild(roleBadge);
        row.appendChild(roleCell);

        const joined = new Date(`${userRow.created_at.replace(' ', 'T')}Z`);
        row.appendChild(createAdminCell(Number.isNaN(joined.getTime()) ? userRow.created_at : joined.toLocaleDateString()));

        const actions = document.createElement('td');
        actions.className = 'admin-actions';
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn btn-secondary';
        editButton.textContent = 'Edit role';
        editButton.addEventListener('click', () => editAdminUser(userRow, users, currentUserId));
        actions.appendChild(editButton);
        if (userRow.id !== currentUserId) {
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn btn-danger-solid';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteAdminUser(userRow, users, currentUserId));
            actions.appendChild(deleteButton);
        }
        row.appendChild(actions);
        body.appendChild(row);
    }
}

function editAdminUser(userRow, users, currentUserId) {
    const row = [...document.querySelectorAll('#user-rows tr')]
        .find((item) => item.children[0].textContent === String(userRow.id));
    if (!row) return;

    const roleCell = row.children[4];
    const actions = row.children[6];
    roleCell.replaceChildren();
    actions.replaceChildren();

    const select = document.createElement('select');
    select.setAttribute('aria-label', `Role for ${userRow.username}`);
    for (const role of ['user', 'admin']) {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        option.selected = role === userRow.role;
        select.appendChild(option);
    }
    roleCell.appendChild(select);

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'btn btn-primary';
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', async () => {
        saveButton.disabled = true;
        try {
            const result = await apiRequest(`/api/admin/users?id=${userRow.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ role: select.value }),
            });
            userRow.role = result.user.role;
            renderAdminUsers(users, currentUserId);
            showToast('Account role updated.', 'success');
        } catch (error) {
            handleProtectedError(error);
            saveButton.disabled = false;
        }
    });

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => renderAdminUsers(users, currentUserId));
    actions.append(saveButton, cancelButton);
}

async function deleteAdminUser(userRow, users, currentUserId) {
    const confirmed = window.confirm(
        `Permanently delete @${userRow.username}? Their posts, follows, likes, and remember tokens will also be removed.`
    );
    if (!confirmed) return;

    try {
        await apiRequest(`/api/admin/users?id=${userRow.id}`, { method: 'DELETE' });
        const remainingUsers = users.filter((item) => item.id !== userRow.id);
        renderAdminUsers(remainingUsers, currentUserId);
        const count = document.getElementById('user-count');
        count.textContent = `${remainingUsers.length} users`;
        showToast('Account deleted.', 'success');
    } catch (error) {
        handleProtectedError(error);
    }
}

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
        renderAdminUsers(result.users, user.id);
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
