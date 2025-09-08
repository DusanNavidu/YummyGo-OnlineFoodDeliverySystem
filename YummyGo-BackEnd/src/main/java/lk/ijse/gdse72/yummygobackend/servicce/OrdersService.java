package lk.ijse.gdse72.yummygobackend.servicce;

import lk.ijse.gdse72.yummygobackend.dto.OrdersDTO;
import lk.ijse.gdse72.yummygobackend.entity.Orders;

/**
 * @author Dusan
 * @date 9/8/2025
 */

public interface OrdersService {
    void placeOrder(OrdersDTO ordersDTO);
}
