package com.customercare.demo.repository;

import com.customercare.demo.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {

    Optional<VerificationCode> findByUserIdAndCodeAndPurposeAndUsedFalse(
            Long userId, String code, VerificationCode.Purpose purpose);

    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationCode v WHERE v.userId = :userId AND v.purpose = :purpose")
    void deleteByUserIdAndPurpose(Long userId, VerificationCode.Purpose purpose);
}
