package lk.ijse.gdse72.yummygobackend.service;

import lk.ijse.gdse72.yummygobackend.dto.OrdersDTO;

import java.util.List;

/**
 * @author Dusan
 * @date 9/8/2025
 */

public interface OrdersService {
    void placeOrder(OrdersDTO ordersDTO);

    List<OrdersDTO> getAllThisBusinessOrders(Long businessId);
}
