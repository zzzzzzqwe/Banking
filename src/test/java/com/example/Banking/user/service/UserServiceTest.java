package com.example.Banking.user.service;

import com.example.Banking.config.security.JwtTokenProvider;
import com.example.Banking.notification.event.UserRegisteredEvent;
import com.example.Banking.user.model.Role;
import com.example.Banking.user.model.User;
import com.example.Banking.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepo;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks UserService userService;

    @Test
    void register_success() {
        when(userRepo.existsByEmail("test@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("hashed");
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.register("test@mail.com", "pass123", "John", "Doe");

        assertThat(result.getEmail()).isEqualTo("test@mail.com");
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        assertThat(result.getPasswordHash()).isEqualTo("hashed");
        assertThat(result.getRole()).isEqualTo(Role.USER);
        assertThat(result.isActive()).isTrue();

        verify(eventPublisher).publishEvent(any(UserRegisteredEvent.class));
    }

    @Test
    void register_duplicateEmail_throws() {
        when(userRepo.existsByEmail("dup@mail.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register("dup@mail.com", "pass", "A", "B"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already registered");

        verify(userRepo, never()).save(any());
    }

    @Test
    void login_success() {
        UUID userId = UUID.randomUUID();
        User user = new User(userId, "test@mail.com", "hashed", "John", "Doe",
                true, Role.USER, java.time.LocalDateTime.now());

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "hashed")).thenReturn(true);
        when(jwtTokenProvider.generateToken(userId.toString(), "test@mail.com", "USER"))
                .thenReturn("jwt-token");

        UserService.LoginResult result = userService.login("test@mail.com", "pass123");

        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.userId()).isEqualTo(userId.toString());
        assertThat(result.role()).isEqualTo("USER");
    }

    @Test
    void login_wrongPassword_throws() {
        User user = new User(UUID.randomUUID(), "test@mail.com", "hashed", "John", "Doe",
                true, Role.USER, java.time.LocalDateTime.now());

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.login("test@mail.com", "wrong"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_emailNotFound_throws() {
        when(userRepo.findByEmail("no@mail.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login("no@mail.com", "pass"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_inactiveUser_throws() {
        User user = new User(UUID.randomUUID(), "test@mail.com", "hashed", "John", "Doe",
                false, Role.USER, java.time.LocalDateTime.now());

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "hashed")).thenReturn(true);

        assertThatThrownBy(() -> userService.login("test@mail.com", "pass123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("deactivated");
    }
}
