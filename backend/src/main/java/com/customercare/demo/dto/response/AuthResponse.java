package com.customercare.demo.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
}