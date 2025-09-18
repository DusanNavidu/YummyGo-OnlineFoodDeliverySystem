package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Builder;
import lombok.Data;

/**
 * @author Dusan
 * @date 9/17/2025
 */

@Data
@Builder
public class OrderHistoryDTO {
    private Long itemId;
    private String itemName;
    private String itemImage;
    private int quantity;
    private String price;
    private Long businessId;
    private String businessName;
}
