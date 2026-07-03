package com.customercare.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ConfirmEmailChangeRequest {
    @NotBlank
    private String code;
}
