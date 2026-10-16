package smart_placement_platform.backend.placement.test;



import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public String hello() {
        return "JWT authentication is working!";
    }
    @GetMapping("/student")
    public String studentOnly() {
        return "Welcome Student! You have STUDENT role.";
    }
}
