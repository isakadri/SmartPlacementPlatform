package smart_placement_platform.backend.placement.job;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByLocationIgnoreCase(String location);

    List<Job> findByMinimumCgpaLessThanEqual(Double cgpa);

    // Get all jobs belonging to a specific company
    List<Job> findByCompanyId(Long companyId);
}