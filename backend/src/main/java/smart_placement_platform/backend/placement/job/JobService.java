
package smart_placement_platform.backend.placement.job;

import org.springframework.stereotype.Service;

import smart_placement_platform.backend.placement.company.Company;
import smart_placement_platform.backend.placement.company.CompanyRepository;
import smart_placement_platform.backend.placement.user.StudentProfile;
import smart_placement_platform.backend.placement.user.StudentProfileRepository;
import smart_placement_platform.backend.placement.job.dto.JobRecommendation;

import java.util.ArrayList;
import java.util.List;

@Service
public class JobService {

    private final StudentProfileRepository studentProfileRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    public JobService(
            JobRepository jobRepository,
            CompanyRepository companyRepository,
            StudentProfileRepository studentProfileRepository) {

        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    // ================================
    // SMART JOB RECOMMENDATION
    // ================================

    public List<JobRecommendation> getRecommendedJobs(Long userId) {

        StudentProfile student =
                studentProfileRepository.findByUserId(userId)
                        .orElse(null);

        if (student == null || student.getCgpa() == null) {
            return List.of();
        }

        List<Job> jobs = jobRepository.findAll();

        List<JobRecommendation> recommendations =
                new ArrayList<>();

        for (Job job : jobs) {

            int skillMatch =
                    calculateSkillMatch(student, job);

            boolean cgpaEligible =
                    student.getCgpa() >= job.getMinimumCgpa();

            double cgpaScore =
                    Math.min(
                            (student.getCgpa() / 10.0) * 100,
                            100
                    );

            double finalScore =
                    (skillMatch * 0.50)
                            + (cgpaScore * 0.30)
                            + (cgpaEligible ? 20 : 0);

            boolean eligible =
                    cgpaEligible && skillMatch >= 50;

            String recommendation;

            if (!cgpaEligible) {

                recommendation = "Not Eligible";

            } else if (skillMatch >= 80) {

                recommendation = "Highly Suitable";

            } else if (skillMatch >= 50) {

                recommendation = "Suitable";

            } else {

                recommendation = "Low Skill Match";
            }

            JobRecommendation result =
                    new JobRecommendation();

            result.setJobId(job.getId());
            result.setJobTitle(job.getTitle());
            result.setCompanyName(
                    job.getCompany().getName()
            );
            result.setLocation(job.getLocation());
            result.setSalary(job.getSalary());
            result.setMinimumCgpa(
                    job.getMinimumCgpa()
            );

            result.setSkillMatch(skillMatch);
            result.setCgpaEligible(cgpaEligible);
            result.setEligible(eligible);
            result.setRecommendation(
                    recommendation
            );

            result.setFinalScore(
                    Math.round(finalScore * 100.0) / 100.0
            );

            recommendations.add(result);
        }

        recommendations.sort(
                (a, b) -> Double.compare(
                        b.getFinalScore(),
                        a.getFinalScore()
                )
        );

        return recommendations;
    }


    // ================================
    // SKILL MATCHING
    // ================================

    public int calculateSkillMatch(
            StudentProfile student,
            Job job) {

        if (student.getSkills() == null
                || job.getRequiredSkills() == null) {

            return 0;
        }

        String[] studentSkills =
                student.getSkills()
                        .toLowerCase()
                        .split(",");

        String[] requiredSkills =
                job.getRequiredSkills()
                        .toLowerCase()
                        .split(",");

        int matchedSkills = 0;

        for (String required : requiredSkills) {

            required = required.trim();

            for (String studentSkill : studentSkills) {

                if (studentSkill.trim()
                        .equals(required)) {

                    matchedSkills++;
                    break;
                }
            }
        }

        if (requiredSkills.length == 0) {
            return 0;
        }

        return (matchedSkills * 100)
                / requiredSkills.length;
    }


    // ================================
    // CREATE JOB
    // ================================

    public Job createJob(
            Job job,
            Long companyId) {

        Company company =
                companyRepository.findById(companyId)
                        .orElse(null);

        if (company == null) {
            return null;
        }

        // Always use the recruiter's company.
        // Do not trust company information
        // sent from the frontend.
        job.setCompany(company);

        return jobRepository.save(job);
    }


    // ================================
    // CGPA FILTER
    // ================================

    public List<Job> getJobsByMinimumCgpa(
            Double cgpa) {

        return jobRepository
                .findByMinimumCgpaLessThanEqual(cgpa);
    }


    // ================================
    // ELIGIBLE JOBS
    // ================================

    public List<Job> getEligibleJobs(
            Long userId) {

        StudentProfile student =
                studentProfileRepository
                        .findByUserId(userId)
                        .orElse(null);

        if (student == null
                || student.getCgpa() == null) {

            return List.of();
        }

        return jobRepository
                .findByMinimumCgpaLessThanEqual(
                        student.getCgpa()
                );
    }


    // ================================
    // GET RECRUITER'S JOBS
    // ================================

    public List<Job> getJobsForCompany(
            Long companyId) {

        return jobRepository
                .findByCompanyId(companyId);
    }


    // ================================
    // GET ALL JOBS
    // ================================

    public List<Job> getAllJobs() {

        return jobRepository.findAll();
    }


    // ================================
    // GET JOBS BY LOCATION
    // ================================

    public List<Job> getJobsByLocation(
            String location) {

        return jobRepository
                .findByLocationIgnoreCase(location);
    }


    // ================================
    // GET JOB BY ID
    // ================================

    public Job getJob(Long id) {

        return jobRepository.findById(id)
                .orElse(null);
    }


    // ================================
    // UPDATE JOB
    // ================================

    public Job updateJob(
            Long id,
            Job updatedJob,
            Long companyId) {

        Job job =
                jobRepository.findById(id)
                        .orElse(null);

        if (job == null) {
            return null;
        }

        // Security check:
        // Recruiter can update only their own company's job.
        if (job.getCompany() == null
                || !job.getCompany()
                .getId()
                .equals(companyId)) {

            return null;
        }

        job.setTitle(
                updatedJob.getTitle()
        );

        job.setDescription(
                updatedJob.getDescription()
        );

        job.setLocation(
                updatedJob.getLocation()
        );

        job.setJobType(
                updatedJob.getJobType()
        );

        job.setSalary(
                updatedJob.getSalary()
        );

        job.setRequiredSkills(
                updatedJob.getRequiredSkills()
        );

        job.setMinimumCgpa(
                updatedJob.getMinimumCgpa()
        );

        job.setExperienceRequired(
                updatedJob.getExperienceRequired()
        );

        // Keep the original company.
        job.setCompany(
                job.getCompany()
        );

        return jobRepository.save(job);
    }


    // ================================
    // DELETE JOB
    // ================================

    public String deleteJob(
            Long id,
            Long companyId) {

        Job job =
                jobRepository.findById(id)
                        .orElse(null);

        if (job == null) {
            return "Job not found";
        }

        // Security check:
        // Recruiter can delete only their own company's job.
        if (job.getCompany() == null
                || !job.getCompany()
                .getId()
                .equals(companyId)) {

            return "Unauthorized";
        }

        jobRepository.delete(job);

        return "Job deleted successfully";
    }
}

