package smart_placement_platform.backend.placement.job.dto;

public class JobRecommendation {
    private double finalScore;

    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String location;
    private Double salary;
    private Double minimumCgpa;
    private int skillMatch;
    private boolean cgpaEligible;
    private boolean eligible;
    private String recommendation;

    public JobRecommendation() {
    }

    // Generate getters and setters for all fields

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public Double getMinimumCgpa() {
        return minimumCgpa;
    }

    public double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(double finalScore) {
        this.finalScore = finalScore;
    }

    public void setMinimumCgpa(Double minimumCgpa) {
        this.minimumCgpa = minimumCgpa;
    }

    public int getSkillMatch() {
        return skillMatch;
    }

    public void setSkillMatch(int skillMatch) {
        this.skillMatch = skillMatch;
    }

    public boolean isCgpaEligible() {
        return cgpaEligible;
    }

    public void setCgpaEligible(boolean cgpaEligible) {
        this.cgpaEligible = cgpaEligible;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}