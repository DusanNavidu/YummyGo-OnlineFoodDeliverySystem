package lk.ijse.gdse72.yummygobackend.repository;

import lk.ijse.gdse72.yummygobackend.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Dusan
 * @date 9/8/2025
 */

public interface OrdersRepository extends JpaRepository<Orders, String> {
    List<Orders> findByBusinessBusinessId(Long businessId);
}
