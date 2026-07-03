package com.customercare.demo.service.impl;

import com.customercare.demo.dto.request.*;
import com.customercare.demo.dto.response.*;
import com.customercare.demo.entity.*;
import com.customercare.demo.mapper.TicketMapper;
import com.customercare.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketMapper ticketMapper;

    // ── Customer: buat tiket ──────────────────────────────────────────────
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest req, User user) {
        Ticket ticket = Ticket.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .priority(req.getPriority() != null ? req.getPriority() : Ticket.Priority.MEDIUM)
                .status(Ticket.Status.OPEN)
                .createdBy(user)
                .build();
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    // ── Customer: lihat tiket sendiri ─────────────────────────────────────
    public Page<TicketResponse> getMyTickets(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ticketRepository.findByCreatedBy(user, pageable)
                .map(ticketMapper::toResponse);
    }

    // ── Agent: lihat semua tiket ──────────────────────────────────────────
    public Page<TicketResponse> getAllTickets(String status, String priority, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Ticket.Status statusEnum = status != null ? Ticket.Status.valueOf(status) : null;
        Ticket.Priority priorityEnum = priority != null ? Ticket.Priority.valueOf(priority) : null;
        String kw = (keyword != null && !keyword.isBlank()) ? keyword : null;
        return ticketRepository.findAllWithFilters(statusEnum, priorityEnum, kw, pageable)
                .map(ticketMapper::toResponse);
    }

    // ── Lihat detail tiket ───────────────────────────────────────────────
    public TicketResponse getTicketById(Long id, User user) {
        Ticket ticket = findTicketOrThrow(id);
        assertCanAccess(ticket, user);
        List<Comment> comments = commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
        ticket.setComments(comments);
        return ticketMapper.toResponse(ticket, true);
    }

    // ── Agent: update status ──────────────────────────────────────────────
    @Transactional
    public TicketResponse updateStatus(Long id, UpdateTicketStatusRequest req, User agent) {
        if (agent.getRole() != User.Role.AGENT) throw new AccessDeniedException("Only agents can update status");
        Ticket ticket = findTicketOrThrow(id);
        ticket.setStatus(req.getStatus());
        if (ticket.getAssignedAgent() == null) {
            ticket.setAssignedAgent(agent);
        }
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    // ── Agent: claim/assign ticket to self ─────────────────────────────────
    @Transactional
    public TicketResponse claimTicket(Long id, User agent) {
        if (agent.getRole() != User.Role.AGENT) throw new AccessDeniedException("Only agents can claim tickets");
        Ticket ticket = findTicketOrThrow(id);

        if (ticket.getAssignedAgent() != null) {
            throw new IllegalStateException("Ticket is already assigned to " + ticket.getAssignedAgent().getFullName());
        }

        ticket.setAssignedAgent(agent);
        if (ticket.getStatus() == Ticket.Status.OPEN) {
            ticket.setStatus(Ticket.Status.IN_PROGRESS);
        }
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    // ── Agent: unassign ticket (release back to pool) ───────────────────────
    @Transactional
    public TicketResponse unassignTicket(Long id, User agent) {
        if (agent.getRole() != User.Role.AGENT) throw new AccessDeniedException("Only agents can unassign tickets");
        Ticket ticket = findTicketOrThrow(id);

        if (ticket.getAssignedAgent() == null) {
            throw new IllegalStateException("Ticket is not assigned to anyone");
        }

        Long assignedId = ticket.getAssignedAgent().getId();
        if (assignedId == null || !assignedId.equals(agent.getId())) {
            throw new IllegalStateException("You can only unassign tickets assigned to you");
        }

        ticket.setAssignedAgent(null);
        if (ticket.getStatus() == Ticket.Status.IN_PROGRESS) {
            ticket.setStatus(Ticket.Status.OPEN);
        }
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    // ── Tambah komentar ───────────────────────────────────────────────────
    @Transactional
    public CommentResponse addComment(Long ticketId, AddCommentRequest req, User user) {
        Ticket ticket = findTicketOrThrow(ticketId);
        assertCanAccess(ticket, user);

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            throw new IllegalStateException("Cannot comment on a closed ticket");
        }

        Comment comment = Comment.builder()
                .ticket(ticket)
                .user(user)
                .message(req.getMessage())
                .build();
        return ticketMapper.toCommentResponse(commentRepository.save(comment));
    }

    // ── Dashboard agent ───────────────────────────────────────────────────
    public DashboardResponse getAgentDashboard(User agent) {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        ticketRepository.countGroupByStatus()
                .forEach(row -> byStatus.put(row[0].toString(), (Long) row[1]));

        Map<String, Long> byCategory = new LinkedHashMap<>();
        ticketRepository.countGroupByCategory()
                .forEach(row -> byCategory.put(row[0].toString(), (Long) row[1]));

        return DashboardResponse.builder()
                .totalTickets(ticketRepository.count())
                .openTickets(ticketRepository.countByStatus(Ticket.Status.OPEN))
                .inProgressTickets(ticketRepository.countByStatus(Ticket.Status.IN_PROGRESS))
                .resolvedTickets(ticketRepository.countByStatus(Ticket.Status.RESOLVED))
                .closedTickets(ticketRepository.countByStatus(Ticket.Status.CLOSED))
                .unassignedTickets(ticketRepository.countByAssignedAgentIsNull())
                .myAssignedTickets(ticketRepository.countByAssignedAgent(agent))
                .byStatus(byStatus)
                .byCategory(byCategory)
                .last7DaysCounts(computeLast7DaysCounts())
                .build();
    }

    private List<Integer> computeLast7DaysCounts() {
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDateTime since = today.minusDays(6).atStartOfDay();
        List<java.time.LocalDateTime> timestamps = ticketRepository.findCreatedAtSince(since);

        int[] counts = new int[7];
        for (java.time.LocalDateTime ts : timestamps) {
            long dayDiff = java.time.temporal.ChronoUnit.DAYS.between(today.minusDays(6), ts.toLocalDate());
            if (dayDiff >= 0 && dayDiff < 7) counts[(int) dayDiff]++;
        }
        List<Integer> result = new java.util.ArrayList<>();
        for (int c : counts) result.add(c);
        return result;
    }

    // ── Dashboard customer ────────────────────────────────────────────────
    public DashboardResponse getCustomerDashboard(User user) {
        return DashboardResponse.builder()
                .totalTickets(ticketRepository.countByCreatedBy(user))
                .openTickets(ticketRepository.countByCreatedByAndStatus(user, Ticket.Status.OPEN))
                .inProgressTickets(ticketRepository.countByCreatedByAndStatus(user, Ticket.Status.IN_PROGRESS))
                .resolvedTickets(ticketRepository.countByCreatedByAndStatus(user, Ticket.Status.RESOLVED))
                .closedTickets(ticketRepository.countByCreatedByAndStatus(user, Ticket.Status.CLOSED))
                .unassignedTickets(0)
                .myAssignedTickets(0)
                .byStatus(Map.of())
                .byCategory(Map.of())
                .last7DaysCounts(List.of())
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private Ticket findTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
    }

    private void assertCanAccess(Ticket ticket, User user) {
        if (user.getRole() == User.Role.AGENT) return;
        if (!ticket.getCreatedBy().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have access to this ticket");
        }
    }
}
