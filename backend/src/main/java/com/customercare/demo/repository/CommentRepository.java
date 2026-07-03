package com.customercare.demo.repository;

import com.customercare.demo.entity.Comment;
import com.customercare.demo.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketOrderByCreatedAtAsc(Ticket ticket);
}
