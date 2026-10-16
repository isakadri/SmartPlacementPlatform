package smart_placement_platform.backend.placement.job;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import smart_placement_platform.backend.placement.user.User;
import smart_placement_platform.backend.placement.user.UserRepository;
import smart_placement_platform.backend.placement.user.StudentProfile;
import smart_placement_platform.backend.placement.user.StudentProfileRepository;
import smart_placement_platform.backend.placement.job.dto.JobRecommendation;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final JobService jobService;

    public JobController(
            JobService jobService,
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository) {

        this.jobService = jobService;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
    }


    // ================================
    // RECOMMENDED JOBS
    // ================================

    @GetMapping("/recommended")
    public ResponseEntity<List<JobRecommendation>> getRecommendedJobs(
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                jobService.getRecommendedJobs(user.getId())
        );
    }


    // ================================
    // RECRUITER JOBS
    // ================================

    @GetMapping("/recruiter")
    public ResponseEntity<List<Job>> getRecruiterJobs(
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.notFound().build();
        }

        Long companyId =
                user.getCompany().getId();

        return ResponseEntity.ok(
                jobService.getJobsForCompany(companyId)
        );
    }


    // ================================
    // SKILL MATCH
    // ================================

    @GetMapping("/{id}/skill-match")
    public ResponseEntity<Integer> getSkillMatch(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile student =
                studentProfileRepository
                        .findByUserId(user.getId())
                        .orElse(null);

        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        Job job = jobService.getJob(id);

        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        int match =
                jobService.calculateSkillMatch(
                        student,
                        job
                );

        return ResponseEntity.ok(match);
    }


    // ================================
    // CREATE JOB
    // ================================

    @PostMapping
    public ResponseEntity<Job> createJob(
            @RequestBody Job job,
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.badRequest().build();
        }

        Long companyId =
                user.getCompany().getId();

        Job createdJob =
                jobService.createJob(
                        job,
                        companyId
                );

        if (createdJob == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(createdJob);
    }


    // ================================
    // GET ALL JOBS
    // ================================

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minimumCgpa) {

        if (location != null && !location.isBlank()) {

            return ResponseEntity.ok(
                    jobService.getJobsByLocation(location)
            );
        }

        if (minimumCgpa != null) {

            return ResponseEntity.ok(
                    jobService.getJobsByMinimumCgpa(
                            minimumCgpa
                    )
            );
        }

        return ResponseEntity.ok(
                jobService.getAllJobs()
        );
    }


    // ================================
    // ELIGIBLE JOBS
    // ================================

    @GetMapping("/eligible")
    public ResponseEntity<List<Job>> getEligibleJobs(
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                jobService.getEligibleJobs(
                        user.getId()
                )
        );
    }


    // ================================
    // GET JOB BY ID
    // ================================

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(
            @PathVariable Long id) {

        Job job =
                jobService.getJob(id);

        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(job);
    }


    // ================================
    // UPDATE JOB
    // ================================

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody Job job,
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.notFound().build();
        }

        Long companyId =
                user.getCompany().getId();

        Job updatedJob =
                jobService.updateJob(
                        id,
                        job,
                        companyId
                );

        if (updatedJob == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedJob);
    }


    // ================================
    // DELETE JOB
    // ================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.notFound().build();
        }

        Long companyId =
                user.getCompany().getId();

        String result =
                jobService.deleteJob(
                        id,
                        companyId
                );

        if (result.equals("Job not found")) {
            return ResponseEntity.notFound().build();
        }

        if (result.equals("Unauthorized")) {
            return ResponseEntity.status(403).body(result);
        }

        return ResponseEntity.ok(result);
    }
}

