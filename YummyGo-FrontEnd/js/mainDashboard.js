$(document).ready(async function() {
    console.log("Main Dashboard is ready");

    // const userId = localStorage.getItem('userId'); // get logged-in user's ID
    // console.log("User ID:", userId);

    const backendUrl = "http://localhost:8080"; // backend URL

    // Page load උනාම cart clear කරන්න
    sessionStorage.removeItem("cart");

    $('#logoutBtn').click(async function () {
        try {
            await cookieStore.delete('token');
            await cookieStore.delete('username');
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Error during logout:', error);
            window.location.href = '/index.html';
        }
    });

    async function loadAllBusinessesItems() {

        const cookie = await cookieStore.get('token');
        const token = cookie?.value;
        const userId = sessionStorage.getItem("userId");
        const savedLocations = JSON.parse(sessionStorage.getItem('savedLocations')) || [];
        // last location
        const lastLocation = savedLocations.length > 0 ? savedLocations[savedLocations.length - 1] : null;
        console.log("Last Location:", lastLocation);

        if (!lastLocation) {
            alert("No saved locations found. Please set your location.");
            return;
        }

        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        $.ajax({
            method: 'GET',
            url: backendUrl + '/api/v1/business/getAllBusinessThisCategory',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            data: { location: lastLocation }, // <-- make sure backend expects this parameter
            success: function(response) {
                const container = $('#business-list');
                container.empty();

                if (response.data && response.data.length > 0) {
                    response.data.forEach(b => {
                container.append(`
                    <div class="col-md-3 col-sm-6 mb-4">
                        <a href="/pages/mainDashboardBusinessItems.html?businessId=${b.businessId}" class="text-decoration-none text-dark">
                            <div class="card business-card shadow-sm border-0 h-100">
                                <img src="${backendUrl}${b.businessLogo}" 
                                    class="card-img-top" 
                                    alt="${b.businessName}">
                                <div class="card-body">
                                    <h5 class="card-title fw-bold mb-2">${b.businessName}</h5>
                                    <p class="small mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${b.businessAddress}, ${b.businessAreaPostalCode}</p>
                                    <p class="small mb-0"><i class="bi bi-envelope me-1"></i>${b.businessEmail} | <i class="bi bi-telephone me-1"></i>${b.contactNumber1}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                `);
            });
                } else {
                    container.append(`
                        <div class="col-12 text-center text-muted mt-3">
                            <i class="bi bi-info-circle"></i> No businesses found for this location.
                        </div>
                    `);
                }
            },
            error: function(xhr) {
                console.error("Error fetching businesses:", xhr.responseText);
            }
        });
    }

    $('#search-data').on('input', async function() {
        let keyword = $(this).val().trim();

        if (keyword === "") {
            loadAllBusinessesItems();
            return;
        }

        const cookie = await cookieStore.get('token');
        const token = cookie?.value;
        const userId = sessionStorage.getItem("userId");
        const savedLocations = JSON.parse(sessionStorage.getItem('savedLocations')) || [];
        // last location
        const lastLocation = savedLocations.length > 0 ? savedLocations[savedLocations.length - 1] : null;
        console.log("Last Location:", lastLocation);

        $.ajax({
            method: 'GET',
            url: backendUrl + `/api/v1/business/getAllBusinesSearch/${keyword}`,
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            data: { location: lastLocation },
            success: function(response) {
                const container = $('#business-list');
                container.empty();

                if (response.data && response.data.length > 0) {
                    response.data.forEach(b => {
                        container.append(`
                            <div class="col-md-4 col-sm-6 mb-4">
                                <a href="/pages/businessItemDashboard.html?businessId=${b.businessId}" class="text-decoration-none text-dark">
                                    <div class="card business-card shadow-sm border-0 h-100">
                                        <img src="${backendUrl}${b.businessLogo}" 
                                            class="card-img-top" 
                                            alt="${b.businessName}">
                                        <div class="card-body">
                                            <h5 class="card-title fw-bold mb-2">${b.businessName}</h5>
                                            <p class="small mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${b.businessAddress}, ${b.businessAreaPostalCode}</p>
                                            <p class="small mb-0"><i class="bi bi-envelope me-1"></i>${b.businessEmail} | <i class="bi bi-telephone me-1"></i>${b.contactNumber1}</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `);
                    });
                } else {
                    container.append(`
                        <div class="col-12 text-center text-muted mt-3">
                            <i class="bi bi-info-circle"></i> No results found.
                        </div>
                    `);
                }
            },
            error: function(xhr) {
                console.error("Error fetching businesses:", xhr.responseText);
            }
        });
    });
    loadAllBusinessesItems();
});