package lk.ijse.gdse72.yummygobackend.controller;

import lk.ijse.gdse72.yummygobackend.dto.UserDTO;
import lk.ijse.gdse72.yummygobackend.entity.User;
import lk.ijse.gdse72.yummygobackend.servicce.UserService;
import lk.ijse.gdse72.yummygobackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
    public ResponseEntity<APIResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> allUsers = userService.getAllUsers();
        List<UserDTO> nonAdminUsers = allUsers.stream()
                .filter(user -> !"ADMIN".equalsIgnoreCase(user.getRole()))
                .toList();
        return ResponseEntity.ok(new APIResponse<>(200, "All Users Retrieved Successfully", nonAdminUsers));
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

    // ✅ FIXED Paged endpoint
    @GetMapping("/getAllUsers/paged")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getAllUsersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDTO> usersPage = userService.getAllUsers(PageRequest.of(page, size));

        List<UserDTO> filtered = usersPage.getContent().stream()
                .filter(user -> !"ADMIN".equalsIgnoreCase(user.getRole()))
                .collect(Collectors.toList());

        Page<UserDTO> nonAdminUsers = new PageImpl<>(
                filtered,
                usersPage.getPageable(),
                filtered.size()   // ✅ ensures consistency
        );

        return ResponseEntity.ok(new APIResponse<>(200, "Users Retrieved Successfully", nonAdminUsers));
    }

}
