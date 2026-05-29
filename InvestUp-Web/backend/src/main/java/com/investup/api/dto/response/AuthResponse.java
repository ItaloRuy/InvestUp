package com.investup.api.dto.response;

import com.investup.api.entity.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String type;
    private UserSummary user;

    @Data
    @Builder
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private int totalXp;
        private int streakDays;
        private int lessonsCompleted;
        private String investorProfile;
    }

    public static AuthResponse of(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(UserSummary.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .totalXp(user.getTotalXp())
                        .streakDays(user.getStreakDays())
                        .lessonsCompleted(user.getLessonsCompleted())
                        .investorProfile(user.getInvestorProfile().name())
                        .build())
                .build();
    }
}
