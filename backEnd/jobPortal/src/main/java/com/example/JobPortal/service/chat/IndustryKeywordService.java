package com.example.JobPortal.service.chat;

import com.example.JobPortal.model.Industry;
import com.example.JobPortal.model.Skills;
import com.example.JobPortal.repository.IndustryRepository;
import com.example.JobPortal.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IndustryKeywordService {
    private final IndustryRepository industryRepository;
    private final SkillRepository skillRepository;

    public Optional<Industry> detectIndustryFromMessage(String message) {
        String msg = message.toLowerCase(Locale.ROOT);
        List<Industry> industries = industryRepository.findAll();

        for (Industry ind : industries) {
            if (msg.contains(ind.getName().toLowerCase(Locale.ROOT))) {
                return Optional.of(ind);
            }
        }

        if (msg.contains("it") || msg.contains("developer") || msg.contains("lập trình")
                || msg.contains("java") || msg.contains("frontend") || msg.contains("backend")) {
            return industries.stream().filter(i -> i.getName().toLowerCase().contains("công nghệ thông tin")).findFirst();
        }

        if (msg.contains("design") || msg.contains("ui") || msg.contains("ux")
                || msg.contains("3d") || msg.contains("artist")) {
            return industries.stream().filter(i -> i.getName().toLowerCase().contains("thiết kế")).findFirst();
        }

        if (msg.contains("marketing") || msg.contains("content") || msg.contains("truyền thông")) {
            return industries.stream().filter(i -> i.getName().toLowerCase().contains("marketing")).findFirst();
        }

        if (msg.contains("tài chính") || msg.contains("accounting") || msg.contains("finance")
                || msg.contains("ngân hàng")) {
            return industries.stream().filter(i -> i.getName().toLowerCase().contains("tài chính")).findFirst();
        }

        if (msg.contains("giáo dục") || msg.contains("teacher") || msg.contains("giảng dạy")) {
            return industries.stream().filter(i -> i.getName().toLowerCase().contains("giáo dục")).findFirst();
        }

        List<Skills> skills = skillRepository.findAll();
        for (Skills skill : skills) {
            if (msg.contains(skill.getName().toLowerCase(Locale.ROOT))) {
                return industries.stream()
                        .filter(i -> i.getId().equals(skill.getIndustry().getId()))
                        .findFirst();
            }
        }

        return Optional.empty();
    }

    public Optional<String> detectLocationFromMessage(String message) {
        String msg = message.toLowerCase(Locale.ROOT);

        if (msg.contains("hà nội") || msg.contains("ha noi") || msg.contains("hanoi") || msg.contains("hn")) {
            return Optional.of("Hà Nội");
        }
        if (msg.contains("hồ chí minh") || msg.contains("tp.hcm") || msg.contains("hcm")
                || msg.contains("sài gòn") || msg.contains("sg")) {
            return Optional.of("TP.HCM");
        }
        if (msg.contains("đà nẵng") || msg.contains("da nang") || msg.contains("dn")) {
            return Optional.of("Đà Nẵng");
        }
        if (msg.contains("hải phòng") || msg.contains("hp")) {
            return Optional.of("Hải Phòng");
        }
        if (msg.contains("cần thơ") || msg.contains("can tho")) {
            return Optional.of("Cần Thơ");
        }

        return Optional.empty();
    }
}
