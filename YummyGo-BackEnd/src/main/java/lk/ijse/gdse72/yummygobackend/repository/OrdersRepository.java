package lk.ijse.gdse72.yummygobackend.repository;

import lk.ijse.gdse72.yummygobackend.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * @author Dusan
 * @date 9/8/2025
 */

public interface OrdersRepository extends JpaRepository<Orders, String> {
    @Query("SELECT o FROM Orders o WHERE o.business.businessId = :businessId ORDER BY o.createdAt DESC")
    List<Orders> findBusinessOrdersDesc(@Param("businessId") Long businessId);

    @Query("SELECT o FROM Orders o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Orders> findUserOrdersDesc(@Param("userId") Long userId);
}
