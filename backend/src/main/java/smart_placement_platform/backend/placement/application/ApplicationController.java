package smart_placement_platform.backend.placement.application;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import smart_placement_platform.backend.placement.user.User;
import smart_placement_platform.backend.placement.user.UserRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    public ApplicationController(
            ApplicationService applicationService,
            UserRepository userRepository) {

        this.applicationService = applicationService;
        this.userRepository = userRepository;
    }

    // ==========================================
    // STUDENT APPLIES FOR A JOB
    // ==========================================

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<Application> apply(
            @PathVariable Long jobId,
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Application application =
                applicationService.apply(
                        user.getId(),
                        jobId
                );

        if (application == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(application);
    }

    // ==========================================
    // GET MY APPLICATIONS - STUDENT
    // ==========================================

    @GetMapping("/my")
    public ResponseEntity<List<Application>> getMyApplications(
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                applicationService.getMyApplications(
                        user.getId()
                )
        );
    }

    // ==========================================
    // GET APPLICATIONS FOR A JOB
    // RECRUITER COMPANY SECURITY
    // ==========================================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getApplicationsForJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long companyId =
                user.getCompany().getId();

        List<Application> applications =
                applicationService.getApplicationsForJob(
                        jobId,
                        companyId
                );

        return ResponseEntity.ok(applications);
    }

    // ==========================================
    // UPDATE APPLICATION STATUS
    // RECRUITER COMPANY SECURITY
    // ==========================================

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<Application> updateStatus(
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status,
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long companyId =
                user.getCompany().getId();

        Application application =
                applicationService.updateStatus(
                        applicationId,
                        status,
                        companyId
                );

        if (application == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(application);
    }

    // ==========================================
    // RECRUITER DASHBOARD STATS
    // ==========================================

    @GetMapping("/recruiter/stats")
    public ResponseEntity<Map<String, Long>> getRecruiterStats(
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long companyId =
                user.getCompany().getId();

        long totalApplicants =
                applicationService.getTotalApplicants(
                        companyId
                );

        long shortlisted =
                applicationService.getShortlistedApplicants(
                        companyId
                );

        long selected =
                applicationService.getSelectedApplicants(
                        companyId
                );

        return ResponseEntity.ok(
                Map.of(
                        "totalApplicants", totalApplicants,
                        "shortlisted", shortlisted,
                        "selected", selected
                )
        );
    }

    // ==========================================
    // RECRUITER - GET ALL COMPANY APPLICANTS
    // ==========================================

    @GetMapping("/recruiter")
    public ResponseEntity<List<Application>>
    getRecruiterApplications(
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email).orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long companyId =
                user.getCompany().getId();

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsForCompany(companyId)
        );
    }
}
