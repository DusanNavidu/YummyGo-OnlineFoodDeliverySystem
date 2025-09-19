package lk.ijse.gdse72.yummygobackend.service.impl;

import lk.ijse.gdse72.yummygobackend.dto.VehicleDTO;
import lk.ijse.gdse72.yummygobackend.entity.Vehicle;
import lk.ijse.gdse72.yummygobackend.repository.VehicleRepository;
import lk.ijse.gdse72.yummygobackend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;


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

    @Override
    public List<VehicleDTO> getVehiclesByUser(Long userId) {
        List<Vehicle> vehicles = vehicleRepository.findByUser_Id(userId);
        return vehicles.stream()
                .map(vehicle -> modelMapper.map(vehicle, VehicleDTO.class))
                .toList();
    }

//    @Override
//    public void updateVehicleStatus(Long userId, String status) {
//        List<Vehicle> vehicles = vehicleRepository.findByUserId(userId);
//        if (vehicles.isEmpty()) {
//            throw new RuntimeException("No vehicles found for user with id: " + userId);
//        }
//
//        vehicles.forEach(vehicle -> {
//            vehicle.setVehicleStatus(status);
//            vehicle.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
//            vehicleRepository.save(vehicle);
//        });
//    }

    @Override
    public void updateVehicleStatus(Long userId, String status) {
        List<Vehicle> vehicles = vehicleRepository.findByUserId(userId);
        if (!vehicles.isEmpty()) {
            Vehicle vehicle = vehicles.get(0); // first vehicle
            vehicle.setVehicleStatus(status);
            vehicle.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            vehicleRepository.save(vehicle);
        }
    }
}