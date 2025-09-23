package lk.ijse.gdse72.yummygobackend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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
    private final OtpService otpService;

    public String register (RegisterDTO registerDTO) {
        if(userRepository.findByUsername(
                registerDTO.getUsername()).isPresent()){
            throw new RuntimeException("Username already exists...");
        }

        if(userRepository.findByEmail(
                registerDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists...");
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

    // Send OTP
    public void sendOtpToEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String otp = otpService.generateOtp();
        user.setResetOtp(otp);
        user.setOtpExpiration(new java.sql.Timestamp(System.currentTimeMillis() + 5 * 60 * 1000)); // 5 mins
        userRepository.save(user);

        String subject = "YummyGo Password Reset OTP";
        String body = "Hello " + user.getFullName() + ",\n\nYour OTP: " + otp +
                "\nIt expires in 5 minutes.\n\nYummyGo Team";

        emailUtil.sendEmail(user.getEmail(), subject, body);
    }

    // Reset password using OTP
    public void resetPasswordWithOtp(String email, String otp, String newUsername, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiration().before(new java.util.Date())) {
            throw new RuntimeException("OTP expired");
        }

        if (newUsername != null && !newUsername.isBlank()) {
            user.setUsername(newUsername);
        }

        if (newPassword != null && !newPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        user.setResetOtp(null);
        user.setOtpExpiration(null);
        userRepository.save(user);
    }

    @PostMapping("/google")
    public Map<String, Object> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");

        // Verify token using Google API
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList("557187205992-dccisljpqtprs915032l79tj2knr68q9.apps.googleusercontent.com"))
                .build();

        try {
            GoogleIdToken googleIdToken = GoogleIdToken.parse(verifier.getJsonFactory(), idToken);
            GoogleIdToken.Payload payload = googleIdToken.getPayload();

            String email = payload.getEmail();
            String fullName = (String) payload.get("name");

            // Check if user exists
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .fullName(fullName)
                        .email(email)
                        .username(email.split("@")[0])
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .userStatus("Active")
                        .role(Role.CLIENT) // default role
                        .createdAt(new Timestamp(System.currentTimeMillis()))
                        .updatedAt(new Timestamp(System.currentTimeMillis()))
                        .build();
                return userRepository.save(newUser);
            });

            String token = jwtUtil.generateToken(user.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("token", token);

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Invalid Google ID token");
        }
    }
}
