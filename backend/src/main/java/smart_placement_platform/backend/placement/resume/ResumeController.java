package smart_placement_platform.backend.placement.resume;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import smart_placement_platform.backend.placement.user.User;
import smart_placement_platform.backend.placement.user.UserRepository;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    public ResumeController(
            ResumeService resumeService,
            UserRepository userRepository) {

        this.resumeService = resumeService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Resume> getResume(
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                resumeService.getResume(user.getId())
        );
    }

    @PutMapping
    public ResponseEntity<Resume> saveResume(
            Authentication authentication,
            @RequestBody Resume resumeData) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                resumeService.saveResume(
                        user.getId(),
                        resumeData
                )
        );
    }
}