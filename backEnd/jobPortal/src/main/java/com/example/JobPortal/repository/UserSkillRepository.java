package com.example.JobPortal.repository;

import com.example.JobPortal.model.User;
import com.example.JobPortal.model.UserSkill;
import com.example.JobPortal.model.UserSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, UserSkillId> {
    List<UserSkill> findByUser(User user);
}

