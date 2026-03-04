package srei.proyecto.srei.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import srei.proyecto.srei.auth.dto.LoginRequestDTO;
import srei.proyecto.srei.auth.dto.LoginResponseDTO;
import srei.proyecto.srei.auth.dto.RegisterRequestDTO;
import srei.proyecto.srei.auth.dto.RegisterResponseDTO;
import srei.proyecto.srei.security.JwtService;
import srei.proyecto.srei.usuario.entity.Usuario;
import srei.proyecto.srei.usuario.repository.UsuarioRepository;

import java.sql.Types;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO dto) {

        Usuario usuario = usuarioRepository
                .findByCorreo(dto.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(dto.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // Obtener rol real desde BD
        List<Map<String, Object>> roles = jdbcTemplate.queryForList(
                "SELECT nombrerol FROM usuariorol ur " +
                "JOIN rol r ON ur.idrol = r.idrol " +
                "WHERE ur.idusuario = ? LIMIT 1",
                usuario.getIdusuario()
        );

        String rolBd = roles.isEmpty()
                ? "user"
                : roles.get(0).get("nombrerol").toString().toLowerCase();

        // 🔹 Corregido: SET LOCAL directo, con validación de rol para seguridad
        if (!rolBd.matches("[a-zA-Z_]+")) {
            rolBd = "user"; // fallback seguro
        }
        jdbcTemplate.execute("SET LOCAL app.currentuserrole = '" + rolBd + "'");
        jdbcTemplate.execute("SET LOCAL app.currentuserid = " + usuario.getIdusuario());

        // Actualizar última conexión
        jdbcTemplate.update("CALL sp_actualizar_ultima_conexion(?)", usuario.getIdusuario());

        String token = jwtService.generarToken(usuario.getCorreo(), rolBd);

        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setIdusuario(usuario.getIdusuario());
        response.setNombres(usuario.getNombres());
        response.setIdtipousuario(usuario.getIdtipousuario());
        response.setRol(rolBd.toUpperCase());

        return response;
    }

    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO dto) {

        if (usuarioRepository.findByCorreo(dto.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        String hashedPass = passwordEncoder.encode(dto.getContrasena());

        Object[] result = jdbcTemplate.execute(
                "CALL sp_registrar_usuario(?, ?, ?, ?, ?, ?, ?)",
                (CallableStatementCallback<Object[]>) cs -> {

                    cs.setString(1, dto.getNombres());
                    cs.setString(2, dto.getApellidos());
                    cs.setString(3, dto.getCorreo());
                    cs.setString(4, hashedPass);
                    cs.setLong(5, dto.getIdtipousuario());

                    cs.registerOutParameter(6, Types.BIGINT);
                    cs.registerOutParameter(7, Types.VARCHAR);

                    cs.execute();

                    return new Object[]{
                            cs.getLong(6),
                            cs.getString(7)
                    };
                }
        );

        Long idUsuario = (Long) result[0];
        String mensaje = (String) result[1];

        if (idUsuario == null || idUsuario == 0) {
            throw new RuntimeException(
                    mensaje != null ? mensaje : "Error al registrar usuario"
            );
        }

        String roleName = switch (dto.getIdtipousuario().intValue()) {
            case 1 -> "admin";
            case 2 -> "coordinador";
            case 3 -> "decano";
            case 4 -> "usuarioexterno";
            case 5 -> "docente";
            default -> "user";
        };

        jdbcTemplate.execute(
                "CALL sp_asignar_rol_usuario(?, ?, ?)",
                (CallableStatementCallback<Void>) cs -> {
                    cs.setLong(1, idUsuario);
                    cs.setString(2, roleName);
                    cs.registerOutParameter(3, Types.VARCHAR);
                    cs.execute();
                    return null;
                }
        );

        String token = jwtService.generarToken(dto.getCorreo(), roleName);

        RegisterResponseDTO response = new RegisterResponseDTO();
        response.setMensaje(mensaje != null ? mensaje : "Usuario registrado correctamente");
        response.setIdusuario(idUsuario);
        response.setNombres(dto.getNombres());
        response.setCorreo(dto.getCorreo());
        response.setIdtipousuario(dto.getIdtipousuario());
        response.setRol(roleName.toUpperCase());
        response.setToken(token);

        return response;
    }
}