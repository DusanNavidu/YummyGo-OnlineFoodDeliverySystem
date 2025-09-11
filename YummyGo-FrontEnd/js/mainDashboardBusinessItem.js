$(document).ready(async function() {
    console.log("Main Business Item Dashboard is ready");

    const backendUrl = "http://localhost:8080";

    // Get businessId from URL or sessionStorage
    let businessId = new URLSearchParams(window.location.search).get('businessId');
    if (businessId) sessionStorage.setItem("businessId", businessId);
    else businessId = sessionStorage.getItem("businessId");

    if (!businessId) { alert("Business not selected!"); return; }

    let cart = [];
    let map, businessMarker, userMarker, routeControl;
    let currentStep = parseInt(sessionStorage.getItem("currentStep")) || 1;
    let mapInitialized = false;

    // ======================
    // Logout
    // ======================
    $('#logoutBtn').click(async function() {
        try {
        // 🔑 Remove auth cookies
        await cookieStore.delete('token');
        await cookieStore.delete('username');

        // 🛒 Remove cart + wizard steps + businessId + location
        sessionStorage.removeItem("cart");
        sessionStorage.removeItem("businessId");
        sessionStorage.removeItem("currentStep");

        // optional: clear delivery fee, subtotal, total (frontend reset)
        $("#cart-table-container").html("");
        $("#subtotal-amount").text("0.00");
        $("#delivery-fee").text("0.00");
        $("#total-amount").text("0.00");
        $("#route-info").html("");

        // optional: clear map + markers
        if (map) {
            if (businessMarker) { map.removeLayer(businessMarker); businessMarker = null; }
            if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
            if (routeControl) { map.removeControl(routeControl); routeControl = null; }
        }
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
        } catch (err) { console.error("Error fetching token or items:", err); }
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
                success: function(response) {
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
                error: function (xhr) { console.error("Error loading business items:", xhr.responseText); }
            });
        } catch (err) { console.error("Error fetching token or items:", err); }
    }
    loadBusinessItems();

    // ==============================
    // Cart Logic
    // ==============================
    $(document).on('click', '.add-to-cart-btn', function() {
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

        if (cart.length === 0) html += `<tr><td colspan="6" class="text-center">Cart is empty</td></tr>`;
        else {
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

    $(document).on('click', '.remove-item', function() { cart.splice($(this).data('index'), 1); updateCartTable(); });
    $(document).on('click', '.increase-qty', function() { cart[$(this).data('index')].quantity++; updateCartTable(); });
    $(document).on('click', '.decrease-qty', function() { const index = $(this).data('index'); if(cart[index].quantity>1) cart[index].quantity--; updateCartTable(); });
    $(document).on('input', '.item-qty', function() { let qty=parseInt($(this).val()); if(isNaN(qty)||qty<1) qty=1; cart[$(this).data('index')].quantity=qty; updateCartTable(); });

    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) { cart = JSON.parse(savedCart); updateCartTable(); }

    function saveCart() { sessionStorage.setItem("cart", JSON.stringify(cart)); }

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

            $('#Order-place-container').show(); $('#business-profile-container').hide(); $('#placeholder-nav-bar').hide();
            setTimeout(() => {
                if (!mapInitialized) {
                    const bLat = parseFloat($('#update-latitude').val()) || 7.8731;
                    const bLng = parseFloat($('#update-longitude').val()) || 80.7718;
                    initMap(bLat, bLng);
                    mapInitialized = true;
                } else map.invalidateSize();
            }, 0);
        } else if (step === 3) {
            $("#prevStepBtn").show();
            $("#nextStepBtn").hide(); 
            $("#placeOrderBtn").hide(); 

            const savedCart = sessionStorage.getItem("cart");
            if (savedCart && cart.length === 0) cart = JSON.parse(savedCart);
            updateCartTable();
            loadOrderSummary();

            const method = $("input[name='payment-method']:checked").val();
            if (method === "card") {
                $("#payBtn").show();
            } else {
                $("#payBtn").hide();
            }
        }
    }

    showStep(currentStep);

    $("#nextStepBtn").click(function() { if(currentStep<3){ currentStep++; showStep(currentStep); } });
    $("#prevStepBtn").click(function() { if(currentStep>1){ currentStep--; showStep(currentStep); } });

    $('#cancelOrderBtn').click(function(){
        $('#Order-place-container').hide(); $('#business-profile-container').show(); $('#placeholder-nav-bar').show();
        currentStep=1; showStep(currentStep); cart=JSON.parse(sessionStorage.getItem('cart'))||[]; updateCartTable();
    });

    // ==============================
    // PayHere Card Payment
    // ==============================
    async function handleCardPayment(e) {
        e.preventDefault();

        const total = parseFloat($("#total-amount").text());
        const orderId = sessionStorage.getItem("orderId");
        if (!orderId) {
            alert("Order ID not found! Please place the order first.");
            return;
        }

        const payment = {
            sandbox: true,
            merchant_id: "1231965",
            return_url: undefined,
            cancel_url: undefined,
            notify_url: `${backendUrl}/api/v1/orders/payment/notify`,
            order_id: orderId,
            items: "Business Order",
            amount: total.toFixed(2),
            currency: "LKR",
            first_name: "Dusan",
            last_name: "Navidu",
            email: "dusansudda@gmail.com",
            phone: "0787777616",
            address: "Saddhathissa mawatha, Walgama, Matara",
            city: "Matara",
            country: "Sri Lanka"
        };

        payhere.startPayment(payment);
    }

    // ==============================
    // PayHere Callbacks
    // ==============================
    payhere.onCompleted = async function(orderId) {
        const userId = (await cookieStore.get("username"))?.value || 1;
        const token = (await cookieStore.get("token"))?.value;
        const total = parseFloat($("#total-amount").text());

        const paymentData = {
            orderId: orderId,
            userId: userId,
            totalAmount: total,
            paymentMethod: "Card",
            paymentStatus: "Completed"
        };

        $.ajax({
            url: `${backendUrl}/api/v1/payments/savePayment`,
            type: "POST",
            contentType: "application/json",
            headers: { "Authorization": "Bearer " + token },
            data: JSON.stringify(paymentData),
            success: function() {
                $("#payment-message").html(`<div class="alert alert-success">Card Payment successful! Order ID: ${orderId}</div>`);
                sessionStorage.removeItem("cart");
                cart = [];
                currentStep = 1;
                showStep(currentStep);
            },
            error: function(xhr) {
                console.error("Error saving card payment:", xhr.responseText);
            }
        });
    };

    payhere.onDismissed = function() {
        $("#payment-message").html(`<div class="alert alert-warning">Card Payment cancelled.</div>`);
    };

    payhere.onError = function(error) {
        $("#payment-message").html(`<div class="alert alert-danger">Payment failed: ${error}</div>`);
    };

    // ==============================
    // Order Summary
    // ==============================
    function loadOrderSummary(){
        let subtotal=0; cart.forEach(i=>subtotal+=i.price*i.quantity);
        let deliveryFee=parseFloat($("#delivery-fee").text()); if(isNaN(deliveryFee)) deliveryFee=0;
        let total=subtotal+deliveryFee;
        $("#subtotal-amount").text(subtotal.toFixed(2));
        $("#total-amount").text(total.toFixed(2));
    }

    function generateOrderId() {
        const ts = Date.now(); // current timestamp
        const username = sessionStorage.getItem("username") || "guest";

        // Encode username to Base64 (short + safe for IDs)
        const encodedUsername = btoa(username).replace(/=/g, "");

        return `ORDER-${ts}-${encodedUsername}`;
    }


    // ==============================
    // Place Order
    // ==============================
    $("#placeOrderBtn").click(async function(e){
        e.preventDefault();

        const token=(await cookieStore.get('token'))?.value;
        
        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Not Authenticated",
                text: "User not authenticated!",
            });
            return;
        }

        if (cart.length === 0) {
            Swal.fire({
                icon: "info",
                title: "Cart is empty",
                text: "Please add items to your cart before placing an order.",
            });
            return;
        }

        const orderId = generateOrderId();
        sessionStorage.setItem("orderId", orderId);

        const userId = sessionStorage.getItem("userId");
        console.log("Placing order:", orderId, userId, cart);
        // const userId = (await cookieStore.get('username'))?.value || 1;

        const orderData={
            orderId: orderId,
            userId: userId, 
            subTotal:parseFloat($("#subtotal-amount").text()), 
            deliveryFee:parseFloat($("#delivery-fee").text()), 
            total:parseFloat($("#total-amount").text()), 
            items:cart.map(i=>
                ({
                    itemId:i.id,
                    quantity:i.quantity,
                    price:i.price
                })
            )
        };
        $.ajax({
            url:`${backendUrl}/api/v1/orders/placeorder`, 
            type:"POST", contentType:"application/json", 
            headers:{'Authorization':'Bearer '+token}, 
            data:JSON.stringify(orderData),
            success:function(response){
                const code=response.code||response.statusCode||0; const message=response.status||response.message||"Something went wrong!";
                if(code===200){ 
                    Swal.fire({
                        icon: "success",
                    title: "Order Placed",
                        text: message,
                    }).then(() => {
                        currentStep = 3;
                        showStep(currentStep);
                    });
                }
                else 
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: message,
                    });
                },
            error:function(xhr){ 
                console.error("Error placing order:",xhr.responseText); 
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong. Try again.",
                });
            }
        });
    });

    // ==============================
    // Payment method toggle
    // ==============================
    $("input[name='payment-method']").change(function () {
        const method = $(this).val();

        if (method === "card") {
            $("#payBtn").show().text("Pay with Card");
            $("#payBtn").off("click").on("click", handleCardPayment);
        } else if (method === "cod") {
            $("#payBtn").show().text("Confirm COD Payment");
            $("#payBtn").off("click").on("click", handleCodPayment);
        }
    });

    // ==============================
    // COD Payment (Pending)
    // ==============================
    async function handleCodPayment(e) {
        e.preventDefault();

        const token = (await cookieStore.get("token"))?.value;
        
        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Not Authenticated",
                text: "User not authenticated!",
            });
            return;
        }

        const userId = sessionStorage.getItem("userId");

        const orderId = sessionStorage.getItem("orderId");
        if (!orderId) {
            Swal.fire({
                icon: "warning",
                title: "Order Not Found",
                text: "Order ID not found! Please place the order first.",
            });
            return;
        }

        const total = parseFloat($("#total-amount").text());

        const paymentData = {
            orderId: orderId,
            userId: userId,
            totalAmount: total,
            paymentMethod: "COD",
            paymentStatus: "Pending"
        };

        console.log("Submitting COD payment:", paymentData);

        $.ajax({
            url: `${backendUrl}/api/v1/payments/savePayment`,
            type: "POST",
            contentType: "application/json",
            headers: { "Authorization": "Bearer " + token },
            data: JSON.stringify(paymentData),
            success: function () {
                Swal.fire({
                    icon: "success",
                    title: "COD Payment Successful",
                    text: "Your order has been placed with Cash on Delivery.",
                });
                window.location.href = '/infomation-pages/success.html'
                sessionStorage.removeItem("cart");
                cart = [];
                currentStep = 1;
                showStep(currentStep);
            },
            error: function (xhr) {
                console.error("Error saving COD payment:", xhr.responseText);
                Swal.fire({
                    icon: "error",
                    title: "Payment Failed",
                    text: xhr.responseText || "COD Payment failed.",
                });            
            }
        });
    }

    // ==============================
    // Map + Routing
    // ==============================
    function initMap(businessLat,businessLng){
        const SL_BOUNDS=L.latLngBounds([5.916,79.652],[9.835,81.881]);
        const centerSL=[7.8731,80.7718];
        const businessLocation=[isFinite(businessLat)?businessLat:centerSL[0], isFinite(businessLng)?businessLng:centerSL[1]];

        if(!map){
            map=L.map('update-map',{center:centerSL,zoom:8,minZoom:7,maxZoom:18,maxBounds:SL_BOUNDS,maxBoundsViscosity:1.0,zoomControl:true});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
        }
        map.fitBounds(SL_BOUNDS);

        if(businessMarker) map.removeLayer(businessMarker);
        businessMarker=L.marker(businessLocation).addTo(map).bindPopup("Business Location").openPopup();

        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(pos){
                const userLoc=[pos.coords.latitude,pos.coords.longitude];
                showUserAndRoute(businessLocation,userLoc);
            },function(){ setTimeout(()=>map.invalidateSize(),0); });
        }
        setTimeout(() => map.invalidateSize(), 0);
    }

    function showUserAndRoute(businessLocation, userLocation) {
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker(userLocation, {icon: L.icon({iconUrl: '/assets/logo/people (1).png', iconSize: [32, 32]})})
            .addTo(map)
            .bindPopup("Your Location")
            .openPopup();

        if (routeControl) map.removeControl(routeControl);
        routeControl = L.Routing.control({
            waypoints: [L.latLng(userLocation[0], userLocation[1]), L.latLng(businessLocation[0], businessLocation[1])],
            lineOptions: { styles: [{ color: 'blue', opacity: 0.6, weight: 4 }] },
            router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
            show: false,
            addWaypoints: false,
            draggableWaypoints: false
        }).addTo(map);

        routeControl.on('routesfound', function(e) {
            const route = e.routes[0];
            const distanceKm = route.summary.totalDistance / 1000; // in km
            const deliveryFee = calculateDeliveryFee(distanceKm);

            // Update delivery fee in order summary
            $("#delivery-fee").text(deliveryFee.toFixed(2));
                loadOrderSummary();

                // Update route info display
            $("#route-info").html(`Distance: <strong>${distanceKm.toFixed(2)} km</strong> / Shipping Fee: <strong>LKR ${deliveryFee.toFixed(2)}</strong>`);
        });
    }

    function calculateDeliveryFee(distanceKm) {
        if (distanceKm <= 5) return 150;
        if (distanceKm <= 10) return 250;
        if (distanceKm <= 20) return 400;
        return 600; // flat max fee
    }
});

