package lk.ijse.gdse72.yummygobackend.repository;

import lk.ijse.gdse72.yummygobackend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Dusan
 * @date 9/15/2025
 */

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByUserId(Long userId);
    List<Vehicle> findByUser_Id(Long userId);

}
