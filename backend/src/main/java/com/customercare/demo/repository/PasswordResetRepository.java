package com.customercare.demo.repository;

import com.customercare.demo.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findByTokenAndUsedFalse(String token);

    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordReset p WHERE p.email = :email")
    void deleteByEmail(String email);
}