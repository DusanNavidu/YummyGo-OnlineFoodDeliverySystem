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

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailsID implements Serializable {
    private String orderId;
    private Long itemId;
}
