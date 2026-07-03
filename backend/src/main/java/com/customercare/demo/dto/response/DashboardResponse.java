package com.customercare.demo.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long closedTickets;
    private long unassignedTickets;
    private long myAssignedTickets;
    private Map<String, Long> byStatus;
    private Map<String, Long> byCategory;
    private List<Integer> last7DaysCounts;
}
