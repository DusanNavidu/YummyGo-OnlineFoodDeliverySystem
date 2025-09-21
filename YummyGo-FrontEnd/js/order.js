$(document).ready(async function () {
    const backendUrl = "http://localhost:8080";

    // Map each status to an icon
    const statusIcons = {
        "Pending": "⏳",
        "Accepted": "✅",
        "Preparing": "🍳",
        "On the way": "🚚",
        "Delivered": "🎉",
        "Cancelled": "❌"
    };

    // Map each status to a color
    // const statusColors = {
    //     "Pending": "#E0E0E0",       // light gray for upcoming/future
    //     "Accepted": "#FFEB3B",      // bright yellow for current order (attention)
    //     "Preparing": "#FFC107",     // amber, slightly deeper for cooking stage
    //     "On the way": "#03A9F4",    // blue for in-transit
    //     "Delivered": "#4CAF50",     // green for completed
    //     "Cancelled": "#F44336"      // red for cancelled
    // };


    function updateOrderStatusIcons(status, orderId) {
        const container = $(`#order-${orderId}-status`);
        const statuses = ["Pending", "Accepted", "Preparing", "On the way", "Delivered"];

        // Reset all icons
        container.find(".order-icon-container").css("background-color", "#f0f0f0");

        if (status === "Cancelled") {
            container.find(`#order-${orderId}-icon-1`).parent().css("background-color", "red");
            return;
        }

        statuses.forEach((s, idx) => {
            const iconDiv = container.find(`#order-${orderId}-icon-${idx + 1}`).parent();
            if (statuses.indexOf(s) < statuses.indexOf(status)) {
                iconDiv.css("background-color", "#4CAF50"); // completed
            } else if (s === status) {
                iconDiv.css("background-color", "#FFEB3B"); // current
            } else {
                iconDiv.css("background-color", "#E0E0E0"); // future
            }
        });
    }

    async function fetchOrders() {
        const token = (await cookieStore.get("token"))?.value;
        const userId = sessionStorage.getItem("userId");
        if (!userId) return;

        $.ajax({
            method: "GET",
            url: `${backendUrl}/api/v1/orders/orderHistory/${userId}`,
            headers: token ? { Authorization: "Bearer " + token } : {},
            success: function (response) {
                if (response && response.length > 0) {
                    renderOrdersHistory(response);
                }
            },
            error: function (err) {
                console.error("Failed to fetch orders:", err);
            },
        });
    }

    function renderOrdersHistory(orders) {
        let container = $("#orders-history");
        container.empty();
        container.append("<h4>Orders History</h4>");

        orders.forEach((order) => {
            let itemsHtml = order.items
                .map(
                    (i) => `
                <div class="d-flex justify-content-between border p-2 rounded mb-2">
                    <span>${i.itemName}</span>
                    <span>Status: ${order.status}</span>
                    <span>Qty: ${i.quantity}</span>
                    <span>Price: ${i.price}</span>
                </div>`
                )
                .join("");

            let orderHtml = `
                <div class="shadow border p-3 rounded mb-4">
                    <h6>Order ID: ${order.orderId}</h6>

                    <!-- Order Status Icons -->
                    <div id="order-${order.orderId}-status" class="d-flex justify-content-between mt-3">
                        ${["Pending","Accepted","Preparing","On the way","Delivered"].map((s, i) => `
                            <div class="border border-black rounded-2 d-flex justify-content-center align-items-center order-icon-container" style="width:50px;height:50px;">
                                <span id="order-${order.orderId}-icon-${i+1}" style="font-size:24px;">${statusIcons[s]}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-3">${itemsHtml}</div>
                    <p>Subtotal: ${order.subTotal}, Shipping: ${order.deliveryFee}, Total: ${order.total}</p>
                </div>
            `;

            container.append(orderHtml);
            updateOrderStatusIcons(order.status, order.orderId);
        });
    }

    fetchOrders();
});
