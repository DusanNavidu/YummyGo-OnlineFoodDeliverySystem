package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Data
@Builder
public class OrdersDTO {
    private String orderId;
    private Long userId;
    private Long businessId;
    private String deliveryAddress;
    private Double subTotal;
    private Double deliveryFee;
    private Double total;
    private String status;  //  Pending, Accepted, Preparing, On the way, Delivered, Cancelled
    private String contactPartner;
    private String RiderReaction; // AcceptedByRider, RejectedByRider
    private Long riderId;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private Timestamp orderDate;

    // Flattened for frontend
    private List<OrderItemDTO> items;
}