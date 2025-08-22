package lk.ijse.gdse72.yummygobackend.servicce.impl;

import jakarta.transaction.Transactional;
import lk.ijse.gdse72.yummygobackend.dto.ItemDTO;
import lk.ijse.gdse72.yummygobackend.entity.Business;
import lk.ijse.gdse72.yummygobackend.entity.Item;
import lk.ijse.gdse72.yummygobackend.exception.ResourceNotFound;
import lk.ijse.gdse72.yummygobackend.repository.BusinessRepository;
import lk.ijse.gdse72.yummygobackend.repository.ItemRepository;
import lk.ijse.gdse72.yummygobackend.servicce.ItemService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

/**
 * @author Dusan
 * @date 8/20/2025
 */

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final ModelMapper modelMapper;
    private final BusinessRepository businessRepository;

    @Override
    public void saveItem(ItemDTO itemDTO) {
        if (itemDTO.getItemStatus() == null) {
            itemDTO.setItemStatus("Active");
        }

        Item item = modelMapper.map(itemDTO, Item.class);
        item.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        item.setUpdatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        if (itemDTO.getBusinessId() != null) {
            Business business = businessRepository.findById(itemDTO.getBusinessId())
                    .orElseThrow(() -> new RuntimeException("Business not found with ID: " + itemDTO.getBusinessId()));
            item.setBusiness(business);
        } else {
            throw new RuntimeException("Business ID is required to create an item");
        }

        itemRepository.save(item);
    }

    @Override
    public void updateItem(ItemDTO itemDTO) {
        Item existingItem = itemRepository.findById(itemDTO.getItemId())
                .orElseThrow(() -> new ResourceNotFound("Item Not Found"));

        if (itemDTO.getItemName() != null) existingItem.setItemName(itemDTO.getItemName());
        if (itemDTO.getItemPrice() != null) existingItem.setItemPrice(itemDTO.getItemPrice());
        if (itemDTO.getItemCategory() != null) existingItem.setItemCategory(itemDTO.getItemCategory());
        if (itemDTO.getItemDescription() != null) existingItem.setItemDescription(itemDTO.getItemDescription());
        if (itemDTO.getItemStatus() != null) existingItem.setItemStatus(itemDTO.getItemStatus());
        if (itemDTO.getItemAvailability() != null) existingItem.setItemAvailability(itemDTO.getItemAvailability());
        if (itemDTO.getItemImage() != null) existingItem.setItemImage(itemDTO.getItemImage());

        existingItem.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        itemRepository.save(existingItem);
    }

    @Override
    public void toggleAvailability(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFound("Item Not Found"));
        item.setItemAvailability(item.getItemAvailability().equals("Available") ? "Unavailable" : "Available");
        item.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        itemRepository.save(item);
    }

    @Override
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

//    @Override
//    public List<Item> getItemsByBusinessId(Long businessId) {
//        Business business = businessRepository.findById(businessId)
//                .orElseThrow(() -> new RuntimeException("Business not found with ID: " + businessId));
//        return itemRepository.findByBusiness(business);
//    }

    @Override
    public List<Item> getItemsByBusinessId(Long businessId) {
        return itemRepository.getActiveItemsByBusinessId(businessId);
    }


    @Override
    public void changeItemStatus(Long itemId) {
        if (itemId == null) {
            throw new IllegalArgumentException("Item Id cannot be null");
        }
        itemRepository.updateItemStatus(itemId);
    }


}
