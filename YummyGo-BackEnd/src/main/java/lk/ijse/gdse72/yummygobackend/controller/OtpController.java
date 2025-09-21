package lk.ijse.gdse72.yummygobackend.controller;

import lk.ijse.gdse72.yummygobackend.service.AuthService;
import lk.ijse.gdse72.yummygobackend.service.OtpService;
import lk.ijse.gdse72.yummygobackend.util.EmailUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * @author Dusan
 * @date 9/21/2025
 */

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class OtpController {
    private final AuthService authService;

    @PostMapping("/otp/send")
    public String sendOtp(@RequestParam String email) {
        authService.sendOtpToEmail(email);
        return "OTP sent to " + email;
    }

    @PostMapping("/otp/reset")
    public String resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPasswordWithOtp(
                request.getEmail(),
                request.getOtp(),
                request.getNewUsername(),
                request.getNewPassword()
        );
        return "Password reset successful!";
    }

    public static class ResetPasswordRequest {
        private String email;
        private String otp;
        private String newUsername;
        private String newPassword;
        // getters & setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
        public String getNewUsername() { return newUsername; }
        public void setNewUsername(String newUsername) { this.newUsername = newUsername; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}