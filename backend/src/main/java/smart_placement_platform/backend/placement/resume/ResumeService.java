package smart_placement_platform.backend.placement.resume;



import org.springframework.stereotype.Service;
import smart_placement_platform.backend.placement.user.User;
import smart_placement_platform.backend.placement.user.UserRepository;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository) {

        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    public Resume getResume(Long userId) {

        return resumeRepository.findByUserId(userId)
                .orElseGet(() -> {

                    User user = userRepository.findById(userId)
                            .orElseThrow(() ->
                                    new RuntimeException("User not found"));

                    Resume resume = new Resume();
                    resume.setUser(user);

                    return resumeRepository.save(resume);
                });
    }

    public Resume saveResume(Long userId, Resume updatedResume) {

        Resume resume = resumeRepository.findByUserId(userId)
                .orElseGet(() -> {

                    User user = userRepository.findById(userId)
                            .orElseThrow(() ->
                                    new RuntimeException("User not found"));

                    Resume newResume = new Resume();
                    newResume.setUser(user);

                    return newResume;
                });

        resume.setPhone(updatedResume.getPhone());
        resume.setLocation(updatedResume.getLocation());
        resume.setSummary(updatedResume.getSummary());
        resume.setSkills(updatedResume.getSkills());
        resume.setEducation(updatedResume.getEducation());
        resume.setProjects(updatedResume.getProjects());
        resume.setExperience(updatedResume.getExperience());
        resume.setGithub(updatedResume.getGithub());
        resume.setLinkedin(updatedResume.getLinkedin());

        return resumeRepository.save(resume);
    }
}
