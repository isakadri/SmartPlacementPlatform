package smart_placement_platform.backend.placement.application;

import org.springframework.stereotype.Service;
import smart_placement_platform.backend.placement.job.Job;
import smart_placement_platform.backend.placement.job.JobRepository;
import smart_placement_platform.backend.placement.user.StudentProfile;
import smart_placement_platform.backend.placement.user.StudentProfileRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JobRepository jobRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentProfileRepository studentProfileRepository,
                              JobRepository jobRepository) {

        this.applicationRepository = applicationRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.jobRepository = jobRepository;
    }

    // ==========================================
    // STUDENT - APPLY FOR JOB
    // ==========================================

    public Application apply(Long userId, Long jobId) {

        StudentProfile student =
                studentProfileRepository.findByUserId(userId).orElse(null);

        if (student == null) {
            return null;
        }

        Job job = jobRepository.findById(jobId).orElse(null);

        if (job == null) {
            return null;
        }

        // Prevent duplicate application
        List<Application> applications =
                applicationRepository.findByStudentId(student.getId());

        for (Application application : applications) {

            if (application.getJob().getId().equals(jobId)) {
                return null;
            }
        }

        Application application = new Application();

        application.setStudent(student);
        application.setJob(job);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setAppliedDate(LocalDate.now().toString());

        return applicationRepository.save(application);
    }

    // ==========================================
    // RECRUITER - UPDATE APPLICATION STATUS
    // ==========================================

    public Application updateStatus(Long applicationId,
                                    ApplicationStatus status,
                                    Long companyId) {

        Application application =
                applicationRepository.findById(applicationId).orElse(null);

        if (application == null) {
            return null;
        }

        Job job = application.getJob();

        // Security check:
        // Recruiter can only modify applications
        // belonging to their own company's job.
        if (job == null ||
                job.getCompany() == null ||
                !job.getCompany().getId().equals(companyId)) {

            return null;
        }

        application.setStatus(status);

        return applicationRepository.save(application);
    }

    // ==========================================
    // STUDENT - MY APPLICATIONS
    // ==========================================

    public List<Application> getMyApplications(Long userId) {

        StudentProfile student =
                studentProfileRepository.findByUserId(userId).orElse(null);

        if (student == null) {
            return List.of();
        }

        return applicationRepository.findByStudentId(student.getId());
    }

    // ==========================================
    // RECRUITER - APPLICATIONS FOR JOB
    // ==========================================

    public List<Application> getApplicationsForJob(Long jobId,
                                                   Long companyId) {

        Job job = jobRepository.findById(jobId).orElse(null);

        if (job == null) {
            return List.of();
        }

        // Security check:
        // Recruiter can only view applications
        // for jobs belonging to their own company.
        if (job.getCompany() == null ||
                !job.getCompany().getId().equals(companyId)) {

            return List.of();
        }

        return applicationRepository.findByJobId(jobId);
    }

    // ==========================================
    // RECRUITER STATISTICS
    // ==========================================

    public long getTotalApplicants(Long companyId) {

        return applicationRepository.countByJobCompanyId(companyId);
    }

    public long getShortlistedApplicants(Long companyId) {

        return applicationRepository.countByJobCompanyIdAndStatus(
                companyId,
                ApplicationStatus.SHORTLISTED
        );
    }

    public long getSelectedApplicants(Long companyId) {

        return applicationRepository.countByJobCompanyIdAndStatus(
                companyId,
                ApplicationStatus.SELECTED
        );
    }

    // ==========================================
    // RECRUITER - ALL COMPANY APPLICATIONS
    // ==========================================

    public List<Application> getApplicationsForCompany(Long companyId) {

        return applicationRepository.findByJobCompanyId(companyId);
    }
}