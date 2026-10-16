package smart_placement_platform.backend.placement.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    List<Application> findByStudentId(Long studentId);

    List<Application> findByJobId(Long jobId);

    Application findByIdAndStudentId(Long id, Long studentId);

    // Get all applications for jobs belonging to a company
    List<Application> findByJobCompanyId(Long companyId);

    // Recruiter dashboard statistics
    long countByJobCompanyId(Long companyId);

    long countByJobCompanyIdAndStatus(
            Long companyId,
            ApplicationStatus status
    );
}