package com.customercare.demo.controller;

import com.customercare.demo.config.SecurityConfig;
import com.customercare.demo.dto.request.CreateTicketRequest;
import com.customercare.demo.dto.request.UpdateTicketStatusRequest;
import com.customercare.demo.dto.response.TicketResponse;
import com.customercare.demo.entity.Ticket;
import com.customercare.demo.entity.User;
import com.customercare.demo.security.JwtService;
import com.customercare.demo.service.impl.TicketService;
import com.customercare.demo.service.impl.UserDetailsServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
@Import(SecurityConfig.class)
@DisplayName("Ticket Controller Tests")
class TicketControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private TicketService ticketService;
    @MockBean private JwtService jwtService;
    @MockBean private UserDetailsServiceImpl userDetailsService;

    private User customerUser;
    private User agentUser;
    private TicketResponse sampleTicketResponse;

    @BeforeEach
    void setUp() {
        customerUser = User.builder()
                .id(1L).fullName("Test Customer").email("customer@test.com")
                .password("encoded").role(User.Role.CUSTOMER).build();

        agentUser = User.builder()
                .id(2L).fullName("Test Agent").email("agent@test.com")
                .password("encoded").role(User.Role.AGENT).build();

        sampleTicketResponse = TicketResponse.builder()
                .id(1L).title("Test Ticket").description("Test description")
                .category("GENERAL").status("OPEN").priority("MEDIUM")
                .createdBy(TicketResponse.UserSummary.builder()
                        .id(1L).fullName("Test Customer").email("customer@test.com").build())
                .assignedAgent(null)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .comments(List.of()).build();
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor asUser(User user) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        return authentication(auth);
    }

    // ── CREATE TICKET ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Customer can create a ticket")
    void createTicket_asCustomer_returns201() throws Exception {
        CreateTicketRequest req = new CreateTicketRequest();
        req.setTitle("Test Ticket Title");
        req.setDescription("This is a detailed description");
        req.setCategory(Ticket.Category.GENERAL);
        req.setPriority(Ticket.Priority.MEDIUM);

        when(ticketService.createTicket(any(), any())).thenReturn(sampleTicketResponse);

        mockMvc.perform(post("/api/tickets")
                        .with(asUser(customerUser)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("OPEN"));
    }

    @Test
    @DisplayName("Agent cannot create a ticket - returns 403")
    void createTicket_asAgent_returns403() throws Exception {
        CreateTicketRequest req = new CreateTicketRequest();
        req.setTitle("Test Ticket Title");
        req.setDescription("This is a detailed description");
        req.setCategory(Ticket.Category.GENERAL);
        req.setPriority(Ticket.Priority.MEDIUM);

        mockMvc.perform(post("/api/tickets")
                        .with(asUser(agentUser)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Create ticket with blank title - returns 400")
    void createTicket_blankTitle_returns400() throws Exception {
        CreateTicketRequest req = new CreateTicketRequest();
        req.setTitle("");
        req.setDescription("Valid description here");
        req.setCategory(Ticket.Category.GENERAL);

        mockMvc.perform(post("/api/tickets")
                        .with(asUser(customerUser)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ── GET TICKET BY ID ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Customer can view ticket by ID")
    void getTicketById_asCustomer_returns200() throws Exception {
        when(ticketService.getTicketById(eq(1L), any())).thenReturn(sampleTicketResponse);

        mockMvc.perform(get("/api/tickets/1")
                        .with(asUser(customerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("Agent can view any ticket by ID")
    void getTicketById_asAgent_returns200() throws Exception {
        when(ticketService.getTicketById(eq(1L), any())).thenReturn(sampleTicketResponse);

        mockMvc.perform(get("/api/tickets/1")
                        .with(asUser(agentUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

        @Test
        @DisplayName("Unauthenticated user cannot view ticket - returns 401 or 403")
        void getTicketById_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/tickets/1"))
                .andExpect(result -> {
                        int status = result.getResponse().getStatus();
                        assert status == 401 || status == 403 :
                        "Expected 401 or 403 but got " + status;
                });
        }

    // ── LIST TICKETS ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("Customer gets only their own tickets")
    void listTickets_asCustomer_returnsOwnTickets() throws Exception {
        var page = new PageImpl<>(List.of(sampleTicketResponse), PageRequest.of(0, 10), 1);
        when(ticketService.getMyTickets(any(), anyInt(), anyInt())).thenReturn(page);

        mockMvc.perform(get("/api/tickets").with(asUser(customerUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("Agent gets all tickets")
    void listTickets_asAgent_returnsAllTickets() throws Exception {
        var page = new PageImpl<>(List.of(sampleTicketResponse), PageRequest.of(0, 10), 1);
        when(ticketService.getAllTickets(any(), any(), any(), anyInt(), anyInt())).thenReturn(page);

        mockMvc.perform(get("/api/tickets").with(asUser(agentUser)))
                .andExpect(status().isOk());
    }

    // ── UPDATE STATUS ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("Agent can update ticket status")
    void updateStatus_asAgent_returns200() throws Exception {
        TicketResponse updated = TicketResponse.builder()
                .id(1L).status("IN_PROGRESS")
                .assignedAgent(TicketResponse.UserSummary.builder()
                        .id(2L).email("agent@test.com").build())
                .comments(List.of()).build();

        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
        req.setStatus(Ticket.Status.IN_PROGRESS);

        when(ticketService.updateStatus(eq(1L), any(), any())).thenReturn(updated);

        mockMvc.perform(patch("/api/tickets/1/status")
                        .with(asUser(agentUser)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("Customer cannot update ticket status - returns 403")
    void updateStatus_asCustomer_returns403() throws Exception {
        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
        req.setStatus(Ticket.Status.RESOLVED);

        mockMvc.perform(patch("/api/tickets/1/status")
                        .with(asUser(customerUser)).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── CLAIM TICKET ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("Agent can claim an unassigned ticket")
    void claimTicket_asAgent_returns200() throws Exception {
        TicketResponse claimed = TicketResponse.builder()
                .id(1L).status("IN_PROGRESS")
                .assignedAgent(TicketResponse.UserSummary.builder()
                        .id(2L).email("agent@test.com").build())
                .comments(List.of()).build();

        when(ticketService.claimTicket(eq(1L), any())).thenReturn(claimed);

        mockMvc.perform(post("/api/tickets/1/claim")
                        .with(asUser(agentUser)).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("Customer cannot claim a ticket - returns 403")
    void claimTicket_asCustomer_returns403() throws Exception {
        mockMvc.perform(post("/api/tickets/1/claim")
                        .with(asUser(customerUser)).with(csrf()))
                .andExpect(status().isForbidden());
    }
}