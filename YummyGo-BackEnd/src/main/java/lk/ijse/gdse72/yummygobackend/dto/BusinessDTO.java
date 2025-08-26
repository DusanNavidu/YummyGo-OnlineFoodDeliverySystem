package lk.ijse.gdse72.yummygobackend.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BusinessDTO {

    private Long businessId;

    @NotBlank(message = "Business name cannot be blank")
    private String businessName;

    @NotBlank(message = "Contact number 1 cannot be blank")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number 1 must have exactly 10 digits")
    private String contactNumber1;

    @NotBlank(message = "Contact number 2 cannot be blank")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number 2 must have exactly 10 digits")
    private String contactNumber2;

    @NotBlank(message = "Business email cannot be blank")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Invalid email format")
    private String businessEmail;

    @NotBlank(message = "Business address cannot be blank")
    private String businessAddress;

    @NotBlank(message = "Business area postal code cannot be blank")
    @Pattern(regexp = "^[0-9]{5}$", message = "Business area postal code must have exactly 5 digits")
    private String businessAreaPostalCode;

    @NotBlank(message = "Business category cannot be blank")
    private String businessCategory;

    @NotBlank(message = "Business logo cannot be blank")
    private String businessLogo;

    @NotBlank(message = "Open time cannot be blank")
    private String openTime;

    @NotBlank(message = "Close time cannot be blank")
    private String closeTime;

    private String openOrClose;

    @NotBlank(message = "Business description cannot be blank")
    private String businessDescription;

    @NotBlank(message = "Latitude cannot be blank")
    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @NotBlank(message = "Longitude cannot be blank")
    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    private String businessStatus;

    private Long userId; // maps to User.id

    private Timestamp createdAt;
    private Timestamp updatedAt;
}
