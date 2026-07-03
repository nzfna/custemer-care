package com.customercare.demo.controller;

import com.customercare.demo.dto.request.*;
import com.customercare.demo.dto.response.*;
import com.customercare.demo.entity.User;
import com.customercare.demo.service.impl.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/tickets")
    public ResponseEntity<ApiResponse<TicketResponse>> create(
            @Valid @RequestBody CreateTicketRequest req,
            @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.CUSTOMER)
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only customers can create tickets"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ticket created", ticketService.createTicket(req, user)));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> list(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String keyword) {

        Page<TicketResponse> result = user.getRole() == User.Role.AGENT
                ? ticketService.getAllTickets(status, priority, keyword, page, size)
                : ticketService.getMyTickets(user, page, size);

        return ResponseEntity.ok(ApiResponse.ok("Success", result));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Success", ticketService.getTicketById(id, user)));
    }

    @PatchMapping("/tickets/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest req,
            @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.AGENT)
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only agents can update status"));
        return ResponseEntity.ok(ApiResponse.ok("Status updated", ticketService.updateStatus(id, req, user)));
    }

    @PostMapping("/tickets/{id}/claim")
    public ResponseEntity<ApiResponse<TicketResponse>> claim(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.AGENT)
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only agents can claim tickets"));
        return ResponseEntity.ok(ApiResponse.ok("Ticket claimed", ticketService.claimTicket(id, user)));
    }

    @PostMapping("/tickets/{id}/unassign")
    public ResponseEntity<ApiResponse<TicketResponse>> unassign(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.AGENT)
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only agents can unassign tickets"));
        return ResponseEntity.ok(ApiResponse.ok("Ticket unassigned", ticketService.unassignTicket(id, user)));
    }

    @PostMapping("/tickets/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Comment added", ticketService.addComment(id, req, user)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard(
            @AuthenticationPrincipal User user) {
        DashboardResponse data = user.getRole() == User.Role.AGENT
                ? ticketService.getAgentDashboard(user)
                : ticketService.getCustomerDashboard(user);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }
}
