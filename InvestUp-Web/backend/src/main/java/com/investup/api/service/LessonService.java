package com.investup.api.service;

import com.investup.api.dto.response.AuthResponse;
import com.investup.api.dto.response.LessonProgressResponse;
import com.investup.api.entity.User;
import com.investup.api.entity.UserProgress;
import com.investup.api.repository.UserProgressRepository;
import com.investup.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final UserProgressRepository progressRepo;
    private final UserRepository userRepo;

    @Transactional
    public AuthResponse.UserSummary completeLesson(Long userId, String lessonId, int xpReward, int trailNumber) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        UserProgress progress = progressRepo
                .findByUserIdAndLessonId(userId, lessonId)
                .orElse(null);

        boolean alreadyCompleted = progress != null
                && progress.getStatus() == UserProgress.LessonStatus.COMPLETED;

        if (!alreadyCompleted) {
            if (progress == null) {
                progress = UserProgress.builder()
                        .user(user)
                        .lessonId(lessonId)
                        .trailNumber(trailNumber)
                        .status(UserProgress.LessonStatus.COMPLETED)
                        .progressPercent(100)
                        .xpEarned(xpReward)
                        .startedAt(LocalDateTime.now())
                        .completedAt(LocalDateTime.now())
                        .build();
            } else {
                progress.setStatus(UserProgress.LessonStatus.COMPLETED);
                progress.setProgressPercent(100);
                progress.setXpEarned(xpReward);
                progress.setCompletedAt(LocalDateTime.now());
            }
            progressRepo.save(progress);

            user.setTotalXp(user.getTotalXp() + xpReward);
            user.setLessonsCompleted(user.getLessonsCompleted() + 1);
            userRepo.save(user);
        }

        return AuthResponse.UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .totalXp(user.getTotalXp())
                .streakDays(user.getStreakDays())
                .lessonsCompleted(user.getLessonsCompleted())
                .investorProfile(user.getInvestorProfile().name())
                .build();
    }

    public List<LessonProgressResponse> getUserProgress(Long userId) {
        return progressRepo.findByUserId(userId).stream()
                .map(p -> new LessonProgressResponse(
                        p.getLessonId(),
                        p.getStatus().name().toLowerCase()))
                .collect(Collectors.toList());
    }
}
