package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long itemId;
    private int quantity;
    private String price;
}
