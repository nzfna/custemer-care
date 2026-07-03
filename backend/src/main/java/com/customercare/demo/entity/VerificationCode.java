package com.customercare.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_codes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 10)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Purpose purpose;

    // Untuk EMAIL_CHANGE, simpan email baru yang mau dipakai
    @Column(name = "new_value")
    private String newValue;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Column(nullable = false)
    private boolean used = false;

    public enum Purpose { EMAIL_CHANGE, PASSWORD_CHANGE }
}
