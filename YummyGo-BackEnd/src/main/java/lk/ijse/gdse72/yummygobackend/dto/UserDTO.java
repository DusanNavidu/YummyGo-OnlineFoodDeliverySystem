package lk.ijse.gdse72.yummygobackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

/**
 * @author Dusan
 * @date 9/5/2025
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDTO {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String username;
    private String password;
    private String userStatus; // "Active" or "Inactive"
    private String role;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
