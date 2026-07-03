package com.customercare.demo.service.impl;

import com.customercare.demo.dto.request.*;
import com.customercare.demo.entity.*;
import com.customercare.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccountSettingsService {

    private final UserRepository userRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom RANDOM = new SecureRandom();

    // ── Email change ─────────────────────────────────────────────────────

    @Transactional
    public void requestEmailChange(User user, RequestEmailChangeRequest req) {
        if (userRepository.existsByEmail(req.getNewEmail().toLowerCase())) {
            throw new IllegalStateException("Email is already in use");
        }

        verificationCodeRepository.deleteByUserIdAndPurpose(user.getId(), VerificationCode.Purpose.EMAIL_CHANGE);

        String code = generateCode();
        VerificationCode vc = VerificationCode.builder()
                .userId(user.getId())
                .code(code)
                .purpose(VerificationCode.Purpose.EMAIL_CHANGE)
                .newValue(req.getNewEmail().toLowerCase())
                .expiredAt(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();
        verificationCodeRepository.save(vc);

        System.out.println("=== EMAIL CHANGE VERIFICATION CODE (DEV) ===");
        System.out.println("User       : " + user.getEmail());
        System.out.println("New Email  : " + req.getNewEmail());
        System.out.println("Code       : " + code);
        System.out.println("=============================================");
    }

    @Transactional
    public void confirmEmailChange(User user, ConfirmEmailChangeRequest req) {
        VerificationCode vc = verificationCodeRepository
                .findByUserIdAndCodeAndPurposeAndUsedFalse(user.getId(), req.getCode(), VerificationCode.Purpose.EMAIL_CHANGE)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code"));

        if (vc.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setEmail(vc.getNewValue());
        userRepository.save(user);

        vc.setUsed(true);
        verificationCodeRepository.save(vc);
    }

    // ── Password change ──────────────────────────────────────────────────

    @Transactional
    public void requestPasswordChange(User user, RequestPasswordChangeRequest req) {
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        verificationCodeRepository.deleteByUserIdAndPurpose(user.getId(), VerificationCode.Purpose.PASSWORD_CHANGE);

        String code = generateCode();
        VerificationCode vc = VerificationCode.builder()
                .userId(user.getId())
                .code(code)
                .purpose(VerificationCode.Purpose.PASSWORD_CHANGE)
                .expiredAt(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();
        verificationCodeRepository.save(vc);

        System.out.println("=== PASSWORD CHANGE VERIFICATION CODE (DEV) ===");
        System.out.println("User : " + user.getEmail());
        System.out.println("Code : " + code);
        System.out.println("================================================");
    }

    @Transactional
    public void confirmPasswordChange(User user, ConfirmPasswordChangeRequest req) {
        VerificationCode vc = verificationCodeRepository
                .findByUserIdAndCodeAndPurposeAndUsedFalse(user.getId(), req.getCode(), VerificationCode.Purpose.PASSWORD_CHANGE)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification code"));

        if (vc.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        vc.setUsed(true);
        verificationCodeRepository.save(vc);
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
