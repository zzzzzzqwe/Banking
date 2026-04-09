package com.example.Banking.config;

import com.example.Banking.user.model.Role;
import com.example.Banking.user.model.User;
import com.example.Banking.user.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail("admin@bank.local")) {
            var admin = new User(
                    UUID.randomUUID(),
                    "admin@bank.local",
                    passwordEncoder.encode("admin123"),
                    "Bank",
                    "Admin",
                    true,
                    Role.ADMIN,
                    LocalDateTime.now()
            );
            userRepository.save(admin);
            System.out.println("Default admin created: admin@bank.local / admin123");
        }
    }
}
