package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
public class OrdersDTO {
    private String orderId;
    private Long userId;
    private String subTotal;
    private String deliveryFee;
    private String total;
    private List<OrderItemDTO> items;
}
