$(document).ready(function () {
    console.log("Admin Vehicle Management Dashboard Loaded");

    const backendUrl = "http://localhost:8080/api/v1/vehicle";
    let currentPage = 0;
    let pageSize = 5;

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

    async function fetchVehicles(page = 0, size = 5) {
        try {
            const cookie = await cookieStore.get('token');
            const token = cookie?.value;

            $.ajax({
                url: `${backendUrl}/getAll`,
                type: "GET",
                headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                data: { page: page, size: size },
                success: function (response) {
                    console.log("Vehicles fetched:", response);

                    if (response.code === 200) {
                        renderVehicles(response.data);
                        updateCounts(response.counts);
                        renderPagination(response.totalPages, response.currentPage);
                    } else {
                        console.error("Unexpected response:", response);
                        alert("Error fetching vehicles!");
                    }
                },
                error: function (xhr) {
                    console.error("Error fetching vehicles:", xhr.responseText || xhr);
                    alert("Failed to fetch vehicles. Check console.");
                }
            });
        } catch (error) {
            console.error("Exception while fetching vehicles:", error);
        }
    }

    function renderVehicles(vehicles) {
        let tbody = $("#usersTableBody");
        tbody.empty();

        if (!vehicles || vehicles.length === 0) {
            tbody.append(`<tr><td colspan="12" class="text-center text-muted">No vehicles found</td></tr>`);
            return;
        }

        const backendUrlBase = "http://localhost:8080"; // backend base URL

        vehicles.forEach(v => {
            let imageSrc = v.vehicleImage ? backendUrlBase + v.vehicleImage : backendUrlBase + "/uploads/default.png";
            let statusClass = getStatusClass(v.vehicleStatus);

            let row = `
                <tr>
                    <td>${v.vehicleId || "-"}</td>
                    <td><img src="${imageSrc}" width="50" height="50" style="border-radius:50%; object-fit:cover;" class="border border-dark"; onerror="this.src='${backendUrlBase}/uploads/default.png'"/></td>
                    <td>${v.licenseNumber || "-"}</td>
                    <td>${v.IDNumber || "-"}</td>
                    <td>${v.vehicleCategory || "-"}</td>
                    <td>${v.vehicleNumber || "-"}</td>
                    <td class="${statusClass} fw-bold">${v.vehicleStatus || "-"}</td>
                    <td>${v.userId || "-"}</td>
                    <td>${formatDateTime(v.createdAt)}</td>
                    <td>${formatDateTime(v.updatedAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${v.vehicleId}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${v.vehicleId}">Delete</button>
                    </td>
                </tr>`;
            tbody.append(row);
        });
    }

    function getStatusClass(status) {
        if (!status) return "";
        status = status.toLowerCase();
        if (status === "active") return "status-active";
        if (status === "inactive") return "status-inactive";
        return "status-other";
    }

    // Helper function to format Timestamp to readable string
    function formatDateTime(timestamp) {
        if (!timestamp) return "-";
        const date = new Date(timestamp);
        return date.toLocaleString(); // e.g., "9/20/2025, 8:34:12 PM"
    }


    function updateCounts(counts) {
        $("#businessCountValue").text(counts.total || 0);
        $("#carCountValue").text(counts.bicycles || 0);
        $("#motorcycleCountValue").text(counts.motorcycles || 0);
        $("#scootyBikeCountValue").text(counts.scooties || 0);
        $("#activeVehiclesValue").text(counts.active || 0);
        $("#inactiveVehiclesValue").text(counts.inactive || 0);
    }

    function renderPagination(totalPages, currentPage) {
        let pagination = $("#pagination");
        pagination.empty();
        if(totalPages <= 1) return;

        for(let i=0;i<totalPages;i++){
            let activeClass = i===currentPage?"active":"";
            pagination.append(`<li class="page-item ${activeClass}"><a class="page-link" href="#">${i+1}</a></li>`);
        }

        $(".page-link").off("click").on("click", function(e){
            e.preventDefault();
            let page = parseInt($(this).text()) - 1;
            fetchVehicles(page, pageSize);
        });
    }

    $("#searchInput").on("keyup", function(){
        let value = $(this).val().toLowerCase();
        $("#usersTableBody tr").filter(function(){
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    fetchVehicles(currentPage, pageSize);
});
