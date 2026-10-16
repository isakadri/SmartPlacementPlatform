package smart_placement_platform.backend.placement.user;

import org.springframework.stereotype.Service;

@Service
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;
    private final UserRepository userRepository;

    public StudentProfileService(
            StudentProfileRepository profileRepository,
            UserRepository userRepository) {

        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    // Create Profile
    public StudentProfile createProfile(
            Long userId,
            StudentProfile profile) {

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return null;
        }

        profile.setUser(user);

        return profileRepository.save(profile);
    }

    // Get Profile by User
    public StudentProfile getProfileByUserId(Long userId) {

        return profileRepository.findByUserId(userId)
                .orElse(null);
    }

    // Update Profile
    public StudentProfile updateProfile(
            Long userId,
            StudentProfile updatedProfile) {

        StudentProfile profile =
                profileRepository.findByUserId(userId)
                        .orElse(null);

        if (profile == null) {
            return null;
        }

        profile.setPhone(updatedProfile.getPhone());
        profile.setCollege(updatedProfile.getCollege());
        profile.setDegree(updatedProfile.getDegree());
        profile.setBranch(updatedProfile.getBranch());
        profile.setCgpa(updatedProfile.getCgpa());
        profile.setSkills(updatedProfile.getSkills());
        profile.setGraduationYear(
                updatedProfile.getGraduationYear()
        );
        profile.setGithubUrl(
                updatedProfile.getGithubUrl()
        );
        profile.setLinkedinUrl(
                updatedProfile.getLinkedinUrl()
        );

        return profileRepository.save(profile);
    }

    // Delete Profile
    public String deleteProfile(Long userId) {

        StudentProfile profile =
                profileRepository.findByUserId(userId)
                        .orElse(null);

        if (profile == null) {
            return "Profile not found";
        }

        profileRepository.delete(profile);

        return "Profile deleted successfully";
    }
}