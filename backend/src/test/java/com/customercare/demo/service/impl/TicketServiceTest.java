package com.customercare.demo.service.impl;

import com.customercare.demo.dto.request.CreateTicketRequest;
import com.customercare.demo.dto.request.UpdateTicketStatusRequest;
import com.customercare.demo.dto.response.TicketResponse;
import com.customercare.demo.entity.Ticket;
import com.customercare.demo.entity.User;
import com.customercare.demo.mapper.TicketMapper;
import com.customercare.demo.repository.CommentRepository;
import com.customercare.demo.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Ticket Service Unit Tests")
class TicketServiceTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private TicketMapper ticketMapper;

    @InjectMocks
    private TicketService ticketService;

    private User customer;
    private User agent;
    private Ticket ticket;
    private TicketResponse ticketResponse;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .id(1L).fullName("Customer").email("customer@test.com")
                .role(User.Role.CUSTOMER).build();

        agent = User.builder()
                .id(2L).fullName("Agent").email("agent@test.com")
                .role(User.Role.AGENT).build();

        ticket = Ticket.builder()
                .id(1L)
                .title("Test Ticket")
                .description("Test description here")
                .category(Ticket.Category.GENERAL)
                .status(Ticket.Status.OPEN)
                .priority(Ticket.Priority.MEDIUM)
                .createdBy(customer)
                .assignedAgent(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ticketResponse = TicketResponse.builder()
                .id(1L).title("Test Ticket").description("Test description here")
                .category("GENERAL").status("OPEN").priority("MEDIUM")
                .createdBy(TicketResponse.UserSummary.builder()
                        .id(1L).fullName("Customer").email("customer@test.com").build())
                .assignedAgent(null)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .comments(List.of())
                .build();
    }

    // ── CREATE TICKET ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Customer can create a ticket with OPEN status by default")
    void createTicket_validRequest_returnsTicketWithOpenStatus() {
        CreateTicketRequest req = new CreateTicketRequest();
        req.setTitle("Test Ticket");
        req.setDescription("Test description here");
        req.setCategory(Ticket.Category.GENERAL);
        req.setPriority(Ticket.Priority.MEDIUM);

        when(ticketRepository.save(any())).thenReturn(ticket);
        when(ticketMapper.toResponse(ticket)).thenReturn(ticketResponse);

        TicketResponse result = ticketService.createTicket(req, customer);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Ticket");
        assertThat(result.getStatus()).isEqualTo("OPEN");
        verify(ticketRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Create ticket defaults to MEDIUM priority when priority is null")
    void createTicket_nullPriority_defaultsToMedium() {
        CreateTicketRequest req = new CreateTicketRequest();
        req.setTitle("Test Ticket");
        req.setDescription("Test description here");
        req.setCategory(Ticket.Category.GENERAL);
        req.setPriority(null); // no priority set

        when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> {
            Ticket t = inv.getArgument(0);
            assertThat(t.getPriority()).isEqualTo(Ticket.Priority.MEDIUM);
            return ticket;
        });
        when(ticketMapper.toResponse(any())).thenReturn(ticketResponse);

        ticketService.createTicket(req, customer);

        verify(ticketRepository, times(1)).save(any());
    }

    // ── GET TICKET BY ID ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Customer can access their own ticket")
    void getTicketById_customerOwnsTicket_returnsTicket() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(commentRepository.findByTicketOrderByCreatedAtAsc(ticket)).thenReturn(List.of());
        when(ticketMapper.toResponse(ticket, true)).thenReturn(ticketResponse);

        TicketResponse result = ticketService.getTicketById(1L, customer);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Customer cannot access another customer's ticket")
    void getTicketById_customerNotOwner_throwsAccessDeniedException() {
        User anotherCustomer = User.builder()
                .id(99L).fullName("Another").email("another@test.com")
                .role(User.Role.CUSTOMER).build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.getTicketById(1L, anotherCustomer))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("don't have access");
    }

    @Test
    @DisplayName("Agent can access any ticket")
    void getTicketById_asAgent_returnsTicket() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(commentRepository.findByTicketOrderByCreatedAtAsc(ticket)).thenReturn(List.of());
        when(ticketMapper.toResponse(ticket, true)).thenReturn(ticketResponse);

        TicketResponse result = ticketService.getTicketById(1L, agent);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Get ticket with non-existent ID throws IllegalArgumentException")
    void getTicketById_notFound_throwsIllegalArgumentException() {
        when(ticketRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.getTicketById(999L, customer))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ticket not found");
    }

    // ── UPDATE STATUS ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("Agent can update ticket status to IN_PROGRESS")
    void updateStatus_asAgent_updatesStatus() {
        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
        req.setStatus(Ticket.Status.IN_PROGRESS);

        Ticket updatedTicket = Ticket.builder()
                .id(1L).title("Test Ticket").description("Test description")
                .category(Ticket.Category.GENERAL).status(Ticket.Status.IN_PROGRESS)
                .priority(Ticket.Priority.MEDIUM).createdBy(customer).assignedAgent(agent)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        TicketResponse updatedResponse = TicketResponse.builder()
                .id(1L).status("IN_PROGRESS")
                .assignedAgent(TicketResponse.UserSummary.builder()
                        .id(2L).fullName("Agent").email("agent@test.com").build())
                .comments(List.of()).build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenReturn(updatedTicket);
        when(ticketMapper.toResponse(updatedTicket)).thenReturn(updatedResponse);

        TicketResponse result = ticketService.updateStatus(1L, req, agent);

        assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(result.getAssignedAgent()).isNotNull();
        assertThat(result.getAssignedAgent().getEmail()).isEqualTo("agent@test.com");
    }

    @Test
    @DisplayName("Customer cannot update ticket status")
    void updateStatus_asCustomer_throwsAccessDeniedException() {
        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
        req.setStatus(Ticket.Status.RESOLVED);

        assertThatThrownBy(() -> ticketService.updateStatus(1L, req, customer))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only agents can update status");
    }

    // ── CLAIM TICKET ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("Agent can claim unassigned ticket - status changes to IN_PROGRESS")
    void claimTicket_unassigned_setsAgentAndInProgress() {
        Ticket claimedTicket = Ticket.builder()
                .id(1L).title("Test Ticket").description("Test description")
                .category(Ticket.Category.GENERAL).status(Ticket.Status.IN_PROGRESS)
                .priority(Ticket.Priority.MEDIUM).createdBy(customer).assignedAgent(agent)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        TicketResponse claimedResponse = TicketResponse.builder()
                .id(1L).status("IN_PROGRESS")
                .assignedAgent(TicketResponse.UserSummary.builder()
                        .id(2L).email("agent@test.com").build())
                .comments(List.of()).build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket)); // unassigned
        when(ticketRepository.save(any())).thenReturn(claimedTicket);
        when(ticketMapper.toResponse(claimedTicket)).thenReturn(claimedResponse);

        TicketResponse result = ticketService.claimTicket(1L, agent);

        assertThat(result.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(result.getAssignedAgent()).isNotNull();
    }

    @Test
    @DisplayName("Agent cannot claim already assigned ticket")
    void claimTicket_alreadyAssigned_throwsIllegalStateException() {
        ticket.setAssignedAgent(agent); // already assigned

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.claimTicket(1L, agent))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already assigned");
    }

    @Test
    @DisplayName("Customer cannot claim a ticket")
    void claimTicket_asCustomer_throwsAccessDeniedException() {
        assertThatThrownBy(() -> ticketService.claimTicket(1L, customer))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only agents can claim");
    }

    // ── UNASSIGN TICKET ───────────────────────────────────────────────────────

    @Test
    @DisplayName("Agent can release their own assigned ticket")
    void unassignTicket_ownTicket_success() {
        ticket.setAssignedAgent(agent);
        ticket.setStatus(Ticket.Status.IN_PROGRESS);

        Ticket releasedTicket = Ticket.builder()
                .id(1L).title("Test Ticket").description("Test")
                .category(Ticket.Category.GENERAL).status(Ticket.Status.OPEN)
                .priority(Ticket.Priority.MEDIUM).createdBy(customer).assignedAgent(null)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

        TicketResponse releasedResponse = TicketResponse.builder()
                .id(1L).status("OPEN").assignedAgent(null).comments(List.of()).build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenReturn(releasedTicket);
        when(ticketMapper.toResponse(releasedTicket)).thenReturn(releasedResponse);

        TicketResponse result = ticketService.unassignTicket(1L, agent);

        assertThat(result.getStatus()).isEqualTo("OPEN");
        assertThat(result.getAssignedAgent()).isNull();
    }

    @Test
    @DisplayName("Agent cannot release ticket assigned to another agent")
    void unassignTicket_anotherAgentsTicket_throwsIllegalStateException() {
        User anotherAgent = User.builder()
                .id(99L).fullName("Other Agent").email("other@test.com")
                .role(User.Role.AGENT).build();

        ticket.setAssignedAgent(anotherAgent); // assigned to different agent

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.unassignTicket(1L, agent))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("You can only unassign");
    }
}
