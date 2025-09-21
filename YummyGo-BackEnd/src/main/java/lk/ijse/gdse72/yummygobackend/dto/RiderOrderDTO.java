package lk.ijse.gdse72.yummygobackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

/**
 * @author Dusan
 * @date 9/18/2025
 */

@Data
@AllArgsConstructor
public class RiderOrderDTO {
    private String orderId;
    private String businessName;
    private String clientName;
    private String status;
    private String total;
    private String deliveryFee;
    private BigDecimal orderLongitude;
    private BigDecimal orderLatitude;
    private String paymentMethod;
    private BigDecimal businessLongitude;
    private BigDecimal businessLatitude;
    private String deliveryAddress;
    private String userPhone;
    private String userEmail;
}