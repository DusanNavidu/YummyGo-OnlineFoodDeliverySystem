package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
@Builder
public class OrdersDTO {
    private String orderId;
    private Long userId;
    private Long businessId;
    private Double subTotal;
    private Double deliveryFee;
    private Double total;
    private Timestamp orderDate;

    // Flattened for frontend
    private List<OrderItemDTO> items;
}