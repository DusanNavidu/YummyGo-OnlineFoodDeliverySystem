package lk.ijse.gdse72.yummygobackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

/**
 * @author Dusan
 * @date 8/20/2025
 */

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ItemDTO {

    private Long itemId;

    @NotBlank(message = "Item name cannot be blank")
    private String itemName;

    @NotBlank(message = "Item price cannot be blank")
    @Pattern(regexp = "^[0-9]+(\\.[0-9]{1,2})?$", message = "Item price must be a valid number with up to two decimal places")
    private String itemPrice;

    @NotBlank(message = "Item category cannot be blank")
    private String itemCategory;

    @NotBlank(message = "Item description cannot be blank")
    private String itemDescription;

    @NotBlank(message = "Item image cannot be blank")
    private String itemImage;

    @NotBlank(message = "Item status cannot be blank")

    private String itemStatus;
    private String itemAvailability;
    private Long businessId;    // maps to Business.businessId

    private Timestamp createdAt;
    private Timestamp updatedAt;
}
