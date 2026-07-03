package com.customercare.demo.controller;

import com.customercare.demo.dto.request.*;
import com.customercare.demo.dto.response.*;
import com.customercare.demo.entity.User;
import com.customercare.demo.service.impl.AccountSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountSettingsController {

    private final AccountSettingsService accountSettingsService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> me(@AuthenticationPrincipal User user) {
        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
        return ResponseEntity.ok(ApiResponse.ok("Success", profile));
    }

    @PostMapping("/email/request-change")
    public ResponseEntity<ApiResponse<Void>> requestEmailChange(
            @Valid @RequestBody RequestEmailChangeRequest req,
            @AuthenticationPrincipal User user) {
        accountSettingsService.requestEmailChange(user, req);
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent"));
    }

    @PostMapping("/email/confirm-change")
    public ResponseEntity<ApiResponse<Void>> confirmEmailChange(
            @Valid @RequestBody ConfirmEmailChangeRequest req,
            @AuthenticationPrincipal User user) {
        accountSettingsService.confirmEmailChange(user, req);
        return ResponseEntity.ok(ApiResponse.ok("Email updated successfully"));
    }

    @PostMapping("/password/request-change")
    public ResponseEntity<ApiResponse<Void>> requestPasswordChange(
            @Valid @RequestBody RequestPasswordChangeRequest req,
            @AuthenticationPrincipal User user) {
        accountSettingsService.requestPasswordChange(user, req);
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent"));
    }

    @PostMapping("/password/confirm-change")
    public ResponseEntity<ApiResponse<Void>> confirmPasswordChange(
            @Valid @RequestBody ConfirmPasswordChangeRequest req,
            @AuthenticationPrincipal User user) {
        accountSettingsService.confirmPasswordChange(user, req);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully"));
    }
}
