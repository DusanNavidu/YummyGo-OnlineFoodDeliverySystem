package lk.ijse.gdse72.yummygobackend.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lk.ijse.gdse72.yummygobackend.dto.OrdersDTO;
import lk.ijse.gdse72.yummygobackend.dto.RiderOrderDTO;
import lk.ijse.gdse72.yummygobackend.service.OrdersService;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * @author Dusan
 * @date 9/8/2025
 */

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@CrossOrigin
public class OrdersController {

    private final OrdersService ordersService;

    @PostMapping("/placeorder")
    public ResponseEntity<APIResponse<String>> placeOrder(@RequestBody @Valid OrdersDTO ordersDTO, HttpServletResponse httpServletResponse) {
        ordersService.placeOrder(ordersDTO);
        return ResponseEntity.ok(new APIResponse<>(200, "Order placed successfully", null));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<OrdersDTO>> getOrdersForBusiness(@PathVariable Long businessId) {
        return ResponseEntity.ok(ordersService.getAllThisBusinessOrders(businessId));
    }

    @GetMapping("/orderHistory/{userId}")
    public ResponseEntity<List<OrdersDTO>> orderHistory(@PathVariable Long userId) {
        List<OrdersDTO> orders = ordersService.getAllUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/updateStatus/{orderId}")
    public ResponseEntity<APIResponse<String>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody OrdersDTO ordersDTO) {
        try {
            ordersService.updateOrderStatus(orderId, ordersDTO.getStatus());
            return ResponseEntity.ok(new APIResponse<>(200, "Order status updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new APIResponse<>(500, "Error updating order status: " + e.getMessage(), null));
        }
    }

    @PutMapping("/updateContactPartner/{orderId}")
    public ResponseEntity<APIResponse<String>> updateContactPartner(
            @PathVariable String orderId,
            @RequestBody OrdersDTO ordersDTO) {
        try {
            ordersService.updateContactPartner(orderId, ordersDTO.getContactPartner());
            return ResponseEntity.ok(new APIResponse<>(200, "Contact partner updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new APIResponse<>(500, "Error updating contact partner: " + e.getMessage(), null));
        }
    }

    @GetMapping("/rider/orders")
    public ResponseEntity<List<RiderOrderDTO>> getOrdersForRider(
            @RequestParam Long userId,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(ordersService.getAllOrdersForRiders(userId, location));
    }

    @PutMapping("/updateRiderReaction/{orderId}")
    public ResponseEntity<APIResponse<String>> updateRiderReaction(
            @PathVariable String orderId,
            @RequestBody Map<String, String> payload,
            @RequestParam String riderId) { // add riderId param
        String reaction = payload.get("RiderReaction");
        ordersService.updateRiderReaction(orderId, reaction, riderId);
        return ResponseEntity.ok(new APIResponse<>(200, "Rider reaction updated", null));
    }

    @GetMapping("/{orderId}/riderDetails")
    public ResponseEntity<RiderOrderDTO> getOrderDetailsForRider(@PathVariable String orderId) {
        return ResponseEntity.ok(ordersService.getOrderDetailsForRider(orderId));
    }
}