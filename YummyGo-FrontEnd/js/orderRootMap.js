$(document).ready(async function () {
    console.log("orderRootMap.js loaded");

    const backendUrl = "http://localhost:8080/api/v1";

    // get orderId from sessionStorage
    let orderId = sessionStorage.getItem("acceptedOrderId");
    console.log("Order ID:", orderId);

    if (!orderId) {
        Swal.fire({ icon: "warning", title: "No Order", text: "No accepted order found!" });
        window.location.href = "/pages/partnerDashboard.html";
        return;
    }

    const token = (await cookieStore.get("token"))?.value;
    if (!token) return;

    // fetch order details
    const orderData = await fetch(`${backendUrl}/orders/${orderId}/riderDetails`, {
        headers: { "Authorization": "Bearer " + token }
    }).then(r => r.json());

    console.log("Order details:", orderData);

    const $details = $('#order-details');
    $details.html(`
        <div class="order-card">
            <h5>Order Details</h5>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Business Name:</strong> ${orderData.businessName}</p>
            <p><strong>Total Amount:</strong> LKR ${orderData.total}</p>
            <p><strong>Delivery Fee:</strong> LKR ${orderData.deliveryFee}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
            <p><strong>Business Address:</strong> ${orderData.businessAddress || 'N/A'}</p>
            <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress || 'N/A'}</p>
            <hr>
            <p><strong>Customer Info</strong></p>
            <p>${orderData.userPhone || 'N/A'} | ${orderData.userEmail || 'N/A'} | ${orderData.clientName || 'N/A'}</p>
            ${orderData.status === "Delivered" ? '<button id="payment-success-btn" class="btn btn-info btn-sm mb-2">Payment Successful</button>' : ''}
        </div>
    `);

    $("#payment-success-btn").click(async function() {
        const orderId = sessionStorage.getItem("acceptedOrderId");
        const token = (await cookieStore.get("token"))?.value;

        try {
            await fetch(`http://localhost:8080/api/v1/payments/updateStatus/${orderId}`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            Swal.fire({
                icon: "success",
                title: "Payment Completed!",
                text: "Payment status updated successfully."
            });

            // Redirect to partner dashboard
            window.location.href = "/pages/partnerDashboard.html";

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to update payment status!"
            });
        }
    });

    // extract coordinates
    const businessLoc = [orderData.businessLatitude, orderData.businessLongitude];
    const deliveryLoc = [orderData.orderLatitude, orderData.orderLongitude];

    // init map
    let map = L.map("root-map").setView(businessLoc, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Map data © OpenStreetMap contributors",
    }).addTo(map);

    let riderMarker, routingControl;

    // custom icons
    const bikeIcon = L.icon({
        iconUrl: '/assets/logo/delivery-boy-top-view-illustration-600nw-2261359959-removebg-preview.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });

    const shopIcon = L.icon({
        iconUrl: '/assets/logo/6680408-removebg-preview.png',
        iconSize: [20, 20],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    const packageIcon = L.icon({
        iconUrl: '/assets/logo/people (1).png',
        iconSize: [20, 20],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    // add static markers for business & delivery
    L.marker(businessLoc, { icon: shopIcon }).addTo(map).bindPopup("Business Pickup");
    L.marker(deliveryLoc, { icon: packageIcon }).addTo(map).bindPopup("Delivery Location");

    function updateRoute(riderLatLng) {
        if (routingControl) map.removeControl(routingControl);

        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(riderLatLng.lat, riderLatLng.lng),
                L.latLng(businessLoc[0], businessLoc[1]),
                L.latLng(deliveryLoc[0], deliveryLoc[1])
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: () => null // ❌ prevent blue default markers
        }).addTo(map);
    }

    // live track rider
    navigator.geolocation.watchPosition(
        pos => {
            const riderLatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };

            if (!riderMarker) {
                riderMarker = L.marker([riderLatLng.lat, riderLatLng.lng], { icon: bikeIcon })
                    .addTo(map)
                    .bindPopup("Rider Location")
                    .openPopup();
                map.setView([riderLatLng.lat, riderLatLng.lng], 15);
            } else {
                riderMarker.setLatLng([riderLatLng.lat, riderLatLng.lng]);
            }

            updateRoute(riderLatLng);
        },
        err => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    // complete delivery
    $("#completeDeliveryBtn").click(async function () {
        try {
            await fetch(`${backendUrl}/orders/updateStatus/${orderId}`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: "Delivered" })
            });
            Swal.fire({ icon: "success", title: "Delivery Completed!" });
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Error", text: "Failed to complete delivery!" });
        }
    });
});
