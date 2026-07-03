package com.customercare.demo.dto.request;

import com.customercare.demo.entity.Ticket;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    @NotNull(message = "Status is required")
    private Ticket.Status status;
}
