package com.investup.api.repository;

import com.investup.api.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    List<UserProgress> findByUserId(Long userId);

    List<UserProgress> findByUserIdAndTrailNumber(Long userId, int trailNumber);

    Optional<UserProgress> findByUserIdAndLessonId(Long userId, String lessonId);

    long countByUserIdAndStatus(Long userId, UserProgress.LessonStatus status);
}
