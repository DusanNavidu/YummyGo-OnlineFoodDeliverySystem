package lk.ijse.gdse72.yummygobackend.repository;

import jakarta.transaction.Transactional;
import lk.ijse.gdse72.yummygobackend.entity.Business;
import lk.ijse.gdse72.yummygobackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Dusan
 * @date 8/13/2025
 */

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {

    List<Business> findByUser(User user);

//    @Transactional
//    @Modifying
}
