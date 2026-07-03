package com.customercare.demo.repository;

import com.customercare.demo.entity.Ticket;
import com.customercare.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Customer: lihat tiket milik sendiri
    Page<Ticket> findByCreatedBy(User user, Pageable pageable);

    // Agent: lihat semua tiket dengan filter opsional
    @Query("""
        SELECT t FROM Ticket t
        WHERE (:status IS NULL OR t.status = :status)
        AND (:priority IS NULL OR t.priority = :priority)
        AND (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY t.createdAt DESC
    """)
    Page<Ticket> findAllWithFilters(
            @Param("status")   Ticket.Status status,
            @Param("priority") Ticket.Priority priority,
            @Param("keyword")  String keyword,
            Pageable pageable
    );

    // Dashboard stats
    long countByStatus(Ticket.Status status);
    long countByCreatedBy(User user);
    long countByCreatedByAndStatus(User user, Ticket.Status status);
    long countByAssignedAgentIsNull();
    long countByAssignedAgent(User agent);

    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT t.category, COUNT(t) FROM Ticket t GROUP BY t.category")
    List<Object[]> countGroupByCategory();

    @Query("""
        SELECT t.createdAt FROM Ticket t
        WHERE t.createdAt >= :since
        ORDER BY t.createdAt ASC
    """)
    List<java.time.LocalDateTime> findCreatedAtSince(@Param("since") java.time.LocalDateTime since);
}
