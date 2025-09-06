package lk.ijse.gdse72.yummygobackend.repository;

import lk.ijse.gdse72.yummygobackend.entity.Role;
import lk.ijse.gdse72.yummygobackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Dusan
 * @date 8/6/2025
 */

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Page<User> findAllByRole(Role role, org.springframework.data.domain.Pageable pageable);
    Page<User> findAllByRoleNot(Role role, org.springframework.data.domain.Pageable pageable);
    Page<User> findAllByUserStatusIgnoreCase(String status, org.springframework.data.domain.Pageable pageable);}
