package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Data;

import java.sql.Timestamp;

/**
 * @author Dusan
 * @date 8/6/2025
 */

@Data

public class RegisterDTO {
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
