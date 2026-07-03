package com.customercare.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RequestPasswordChangeRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;
}
