package lk.ijse.gdse72.yummygobackend.service;

import lk.ijse.gdse72.yummygobackend.dto.OrdersDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author Dusan
 * @date 9/8/2025
 */

public interface OrdersService {
    void placeOrder(OrdersDTO ordersDTO);

    List<OrdersDTO> getAllThisBusinessOrders(Long businessId);

    @Transactional
    void updateOrderStatus(String orderId, String status);

    @Transactional
    void updateContactPartner(String orderId, String contactPartner);

    @Transactional(readOnly = true)
    List<OrdersDTO> getAllUserOrders(Long userId);
}
