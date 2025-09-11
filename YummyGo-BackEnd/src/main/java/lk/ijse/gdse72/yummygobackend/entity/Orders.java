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
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String orderId;

    private Long userId;

    private String subTotal;
    private String deliveryFee;
    private String total;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetails> orderDetailsList;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    @OneToOne(mappedBy = "orders", cascade = CascadeType.ALL)
    private Payment payment;
}
