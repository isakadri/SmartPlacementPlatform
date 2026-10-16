package smart_placement_platform.backend.placement.resume;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import smart_placement_platform.backend.placement.job.Job;
import smart_placement_platform.backend.placement.job.JobRepository;
import smart_placement_platform.backend.placement.user.User;
import smart_placement_platform.backend.placement.user.UserRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeMatchController {

    private final ResumeMatchService resumeMatchService;
    private final ResumeService resumeService;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public ResumeMatchController(
            ResumeMatchService resumeMatchService,
            ResumeService resumeService,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.resumeMatchService = resumeMatchService;
        this.resumeService = resumeService;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/match/{jobId}")
    public ResponseEntity<?> matchResumeWithJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Job job = jobRepository.findById(jobId)
                .orElse(null);

        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        Resume resume = resumeService.getResume(user.getId());

        Map<String, Object> result =
                resumeMatchService.calculateSkillMatch(
                        resume.getSkills(),
                        job
                );

        return ResponseEntity.ok(result);
    }
}