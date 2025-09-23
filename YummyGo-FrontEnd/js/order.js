$(document).ready(async function () {
    const backendUrl = "http://localhost:8080";

    const statusIcons = {
        "Pending": "⏳",
        "Accepted": "✅",
        "Preparing": "🍳",
        "On the way": "🚚",
        "Delivered": "🎉",
        "Cancelled": "❌"
    };

    const statuses = ["Pending", "Accepted", "Preparing", "On the way", "Delivered"];

    function updateOrderStatusIcons(status, orderId) {
        const container = $(`#order-${orderId}-status .status-step`);
        container.removeClass("completed current");

        if (status === "Cancelled") {
            container.first().addClass("current").css("background", "#F44336").text("❌");
            return;
        }

        const currentIndex = statuses.indexOf(status);
        container.each(function (index) {
            if (index < currentIndex) $(this).addClass("completed");
            else if (index === currentIndex) $(this).addClass("current");
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
                } else {
                    $("#orders-history").html(`<h5 class="text-center text-muted">No orders yet 🍔</h5>`);
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
        container.append("<h4 class='mb-4 fw-bold'>My Orders</h4>");

        orders.forEach((order) => {
            let itemsHtml = order.items.map(i => `
                <div class="order-item">
                    <span>${i.itemName} × ${i.quantity}</span>
                    <span>LKR ${i.price}</span>
                </div>`).join("");

            let orderHtml = `
                <div class="order-card">
                    <div class="order-header">Order #${order.orderId}</div>

                    <div id="order-${order.orderId}-status" class="order-status">
                        ${statuses.map((s, i) => `
                            <div class="status-step" id="order-${order.orderId}-icon-${i+1}">
                                ${statusIcons[s]}
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-2">${itemsHtml}</div>

                    <div class="order-summary">
                        <p class="mb-1">Subtotal: <strong>LKR ${order.subTotal}</strong></p>
                        <p class="mb-1">Delivery: <strong>LKR ${order.deliveryFee}</strong></p>
                        <p class="mb-0">Total: <strong>LKR ${order.total}</strong></p>
                    </div>
                </div>
            `;

            container.append(orderHtml);
            updateOrderStatusIcons(order.status, order.orderId);
        });
    }

    fetchOrders();
});
