$(document).ready(async function() {
    console.log("Admin Dashboard Manage Users is ready");

    const backendUrl = "http://localhost:8080"; // backend URL

    loadAllUsers();
    loadInactiveUserCount();
    loadActiveUserCount();
    loadUserCount();
    loadPartnerCount();
    loadBusinessCount();
    loadClientCount();
    loadAdminCount();

    $('#logoutBtn').click(async function (e) {
        e.preventDefault(); // stop default link navigation

        try {
            await cookieStore.delete('token');
            await cookieStore.delete('username');
            sessionStorage.clear();   // optional: clear session data too

            // redirect to login page
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Error during logout:', error);
            window.location.href = '/index.html';
        }
    });

    $("#addUserForm").on("submit", function (event) {
        event.preventDefault();

        const password = $("#password").val();
        const confirmPassword = $("#confirm-password").val();

        // Check if passwords match
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const user = {
            fullName: $("#fullName").val(),
            phoneNumber: $("#phoneNumber").val(),
            email: $("#email").val(),
            username: $("#username").val(),
            password: confirmPassword,
            userStatus: "Active",
            role: $("#role").val()
        };
        console.log(user);

        if(!user.fullName || !user.phoneNumber || !user.email || !user.username || !user.password || !user.role) {
            alert("All fields are required.");
            return;
        }

        $.ajax({
            url: "http://localhost:8080/api/v1/AdminDashboardUsersManage/admin/saveuser",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(user),
            success: function (response) {
                // Corrected line
                if (response.code === 200) {
                    alert("Registration successful! Redirecting to home page...");
                } else {
                    alert("Registration failed: " + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
                alert("An error occurred during registration. Please try again.");
            }
        })
    })

    $('#searchInput').on('input', async function () {
        const keyword = $(this).val();

        const cookie = await cookieStore.get('token');
        const token = cookie?.value;

        if (!token) {
            console.error("No token found in cookies");
            return;
        }

        if (!keyword) {
            loadAllUsers();
            return;
        }

        $.ajax({
            method: "GET",
            url: backendUrl + '/api/v1/AdminDashboardUsersManage/searchUsers',
            data: { keyword: keyword },
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            success: (response) => {
                const users = response.data;
                let usersTable = $("#usersTableBody");
                usersTable.empty();

                if (!users || users.length === 0) {
                    usersTable.html('<tr><td colspan="10">No users found.</td></tr>');
                    return;
                }

                users.forEach(user => {
                    user.createdAt = new Date(user.createdAt).toLocaleString();
                    user.updatedAt = new Date(user.updatedAt).toLocaleString();

                    let statusBadge = user.userStatus.toLowerCase() === 'active'
                        ? `<span class="badge bg-success">${user.userStatus}</span>`
                        : `<span class="badge bg-danger">${user.userStatus}</span>`;

                    let roleImage = '';
                    switch (user.role.toUpperCase()) {
                        case 'CLIENT':
                            roleImage = '<img class="me-2" src="/assets/logo/eating.png" width="24" title="Client">';
                            break;
                        case 'PARTNER':
                            roleImage = '<img class="me-2" src="/assets/logo/app.png" width="24" title="Partner">';
                            break;
                        case 'BUSINESS':
                            roleImage = '<img class="me-2" src="/assets/logo/coffee-shop.png" width="24" title="Business">';
                            break;
                        default:
                            roleImage = '<img class="me-2" src="/assets/logo/setting.png" width="24" title="Admin">';
                    }

                    // Toggle button
                    let toggleBtn = '';
                    if (user.userStatus.toLowerCase() === 'active') {
                        toggleBtn = `<button class="btn btn-danger btn-sm" onClick="deactivateUser('${user.id}')">Deactivate</button>`;
                    } else {
                        toggleBtn = `<button class="btn btn-success btn-sm" onClick="activateUser('${user.id}')">Activate</button>`;
                    }

                    usersTable.append(`
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.fullName}</td>
                            <td>${user.phoneNumber}</td>
                            <td>${user.email}</td>
                            <td>${user.username}</td>
                            <td>${statusBadge}</td>
                            <td>${roleImage} ${user.role}</td>
                            <td>${user.createdAt}</td>
                            <td>${user.updatedAt}</td>
                            <td class="d-flex flex-column gap-1">
                                <button class="btn btn-info btn-sm" onClick="viewUser('${user.id}')">View</button>
                                <button class="btn btn-warning btn-sm" onClick="editUser('${user.id}', '${user.fullName}', '${user.phoneNumber}', '${user.email}', '${user.username}')">Edit</button>
                                ${toggleBtn}
                            </td>
                        </tr>
                    `);
                });
            },
            error: (error) => {
                console.error(error);
                alert("Error searching users: " + error.responseText);
            }
        });
    });

    $("#userBusinesses").click(() => loadAllBusinessUsers());
    $("#userCount").click(() => loadAllUsers());
    $("#userClients").click(() => loadAllClientUsers());
    $("#userPartners").click(() => loadAllPartnerUsers());
    $("#userAdmins").click(() => {
        let usersTable = $("#usersTableBody");
        usersTable.html('<tr><td colspan="10">Don\'t have show Admin users. It is very security data in this system.</td></tr>');
    });
    $("#activeUsers").click(() => loadAllActiveUsers());
    $("#inactiveUsers").click(() => loadAllInactiveUsers());

});

// --- Load all users ---
async function loadAllUsers(page = 0, size = 10) {
    const cookie = await cookieStore.get('token');
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: 'http://localhost:8080/api/v1/AdminDashboardUsersManage/getAllUsers',
        data: { page: page, size: size },
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        success: (response) => {
            const pageData = response.data;
            const users = pageData.content;
            const totalPages = pageData.totalPages;
            const currentPage = pageData.number;

            let usersTable = $("#usersTableBody");
            usersTable.empty();

            if (!users || users.length === 0) {
                usersTable.html('<tr><td colspan="10">No users found.</td></tr>');
                return;
            }

            users.forEach(user => {
                user.createdAt = new Date(user.createdAt).toLocaleString();
                user.updatedAt = new Date(user.updatedAt).toLocaleString();

                let statusBadge = user.userStatus.toLowerCase() === 'active'
                    ? `<span class="badge bg-success">${user.userStatus}</span>`
                    : `<span class="badge bg-danger">${user.userStatus}</span>`;

                let roleImage = '';
                switch (user.role.toUpperCase()) {
                    case 'CLIENT':
                        roleImage = '<img class="me-2" src="/assets/logo/eating.png" width="24" title="Client">';
                        break;
                    case 'PARTNER':
                        roleImage = '<img class="me-2" src="/assets/logo/app.png" width="24" title="Partner">';
                        break;
                    case 'BUSINESS':
                        roleImage = '<img class="me-2" src="/assets/logo/coffee-shop.png" width="24" title="Business">';
                        break;
                    default:
                        roleImage = '<img class="me-2" src="/assets/logo/setting.png" width="24" title="Admin">';
                }

                // Toggle button
                let toggleBtn = '';
                if (user.userStatus.toLowerCase() === 'active') {
                    toggleBtn = `<button class="btn btn-danger btn-sm" onClick="deactivateUser('${user.id}')">Deactivate</button>`;
                } else {
                    toggleBtn = `<button class="btn btn-success btn-sm" onClick="activateUser('${user.id}')">Activate</button>`;
                }

                usersTable.append(`
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.fullName}</td>
                        <td>${user.phoneNumber}</td>
                        <td>${user.email}</td>
                        <td>${user.username}</td>
                        <td>${statusBadge}</td>
                        <td>${roleImage} ${user.role}</td>
                        <td>${user.createdAt}</td>
                        <td>${user.updatedAt}</td>
                        <td class="d-flex flex-column gap-1">
                            <button class="btn btn-info btn-sm">View</button>
                            <button class="btn btn-warning btn-sm" onClick="editUser('${user.id}', '${user.fullName}', '${user.phoneNumber}', '${user.email}', '${user.username}')">Edit</button>
                            ${toggleBtn}
                        </td>
                    </tr>
                `);
            });

            // Render pagination
            renderPagination(totalPages, currentPage);
        },
        error: (error) => {
            console.error(error);
            $('#user-list').html('<p>Error loading users.</p>');
            alert("Error fetching users: " + error.responseText);
        }
    });
}

async function loadAllBusinessUsers(page = 0, size = 10) {
    const cookie = await cookieStore.get('token');
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: 'http://localhost:8080/api/v1/AdminDashboardUsersManage/getAllBusinessUsers',
        data: { page: page, size: size },
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        success: (response) => {
            const pageData = response.data;
            const users = pageData.content;
            const totalPages = pageData.totalPages;
            const currentPage = pageData.number;

            let usersTable = $("#usersTableBody");
            usersTable.empty();

            if (!users || users.length === 0) {
                usersTable.html('<tr><td colspan="10">No Business users found.</td></tr>');
                return;
            }

            users.forEach(user => {
                user.createdAt = new Date(user.createdAt).toLocaleString();
                user.updatedAt = new Date(user.updatedAt).toLocaleString();

                let statusBadge = user.userStatus.toLowerCase() === 'active'
                    ? `<span class="badge bg-success">${user.userStatus}</span>`
                    : `<span class="badge bg-danger">${user.userStatus}</span>`;

                let roleImage = '';
                switch (user.role.toUpperCase()) {
                    case 'CLIENT':
                        roleImage = '<img class="me-2" src="/assets/logo/eating.png" width="24" title="Client">';
                        break;
                    case 'PARTNER':
                        roleImage = '<img class="me-2" src="/assets/logo/app.png" width="24" title="Partner">';
                        break;
                    case 'BUSINESS':
                        roleImage = '<img class="me-2" src="/assets/logo/coffee-shop.png" width="24" title="Business">';
                        break;
                    default:
                        roleImage = '<img class="me-2" src="/assets/logo/setting.png" width="24" title="Admin">';
                }

                // Toggle button
                let toggleBtn = '';
                if (user.userStatus.toLowerCase() === 'active') {
                    toggleBtn = `<button class="btn btn-danger btn-sm" onClick="deactivateUser('${user.id}')">Deactivate</button>`;
                } else {
                    toggleBtn = `<button class="btn btn-success btn-sm" onClick="activateUser('${user.id}')">Activate</button>`;
                }

                usersTable.append(`
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.fullName}</td>
                        <td>${user.phoneNumber}</td>
                        <td>${user.email}</td>
                        <td>${user.username}</td>
                        <td>${statusBadge}</td>
                        <td>${roleImage} ${user.role}</td>
                        <td>${user.createdAt}</td>
                        <td>${user.updatedAt}</td>
                        <td class="d-flex flex-column gap-1">
                            <button class="btn btn-info btn-sm" onClick="viewUser('${user.id}')">View</button>
                            <button class="btn btn-warning btn-sm" onClick="editUser('${user.id}', '${user.fullName}', '${user.phoneNumber}', '${user.email}', '${user.username}')">Edit</button>
                            ${toggleBtn}
                        </td>
                    </tr>
                `);
            });

            // Render pagination
            renderPagination(totalPages, currentPage);
        },
        error: (error) => {
            console.error(error);
            $('#user-list').html('<p>Error loading users.</p>');
            alert("Error fetching users: " + error.responseText);
        }
    });
}

async function loadAllClientUsers(page = 0, size = 10) {
    const cookie = await cookieStore.get('token');
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: 'http://localhost:8080/api/v1/AdminDashboardUsersManage/getAllClientUsers',
        data: { page: page, size: size },
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        success: (response) => {
            const pageData = response.data;
            const users = pageData.content;
            const totalPages = pageData.totalPages;
            const currentPage = pageData.number;

            let usersTable = $("#usersTableBody");
            usersTable.empty();

            if (!users || users.length === 0) {
                usersTable.html('<tr><td colspan="10">No Client users found.</td></tr>');
                return;
            }

            users.forEach(user => {
                user.createdAt = new Date(user.createdAt).toLocaleString();
                user.updatedAt = new Date(user.updatedAt).toLocaleString();

                let statusBadge = user.userStatus.toLowerCase() === 'active'
                    ? `<span class="badge bg-success">${user.userStatus}</span>`
                    : `<span class="badge bg-danger">${user.userStatus}</span>`;

                let roleImage = '';
                switch (user.role.toUpperCase()) {
                    case 'CLIENT':
                        roleImage = '<img class="me-2" src="/assets/logo/eating.png" width="24" title="Client">';
                        break;
                    case 'PARTNER':
                        roleImage = '<img class="me-2" src="/assets/logo/app.png" width="24" title="Partner">';
                        break;
                    case 'BUSINESS':
                        roleImage = '<img class="me-2" src="/assets/logo/coffee-shop.png" width="24" title="Business">';
                        break;
                    default:
                        roleImage = '<img class="me-2" src="/assets/logo/setting.png" width="24" title="Admin">';
                }

                // Toggle button
                let toggleBtn = '';
                if (user.userStatus.toLowerCase() === 'active') {
                    toggleBtn = `<button class="btn btn-danger btn-sm" onClick="deactivateUser('${user.id}')">Deactivate</button>`;
                } else {
                    toggleBtn = `<button class="btn btn-success btn-sm" onClick="activateUser('${user.id}')">Activate</button>`;
                }

                usersTable.append(`
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.fullName}</td>
                        <td>${user.phoneNumber}</td>
                        <td>${user.email}</td>
                        <td>${user.username}</td>
                        <td>${statusBadge}</td>
                        <td>${roleImage} ${user.role}</td>
                        <td>${user.createdAt}</td>
                        <td>${user.updatedAt}</td>
                        <td class="d-flex flex-column gap-1">
                            <button class="btn btn-info btn-sm" onClick="viewUser('${user.id}')">View</button>
                            <button class="btn btn-warning btn-sm" onClick="editUser('${user.id}', '${user.fullName}', '${user.phoneNumber}', '${user.email}', '${user.username}')">Edit</button>
                            ${toggleBtn}
                        </td>
                    </tr>
                `);
            });

            // Render pagination
            renderPagination(totalPages, currentPage);
        },
        error: (error) => {
            console.error(error);
            $('#user-list').html('<p>Error loading users.</p>');
            alert("Error fetching users: " + error.responseText);
        }
    });
}

async function loadAllPartnerUsers(page = 0, size = 10) {
    const cookie = await cookieStore.get('token');
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: 'http://localhost:8080/api/v1/AdminDashboardUsersManage/getAllPartnerUsers',
        data: { page: page, size: size },
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        success: (response) => {
            const pageData = response.data;
            const users = pageData.content;
            const totalPages = pageData.totalPages;
            const currentPage = pageData.number;

            let usersTable = $("#usersTableBody");
            usersTable.empty();

            if (!users || users.length === 0) {
                usersTable.html('<tr><td colspan="10">No Partner users found.</td></tr>');
                return;
            }

            users.forEach(user => {
                user.createdAt = new Date(user.createdAt).toLocaleString();
                user.updatedAt = new Date(user.updatedAt).toLocaleString();

                let statusBadge = user.userStatus.toLowerCase() === 'active'
                    ? `<span class="badge bg-success">${user.userStatus}</span>`
                    : `<span class="badge bg-danger">${user.userStatus}</span>`;

                let roleImage = '';
                switch (user.role.toUpperCase()) {
                    case 'CLIENT':
                        roleImage = '<img class="me-2" src="/assets/logo/eating.png" width="24" title="Client">';
                        break;
                    case 'PARTNER':
                        roleImage = '<img class="me-2" src="/assets/logo/app.png" width="24" title="Partner">';
                        break;
                    case 'BUSINESS':
                        roleImage = '<img class="me-2" src="/assets/logo/coffee-shop.png" width="24" title="Business">';
                        break;
                    default:
                        roleImage = '<img class="me-2" src="/assets/logo/setting.png" width="24" title="Admin">';
                }

                // Toggle button
                let toggleBtn = '';
                if (user.userStatus.toLowerCase() === 'active') {
                    toggleBtn = `<button class="btn btn-danger btn-sm" onClick="deactivateUser('${user.id}')">Deactivate</button>`;
                } else {
                    toggleBtn = `<button class="btn btn-success btn-sm" onClick="activateUser('${user.id}')">Activate</button>`;
                }

                usersTable.append(`
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.fullName}</td>
                        <td>${user.phoneNumber}</td>
                        <td>${user.email}</td>
                        <td>${user.username}</td>
                        <td>${statusBadge}</td>
                        <td>${roleImage} ${user.role}</td>
                        <td>${user.createdAt}</td>
                        <td>${user.updatedAt}</td>
                        <td class="d-flex flex-column gap-1">
                            <button class="btn btn-info btn-sm" onClick="viewUser('${user.id}')">View</button>
                            <button class="btn btn-warning btn-sm" onClick="editUser('${user.id}', '${user.fullName}', '${user.phoneNumber}', '${user.email}', '${user.username}')">Edit</button>
                            ${toggleBtn}
                        </td>
                    </tr>
                `);
            });

            // Render pagination
            renderPagination(totalPages, currentPage);
        },
        error: (error) => {
            console.error(error);
            $('#user-list').html('<p>Error loading users.</p>');
            alert("Error fetching users: " + error.responseText);
        }
    });
}

async function loadAllActiveUsers(page = 0, size = 10) {
    const cookie = await cookieStore.get('token');
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: 'http://localhost:8080/api/v1/AdminDashboardUsersManage/getAllActiveUsers',
        data: { page: page, size: size },
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        success: (response) => {
            const pageData = response.data;
            const users = pageData.content;
            const totalPages = pageData.totalPages;
            const currentPage = pageData.number;

            let usersTable = $("#usersTableBody");
            usersTable.empty();

            if (!users || users.length === 0) {
                usersTable.html('<tr><td colspan="10">No active users found.</td></tr>');
                return;
            }

            users.forEach(user => {
                user.createdAt = new Date(user.createdAt).toLocaleString();
                user.updatedAt = new Date(user.updatedAt).toLocaleString();

                let statusBadge = user.userStatus.toLowerCase() === 'active'
                    ? `<span class="badge bg-success">${user.userStatus}</span>`
                    : `<span class="badge bg-danger">${user.userStatus}</span>`;

                let roleImage = '';
                switch (user.role.toUpperCase()) {
                    case 'CLIENT':
                        roleImage = '<img class="me-2" src="/assets/logo/eating.png" width="24" title="Client">';
                        break;
                    case 'PARTNER':
                        roleImage = '<img class="me-2" src="/assets/logo/app.png" width="24" title="Partner">';
                        break;
                    case 'BUSINESS':
                        roleImage = '<img class="me-2" src="/assets/logo/coffee-shop.png" width="24" title="Business">';
                        break;
                    default:
                        roleImage = '<img class="me-2" src="/assets/logo/setting.png" width="24" title="Admin">';
                }

                // Toggle button
                let toggleBtn = '';
                if (user.userStatus.toLowerCase() === 'active') {
                    toggleBtn = `<button class="btn btn-danger btn-sm" onClick="deactivateUser('${user.id}')">Deactivate</button>`;
                } else {
                    toggleBtn = `<button class="btn btn-success btn-sm" onClick="activateUser('${user.id}')">Activate</button>`;
                }

                usersTable.append(`
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.fullName}</td>
                        <td>${user.phoneNumber}</td>
                        <td>${user.email}</td>
                        <td>${user.username}</td>
                        <td>${statusBadge}</td>
                        <td>${roleImage} ${user.role}</td>
                        <td>${user.createdAt}</td>
                        <td>${user.updatedAt}</td>
                        <td class="d-flex flex-column gap-1">
                            <button class="btn btn-info btn-sm" onClick="viewUser('${user.id}')">View</button>
                            <button class="btn btn-warning btn-sm" onClick="editUser('${user.id}', '${user.fullName}', '${user.phoneNumber}', '${user.email}', '${user.username}')">Edit</button>
                            ${toggleBtn}
                        </td>
                    </tr>
                `);
            });

            // Render pagination
            renderPagination(totalPages, currentPage);
        },
        error: (error) => {
            console.error(error);
            $('#user-list').html('<p>Error loading users.</p>');
            alert("Error fetching users: " + error.responseText);
        }
    });
}

async function loadAllInactiveUsers(page = 0, size = 10) {
    const cookie = await cookieStore.get('token');
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: 'http://localhost:8080/api/v1/AdminDashboardUsersManage/getAllInactiveUsers',
        data: { page: page, size: size },
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        success: (response) => {
            const pageData = response.data;
            const users = pageData.content;
            const totalPages = pageData.totalPages;
            const currentPage = pageData.number;

            let usersTable = $("#usersTableBody");
            usersTable.empty();

            if (!users || users.length === 0) {
                usersTable.html('<tr><td colspan="10">No Inactive users found.</td></tr>');
                return;
            }

            users.forEach(user => {
                user.createdAt = new Date(user.createdAt).toLocaleString();
                user.updatedAt = new Date(user.updatedAt).toLocaleString();

                let statusBadge = user.userStatus.toLowerCase() === 'active'
                    ? `<span class="badge bg-success">${user.userStatus}</span>`
                    : `<span class="badge bg-danger">${user.userStatus}</span>`;

                let roleImage = '';
                switch (user.role.toUpperCase()) {
                    case 'CLIENT':
                        roleImage = '<img class="me-2" src="/assets/logo/eating.png" width="24" title="Client">';
                        break;
                    case 'PARTNER':
                        roleImage = '<img class="me-2" src="/assets/logo/app.png" width="24" title="Partner">';
                        break;
                    case 'BUSINESS':
                        roleImage = '<img class="me-2" src="/assets/logo/coffee-shop.png" width="24" title="Business">';
                        break;
                    default:
                        roleImage = '<img class="me-2" src="/assets/logo/setting.png" width="24" title="Admin">';
                }

                // Toggle button
                let toggleBtn = '';
                if (user.userStatus.toLowerCase() === 'active') {
                    toggleBtn = `<button class="btn btn-danger btn-sm" onClick="deactivateUser('${user.id}')">Deactivate</button>`;
                } else {
                    toggleBtn = `<button class="btn btn-success btn-sm" onClick="activateUser('${user.id}')">Activate</button>`;
                }

                usersTable.append(`
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.fullName}</td>
                        <td>${user.phoneNumber}</td>
                        <td>${user.email}</td>
                        <td>${user.username}</td>
                        <td>${statusBadge}</td>
                        <td>${roleImage} ${user.role}</td>
                        <td>${user.createdAt}</td>
                        <td>${user.updatedAt}</td>
                        <td class="d-flex flex-column gap-1">
                            <button class="btn btn-info btn-sm" onClick="viewUser('${user.id}')">View</button>
                            <button class="btn btn-warning btn-sm" onClick="editUser('${user.id}', '${user.fullName}', '${user.phoneNumber}', '${user.email}', '${user.username}')">Edit</button>
                            ${toggleBtn}
                        </td>
                    </tr>
                `);
            });

            // Render pagination
            renderPagination(totalPages, currentPage);
        },
        error: (error) => {
            console.error(error);
            $('#user-list').html('<p>Error loading users.</p>');
            alert("Error fetching users: " + error.responseText);
        }
    });
}

function renderPagination(totalPages, currentPage) {
    let pagination = $("#pagination");
    pagination.empty();

    if (totalPages <= 1) return;

    // Prev button
    pagination.append(`
        <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
            <a class="page-link prev-btn" href="#">&lt;</a>
        </li>
    `);

    // Page numbers
    for (let i = 0; i < totalPages; i++) {
        pagination.append(`
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link page-btn" data-page="${i}" href="#">${i + 1}</a>
            </li>
        `);
    }

    // Next button
    pagination.append(`
        <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
            <a class="page-link next-btn" href="#">&gt;</a>
        </li>
    `);

    // --- Bind events ---
    $(".prev-btn").click(() => loadAllUsers(currentPage - 1));
    $(".page-btn").click(function() {
        loadAllUsers($(this).data("page"));
    });
    $(".next-btn").click(() => loadAllUsers(currentPage + 1));
}

// --- Load user count ---
async function loadUserCount() {
    const cookie = await cookieStore.get("token");
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: "http://localhost:8080/api/v1/AdminDashboardUsersManage/getUserCount",
        headers: token ? { Authorization: "Bearer " + token } : {},
        success: (response) => {
            const userCount = response.data;
            console.log("User count:", userCount);
            $("#userCountValue").text(userCount);
        },
        error: (error) => {
            console.error(error);
            alert("Error fetching user count: " + error.responseText);
        },
    });
}

async function loadPartnerCount() {
    const cookie = await cookieStore.get("token");
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: "http://localhost:8080/api/v1/AdminDashboardUsersManage/getPartnerCount",
        headers: token ? { Authorization: "Bearer " + token } : {},
        success: (response) => {
            const partnerCount = response.data;
            console.log("Partner count:", partnerCount);
            $("#userPartnersValue").text(partnerCount);
        },
        error: (error) => {
            console.error(error);
            alert("Error fetching partner count: " + error.responseText);
        },
    });
}

async function loadBusinessCount() {
    const cookie = await cookieStore.get("token");
    const token = cookie?.value;
    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: "GET",
        url: "http://localhost:8080/api/v1/AdminDashboardUsersManage/getBusinessCount",
        headers: token ? { Authorization: "Bearer " + token } : {},
        success: (response) => {
            const businessCount = response.data;
            console.log("Business count:", businessCount);
            $("#userBusinessesValue").text(businessCount);
        },
        error: (error) => {
            console.error(error);
            alert("Error fetching business count: " + error.responseText);
        },
    });
}

async function loadClientCount() {
    const cookie = await cookieStore.get("token");
    const token = cookie?.value;
    if (!token) {
        console.error("No token found in cookies");
        return;
    }
    $.ajax({
        method: "GET",
        url: "http://localhost:8080/api/v1/AdminDashboardUsersManage/getClientCount",
        headers: token ? { Authorization: "Bearer " + token } : {},
        success: (response) => {
            const clientCount = response.data;
            console.log("Client count:", clientCount);
            $("#userClientsValue").text(clientCount);
        },
        error: (error) => {
            console.error(error);
            alert("Error fetching client count: " + error.responseText);
        },
    });
}

async function loadAdminCount() {
    const cookie = await cookieStore.get("token");
    const token = cookie?.value;
    if (!token) {
        console.error("No token found in cookies");
        return;
    }
    $.ajax({
        method: "GET",
        url: "http://localhost:8080/api/v1/AdminDashboardUsersManage/getAdminCount",
        headers: token ? { Authorization: "Bearer " + token } : {},
        success: (response) => {
            const adminCount = response.data;
            console.log("Admin count:", adminCount);
            $("#userAdminsValue").text(adminCount);
        },
        error: (error) => {
            console.error(error);
            alert("Error fetching admin count: " + error.responseText);
        },
    });
}

async function loadActiveUserCount() {
    const cookie = await cookieStore.get("token");
    const token = cookie?.value;
    if (!token) {
        console.error("No token found in cookies");
        return;
    }
    $.ajax({
        method: "GET",
        url: "http://localhost:8080/api/v1/AdminDashboardUsersManage/getActiveUserCount",
        headers: token ? { Authorization: "Bearer " + token } : {},
        success: (response) => {
            const activeUserCount = response.data;
            console.log("Active user count:", activeUserCount);
            $("#activeUsersValue").text(activeUserCount);
        },
        error: (error) => {
            console.error(error);
            alert("Error fetching active user count: " + error.responseText);
        },
    });
}

async function loadInactiveUserCount() {
    const cookie = await cookieStore.get("token");
    const token = cookie?.value;
    if (!token) {
        console.error("No token found in cookies");
        return;
    }
    $.ajax({
        method: "GET",
        url: "http://localhost:8080/api/v1/AdminDashboardUsersManage/getInactiveUserCount",
        headers: token ? { Authorization: "Bearer " + token } : {},
        success: (response) => {
            const inactiveUserCount = response.data;
            console.log("Inactive user count:", inactiveUserCount);
            $("#inactiveUsersValue").text(inactiveUserCount);
        },
        error: (error) => {
            console.error(error);
            alert("Error fetching inactive user count: " + error.responseText);
        },
    });
}

async function deactivateUser(id) {
    console.log("Deactivating user with ID:", id);

    const cookie = await cookieStore.get('token');
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: 'PATCH',
        url: `http://localhost:8080/api/v1/AdminDashboardUsersManage/deactivateUser/${id}`,
        contentType: 'application/json',
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        data: JSON.stringify({ status: 'Inactive' }),
        success: (response) => {
            console.log("User deactivated successfully:", response);
            loadAllUsers();
            loadUserCount();
            loadActiveUserCount();
            loadInactiveUserCount();
            loadPartnerCount();
            loadBusinessCount();
            loadClientCount();
            loadAdminCount();
            alert("User deactivated successfully.");
        },
        error: (error) => {
            console.error("Error deactivating user:", error);
            alert("Error deactivating user: " + error.responseText);
        }
    });
}

async function activateUser(id) {
    const cookie = await cookieStore.get('token');
    const token = cookie?.value;

    if (!token) {
        console.error("No token found in cookies");
        return;
    }

    $.ajax({
        method: 'PATCH',
        url: `http://localhost:8080/api/v1/AdminDashboardUsersManage/activateUser/${id}`,
        contentType: 'application/json',
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        data: JSON.stringify({ status: 'Active' }),
        success: (response) => {
            console.log("User activated successfully:", response);
            // Reload data after activating
            loadAllUsers();
            loadUserCount();
            loadActiveUserCount();
            loadInactiveUserCount();
            loadPartnerCount();
            loadBusinessCount();
            loadClientCount();
            loadAdminCount();
            alert("User activated successfully.");
        },
        error: (error) => {
            console.error("Error activating user:", error);
            alert("Error activating user: " + error.responseText);
        }
    });
}
