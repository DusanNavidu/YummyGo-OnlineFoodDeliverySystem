$(document).ready(async function() {
    console.log("Main Business Item Dashboard is ready");

    const backendUrl = "http://localhost:8080";

    // Get businessId from URL or sessionStorage
    let businessId = new URLSearchParams(window.location.search).get('businessId');
    if (businessId) {
        sessionStorage.setItem("businessId", businessId);
    } else {
        businessId = sessionStorage.getItem("businessId");
    }

    if (!businessId) {
        alert("Business not selected!");
        return;
    }

    let cart = [];
    let map, businessMarker, userMarker, routeControl;
    let currentStep = parseInt(sessionStorage.getItem("currentStep")) || 1;

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

    // ======================
    // Load Business Profile
    // ======================
    async function loadBusinessProfile() {
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
    loadBusinessProfile();

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
        loadOrderSummary();
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

    // ==============================
    // Wizard Steps
    // ==============================
    function showStep(step) {
        sessionStorage.setItem("currentStep", step);
        $(".wizard-step").addClass("d-none");
        $("#step-" + step).removeClass("d-none");

        $(".step-indicator").removeClass("active");
        $(`.step-indicator[data-step="${step}"]`).addClass("active");

        if (step === 1) {
            $("#prevStepBtn").hide();
            $("#nextStepBtn").show();
            $("#placeOrderBtn").hide();
            $("#payBtn").hide();
        } else if (step === 2) {
            $("#prevStepBtn").show();
            $("#nextStepBtn").hide();
            $("#placeOrderBtn").show();
            $("#payBtn").hide();
        } else if (step === 3) {
            $("#prevStepBtn").show();
            $("#nextStepBtn").hide();
            $("#placeOrderBtn").hide();
            $("#payBtn").show();
        }
    }

    showStep(currentStep);

    $("#nextStepBtn").click(function () {
        if (currentStep < 3) {
            currentStep++;
            showStep(currentStep);
        }
    });

    $("#prevStepBtn").click(function () {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    $('#cancelOrderBtn').click(function() {
        // Hide the order wizard
        $('#Order-place-container').hide();

        // Show the business profile container
        $('#business-profile-container').show();

        // Show navbar again if it was hidden
        $('#placeholder-nav-bar').show();

        // Reset wizard to step 1
        currentStep = 1;
        showStep(currentStep);

        // Restore cart if needed
        cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        updateCartTable();
    });

    // ==============================
    // Order Summary
    // ==============================
    function loadOrderSummary() {
        let subtotal = 0;
        cart.forEach(item => subtotal += item.price * item.quantity);
        let deliveryFee = parseFloat($("#delivery-fee").text()) || 0;
        let total = subtotal + deliveryFee;

        $("#subtotal-amount").text(subtotal.toFixed(2));
        $("#total-amount").text(total.toFixed(2));
    }

    // ==============================
    // Place Order
    // ==============================
    $("#placeOrderBtn").click(async function(e){
        e.preventDefault();

        const token = (await cookieStore.get('token'))?.value;
        if (!token) { alert("User not authenticated!"); return; }

        if(cart.length === 0) {
            $("#order-message").html('<div class="alert alert-warning">Cart is empty. Add items to cart.</div>');
            return;
        }

        const userId = await cookieStore.get('username'); // Replace with actual userId logic

        const orderData = {
            userId: userId?.value || 1,
            subTotal: parseFloat($("#subtotal-amount").text()),
            deliveryFee: parseFloat($("#delivery-fee").text()),
            total: parseFloat($("#total-amount").text()),
            items: cart.map(i => ({
                itemId: i.id,
                quantity: i.quantity,
                price: i.price
            }))
        };

        $.ajax({
            url: `${backendUrl}/api/v1/orders/placeorder`,
            type: "POST",
            contentType: "application/json",
            headers: { 'Authorization': 'Bearer ' + token },
            data: JSON.stringify(orderData),
            success: function (response) {
                console.log("Raw response:", response); // DEBUG

                const code = response.code || response.statusCode || 0;
                const message = response.status || response.message || "Something went wrong!";

                if (code === 200) {
                    $("#order-message").html(`<div class="alert alert-success">${message}</div>`);
                    cart = [];
                    updateCartTable();
                    sessionStorage.removeItem("cart");
                    currentStep = 3;
                    showStep(currentStep);
                    initPayPalButton();
                    console.log("Order Response:", response);
                } else {
                    $("#order-message").html(`<div class="alert alert-danger">${message}</div>`);
                }
            },
            error: function(xhr) {
                console.error("Error placing order:", xhr.responseText);
                $("#order-message").html('<div class="alert alert-danger">Something went wrong. Try again.</div>');
            }
        });
    });

    // ==============================
    // Payment method toggle
    // ==============================
    $("input[name='payment-method']").change(function () {
        const method = $(this).val();
        if (method === "card") {
            $("#card-payment-fields").removeClass("d-none");
            $("#paypal-button-container").removeClass("d-none");
        } else {
            $("#card-payment-fields").addClass("d-none");
            $("#paypal-button-container").addClass("d-none");
        }
    });

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
            $("#delivery-fee").text(roundedCost.toFixed(2));
            loadOrderSummary();
        });
    }

    // ==============================
    // PayPal Button Init
    // ==============================
    function initPayPalButton() {
        $("#paypal-button-container").empty();
        if (typeof paypal === "undefined") return;

        paypal.Buttons({
            createOrder: function(data, actions) {
                let total = parseFloat($("#total-amount").text());
                return actions.order.create({
                    purchase_units: [{ amount: { value: total.toFixed(2) } }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    alert("Payment completed by " + details.payer.name.given_name);
                });
            }
        }).render('#paypal-button-container');
    }
});

function resetWizard() {
    cart = [];
    updateCartTable();
    currentStep = 1;
    sessionStorage.removeItem("currentStep");
    showStep(currentStep);
}
