package lk.ijse.gdse72.yummygobackend.config;

import lk.ijse.gdse72.yummygobackend.entity.Role;
import lk.ijse.gdse72.yummygobackend.entity.User;
import lk.ijse.gdse72.yummygobackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;

/**
 * @author Dusan
 * @date 9/5/2025
 */

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Check if an ADMIN user already exists
        boolean adminExists = userRepository.findByUsername("admin").isPresent();

        if (!adminExists) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .phoneNumber("0770000000")
                    .email("admin@yummygosystem.com")
                    .username("admin")
                    .password(passwordEncoder.encode("admin123")) // default password
                    .userStatus("Active")
                    .role(Role.ADMIN)
                    .createdAt(Timestamp.from(Instant.now()))
                    .updatedAt(Timestamp.from(Instant.now()))
                    .build();

            userRepository.save(admin);
//            System.out.println("Default ADMIN user created: username=admin, password=admin123");
            System.out.println("Default ADMIN user created.");
        } else {
            System.out.println("Default ADMIN user already exists. Skipping creation.");
        }
    }
}