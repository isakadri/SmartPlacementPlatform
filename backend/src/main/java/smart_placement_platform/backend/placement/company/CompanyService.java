package smart_placement_platform.backend.placement.company;



import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    // Create Company
    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }

    // Get All Companies
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    // Get Company By ID
    public Company getCompany(Long id) {
        return companyRepository.findById(id)
                .orElse(null);
    }

    // Update Company
    public Company updateCompany(
            Long id,
            Company updatedCompany) {

        Company company = companyRepository.findById(id)
                .orElse(null);

        if (company == null) {
            return null;
        }

        company.setName(updatedCompany.getName());
        company.setDescription(updatedCompany.getDescription());
        company.setIndustry(updatedCompany.getIndustry());
        company.setLocation(updatedCompany.getLocation());
        company.setWebsite(updatedCompany.getWebsite());
        company.setCompanySize(updatedCompany.getCompanySize());

        return companyRepository.save(company);
    }

    // Delete Company
    public String deleteCompany(Long id) {

        if (!companyRepository.existsById(id)) {
            return "Company not found";
        }

        companyRepository.deleteById(id);

        return "Company deleted successfully";
    }
}
