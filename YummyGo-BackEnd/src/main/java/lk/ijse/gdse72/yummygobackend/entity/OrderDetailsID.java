package lk.ijse.gdse72.yummygobackend.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * @author Dusan
 * @date 8/26/2025
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class OrderDetailsID implements Serializable {
    private Long orderId;
    private Long itemId;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
