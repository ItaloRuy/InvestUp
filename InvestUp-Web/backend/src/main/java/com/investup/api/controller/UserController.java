package com.investup.api.controller;

import com.investup.api.dto.request.CompleteLessonRequest;
import com.investup.api.dto.response.AuthResponse;
import com.investup.api.dto.response.LessonProgressResponse;
import com.investup.api.entity.User;
import com.investup.api.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final LessonService lessonService;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserSummary> getCurrentUser(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(AuthResponse.UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .totalXp(user.getTotalXp())
                .streakDays(user.getStreakDays())
                .lessonsCompleted(user.getLessonsCompleted())
                .investorProfile(user.getInvestorProfile().name())
                .build());
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<AuthResponse.UserSummary> completeLesson(
            @PathVariable String lessonId,
            @RequestBody CompleteLessonRequest request,
            @AuthenticationPrincipal User user) {

        AuthResponse.UserSummary summary = lessonService.completeLesson(
                user.getId(), lessonId, request.getXpReward(), request.getTrailNumber());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/progress")
    public ResponseEntity<List<LessonProgressResponse>> getUserProgress(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(lessonService.getUserProgress(user.getId()));
    }
}
