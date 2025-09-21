package lk.ijse.gdse72.yummygobackend.service;

import lk.ijse.gdse72.yummygobackend.dto.AuthDTO;
import lk.ijse.gdse72.yummygobackend.dto.AuthResponseDTO;
import lk.ijse.gdse72.yummygobackend.dto.RegisterDTO;
import lk.ijse.gdse72.yummygobackend.entity.Role;
import lk.ijse.gdse72.yummygobackend.entity.User;
import lk.ijse.gdse72.yummygobackend.exception.InactiveUserException;
import lk.ijse.gdse72.yummygobackend.repository.UserRepository;
import lk.ijse.gdse72.yummygobackend.util.EmailUtil;
import lk.ijse.gdse72.yummygobackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * @author Dusan
 * @date 8/6/2025
 */

@Service
@RequiredArgsConstructor

public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailUtil emailUtil;

    public String register (RegisterDTO registerDTO) {
        if(userRepository.findByUsername(
                registerDTO.getUsername()).isPresent()){
            throw new RuntimeException("Username already exists...");
        }
        User user = User.builder()
                .fullName(registerDTO.getFullName())
                .phoneNumber(registerDTO.getPhoneNumber())
                .email(registerDTO.getEmail())
                .username(registerDTO.getUsername())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .userStatus(registerDTO.getUserStatus())
                .role(Role.valueOf(registerDTO.getRole()))
                .createdAt(new java.sql.Timestamp(System.currentTimeMillis()))
                .updatedAt(new java.sql.Timestamp(System.currentTimeMillis()))
                .build();
        userRepository.save(user);
        return "User Registration Success...";
    }

    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        System.out.println("Authenticating user...");
        System.out.println("authDTO = " + authDTO);

        User user = userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Username not found"));
        System.out.println("User found: " + user.getUsername());

        // Check if user is inactive
        if ("Inactive".equalsIgnoreCase(user.getUserStatus())) {
            throw new InactiveUserException("Your account is deactivated. Please contact support.");
        }

        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            System.out.println("Incorrect password for user: " + authDTO.getUsername());
            throw new BadCredentialsException("Incorrect password");
        }

        String token = jwtUtil.generateToken(authDTO.getUsername());
        String role = user.getRole().name();
        System.out.println("Generated Token: " + token);
        System.out.println("User Role: " + role);
        System.out.println("Authentication successful for user: " + authDTO.getUsername());

        // 🔥 Login success -> Send email to ADMIN
        if (user.getRole() == Role.ADMIN) {
            String subject = "Admin Login Alert - YummyGo System";
            String body = "Hello " + user.getFullName() + ",\n\n" +
                    "Your ADMIN account logged in at: " + new java.util.Date() + ".\n\n" +
                    "If this wasn't you, please secure your account immediately.\n\n" +
                    "Regards,\nYummyGo Security Team";

            emailUtil.sendEmail(user.getEmail(), subject, body);
        }

        return new AuthResponseDTO(token, role, user.getId());
    }
}
