package lk.ijse.gdse72.yummygobackend.controller;

import lk.ijse.gdse72.yummygobackend.dto.UserDTO;
import lk.ijse.gdse72.yummygobackend.servicce.UserService;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Dusan
 * @date 9/5/2025
 */

@RestController
@RequestMapping("/api/v1/AdminDashboardUsersManage")
@RequiredArgsConstructor
@CrossOrigin

public class AdminDashboardUsersManage {

    private final UserService userService;

    @GetMapping("/getAllUsers")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDTO> pagedUsers = userService.getAllNonAdminUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(new APIResponse<>(200, "All Users Retrieved Successfully", pagedUsers));
    }

    @GetMapping("/getAllBusinessUsers")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getAllBusinessUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDTO> pagedUsers = userService.getAllBusinessUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(new APIResponse<>(200, "All Business Users Retrieved Successfully", pagedUsers));
    }

    @GetMapping("/getAllPartnerUsers")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getAllPartnerUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDTO> pagedUsers = userService.getAllPartnerUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(new APIResponse<>(200, "All Partner Users Retrieved Successfully", pagedUsers));
    }

    @GetMapping("/getAllClientUsers")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getAllClientUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDTO> pagedUsers = userService.getAllClientUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(new APIResponse<>(200, "All Client Users Retrieved Successfully", pagedUsers));
    }


    @GetMapping("/getUserCount")
    public ResponseEntity<APIResponse<Long>> getUserCount() {
        Long userCount = userService.getUserCount();
        return ResponseEntity.ok(new APIResponse<>(200, "User Count Retrieved Successfully", userCount));
    }

    @GetMapping("/getPartnerCount")
    public ResponseEntity<APIResponse<Long>> getPartnerCount() {
        List<UserDTO> allUsers = userService.getAllUsers();
        Long partnerCount = allUsers.stream()
                .filter(user -> "PARTNER".equalsIgnoreCase(user.getRole()))
                .count();
        return ResponseEntity.ok(new APIResponse<>(200, "Partner Count Retrieved Successfully", partnerCount));
    }

    @GetMapping("/getBusinessCount")
    public ResponseEntity<APIResponse<Long>> getBusinessCount() {
        List<UserDTO> allUsers = userService.getAllUsers();
        Long businessCount = allUsers.stream()
                .filter(user -> "BUSINESS".equalsIgnoreCase(user.getRole()))
                .count();
        return ResponseEntity.ok(new APIResponse<>(200, "Business Count Retrieved Successfully", businessCount));
    }

    @GetMapping("/getClientCount")
    public ResponseEntity<APIResponse<Long>> getClientCount() {
        List<UserDTO> allUsers = userService.getAllUsers();
        Long clientCount = allUsers.stream()
                .filter(user -> "CLIENT".equalsIgnoreCase(user.getRole()))
                .count();
        return ResponseEntity.ok(new APIResponse<>(200, "Client Count Retrieved Successfully", clientCount));
    }

    @GetMapping("/getAdminCount")
    public ResponseEntity<APIResponse<Long>> getAdminCount() {
        List<UserDTO> allUsers = userService.getAllUsers();
        Long adminCount = allUsers.stream()
                .filter(user -> "ADMIN".equalsIgnoreCase(user.getRole()))
                .count();
        return ResponseEntity.ok(new APIResponse<>(200, "Admin Count Retrieved Successfully", adminCount));
    }

    @GetMapping("/getActiveUserCount")
    public ResponseEntity<APIResponse<Long>> getActiveUserCount() {
        List<UserDTO> allUsers = userService.getAllUsers();
        Long activeUserCount = allUsers.stream()
                .filter(user -> "Active".equalsIgnoreCase(user.getUserStatus()))
                .count();
        return ResponseEntity.ok(new APIResponse<>(200, "Active User Count Retrieved Successfully", activeUserCount));
    }

    @GetMapping("/getInactiveUserCount")
    public ResponseEntity<APIResponse<Long>> getInactiveUserCount() {
        List<UserDTO> allUsers = userService.getAllUsers();
        Long inactiveUserCount = allUsers.stream()
                .filter(user -> "Inactive".equalsIgnoreCase(user.getUserStatus()))
                .count();
        return ResponseEntity.ok(new APIResponse<>(200, "Inactive User Count Retrieved Successfully", inactiveUserCount));
    }

    @GetMapping("/getAllActiveUsers")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getAllActiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDTO> pagedUsers = userService.getAllActiveUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(new APIResponse<>(200, "Active Users Retrieved Successfully", pagedUsers));
    }

    @GetMapping("/getAllInactiveUsers")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getAllInactiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDTO> pagedUsers = userService.getAllInactiveUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(new APIResponse<>(200, "Inactive Users Retrieved Successfully", pagedUsers));
    }

    @GetMapping("/searchUsers")
    public ResponseEntity<APIResponse<List<UserDTO>>> searchUsers(String keyword) {
        List<UserDTO> allUsers = userService.getAllUsers();

        if (keyword == null || keyword.isEmpty()) {
            // Return all non-admin users if no keyword
            List<UserDTO> nonAdminUsers = allUsers.stream()
                    .filter(user -> !"ADMIN".equalsIgnoreCase(user.getRole()))
                    .toList();
            return ResponseEntity.ok(new APIResponse<>(200, "All Users Retrieved Successfully", nonAdminUsers));
        }

        String lowerKeyword = keyword.toLowerCase();
        List<UserDTO> filteredUsers = allUsers.stream()
                .filter(user -> !"ADMIN".equalsIgnoreCase(user.getRole()))
                .filter(user ->
                        (user.getFullName() != null && user.getFullName().toLowerCase().contains(lowerKeyword)) ||
                                (user.getEmail() != null && user.getEmail().toLowerCase().contains(lowerKeyword)) ||
                                (user.getUsername() != null && user.getUsername().toLowerCase().contains(lowerKeyword)) ||
                                (user.getPhoneNumber() != null && user.getPhoneNumber().toLowerCase().contains(lowerKeyword)) ||
                                (user.getId() != null && user.getId().toString().contains(lowerKeyword))
                )
                .toList();

        return ResponseEntity.ok(new APIResponse<>(200, "Users Retrieved Successfully", filteredUsers));
    }
}
