package com.customercare.demo.dto.request;

import com.customercare.demo.entity.Ticket;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10)
    private String description;

    @NotNull(message = "Category is required")
    private Ticket.Category category;

    private Ticket.Priority priority = Ticket.Priority.MEDIUM;
}
