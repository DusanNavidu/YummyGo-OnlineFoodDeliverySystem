package lk.ijse.gdse72.yummygobackend.repository;

import lk.ijse.gdse72.yummygobackend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Dusan
 * @date 9/10/2025
 */

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrders_OrderId(String orderId);
}
