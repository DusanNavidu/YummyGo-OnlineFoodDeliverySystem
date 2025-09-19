$(document).ready(async function() {
    console.log("Partner Dashboard JS loaded");

    const userId = sessionStorage.getItem("userId");
    const $riderContainer = $('#rider-save-introduction-container');
    const $statusToggleBtn = $("#statusToggleBtn");
    const $ordersContainer = $('#ordersContainer');
    const $vehicleStatusContainerBtn = $('#vehicle-status-container-btn');
    const backendUrl = "http://localhost:8080/api/v1";

    if (!userId) {
        Swal.fire({ icon: "warning", title: "Not Authenticated", text: "Please login first!" });
        return;
    }

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

    let hasValidVehicle = false; // global flag

    // ==========================
    // VEHICLE LOGIC
    // ==========================
    async function checkUserVehicle() {
        const token = (await cookieStore.get('token'))?.value;
        if (!token || !userId) return;

        $.ajax({
            url: `${backendUrl}/vehicle/user/${userId}`,
            method: "GET",
            headers: { 'Authorization': 'Bearer ' + token },
            success: function(response) {
                if (response && response.length > 0) {
                    const vehicle = response[0];

                    // check for missing important fields
                    if (!vehicle.vehicleCategory || !vehicle.vehicleImage || !vehicle.vehicleStatus) {
                        $riderContainer.show(); 
                        $("#vehicle-status-container-btn").hide();
                        hasValidVehicle = false;
                    } else {
                        $riderContainer.hide(); 
                        $vehicleStatusContainerBtn.show();
                        updateStatusButton(vehicle.vehicleStatus);
                        hasValidVehicle = true;
                        fetchRiderOrders(); // only load orders if vehicle is valid
                    }
                } else {
                    $riderContainer.show();
                    hasValidVehicle = false;
                }
            },
            error: function(err) {
                console.error("Failed to fetch vehicles:", err);
                $riderContainer.show();
                hasValidVehicle = false;
            }
        });
    }


    const $vehicleCategory = $('#vehicleCategory');
    const $licenseNumber = $('#vehicleLicenseNumber');
    const $vehicleNumber = $('#vehicleNumber');
    const $vehicleImage = $('#vehicleImage');

    // Hide/Show fields based on category
    $vehicleCategory.change(function() {
        if ($vehicleCategory.val() === "Bicycle") {
            $licenseNumber.closest('.mb-3').hide();
            $vehicleNumber.closest('.mb-3').hide();
        } else {
            $licenseNumber.closest('.mb-3').show();
            $vehicleNumber.closest('.mb-3').show();
        }
    }).trigger('change');

    // Drag & drop image preview
    const $previewContainer = $('<div class="dz-preview mb-3"></div>').insertAfter($vehicleImage);
    function handleFile(file) {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file only.");
            return;
        }
        const url = URL.createObjectURL(file);
        $previewContainer.html(`<div class="position-relative">
            <img src="${url}" class="img-fluid rounded">
            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0">Remove</button>
        </div>`);
        $previewContainer.find('button').click(function() {
            $vehicleImage.val("");
            $previewContainer.empty();
            URL.revokeObjectURL(url);
        });
    }

    $vehicleImage.on("change", function() {
        const file = this.files[0];
        if (file) handleFile(file);
    });

    // Vehicle form submit
    $('#vehicleSaveForm').submit(async function(e) {
        e.preventDefault();
        const token = (await cookieStore.get('token'))?.value;
        if (!token) {
            Swal.fire({ icon: "warning", title: "Not Authenticated", text: "User not authenticated!" });
            return;
        }
        if (!$vehicleImage[0].files.length) {
            Swal.fire({ icon: "warning", title: "No Image", text: "Please upload vehicle image!" });
            return;
        }

        const formData = new FormData();
        const category = $vehicleCategory.val();
        formData.append('vehicleCategory', category);
        formData.append('vehicleImage', $vehicleImage[0].files[0]);
        formData.append('vehicleStatus', 'PENDING');
        formData.append('userId', userId);

        if (category === "Bicycle") {
            formData.append('licenseNumber', 'no');
            formData.append('vehicleNumber', 'no');
            formData.append('IDNumber', $('#idNumber').val());
        } else {
            formData.append('licenseNumber', $licenseNumber.val());
            formData.append('vehicleNumber', $vehicleNumber.val());
            formData.append('IDNumber', $('#idNumber').val());
        }

        try {
            await $.ajax({
                url: `${backendUrl}/vehicle/create`,
                method: "POST",
                headers: { 'Authorization': 'Bearer ' + token },
                processData: false,
                contentType: false,
                data: formData
            });
            Swal.fire({ icon: "success", title: "Success", text: "Vehicle saved successfully!" });
            $('#vehicleSaveForm')[0].reset();
            $previewContainer.empty();
            $licenseNumber.closest('.mb-3').show();
            $vehicleNumber.closest('.mb-3').show();
            $riderContainer.hide();
        } catch (err) {
            console.error("Error saving vehicle:", err);
            Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while saving the vehicle!" });
        }
    });

    // ==========================
    // VEHICLE STATUS TOGGLE
    // ==========================
    function updateStatusButton(status) {
        if (status === "Active") {
            $statusToggleBtn.removeClass("btn-danger").addClass("btn-success").text("Active");
        } else {
            $statusToggleBtn.removeClass("btn-success").addClass("btn-danger").text("Inactive");
        }
    }

    $statusToggleBtn.click(async function () {
        const currentStatus = $(this).text().trim();
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
        const token = (await cookieStore.get("token"))?.value;

        try {
            await $.ajax({
                url: `${backendUrl}/vehicle/updateStatus/${userId}`,
                method: "PUT",
                contentType: "application/json",
                headers: { Authorization: `Bearer ${token}` },
                data: JSON.stringify({ vehicleStatus: newStatus })
            });
            updateStatusButton(newStatus);
        } catch (err) {
            console.error("Error updating vehicle status:", err);
        }
    });

    checkUserVehicle();

    // ==========================
    // RIDER ORDERS LOGIC
    // ==========================
    async function fetchRiderOrders() {

        if (!hasValidVehicle) {
            $ordersContainer.html('<div class="alert alert-warning">🚫 Please register your vehicle to view orders.</div>');
            return;
        }

        const token = (await cookieStore.get('token'))?.value;
        if (!token) return;

        try {
            const currentLocation = sessionStorage.getItem("savedLocations")
                        ? JSON.parse(sessionStorage.getItem("savedLocations")).slice(-1)[0]
                        : null;

            const orders = await $.ajax({
                url: `${backendUrl}/orders/rider/orders?userId=${userId}&location=${currentLocation}`,
                method: "GET",
                headers: { 'Authorization': `Bearer ${token}` }
            });

            renderOrders(orders);
        } catch (err) {
            console.error("Error fetching rider orders:", err);
            $ordersContainer.html('<div class="alert alert-danger">Failed to load orders!</div>');
        }
    }

    async function getLocationName(lat, lon) {
        if (!lat || !lon) return "Unknown location";
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const data = await response.json();

            if (data && data.address) {
                // Prefer city/town/village/suburb/locality
                const addr = data.address;
                return addr.city || addr.town || addr.village || addr.suburb || addr.hamlet || addr.locality || "Unknown location";
            }

            // fallback to full display name
            return data.display_name || "Unknown location";
        } catch (err) {
            console.error("Error reverse geocoding:", err);
            return "Unknown location";
        }
    }

    let previousOrderIds = new Set(); // Track previous orders

    async function renderOrders(orders) {
        $ordersContainer.empty(); // clear previous
        if (!orders || orders.length === 0) {
            $ordersContainer.html('<div class="alert alert-info">No new orders at the moment.</div>');
            return;
        }

        for (const order of orders) {
            // Render card immediately with placeholders
            const orderCard = $(`
                <div class="card mb-3 shadow-sm border-success">
                    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <span>New Order!</span>
                        <small>${order.status || "Pending"}</small>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${order.businessName}</h5>
                        <p class="card-text">
                            <strong>Order ID:</strong> ${order.orderId}<br>
                            <strong>Total:</strong> LKR ${order.total}<br>
                            <strong>Delivery Fee:</strong> LKR ${order.deliveryFee}<br>
                            <strong>Payment:</strong> ${order.paymentMethod}<br>
                            <strong>Business Location:</strong> <span class="business-location">Loading...</span><br>
                            <strong>Delivery Location:</strong> <span class="delivery-location">Loading...</span><br>
                        </p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-success btn-sm accept-order-btn" data-id="${order.orderId}">Accept</button>
                            <button class="btn btn-danger btn-sm reject-order-btn" data-id="${order.orderId}">Reject</button>
                        </div>
                    </div>
                </div>
            `);

            $ordersContainer.append(orderCard);

            // Fetch locations asynchronously without blocking the loop
            getLocationName(order.businessLatitude, order.businessLongitude)
                .then(name => orderCard.find('.business-location').text(name));
            getLocationName(order.orderLatitude, order.orderLongitude)
                .then(name => orderCard.find('.delivery-location').text(name));

            // Optional: trigger notification for new orders
            if (!previousOrderIds.has(order.orderId)) {
                previousOrderIds.add(order.orderId);
                if (Notification.permission === "default") Notification.requestPermission();
                if (Notification.permission === "granted") {
                    new Notification("New Order Received!", {
                        body: `Order ID: ${order.orderId} - ${order.businessName}`,
                        icon: "/path/to/icon.png"
                    });
                }
            }
        }

        // Update tracked orders
        previousOrderIds = new Set(orders.map(o => o.orderId));
    }

    // Accept order
    $(document).on('click', '.accept-order-btn', async function () {
        const orderId = $(this).data('id');
        const token = (await cookieStore.get('token'))?.value;

        try {
            await $.ajax({
                url: `${backendUrl}/orders/updateRiderReaction/${orderId}`,
                method: "PUT",
                headers: { 'Authorization': `Bearer ${token}` },
                contentType: "application/json",
                data: JSON.stringify({ RiderReaction: "AcceptedByRider" })
            });
            Swal.fire({ icon: "success", title: "Order Accepted", text: `Order ${orderId} accepted.` });
            fetchRiderOrders();
        } catch (err) {
            console.error("Error accepting order:", err);
            Swal.fire({ icon: "error", title: "Error", text: "Could not accept the order!" });
        }
    });

    // Reject order
    $(document).on('click', '.reject-order-btn', async function () {
        const orderId = $(this).data('id');
        const token = (await cookieStore.get('token'))?.value;

        try {
            await $.ajax({
                url: `${backendUrl}/orders/updateRiderReaction/${orderId}`,
                method: "PUT",
                headers: { 'Authorization': `Bearer ${token}` },
                contentType: "application/json",
                data: JSON.stringify({ RiderReaction: "RejectedByRider" })
            });
            Swal.fire({ icon: "info", title: "Order Rejected", text: `Order ${orderId} rejected.` });
            fetchRiderOrders();
        } catch (err) {
            console.error("Error rejecting order:", err);
            Swal.fire({ icon: "error", title: "Error", text: "Could not reject the order!" });
        }
    });

    // Initial fetch and polling
    fetchRiderOrders();
    setInterval(fetchRiderOrders, 5000);
});