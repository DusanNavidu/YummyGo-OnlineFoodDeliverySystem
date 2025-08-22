package lk.ijse.gdse72.yummygobackend.servicce;

import lk.ijse.gdse72.yummygobackend.dto.ItemDTO;
import lk.ijse.gdse72.yummygobackend.entity.Item;

import java.util.List;

/**
 * @author Dusan
 * @date 8/20/2025
 */

public interface ItemService {
    void saveItem(ItemDTO itemDTO);

    void updateItem(ItemDTO itemDTO);

    List<Item> getAllItems();

    List<Item> getItemsByBusinessId(Long businessId);

    void toggleAvailability(Long itemId);

    void changeItemStatus(Long itemId);
}
