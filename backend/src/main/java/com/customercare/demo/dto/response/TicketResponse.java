package com.customercare.demo.dto.response;

import com.customercare.demo.entity.Ticket;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String status;
    private String priority;
    private UserSummary createdBy;
    private UserSummary assignedAgent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> comments;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String fullName;
        private String email;
    }
}
