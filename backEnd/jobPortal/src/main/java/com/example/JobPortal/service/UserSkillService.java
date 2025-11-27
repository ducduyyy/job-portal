package com.example.JobPortal.service;

import com.example.JobPortal.dto.UserSkillDto;
import com.example.JobPortal.model.User;
import com.example.JobPortal.model.UserSkill;
import com.example.JobPortal.model.UserSkillId;
import com.example.JobPortal.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSkillService {

    private final UserSkillRepository userSkillRepository;

    public List<UserSkillDto> getSkillsByUser(User user) {
        return userSkillRepository.findByUser(user)
                .stream()
                .map(us -> new UserSkillDto(
                        us.getUser().getId(),
                        us.getSkill().getId(),
                        us.getSkill().getName()
                ))
                .toList();
    }

    public UserSkillDto addSkill(UserSkill userSkill) {
        UserSkill saved = userSkillRepository.save(userSkill);
        return new UserSkillDto(
                saved.getUser().getId(),
                saved.getSkill().getId(),
                saved.getSkill().getName()
        );
    }

    public void deleteSkill(UserSkillId id) {
        userSkillRepository.deleteById(id);
    }
}


