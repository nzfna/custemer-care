package com.customercare.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddCommentRequest {
    @NotBlank(message = "Message is required")
    @Size(min = 1, max = 2000)
    private String message;
}
