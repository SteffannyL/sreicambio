package srei.proyecto.srei.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.reactive.function.client.WebClient;

import srei.proyecto.srei.usuario.repository.UsuarioRepository;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final UsuarioRepository usuarioRepository;
    private final JdbcTemplate jdbcTemplate;
@Bean
public WebClient.Builder webClientBuilder() {
    return WebClient.builder();
}
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthFilter
    ) throws Exception {

        http
            // 🔹 CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 🔹 CSRF desactivado (JWT)
            .csrf(csrf -> csrf.disable())

            // 🔹 Autorización limpia y clara
            .authorizeHttpRequests(auth -> auth

                // Preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Públicas
                .requestMatchers("/api/auth/**").permitAll()

                // ADMIN
                .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                // DOCENTE
                // IA (igual que aprobar-evento pero flexible)
// DOCENTE
.requestMatchers(HttpMethod.POST, "/api/ia/preguntar")
    .hasAnyRole("DOCENTE", "COORDINADOR")

.requestMatchers("/api/docente/**")
    .hasRole("DOCENTE")

                // COORDINADOR
                .requestMatchers(HttpMethod.POST, "/api/coordinador/aprobar-evento")
.hasRole("COORDINADOR")

.requestMatchers("/api/coordinador/**")
.hasAnyRole("ADMIN", "COORDINADOR")

                // DECANO
                .requestMatchers("/api/decano/**")
                    .hasRole("DECANO")

                // Todo lo demás autenticado
                .anyRequest().authenticated()
            )

            // Stateless (JWT)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Provider
            .authenticationProvider(authenticationProvider())

            // Filtro JWT
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> usuarioRepository.findByCorreo(email)
                .map(usuario -> {

                    Set<String> authorities = new HashSet<>();

                    List<Map<String, Object>> rolesBd =
                            jdbcTemplate.queryForList(
                                "SELECT nombrerol FROM usuariorol ur " +
                                "JOIN rol r ON ur.idrol = r.idrol " +
                                "WHERE ur.idusuario = ?",
                                usuario.getIdusuario()
                            );

                    for (Map<String, Object> row : rolesBd) {

                        String rolBd =
                                ((String) row.get("nombrerol")).toLowerCase();

                        String rolApp = switch (rolBd) {
                            case "admin"          -> "ADMIN";
                            case "coordinador"    -> "COORDINADOR";
                            case "decano"         -> "DECANO";
                            case "docente"        -> "DOCENTE";
                            case "usuarioexterno" -> "USUARIOEXTERNO";
                            default               -> "USER";
                        };

                        authorities.add("ROLE_" + rolApp);
                    }

                    if (authorities.isEmpty()) {
                        authorities.add("ROLE_USER");
                    }

                    return User.builder()
                            .username(usuario.getCorreo())
                            .password(usuario.getContrasena())
                            .authorities(authorities.toArray(new String[0]))
                            .build();
                })
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuario no encontrado"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );

        return http.build();
    }
}