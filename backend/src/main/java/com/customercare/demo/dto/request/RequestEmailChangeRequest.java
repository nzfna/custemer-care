package com.customercare.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RequestEmailChangeRequest {
    @NotBlank @Email
    private String newEmail;
}
