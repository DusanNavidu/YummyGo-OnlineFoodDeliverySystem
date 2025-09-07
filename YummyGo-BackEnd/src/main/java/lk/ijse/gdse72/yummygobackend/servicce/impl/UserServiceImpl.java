package lk.ijse.gdse72.yummygobackend.servicce.impl;

import lk.ijse.gdse72.yummygobackend.dto.UserDTO;
import lk.ijse.gdse72.yummygobackend.entity.Role;
import lk.ijse.gdse72.yummygobackend.entity.User;
import lk.ijse.gdse72.yummygobackend.repository.UserRepository;
import lk.ijse.gdse72.yummygobackend.servicce.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * @author Dusan
 * @date 9/5/2025
 */

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper; // model mapper ekk inject karanawa

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        return modelMapper.map(allUsers, new org.modelmapper.TypeToken<List<UserDTO>>() {}.getType());
    }

    @Override
    public Page<UserDTO> getAllNonAdminUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAllByRoleNot(Role.ADMIN, pageable);
        return usersPage.map(user -> modelMapper.map(user, UserDTO.class));
    }

    @Override
    public Page<UserDTO> getAllBusinessUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAllByRole(Role.BUSINESS, pageable);
        return usersPage.map(user -> modelMapper.map(user, UserDTO.class));
    }

    @Override
    public Page<UserDTO> getAllPartnerUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAllByRole(Role.PARTNER, pageable);
        return usersPage.map(user -> modelMapper.map(user, UserDTO.class));
    }

    @Override
    public Page<UserDTO> getAllClientUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAllByRole(Role.CLIENT, pageable);
        return usersPage.map(user -> modelMapper.map(user, UserDTO.class));
    }

    @Override
    public Page<UserDTO> getAllActiveUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAllByUserStatusIgnoreCase("active", pageable);
        return usersPage.map(user -> modelMapper.map(user, UserDTO.class));
    }

    @Override
    public Page<UserDTO> getAllInactiveUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAllByUserStatusIgnoreCase("inactive", pageable);
        return usersPage.map(user -> modelMapper.map(user, UserDTO.class));
    }

    @Override
    public Long getUserCount() {
        return userRepository.count();
    }

    @Override
    public void deactivateUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        userRepository.updateUserStatus(userId);
    }

    @Override
    public void activateUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        userRepository.updateUserStatusActive(userId);
    }
}
