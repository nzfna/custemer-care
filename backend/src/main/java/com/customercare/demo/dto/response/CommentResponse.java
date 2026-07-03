package com.customercare.demo.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String message;
    private String senderName;
    private String senderRole;
    private LocalDateTime createdAt;
}
