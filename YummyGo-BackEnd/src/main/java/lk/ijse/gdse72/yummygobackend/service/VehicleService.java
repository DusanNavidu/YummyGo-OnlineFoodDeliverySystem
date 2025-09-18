package lk.ijse.gdse72.yummygobackend.service;

import lk.ijse.gdse72.yummygobackend.dto.VehicleDTO;

import java.util.List;

/**
 * @author Dusan
 * @date 9/15/2025
 */

public interface VehicleService {

    void saveVehicle(VehicleDTO vehicleDTO);

    List<VehicleDTO> getVehiclesByUser(Long userId);

    void updateVehicleStatus(Long userId, String status);
}
