package lk.ijse.gdse72.yummygobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    private String deliveryAddress;
    private String subTotal;
    private String deliveryFee;
    private String total;
    private String status;  //  Pending, Accepted, Preparing, On the way, Delivered, Cancelled
    private String contactPartner; // Pending, Rider Called
    private String RiderReaction; // Pending, AcceptedByRider, RejectedByRider
    private String riderId;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetails> orderDetailsList;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    @OneToOne(mappedBy = "orders", cascade = CascadeType.ALL)
    private Payment payment;
}
