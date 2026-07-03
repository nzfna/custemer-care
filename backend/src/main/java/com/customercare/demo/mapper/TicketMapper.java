package com.customercare.demo.mapper;

import com.customercare.demo.dto.response.CommentResponse;
import com.customercare.demo.dto.response.TicketResponse;
import com.customercare.demo.entity.Comment;
import com.customercare.demo.entity.Ticket;
import com.customercare.demo.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class TicketMapper {

    public TicketResponse toResponse(Ticket ticket) {
        return toResponse(ticket, false);
    }

    public TicketResponse toResponse(Ticket ticket, boolean includeComments) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory().name())
                .status(ticket.getStatus().name())
                .priority(ticket.getPriority().name())
                .createdBy(toUserSummary(ticket.getCreatedBy()))
                .assignedAgent(ticket.getAssignedAgent() != null ? toUserSummary(ticket.getAssignedAgent()) : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .comments(includeComments && ticket.getComments() != null
                        ? ticket.getComments().stream().map(this::toCommentResponse).toList()
                        : Collections.emptyList())
                .build();
    }

    public CommentResponse toCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .message(comment.getMessage())
                .senderName(comment.getUser().getFullName())
                .senderRole(comment.getUser().getRole().name())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private TicketResponse.UserSummary toUserSummary(User user) {
        return TicketResponse.UserSummary.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
    }
}
