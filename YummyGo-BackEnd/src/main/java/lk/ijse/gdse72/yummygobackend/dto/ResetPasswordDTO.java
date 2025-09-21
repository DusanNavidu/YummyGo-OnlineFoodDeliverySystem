package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Data;

/**
 * @author Dusan
 * @date 9/21/2025
 */

@Data
public class ResetPasswordDTO {
    private String token;      // reset token from email
    private String newUsername;
    private String newPassword;
}
