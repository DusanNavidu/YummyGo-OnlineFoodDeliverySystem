package lk.ijse.gdse72.yummygobackend.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

/**
 * @author Dusan
 * @date 9/21/2025
 */

@Service
public class OtpService {

    private final SecureRandom random = new SecureRandom();

    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otp);
    }
}