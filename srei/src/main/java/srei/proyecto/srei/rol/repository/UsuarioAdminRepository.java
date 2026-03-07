package srei.proyecto.srei.rol.repository;

import srei.proyecto.srei.rol.dto.UsuarioAdminDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Repository
public class UsuarioAdminRepository {

    private final JdbcTemplate jdbcTemplate;

    public UsuarioAdminRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 🔹 LISTAR USUARIOS
    public List<UsuarioAdminDTO> listarUsuarios() {

        String sql = """
            SELECT u.idusuario,
                   u.nombres,
                   u.apellidos,
                   u.correo,
                   u.activo,
                   t.nombretipousuario
            FROM usuario u
            JOIN tipousuario t ON u.idtipousuario = t.idtipousuario
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new UsuarioAdminDTO(
                rs.getLong("idusuario"),
                rs.getString("nombres"),
                rs.getString("apellidos"),
                rs.getString("correo"),
                rs.getBoolean("activo"),
                rs.getString("nombretipousuario")
            )
        );
    }

    // OBTENER USUARIO POR ID
    public UsuarioAdminDTO obtenerUsuarioPorId(Long id) {

        String sql = """
            SELECT u.idusuario,
                   u.nombres,
                   u.apellidos,
                   u.correo,
                   u.activo,
                   t.nombretipousuario
            FROM usuario u
            JOIN tipousuario t ON u.idtipousuario = t.idtipousuario
            WHERE u.idusuario = ?
        """;

        return jdbcTemplate.queryForObject(sql, new Object[]{id}, (rs, rowNum) ->
            new UsuarioAdminDTO(
                rs.getLong("idusuario"),
                rs.getString("nombres"),
                rs.getString("apellidos"),
                rs.getString("correo"),
                rs.getBoolean("activo"),
                rs.getString("nombretipousuario")
            )
        );
    }

    // 🔹 CAMBIAR ESTADO
    public void cambiarEstado(Long idusuario, Boolean activo) {

        String sql = """
            UPDATE usuario
            SET activo = ?
            WHERE idusuario = ?
        """;

        jdbcTemplate.update(sql, activo, idusuario);
    }

   // 🔹 ACTUALIZAR USUARIO
public void actualizarUsuario(Long id, UsuarioAdminDTO usuario) {

    String sql =
        "UPDATE usuario " +
        "SET nombres = ?, " +
        "apellidos = ?, " +
        "correo = ?, " +
        "activo = ?, " +
        "idtipousuario = ( " +
        "   SELECT idtipousuario FROM tipousuario WHERE nombretipousuario = ? " +
        ") " +
        "WHERE idusuario = ?";

    jdbcTemplate.update(sql,
            usuario.getNombres(),
            usuario.getApellidos(),
            usuario.getCorreo(),
            usuario.getActivo(),
            usuario.getTipoUsuario(),
            id
    );
}

public Map<String, Object> obtenerEstadisticas() {

    String totalSql = "SELECT COUNT(*) FROM usuario";
    String activosSql = "SELECT COUNT(*) FROM usuario WHERE activo = true";
    String inactivosSql = "SELECT COUNT(*) FROM usuario WHERE activo = false";

    Integer total = jdbcTemplate.queryForObject(totalSql, Integer.class);
    Integer activos = jdbcTemplate.queryForObject(activosSql, Integer.class);
    Integer inactivos = jdbcTemplate.queryForObject(inactivosSql, Integer.class);

    Map<String, Object> stats = new HashMap<>();
    stats.put("total", total);
    stats.put("activos", activos);
    stats.put("inactivos", inactivos);

    return stats;
}

public List<Map<String, Object>> obtenerUsuariosPorMes() {

    String sql = """
        SELECT 
        TO_CHAR(fecharegistro, 'YYYY-MM') AS mes,
        COUNT(*) AS total
        FROM usuario
        WHERE fecharegistro IS NOT NULL
        GROUP BY mes
        ORDER BY mes
    """;

    return jdbcTemplate.queryForList(sql);
}

}