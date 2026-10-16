
package smart_placement_platform.backend.placement.company;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import smart_placement_platform.backend.placement.user.User;
import smart_placement_platform.backend.placement.user.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;
    private final UserRepository userRepository;

    public CompanyController(
            CompanyService companyService,
            UserRepository userRepository) {

        this.companyService = companyService;
        this.userRepository = userRepository;
    }


    // ==========================================
    // CREATE COMPANY
    // ==========================================

    @PostMapping
    public ResponseEntity<Company> createCompany(
            @RequestBody Company company) {

        return ResponseEntity.ok(
                companyService.createCompany(company)
        );
    }


    // ==========================================
    // GET ALL COMPANIES
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {

        return ResponseEntity.ok(
                companyService.getAllCompanies()
        );
    }


    // ==========================================
    // GET COMPANY BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompany(
            @PathVariable Long id) {

        Company company =
                companyService.getCompany(id);

        if (company == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(company);
    }


    // ==========================================
    // GET MY COMPANY - RECRUITER
    // ==========================================

    @GetMapping("/my")
    public ResponseEntity<Company> getMyCompany(
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.notFound().build();
        }

        Long companyId =
                user.getCompany().getId();

        Company company =
                companyService.getCompany(companyId);

        if (company == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(company);
    }


    // ==========================================
    // UPDATE COMPANY
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(
            @PathVariable Long id,
            @RequestBody Company company) {

        Company updatedCompany =
                companyService.updateCompany(
                        id,
                        company
                );

        if (updatedCompany == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedCompany);
    }


    // ==========================================
    // UPDATE MY COMPANY - RECRUITER
    // ==========================================

    @PutMapping("/my")
    public ResponseEntity<Company> updateMyCompany(
            @RequestBody Company updatedCompany,
            Authentication authentication) {

        String email = authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (user == null || user.getCompany() == null) {
            return ResponseEntity.notFound().build();
        }

        Long companyId =
                user.getCompany().getId();

        Company company =
                companyService.updateCompany(
                        companyId,
                        updatedCompany
                );

        if (company == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(company);
    }


    // ==========================================
    // DELETE COMPANY
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCompany(
            @PathVariable Long id) {

        String result =
                companyService.deleteCompany(id);

        if (result.equals("Company not found")) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(result);
    }
}

