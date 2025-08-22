package lk.ijse.gdse72.yummygobackend.controller;

import lk.ijse.gdse72.yummygobackend.dto.ApiResponse;
import lk.ijse.gdse72.yummygobackend.dto.ItemDTO;
import lk.ijse.gdse72.yummygobackend.entity.Item;
import lk.ijse.gdse72.yummygobackend.servicce.ItemService;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

/**
 * @author Dusan
 * @date 8/20/2025
 */

@RestController
@RequestMapping("/api/v1/item")
@RequiredArgsConstructor
@CrossOrigin
@Slf4j
public class ItemController {

    private final ItemService itemService;
    private final ModelMapper modelMapper;

    @PostMapping("/create")
    public ResponseEntity<APIResponse<String>> createItem(
            @RequestParam String itemName,
            @RequestParam String itemPrice,
            @RequestParam String itemCategory,
            @RequestParam String itemDescription,
            @RequestParam String itemStatus,
            @RequestParam String itemAvailability,
            @RequestParam Long businessId,
            @RequestPart("itemImage") MultipartFile logoFile
    ) {
        try {
            // save image
            String uploadDir = "uploads/item-images/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String fileName = System.currentTimeMillis() + "_" + logoFile.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(logoFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create ItemDTO
            ItemDTO itemDTO = new ItemDTO();
            itemDTO.setItemName(itemName);
            itemDTO.setItemPrice(itemPrice);
            itemDTO.setItemCategory(itemCategory);
            itemDTO.setItemDescription(itemDescription);
            itemDTO.setItemStatus(itemStatus);
            itemDTO.setItemAvailability(itemAvailability);
            itemDTO.setItemImage("/uploads/item-images/" + fileName);
            itemDTO.setBusinessId(businessId);

            System.out.println("ItemDTO: " + itemDTO);

            itemService.saveItem(itemDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new APIResponse<>(201, "Item Created Successfully", null));
        } catch (IOException e) {
            log.error("Error saving item image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Failed to save item image: " + e.getMessage(), null));
        }
    }

    // ------------------- UPDATE ITEM -------------------
    @PutMapping("/update")
    public ResponseEntity<APIResponse<String>> updateItem(
            @RequestParam Long itemId,
            @RequestParam String itemName,
            @RequestParam String itemPrice,
            @RequestParam String itemCategory,
            @RequestParam String itemDescription,
            @RequestParam String itemStatus,
            @RequestParam String itemAvailability,
            @RequestPart(required = false) MultipartFile itemImage
    ) {
        try {
            ItemDTO itemDTO = new ItemDTO();
            itemDTO.setItemId(itemId);
            itemDTO.setItemName(itemName);
            itemDTO.setItemPrice(itemPrice);
            itemDTO.setItemCategory(itemCategory);
            itemDTO.setItemDescription(itemDescription);
            itemDTO.setItemStatus(itemStatus);
            itemDTO.setItemAvailability(itemAvailability);

            if (itemImage != null && !itemImage.isEmpty()) {
                String uploadDir = "uploads/item-images/";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

                String fileName = System.currentTimeMillis() + "_" + itemImage.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(itemImage.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                itemDTO.setItemImage("/uploads/item-images/" + fileName);
            }

            itemService.updateItem(itemDTO);
            return ResponseEntity.ok(new APIResponse<>(200, "Item updated successfully", null));
        } catch (Exception e) {
            log.error("Error updating item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Failed to update item: " + e.getMessage(), null));
        }
    }

    // ------------------- TOGGLE AVAILABILITY -------------------
    @PutMapping("/toggleAvailability/{itemId}")
    public ResponseEntity<APIResponse<String>> toggleAvailability(@PathVariable Long itemId) {
        try {
            itemService.toggleAvailability(itemId);
            return ResponseEntity.ok(new APIResponse<>(200, "Item availability updated successfully", null));
        } catch (Exception e) {
            log.error("Error toggling availability", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Failed to toggle availability: " + e.getMessage(), null));
        }
    }

    @GetMapping("/getAll")
    public ResponseEntity<APIResponse<List<ItemDTO>>> getAllItems() {
        try {
            List<Item> items = itemService.getAllItems();
            List<ItemDTO> itemDTOs = items.stream()
                    .map(item -> modelMapper.map(item, ItemDTO.class))
                    .toList();
            return ResponseEntity.ok(new APIResponse<>(200, "Items retrieved successfully", itemDTOs));
        } catch (Exception e) {
            log.error("Error retrieving items", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Failed to retrieve items: " + e.getMessage(), null));
        }
    }

    @GetMapping("/getAllThisBusinessItems/{businessId}")
    public ResponseEntity<APIResponse<List<ItemDTO>>> getItemsByBusinessId(
            @PathVariable Long businessId) {  // <-- path variable inject
        try {
            List<Item> items = itemService.getItemsByBusinessId(businessId);
            List<ItemDTO> itemDTOs = items.stream()
                    .map(item -> modelMapper.map(item, ItemDTO.class))
                    .toList();
            return ResponseEntity.ok(new APIResponse<>(200, "Items retrieved successfully", itemDTOs));
        } catch (Exception e) {
            log.error("Error retrieving items for business ID: " + businessId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>(500, "Failed to retrieve items: " + e.getMessage(), null));
        }
    }

    @PatchMapping("/changeStatus/{itemId}")
    public ResponseEntity<APIResponse<Long>> changeItemStatus(@PathVariable("itemId") Long itemId) {
        itemService.changeItemStatus(itemId);
        return ResponseEntity.ok(new APIResponse<>(200, "Item Status Changed Successfully", null));
    }
}
