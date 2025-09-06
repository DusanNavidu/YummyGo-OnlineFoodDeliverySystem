package lk.ijse.gdse72.yummygobackend.servicce;

import lk.ijse.gdse72.yummygobackend.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * @author Dusan
 * @date 9/5/2025
 */

public interface UserService {
    List<UserDTO> getAllUsers();

    Page<UserDTO> getAllNonAdminUsers(Pageable pageable);

    Page<UserDTO> getAllBusinessUsers(Pageable pageable);

    Page<UserDTO> getAllPartnerUsers(Pageable pageable);

    Page<UserDTO> getAllClientUsers(Pageable pageable);

    Page<UserDTO> getAllActiveUsers(Pageable pageable);

    Page<UserDTO> getAllInactiveUsers(Pageable pageable);

    Long getUserCount();
}
