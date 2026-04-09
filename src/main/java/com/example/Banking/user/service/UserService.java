package com.example.Banking.user.service;

import com.example.Banking.config.security.JwtTokenProvider;
import com.example.Banking.user.model.Role;
import com.example.Banking.user.model.User;
import com.example.Banking.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public UserService(UserRepository userRepo,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public User register(String email, String password, String firstName, String lastName) {
        if (userRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }

        var user = new User(
                UUID.randomUUID(),
                email,
                passwordEncoder.encode(password),
                firstName,
                lastName,
                true,
                Role.USER,
                LocalDateTime.now()
        );

        return userRepo.save(user);
    }

    public LoginResult login(String email, String password) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is deactivated");
        }

        String token = jwtTokenProvider.generateToken(
                user.getId().toString(),
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResult(token, user.getId().toString(), user.getRole().name());
    }

    public record LoginResult(String token, String userId, String role) {}
}
