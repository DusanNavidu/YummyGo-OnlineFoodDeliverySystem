package lk.ijse.gdse72.yummygobackend.repository;

import jakarta.transaction.Transactional;
import lk.ijse.gdse72.yummygobackend.entity.Business;
import lk.ijse.gdse72.yummygobackend.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Dusan
 * @date 8/20/2025
 */

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    @Transactional
    @Modifying
    @Query(value = "UPDATE item SET item_status = 'Deactivated' WHERE item_id = ?1", nativeQuery = true)
    void updateItemStatus(Long itemId);

    @Query("SELECT i FROM Item i WHERE i.business.businessId = :businessId AND i.itemStatus <> 'Deactivated'")
    List<Item> getActiveItemsByBusinessId(@Param("businessId") Long businessId);

    List<Item> findByBusiness(Business business);
}
