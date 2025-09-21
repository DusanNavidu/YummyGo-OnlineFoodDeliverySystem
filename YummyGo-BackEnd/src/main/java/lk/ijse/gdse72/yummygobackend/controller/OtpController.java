package lk.ijse.gdse72.yummygobackend.controller;

import lk.ijse.gdse72.yummygobackend.service.OtpService;
import lk.ijse.gdse72.yummygobackend.util.EmailUtil;
import org.springframework.web.bind.annotation.*;

/**
 * @author Dusan
 * @date 9/21/2025
 */

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final EmailUtil emailUtil;
    private final OtpService otpService;

    public OtpController(EmailUtil emailUtil, OtpService otpService) {
        this.emailUtil = emailUtil;
        this.otpService = otpService;
    }

    @PostMapping("/send")
    public String sendOtp(@RequestParam String email) {
        String otp = otpService.generateOtp();
        emailUtil.sendEmail(email, "Your OTP Code", "Your OTP is: " + otp);
        return "OTP sent to " + email;
    }
}