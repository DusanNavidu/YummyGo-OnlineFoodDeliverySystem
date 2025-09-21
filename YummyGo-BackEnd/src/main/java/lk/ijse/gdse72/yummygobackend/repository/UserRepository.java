package lk.ijse.gdse72.yummygobackend.repository;

import jakarta.transaction.Transactional;
import lk.ijse.gdse72.yummygobackend.entity.Role;
import lk.ijse.gdse72.yummygobackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Dusan
 * @date 8/6/2025
 */

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Page<User> findAllByRole(Role role, org.springframework.data.domain.Pageable pageable);
    Page<User> findAllByRoleNot(Role role, org.springframework.data.domain.Pageable pageable);
    Page<User> findAllByUserStatusIgnoreCase(String status, org.springframework.data.domain.Pageable pageable);

    @Transactional
    @Modifying
    @Query(value = "UPDATE user SET user_status = 'Inactive' WHERE id = ?1", nativeQuery = true)
    void updateUserStatus(Long id);

    @Transactional
    @Modifying
    @Query(value = "UPDATE user SET user_status = 'Active' WHERE id = ?1", nativeQuery = true)
    void updateUserStatusActive(Long id);
}
