package srei.proyecto.srei.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.lang.NonNull;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import srei.proyecto.srei.usuario.repository.UsuarioRepository;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UsuarioRepository usuarioRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // ✅ Permitir preflight CORS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ Endpoints públicos
        if (requestURI.startsWith("/api/auth/")
                || requestURI.startsWith("/api/sesiones/validar/")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        String token = null;
        String correo = null;

        // ✅ Header Authorization
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // ✅ Fallback multipart
        if (token == null) {
            String paramToken = request.getParameter("token");
            if (paramToken != null) {
                token = paramToken;
            }
        }

        // No hay token → seguir
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            correo = jwtService.extractUsername(token);

            if (correo != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(correo);

                // DEBUG CLAVE
                System.out.println("USER: " + correo);
                System.out.println("AUTHORITIES (ANTES): " + userDetails.getAuthorities());

                if (jwtService.isTokenValid(token, userDetails)) {

                    var usuario = usuarioRepository
                            .findByCorreo(correo)
                            .orElseThrow();

                    Long idUsuario = usuario.getIdusuario();

                    //  IMPORTANTE: tomar TODOS los roles
                    var authorities = userDetails.getAuthorities();

                    //  DEBUG CLAVE
                    System.out.println("AUTHORITIES (DESPUES): " + authorities);

                    // Tomar primer rol para RLS
                    String rol = authorities.stream()
                            .findFirst()
                            .map(a -> a.getAuthority()
                                    .replace("ROLE_", "")
                                    .toLowerCase())
                            .orElse("usuario");

                    // Variables para PostgreSQL RLS
                    jdbcTemplate.execute("SET app.currentuserid = " + idUsuario);
                    jdbcTemplate.execute("SET app.currentuserrole = '" + rol + "'");

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    authorities
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authToken);

                    // 🔥 DEBUG FINAL
                    System.out.println("AUTH FINAL: " +
                            SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                }
            }

        } catch (Exception e) {
            System.out.println("❌ Error en JWT Filter: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}