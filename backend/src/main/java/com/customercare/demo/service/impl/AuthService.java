package com.customercare.demo.service.impl;

import com.customercare.demo.dto.request.*;
import com.customercare.demo.dto.response.*;
import com.customercare.demo.entity.*;
import com.customercare.demo.repository.*;
import com.customercare.demo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.CUSTOMER)
                .build();

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail().toLowerCase(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildAuthResponse(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        // Always return success to prevent email enumeration
        userRepository.findByEmail(req.getEmail().toLowerCase()).ifPresent(user -> {
            passwordResetRepository.deleteByEmail(user.getEmail());

            PasswordReset reset = PasswordReset.builder()
                    .email(user.getEmail())
                    .token(UUID.randomUUID().toString())
                    .expiredAt(LocalDateTime.now().plusHours(1))
                    .used(false)
                    .build();

            passwordResetRepository.save(reset);

            // TODO: send email with token
            // In dev: token is saved to DB, can be fetched via /api/auth/dev/reset-token (dev only)
            System.out.println("=== RESET TOKEN (DEV) ===");
            System.out.println("Email : " + user.getEmail());
            System.out.println("Token : " + reset.getToken());
            System.out.println("=========================");
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        PasswordReset reset = passwordResetRepository.findByTokenAndUsedFalse(req.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (reset.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        User user = userRepository.findByEmail(reset.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        reset.setUsed(true);
        passwordResetRepository.save(reset);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}