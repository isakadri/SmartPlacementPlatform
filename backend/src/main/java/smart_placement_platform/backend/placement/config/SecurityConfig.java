package smart_placement_platform.backend.placement.config;

import smart_placement_platform.backend.placement.auth.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(request -> {
                    var configuration = new org.springframework.web.cors.CorsConfiguration();

                    configuration.setAllowedOrigins(
                            java.util.List.of("http://localhost:5173")
                    );

                    configuration.setAllowedMethods(
                            java.util.List.of(
                                    "GET",
                                    "POST",
                                    "PUT",
                                    "DELETE",
                                    "OPTIONS"
                            )
                    );

                    configuration.setAllowedHeaders(
                            java.util.List.of("*")
                    );

                    configuration.setAllowCredentials(true);

                    return configuration;
                }))

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        .requestMatchers("/api/test/student")
                        .hasRole("STUDENT")

                        .requestMatchers("/api/applications/apply/**")
                        .hasRole("STUDENT")

                        .requestMatchers("/api/applications/my")
                        .hasRole("STUDENT")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/jobs/**"
                        )
                        .hasAnyRole("STUDENT", "RECRUITER", "ADMIN")

                        .requestMatchers("/api/jobs/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .requestMatchers("/api/companies/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .requestMatchers("/api/applications/*/status")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .requestMatchers("/api/applications/job/**")
                        .hasAnyRole("RECRUITER", "ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}