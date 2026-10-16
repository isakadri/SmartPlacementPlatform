package smart_placement_platform.backend.placement.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/profile")
public class StudentProfileController {

    private final StudentProfileService profileService;
    private final UserRepository userRepository;

    public StudentProfileController(
            StudentProfileService profileService,
            UserRepository userRepository) {

        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    // Create Profile
    @PostMapping
    public ResponseEntity<StudentProfile> createProfile(
            @RequestBody StudentProfile profile,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile savedProfile =
                profileService.createProfile(
                        user.getId(),
                        profile
                );

        return ResponseEntity.ok(savedProfile);
    }

    // Get My Profile
    @GetMapping
    public ResponseEntity<StudentProfile> getMyProfile(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile profile =
                profileService.getProfileByUserId(user.getId());

        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(profile);
    }

    // Update My Profile
    @PutMapping
    public ResponseEntity<StudentProfile> updateProfile(
            @RequestBody StudentProfile profile,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        StudentProfile updatedProfile =
                profileService.updateProfile(
                        user.getId(),
                        profile
                );

        if (updatedProfile == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedProfile);
    }

    // Delete My Profile
    @DeleteMapping
    public ResponseEntity<String> deleteProfile(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        String result =
                profileService.deleteProfile(user.getId());

        if (result.equals("Profile not found")) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(result);
    }
}