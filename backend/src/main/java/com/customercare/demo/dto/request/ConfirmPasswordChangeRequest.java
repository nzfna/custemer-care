package com.customercare.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ConfirmPasswordChangeRequest {
    @NotBlank
    private String code;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;
}
