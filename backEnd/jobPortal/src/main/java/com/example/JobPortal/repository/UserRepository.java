package com.example.JobPortal.repository;

import com.example.JobPortal.dto.MonthlyDataDto;
import com.example.JobPortal.enums.AccountStatus;
import com.example.JobPortal.enums.Role;
import com.example.JobPortal.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query(value = """
    SELECT DATE_FORMAT(u.createdAt, '%Y-%m') AS month, COUNT(u.id) AS count
    FROM users u
    WHERE u.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(u.createdAt, '%Y-%m')
    ORDER BY month ASC
""", nativeQuery = true)
    List<Object[]> findUserGrowthLast6MonthsNative();



    // === Cho Tab "User Management" (Lọc) ===
    Page<User> findByRoleAndStatus(Role role, AccountStatus status, Pageable pageable);
    Page<User> findByRole(Role role, Pageable pageable);
    Page<User> findByStatus(AccountStatus status, Pageable pageable);
    Optional<User> findByResetToken(String resetToken);



}
