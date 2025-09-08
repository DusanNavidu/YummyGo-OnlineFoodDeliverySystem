$(document).ready(async function() {
    console.log("Main Business Item Dashboard is ready");

    const backendUrl = "http://localhost:8080";
    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('businessId');
    const userId = sessionStorage.getItem("userId"); 

    if (!businessId) {
        alert("Business not selected!");
        return;
    }

    let cart = [];
    let map, businessMarker, userMarker, routeControl;

    // ======================
    // Logout
    // ======================
    $('#logoutBtn').click(async function () {
        try {
            await cookieStore.delete('token');
            await cookieStore.delete('username');
            sessionStorage.removeItem("cart");
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Error during logout:', error);
            window.location.href = '/index.html';
        }
    });

    // ========================
    // Load Business Profile
    // ========================
    async function loadBusinesProfile() {
        try {
            const token = (await cookieStore.get('token'))?.value;

            $.ajax({
                url: `${backendUrl}/api/v1/business/getBusinessProfile/${businessId}`,
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
                success: function(response) {
                    const business = response.data;
                    if (business) {
                        $('#business-name-profile').text(business.businessName);
                        $('#business-location-profile').text(business.businessAddress);
                        $('#business-open-time-profile').text(business.openTime);
                        $('#business-close-time-profile').text(business.closeTime);
                        $('#business-contact1-profile').text(business.contactNumber1);
                        $('#business-contact2-profile').text(business.contactNumber2);
                        $('#update-latitude').val(business.latitude);
                        $('#update-longitude').val(business.longitude);

                        if (business.businessLogo) {
                            $('#business-logo-profile').html(`<img src="${backendUrl}${business.businessLogo}" 
                                alt="Business Logo" class="img-fluid rounded-circle p-2 border mb-3" style="width: 200px; height: 200px; object-fit: contain;">`);
                        } else {
                            $('#business-logo-profile').html(`<p>No logo available</p>`);
                        }
                        initMap(business.latitude, business.longitude);
                    }
                },
                error: function(xhr, status, error) {
                    console.error("Error fetching business profile:", error);
                }
            });
        } catch (err) {
            console.error("Error fetching token or items:", err);
        }
    }
    loadBusinesProfile();

    // =========================
    // Load Business Items
    // =========================
    async function loadBusinessItems() {
        try {
            const token = (await cookieStore.get('token'))?.value;

            $.ajax({
                url: `${backendUrl}/api/v1/item/getAllThisBusinessItems/${businessId}`,
                method: 'GET',
                headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                success: function (response) {
                    const container = $('#business-items-container');
                    container.empty();

                    if (!response.data || response.data.length === 0) {
                        container.append('<p>No items found for this business.</p>');
                        return;
                    }

                    response.data.forEach((item) => {
                        const isAvailable = item.itemAvailability === 'Available';
                        const cardOpacity = isAvailable ? '1' : '0.5';
                        const buttonDisabled = isAvailable ? '' : 'disabled';
                        const unavailableOverlay = isAvailable ? '' : `
                            <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                                style="background: rgba(255,255,255,0.5); z-index: 10;">
                                <img src="/assets/image/download__4_-removebg-preview.png" alt="Unavailable" 
                                    style="width: 100%; height: 100%; object-fit: contain;">
                            </div>
                        `;

                        container.append(`
                            <div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
                                <div class="shadow border-secondary rounded-3 h-100 p-2 item-card position-relative" style="opacity: ${cardOpacity};">
                                ${unavailableOverlay}
                                    <div class="position-absolute top-0 end-0 m-2 item-cart-page-btn">
                                        <button class="btn btn-dark border-secondary rounded-5 shadow add-to-cart-btn" ${buttonDisabled}
                                            data-item-id="${item.itemId}" 
                                            data-item-name="${item.itemName}" 
                                            data-item-price="${item.itemPrice}"
                                            data-item-image="${item.itemImage}">
                                            +
                                        </button>
                                    </div>
                                    <img src="${backendUrl}${item.itemImage}" class="img-fluid mb-2" 
                                         style="height: 150px; object-fit:contain;">
                                    <div class="card-body d-flex flex-column">
                                        <h5 style="overflow-y:auto; max-height:70px; height:70px; overflow:hidden;">${item.itemName}</h5>
                                        <p style="overflow-y:auto; max-height:50px; height:50px; overflow:hidden;">Item Price: <span class="fst-italic">LKR </span>${item.itemPrice}</p>
                                        <div class="item-description flex-grow-1" style="overflow-y:auto; height:70px; max-height:70px;">
                                            <small class="text-secondary mt-2 mb-3">${item.itemDescription}</small>
                                        </div>
                                        <p class="status-text mt-2">Status: ${item.itemAvailability}</p>
                                    </div>
                                </div>
                            </div>
                        `);
                    });
                },
                error: function (xhr) {
                    console.error("Error loading business items:", xhr.responseText);
                }
            });

        } catch (err) {
            console.error("Error fetching token or items:", err);
        }
    }
    loadBusinessItems();

    // ==============================
    // Cart Logic
    // ==============================
    $(document).on('click', '.add-to-cart-btn', function () {
        const item = {
            id: $(this).data('item-id'),
            name: $(this).data('item-name'),
            price: parseFloat($(this).data('item-price')),
            image: $(this).data('item-image'),
            quantity: 1
        };
        const existing = cart.find(i => i.id === item.id);
        if (existing) existing.quantity++;
        else cart.push(item);
        updateCartTable();
    });

    function updateCartTable() {
        let html = `<table class="table table-bordered">
                <thead class="table-dark">
                    <tr><th>Image</th><th>Name</th><th>Price</th><th>Qty</th><th>Total</th><th>Action</th></tr>
                </thead><tbody>`;
        let total = 0;

        if (cart.length === 0) {
            html += `<tr><td colspan="6" class="text-center">Cart is empty</td></tr>`;
        } else {
            cart.forEach((item, index) => {
                const rowTotal = item.price * item.quantity;
                total += rowTotal;
                html += `
                    <tr>
                        <td><img src="${backendUrl}${item.image}" style="width:50px;height:50px;object-fit:contain;"></td>
                        <td>${item.name}</td>
                        <td>${item.price}</td>
                        <td>
                            <div class="input-group input-group-sm" style="max-width:120px;">
                                <button class="btn btn-outline-secondary decrease-qty" data-index="${index}">-</button>
                                <input type="text" class="form-control text-center item-qty" data-index="${index}" value="${item.quantity}">
                                <button class="btn btn-outline-secondary increase-qty" data-index="${index}">+</button>
                            </div>
                        </td>
                        <td class="row-total">${rowTotal}</td>
                        <td><button class="btn btn-sm btn-danger remove-item" data-index="${index}">X</button></td>
                    </tr>`;
            });
            html += `<tr class="fw-bold"><td colspan="4" class="text-end">Total</td><td colspan="2">LKR <span id="cart-total">${total.toFixed(2)}</span></td></tr>`;
        }

        html += `</tbody></table>`;
        $("#cart-table-container").html(html);
        saveCart();
        updateOrderSummary();
    }

    $(document).on('click', '.remove-item', function () {
        cart.splice($(this).data('index'), 1);
        updateCartTable();
    });
    $(document).on('click', '.increase-qty', function () {
        cart[$(this).data('index')].quantity++;
        updateCartTable();
    });
    $(document).on('click', '.decrease-qty', function () {
        const index = $(this).data('index');
        if (cart[index].quantity > 1) cart[index].quantity--;
        updateCartTable();
    });
    $(document).on('input', '.item-qty', function () {
        let qty = parseInt($(this).val());
        if (isNaN(qty) || qty < 1) qty = 1;
        cart[$(this).data('index')].quantity = qty;
        updateCartTable();
    });

    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) { cart = JSON.parse(savedCart); updateCartTable(); }

    function saveCart() {
        sessionStorage.setItem("cart", JSON.stringify(cart));
    }

    function updateOrderSummary() {
        let subtotal = 0;
        cart.forEach(item => subtotal += item.price * item.quantity);
        let deliveryFee = parseFloat($("#delivery-fee").text()) || 0;
        let total = subtotal + deliveryFee;
        $("#subtotal-amount").text(subtotal.toFixed(2));
        $("#total-amount").text(total.toFixed(2));
    }
    function updateDeliveryFee(newFee) {
        $("#delivery-fee").text(newFee.toFixed(2));
        updateOrderSummary();
    }

    // ==============================
    // Wizard Steps
    // ==============================
    let currentStep = 1, totalSteps = 4;
    function showStep(step) {
        $(".wizard-step").addClass("d-none");
        $(`#step-${step}`).removeClass("d-none");
        $("#prevStepBtn").prop("disabled", step === 1);
        $("#nextStepBtn").toggle(step < totalSteps);
        $("#placeOrderBtn").toggle(step === totalSteps);
        $(".step-circle").removeClass("active");
        $(`.step-indicator[data-step=${step}] .step-circle`).addClass("active");
        if (step === 2) {
            const lat = $('#update-latitude').val(), lng = $('#update-longitude').val();
            initMap(lat || null, lng || null);
        }
    }
    $("#nextStepBtn").click(function () { if (currentStep < totalSteps) { currentStep++; showStep(currentStep); } });
    $("#prevStepBtn").click(function () { if (currentStep > 1) { currentStep--; showStep(currentStep); } });
    $(".step-indicator").click(function () { const step = parseInt($(this).attr("data-step")); if (step <= currentStep) { currentStep = step; showStep(step); } });

    // ==============================
    // Payment method toggle
    // ==============================
    $("input[name='payment-method']").change(function () {
        const method = $(this).val();
        if (method === "card") {
            $("#card-payment-fields").removeClass("d-none");
            $("#paypal-button-container").removeClass("d-none");
            initPayPalButton();
        } else {
            $("#card-payment-fields").addClass("d-none");
            $("#paypal-button-container").addClass("d-none");
        }
    });

    // ==============================
    // PayPal Integration
    // ==============================
    function initPayPalButton() {
        $("#paypal-button-container").empty();
        paypal.Buttons({
            style: { color: 'gold', shape: 'pill', label: 'pay', height: 40 },
            createOrder: function (data, actions) {
                let totalAmount = $("#total-amount").text();
                return actions.order.create({
                    purchase_units: [{ amount: { value: totalAmount } }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    alert("Payment successful! Thank you, " + details.payer.name.given_name);

                    // send to backend
                    $.ajax({
                        url: backendUrl + "/api/v1/order/placeOrder",
                        method: "POST",
                        contentType: "application/json",
                        headers: { "Authorization": "Bearer " + (cookieStore.get('token')?.value || "") },
                        data: JSON.stringify({
                            userId: userId,
                            businessId: businessId,
                            cart: cart,
                            total: $("#total-amount").text(),
                            paymentId: details.id,
                            paymentMethod: "PayPal"
                        }),
                        success: function () {
                            sessionStorage.removeItem("cart");
                            window.location.href = "/success.html";
                        }
                    });
                });
            },
            onError: function (err) {
                console.error("PayPal error:", err);
                alert("Something went wrong with PayPal payment.");
            }
        }).render("#paypal-button-container");
    }

    // ==============================
    // Map + Routing
    // ==============================
    function initMap(businessLat, businessLng) {
        const businessLocation = [businessLat || 6.9271, businessLng || 79.8612];
        if (!map) {
            map = L.map('update-map').setView(businessLocation, 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        } else {
            map.setView(businessLocation, 15);
        }
        if (!businessMarker) {
            businessMarker = L.marker(businessLocation).addTo(map).bindPopup("Business Location").openPopup();
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const userLat = position.coords.latitude, userLng = position.coords.longitude;
                showUserAndRoute(businessLocation, [userLat, userLng]);
            });
        }
        setTimeout(() => map.invalidateSize(), 400);
    }
    function showUserAndRoute(businessLoc, userLoc) {
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker(userLoc, { draggable: true }).addTo(map).bindPopup("Your Location").openPopup();
        showDeliveryRoute(businessLoc, userLoc);
        userMarker.on("dragend", function (e) {
            const newPos = e.target.getLatLng();
            showDeliveryRoute(businessLoc, [newPos.lat, newPos.lng]);
        });
    }
    function showDeliveryRoute(businessLoc, userLoc) {
        if (routeControl) map.removeControl(routeControl);
        routeControl = L.Routing.control({
            waypoints: [L.latLng(businessLoc), L.latLng(userLoc)],
            addWaypoints: false,
            draggableWaypoints: false
        }).addTo(map);
        routeControl.on('routesfound', function (e) {
            const distanceMeters = e.routes[0].summary.totalDistance;
            const distanceKm = distanceMeters / 1000;
            let cost = distanceKm <= 1 ? 100 : 100 + ((distanceKm - 1) * 70);
            const roundedKm = distanceKm.toFixed(2), roundedCost = Math.ceil(cost);
            $("#route-info").html(`<p class="mt-2 text-center fw-bold">Distance: ${roundedKm} km | Delivery Cost: Rs ${roundedCost}</p>`);
            updateDeliveryFee(roundedCost);
        });
    }
});
