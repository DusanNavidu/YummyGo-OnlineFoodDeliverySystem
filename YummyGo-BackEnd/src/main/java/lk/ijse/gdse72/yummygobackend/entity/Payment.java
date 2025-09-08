package lk.ijse.gdse72.yummygobackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private Long userId;
    private String paymentStatus;
    private String paymentMethod;
    private String totalAmount;

    private Timestamp createdAt;

    @OneToOne
    @JoinColumn(name = "order_id", referencedColumnName = "orderId", nullable = false, unique = true)
    private Orders orders;
}

