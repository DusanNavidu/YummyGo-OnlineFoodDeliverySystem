package lk.ijse.gdse72.yummygobackend.controller;

import lk.ijse.gdse72.yummygobackend.dto.ApiResponse;
import lk.ijse.gdse72.yummygobackend.dto.AuthDTO;
import lk.ijse.gdse72.yummygobackend.dto.AuthResponseDTO;
import lk.ijse.gdse72.yummygobackend.dto.RegisterDTO;
import lk.ijse.gdse72.yummygobackend.exception.InactiveUserException;
import lk.ijse.gdse72.yummygobackend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

/**
 * @author Dusan
 * @date 8/6/2025
 */

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {
    private final AuthService authService;

    @GetMapping("/roleSelector")
    public ResponseEntity<ApiResponse> getRoleSelector() {
        System.out.println("getRoleSelector called");
        return ResponseEntity.ok(new ApiResponse(
                200,
                "ok",
                "Role Selected Successfully"
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody RegisterDTO registerDTO) {
        System.out.println("registerDTO = " + registerDTO);
        return ResponseEntity.ok(new ApiResponse(
                200,
                "ok",
                authService.register(registerDTO)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody AuthDTO authDTO) {
        try {
            System.out.println("authDTO = " + authDTO);
            AuthResponseDTO response = authService.authenticate(authDTO);

            return ResponseEntity.ok(new ApiResponse(
                    200,
                    "OK",
                    response
            ));
        } catch (UsernameNotFoundException | BadCredentialsException e) {
            return ResponseEntity.status(401).body(new ApiResponse(
                    401,
                    "Unauthorized",
                    e.getMessage()
            ));
        } catch (InactiveUserException e) {
            return ResponseEntity.status(403).body(new ApiResponse(
                    403,
                    "Forbidden",
                    e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse(
                    500,
                    "Error",
                    "Login failed: " + e.getMessage()
            ));
        }
    }

}
