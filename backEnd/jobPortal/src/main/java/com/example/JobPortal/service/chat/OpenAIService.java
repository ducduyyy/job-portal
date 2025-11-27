package com.example.JobPortal.service.chat;

import com.example.JobPortal.dto.JobDto;
import com.openai.errors.RateLimitException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class OpenAIService {

    // BE không gọi Puter API nữa, chỉ đóng vai trò trả lời fallback
    public String getChatResponse(String userMessage) {
        // fallback message khi FE GPT-5 không trả về kết quả
        return "Dưới đây là danh sách các job phù hợp với yêu cầu của bạn 👇";
    }

    public String getChatResponseWithJobs(String userMessage, List<JobDto> jobs) {
        if (jobs == null || jobs.isEmpty()) {
            return getChatResponse(userMessage);
        }

        // Tạo phần tóm tắt các job gửi cho model
        StringBuilder jobSummary = new StringBuilder();
        jobSummary.append("Dưới đây là một số công việc phù hợp :\n");
        int i = 0;
        for (com.example.JobPortal.dto.JobDto j : jobs) {
            i++;
            jobSummary.append(i)
                    .append(". ")
                    .append(j.getTitle() != null ? j.getTitle() : "Untitled")
                    .append(" — ")
                    .append(j.getPostedByName() != null ? j.getPostedByName() : "")
                    .append(j.getLocation() != null ? " | " + j.getLocation() : "")
                    .append(j.getSalaryMax() != null ? " | " + j.getSalaryMax() : "")
                    .append(j.getSalaryMin() != null ? " | " + j.getSalaryMin() : "")
                    .append("\n");
            if (i >= 6) break;
        }

        // Nối message người dùng + context job
        String augmentedUserMessage = userMessage
                + "\n\n" + jobSummary.toString()
                + "\n\nHãy trả lời người dùng bằng tiếng Việt, nói tự nhiên, thân thiện: "
                + "bắt đầu bằng câu 'Dưới đây là danh sách các job phù hợp cho yêu cầu của bạn 👇' "
                + "sau đó tóm tắt ngắn gọn (1-2 câu), "
                + "nêu 3 job nổi bật nhất, "
                + "và hỏi người dùng có muốn xem thêm công việc khác cùng ngành không.";


        // Gọi lại method chuẩn (sẽ tự tạo messages + gọi OpenAI)
        return getChatResponse(augmentedUserMessage);
    }



}
