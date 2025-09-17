package lk.ijse.gdse72.yummygobackend.dto;

import lombok.Data;

import java.sql.Timestamp;

/**
 * @author Dusan
 * @date 9/13/2025
 */

@Data
public class VehicleDTO {
    private Long vehicleId;
    private String licenseNumber;
    private String IDNumber;
    private String vehicleCategory;
    private String vehicleNumber;
    private String vehicleImage;
    private String vehicleStatus;
    private Long userId;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}