package lk.ijse.gdse72.yummygobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

/**
 * @author Dusan
 * @date 8/26/2025
 */

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "orders")
public class Orders {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long orderId;

    private Long userId;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL)
    private List<OrderDetails> orderDetailsList;

//    private String orderStatus; // e.g., "Pending", "Cooking", "Complete", "Delivery", "Cancelled"
//    private String paymentStatus; // e.g., "Paid", "Unpaid"
//    private String paymentMethod; // e.g., "Cash", "Online Payment"
//    private String rideCost;
//    private String totalAmount;

    private Timestamp createdAt;
    private Timestamp updatedAt;
}
