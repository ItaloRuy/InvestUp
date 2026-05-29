package com.investup.api.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "lesson_id", nullable = false, length = 10)
    private String lessonId;

    @Column(nullable = false)
    private int trailNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LessonStatus status = LessonStatus.AVAILABLE;

    @Builder.Default
    private int progressPercent = 0;

    private int quizScore;
    private int xpEarned;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public enum LessonStatus {
        LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED
    }
}
