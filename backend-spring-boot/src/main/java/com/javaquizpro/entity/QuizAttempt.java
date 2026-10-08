package com.javaquizpro.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private User participant;

    @Builder.Default
    private Integer score = 0;

    @Builder.Default
    @Column(name = "total_marks")
    private Integer totalMarks = 0;

    @Builder.Default
    private Integer percentage = 0;

    @Builder.Default
    @Column(name = "correct_answers")
    private Integer correctAnswers = 0;

    @Builder.Default
    @Column(name = "wrong_answers")
    private Integer wrongAnswers = 0;

    @Builder.Default
    private Integer unanswered = 0;

    @Builder.Default
    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttemptStatus status;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Builder.Default
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    public enum AttemptStatus {
        PASS, FAIL
    }
}
