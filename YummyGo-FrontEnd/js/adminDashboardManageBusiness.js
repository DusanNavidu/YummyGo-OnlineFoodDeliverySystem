$(document).ready(function () {
    console.log("Admin Business Management Dashboard Loaded");

    const backendUrl = "http://localhost:8080/api/v1/business";
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

    async function fetchBusinesses(page = 0, size = 5) {
        try {
            const cookie = await cookieStore.get('token');
            const token = cookie?.value;

            $.ajax({
                url: `${backendUrl}/getAll`,
                type: "GET",
                headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                data: { page: page, size: size },
                success: function (response) {
                    console.log("Businesses fetched:", response);

                    if (response.code === 200) {
                        renderBusinesses(response.data);
                        updateCounts(response.data);
                        renderPagination(response.totalPages, response.currentPage);
                    } else {
                        console.error("Unexpected response:", response);
                        alert("Error fetching businesses!");
                    }
                },
                error: function (xhr) {
                    console.error("Error fetching businesses:", xhr.responseText || xhr);
                    alert("Failed to fetch businesses. Check console.");
                }
            });
        } catch (error) {
            console.error("Exception while fetching businesses:", error);
        }
    }

    function renderBusinesses(businesses) {
        let tbody = $("#businessTableBody");
        tbody.empty();

        if (!businesses || businesses.length === 0) {
            tbody.append(`<tr><td colspan="10" class="text-center text-muted">No businesses found</td></tr>`);
            return;
        }

        businesses.forEach(b => {
            // Format createdAt and updatedAt
            let createdAt = b.createdAt ? new Date(b.createdAt).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) : "-";

            let updatedAt = b.updatedAt ? new Date(b.updatedAt).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) : "-";

            let row = `
                <tr>
                    <td>${b.businessId || "-"}</td>
                    <td>${b.businessName || "-"}</td>
                    <td>${b.contactNumber1 || "-"}</td>
                    <td>${b.businessEmail || "-"}</td>
                    <td>${b.userId || "-"}</td>
                    <td>${b.businessStatus || "-"}</td>
                    <td>${b.businessCategory || "-"}</td>
                    <td>${createdAt}</td>
                    <td>${updatedAt}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${b.businessId}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${b.businessId}">Delete</button>
                    </td>
                </tr>`;
            tbody.append(row);
        });
    }

    function updateCounts(businesses) {
        $("#businessCountValue").text(businesses.length);

        let hotels = businesses.filter(b => b.businessCategory?.toLowerCase() === "hotel").length;
        let cafes = businesses.filter(b => b.businessCategory?.toLowerCase() === "cafe").length;
        let restaurants = businesses.filter(b => b.businessCategory?.toLowerCase() === "restaurant").length;
        let bakery = businesses.filter(b => b.businessCategory?.toLowerCase() === "bakery").length;
        let other = businesses.filter(b => !["hotel","cafe","restaurant","bakery"].includes(b.businessCategory?.toLowerCase())).length;

        let active = businesses.filter(b => b.businessStatus?.toLowerCase() === "active").length;
        let inactive = businesses.filter(b => b.businessStatus?.toLowerCase() !== "active").length;

        $("#businessHotelsValue").text(hotels);
        $("#businessCafesValue").text(cafes);
        $("#businessRestaurantsValue").text(restaurants);
        $("#businessBakeryValue").text(bakery);
        $("#businessOtherValue").text(other);
        $("#activeBusinessesValue").text(active);
        $("#inactiveBusinessesValue").text(inactive);
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
            fetchBusinesses(page, pageSize);
        });
    }

    $("#searchInput").on("keyup", function(){
        let value = $(this).val().toLowerCase();
        $("#businessTableBody tr").filter(function(){
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    fetchBusinesses(currentPage, pageSize);
});
