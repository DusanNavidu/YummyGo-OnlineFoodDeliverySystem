package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemDTO {
    private Long itemId;
    private String itemName;
    private int quantity;
    private String price;
}
