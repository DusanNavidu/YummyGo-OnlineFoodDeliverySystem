package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * @author Dusan
 * @date 9/8/2025
 */

@Data
public class PaymentDTO {
    private Long paymentId;
    private Long userId;
    private String paymentStatus; // e.g., "Paid", "Unpaid", "Pending"
    private String paymentMethod; // e.g., "Cash on Delivery", "Credit/Debit Card"
    private BigDecimal totalAmount;
    private String orderId;

    private Timestamp createdAt;
}
