package lk.ijse.gdse72.yummygobackend.controller;

import lk.ijse.gdse72.yummygobackend.dto.ItemDTO;
import lk.ijse.gdse72.yummygobackend.dto.VehicleDTO;
import lk.ijse.gdse72.yummygobackend.service.VehicleService;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/vehicle")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class VehicleController {

    private final VehicleService vehicleService;
    private final ModelMapper modelMapper;

//    ------------------- CREATE VEHICLE -------------------
    @PostMapping("/create")
    public ResponseEntity<APIResponse<String>> createVehicle(
            @RequestParam String licenseNumber,
            @RequestParam String IDNumber,
            @RequestParam String vehicleCategory,
            @RequestParam String vehicleNumber,
            @RequestPart("vehicleImage")MultipartFile vehicleImage,
            @RequestParam String vehicleStatus,
            @RequestParam Long userId
    ) {
       try {
           // save image
           String uploadDir = "uploads/vehicle-images/";
           Path uploadPath = Paths.get(uploadDir);
           if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

           String fileName = System.currentTimeMillis() + "_" + vehicleImage.getOriginalFilename();
           Path filePath = uploadPath.resolve(fileName);
           Files.copy(vehicleImage.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create vehicleDTO
            VehicleDTO vehicleDTO = new VehicleDTO();
            vehicleDTO.setLicenseNumber(licenseNumber);
            vehicleDTO.setIDNumber(IDNumber);
            vehicleDTO.setVehicleCategory(vehicleCategory);
            vehicleDTO.setVehicleNumber(vehicleNumber);
            vehicleDTO.setVehicleImage("/uploads/vehicle-images/" + fileName);
            vehicleDTO.setVehicleStatus(vehicleStatus);
            vehicleDTO.setUserId(userId);


           System.out.println("VehicleDTO : " + vehicleDTO);

           vehicleService.saveVehicle(vehicleDTO);
           return ResponseEntity.status(HttpStatus.CREATED)
                   .body(new APIResponse<>(201, "Item Created Successfully", null));

       } catch (IOException e) {
           log.error("Error saving item image", e);
           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(new APIResponse<>(500, "Failed to save item image: " + e.getMessage(), null));
       }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<VehicleDTO>> getVehiclesByUser(@PathVariable Long userId) {
        List<VehicleDTO> vehicles = vehicleService.getVehiclesByUser(userId);
        return ResponseEntity.ok(vehicles);
    }

    // ------------------- UPDATE VEHICLE STATUS -------------------
    @PutMapping("/updateStatus/{userId}")
    public ResponseEntity<?> updateStatus(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String status = body.get("vehicleStatus");
        vehicleService.updateVehicleStatus(userId, status);
        return ResponseEntity.ok(Map.of("message", "Vehicle status updated successfully"));
    }

    @GetMapping("/getAll")
    public Map<String, Object> getAllVehicles(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "5") int size) {

        List<VehicleDTO> vehicles = vehicleService.getAllVehicles(page, size);

        // Counts
        long total = vehicleService.countVehicles();
        long bicycles = vehicles.stream().filter(v -> "Bicycle".equalsIgnoreCase(v.getVehicleCategory())).count();
        long motorcycles = vehicles.stream().filter(v -> "Motorcycle".equalsIgnoreCase(v.getVehicleCategory())).count();
        long scooties = vehicles.stream().filter(v -> "Scooty".equalsIgnoreCase(v.getVehicleCategory())).count();
        long active = vehicles.stream().filter(v -> "Active".equalsIgnoreCase(v.getVehicleStatus())).count();
        long inactive = vehicles.stream().filter(v -> !"Active".equalsIgnoreCase(v.getVehicleStatus())).count();

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", vehicles);
        response.put("currentPage", page);
        response.put("totalPages", (int) Math.ceil((double) total / size));
        response.put("counts", Map.of(
                "total", total,
                "bicycles", bicycles,
                "motorcycles", motorcycles,
                "scooties", scooties,
                "active", active,
                "inactive", inactive
        ));

        return response;
    }
}