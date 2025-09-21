package lk.ijse.gdse72.yummygobackend.repository;

import lk.ijse.gdse72.yummygobackend.entity.Business;
import lk.ijse.gdse72.yummygobackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

/**
 * @author Dusan
 * @date 8/13/2025
 */

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {

    List<Business> findByUser(User user);

    List<Business> findByBusinessAddress(String businessAddress);

    @Query("SELECT b FROM Business b " +
            "WHERE (:location IS NULL OR b.businessAddress = :location) " +
            "AND (:keyword IS NULL OR LOWER(b.businessName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(b.businessCategory) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(b.businessAddress) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Business> searchBusinesses(@Param("keyword") String keyword, @Param("location") String location);

    Optional<Business> findByBusinessId(Long businessId);

    Page<Business> findAll(org.springframework.data.domain.Pageable pageable);
}