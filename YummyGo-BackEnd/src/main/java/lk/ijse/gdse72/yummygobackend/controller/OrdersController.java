package lk.ijse.gdse72.yummygobackend.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lk.ijse.gdse72.yummygobackend.dto.OrdersDTO;
import lk.ijse.gdse72.yummygobackend.servicce.OrdersService;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
//        System.out.println(ordersDTO);
//        System.out.println("Order placed successfully");
//        System.out.println(httpServletResponse);
        return ResponseEntity.ok(new APIResponse<>(200, "Order placed successfully", null));
    }
}