package com.example.JobPortal.repository;

import com.example.JobPortal.dto.IndustryJobCountDto;
import com.example.JobPortal.model.Industry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IndustryRepository extends JpaRepository<Industry, Long> {
    @Query("""
        SELECT i.id AS id, COUNT(j.id) AS jobCount
        FROM Industry i
        LEFT JOIN Jobs j ON j.industry.id = i.id
        GROUP BY i.id
    """)
    List<Object[]> countJobsByIndustry();

    // ⭐️ HÀM MỚI (TRẢ VỀ DTO): Thêm hàm này
    // Query này trả về (String name, long count) mà DTO Admin cần
    @Query("""
        SELECT new com.example.JobPortal.dto.IndustryJobCountDto(
            i.name, 
            COUNT(j.id)
        )
        FROM Industry i
        LEFT JOIN Jobs j ON j.industry.id = i.id
        GROUP BY i.id, i.name
    """)
    List<IndustryJobCountDto> findIndustryJobCountsForAdmin();

}

