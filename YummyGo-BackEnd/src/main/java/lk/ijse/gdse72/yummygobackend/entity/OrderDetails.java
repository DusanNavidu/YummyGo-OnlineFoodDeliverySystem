package lk.ijse.gdse72.yummygobackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

/**
 * @author Dusan
 * @date 8/26/2025
 */

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "order_details")
public class OrderDetails {

    @EmbeddedId
    private OrderDetailsID orderDetailsID;

    private Integer quantity;
    private String price;

    @MapsId("orderId")
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Orders orders;

    @MapsId("itemId")
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;
}
