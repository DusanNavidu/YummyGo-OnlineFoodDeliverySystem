package lk.ijse.gdse72.yummygobackend.service.impl;

import lk.ijse.gdse72.yummygobackend.dto.VehicleDTO;
import lk.ijse.gdse72.yummygobackend.entity.Vehicle;
import lk.ijse.gdse72.yummygobackend.repository.VehicleRepository;
import lk.ijse.gdse72.yummygobackend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ModelMapper modelMapper;

    @Override
    public void saveVehicle(VehicleDTO vehicleDTO) {
        if (vehicleDTO.getVehicleStatus() == null) {
            vehicleDTO.setVehicleStatus("Active");
        }

        Vehicle vehicle = modelMapper.map(vehicleDTO, Vehicle.class);
        vehicle.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        vehicle.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        vehicleRepository.save(vehicle);
    }
}