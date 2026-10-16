package smart_placement_platform.backend.placement.resume;

import org.springframework.stereotype.Service;
import smart_placement_platform.backend.placement.job.Job;

import java.util.*;

@Service
public class ResumeMatchService {

    public Map<String, Object> calculateSkillMatch(
            String resumeSkills,
            Job job
    ) {

        Set<String> resumeSkillSet = normalizeSkills(resumeSkills);
        Set<String> requiredSkillSet = normalizeSkills(job.getRequiredSkills());

        Set<String> matchedSkills = new LinkedHashSet<>();
        Set<String> missingSkills = new LinkedHashSet<>();

        for (String requiredSkill : requiredSkillSet) {

            if (resumeSkillSet.contains(requiredSkill)) {
                matchedSkills.add(requiredSkill);
            } else {
                missingSkills.add(requiredSkill);
            }
        }

        int totalRequiredSkills = requiredSkillSet.size();
        int matchedSkillCount = matchedSkills.size();

        double matchPercentage = 0;

        if (totalRequiredSkills > 0) {
            matchPercentage =
                    ((double) matchedSkillCount / totalRequiredSkills) * 100;
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("jobTitle", job.getTitle());
        result.put("matchPercentage", Math.round(matchPercentage));
        result.put("matchedSkills", matchedSkills);
        result.put("missingSkills", missingSkills);

        return result;
    }

    private Set<String> normalizeSkills(String skills) {

        if (skills == null || skills.isBlank()) {
            return new LinkedHashSet<>();
        }

        String[] skillArray = skills.split(",");

        Set<String> skillSet = new LinkedHashSet<>();

        for (String skill : skillArray) {
            skillSet.add(skill.trim().toLowerCase());
        }

        return skillSet;
    }
}