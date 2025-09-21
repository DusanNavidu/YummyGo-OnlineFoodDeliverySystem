package lk.ijse.gdse72.yummygobackend.controller;

import lk.ijse.gdse72.yummygobackend.dto.BusinessDTO;
import lk.ijse.gdse72.yummygobackend.entity.Business;
import lk.ijse.gdse72.yummygobackend.service.BusinessService;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;


import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Dusan
 * @date 8/20/2025
 */

@RestController
@RequestMapping("/api/v1/business")
@RequiredArgsConstructor
@CrossOrigin
@Slf4j
public class BusinessController {

    private final BusinessService businessService;
    private final ModelMapper modelMapper;

    @PostMapping("/create")
    public ResponseEntity<APIResponse<String>> createBusiness(
            @RequestParam String businessName,
            @RequestParam String contactNumber1,
            @RequestParam String contactNumber2,
            @RequestParam String businessEmail,
            @RequestParam String businessAddress,
            @RequestParam String businessAreaPostalCode,
            @RequestParam String businessCategory,
            @RequestParam String openTime,
            @RequestParam String closeTime,
            @RequestParam String openOrClose,
            @RequestParam String businessDescription,
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam String businessStatus,
            @RequestParam Long userId,
            @RequestPart("logo") MultipartFile logoFile
    ) {
        try {
            // Save logo
            String uploadDir = "uploads/business-logos/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String fileName = System.currentTimeMillis() + "_" + logoFile.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(logoFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Map to DTO
            BusinessDTO businessDTO = new BusinessDTO();
            businessDTO.setBusinessName(businessName);
            businessDTO.setContactNumber1(contactNumber1);
            businessDTO.setContactNumber2(contactNumber2);
            businessDTO.setBusinessEmail(businessEmail);
            businessDTO.setBusinessAddress(businessAddress);
            businessDTO.setBusinessAreaPostalCode(businessAreaPostalCode);
            businessDTO.setBusinessCategory(businessCategory);
            businessDTO.setOpenTime(openTime);
            businessDTO.setCloseTime(closeTime);
            businessDTO.setOpenOrClose(openOrClose);
            businessDTO.setBusinessDescription(businessDescription);
            businessDTO.setLatitude(latitude);
            businessDTO.setLongitude(longitude);
            businessDTO.setBusinessStatus(businessStatus);
            businessDTO.setBusinessLogo("/uploads/business-logos/" + fileName);
            businessDTO.setUserId(userId);

            System.out.println("Business DTO: " + businessDTO);

            businessService.SaveBusiness(businessDTO);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new APIResponse<>(201, "Business Created Successfully", null));

        } catch (IOException e) {
            log.error("Error saving business logo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Error saving file", null));
        }
    }
    @GetMapping("/getAll")
    public ResponseEntity<?> getAllBusinesses(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "5") int size) {
        Page<BusinessDTO> businessPage = businessService.getAllBusinesses(page, size);

        return ResponseEntity.ok().body(
                new ApiResponse<>(200, "Success", businessPage.getContent(),
                        businessPage.getTotalElements(),
                        businessPage.getTotalPages(),
                        businessPage.getNumber())
        );
    }

    // DTO wrapper for pagination response
    public record ApiResponse<T>(
            int code,
            String message,
            T data,
            long totalItems,
            int totalPages,
            int currentPage
    ) {}

    @GetMapping("/getAllThisUserBusinesses")
    public ResponseEntity<APIResponse<List<BusinessDTO>>> getAllThisUserBusinesses(@RequestParam Long userId) {
        try {
            List<Business> businesses = businessService.getBusinessesByUserId(userId);
            List<BusinessDTO> businessDTOs = businesses.stream()
                    .map(b -> modelMapper.map(b, BusinessDTO.class))
                    .toList();

            return ResponseEntity.ok(new APIResponse<>(200, "User businesses fetched successfully", businessDTOs));

        } catch (Exception e) {
            log.error("Error fetching user businesses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Error fetching user businesses", null));
        }
    }

    @GetMapping("/getAllBusinessThisCategory")
    public ResponseEntity<APIResponse<List<BusinessDTO>>> getAllBusinessThisCategory(
            @RequestParam String location) {
        try {
            List<Business> businesses = businessService.getBusinessesByLocation(location);
            List<BusinessDTO> businessDTOs = businesses.stream()
                    .map(b -> modelMapper.map(b, BusinessDTO.class))
                    .toList();

            return ResponseEntity.ok(new APIResponse<>(200, "Businesses fetched successfully", businessDTOs));

        } catch (Exception e) {
            log.error("Error fetching businesses by location", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Error fetching businesses", null));
        }
    }

    @GetMapping("/getAllBusinesSearch/{keyword}")
    public ResponseEntity<APIResponse<List<BusinessDTO>>> searchBusiness(
            @PathVariable String keyword, @RequestParam String location) {
        try {
            List<Business> businesses = businessService.getBusinessesByKeyword(keyword, location);
            List<BusinessDTO> businessDTOs = businesses.stream()
                    .map(b -> modelMapper.map(b, BusinessDTO.class))
                    .toList();

            return ResponseEntity.ok(new APIResponse<>(200, "Businesses search successfully", businessDTOs));

        } catch (Exception e) {
            log.error("Error searching businesses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Error searching businesses", null));
        }
    }

    @GetMapping("/getBusinessProfile/{businessId}")
    public ResponseEntity<APIResponse<BusinessDTO>> getBusinessProfile(@PathVariable Long businessId) {
        try {
            return businessService.getBusinessProfile(businessId)
                    .map(b -> modelMapper.map(b, BusinessDTO.class))
                    .map(businessDTO -> ResponseEntity.ok(new APIResponse<>(200, "Business profile fetched successfully", businessDTO)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new APIResponse<>(404, "Business not found", null)));

        } catch (Exception e) {
            log.error("Error fetching business profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Error fetching business profile", null));
        }
    }
}
