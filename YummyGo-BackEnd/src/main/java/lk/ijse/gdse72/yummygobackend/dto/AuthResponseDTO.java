package lk.ijse.gdse72.yummygobackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author Dusan
 * @date 7/21/2025
 */

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String role;
    private Long userId;
}