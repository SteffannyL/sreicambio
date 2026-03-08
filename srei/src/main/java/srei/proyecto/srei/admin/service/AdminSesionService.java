package srei.proyecto.srei.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import srei.proyecto.srei.admin.dto.SesionDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminSesionService {

    private final JdbcTemplate jdbcTemplate;

    // LISTAR SESIONES ACTIVAS PARA ADMIN
    public List<SesionDTO> listarSesiones() {

        String sql = "SELECT * FROM fn_listar_sesiones_activas()";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            SesionDTO s = new SesionDTO();

            s.setIdsesion(rs.getLong("idsesion"));
            s.setIdusuario(rs.getLong("idusuario"));

            s.setNombres(rs.getString("nombres"));
            s.setApellidos(rs.getString("apellidos"));

            s.setNombrerol(rs.getString("nombrerol"));

            s.setIp(rs.getString("ip"));
            s.setNavegador(rs.getString("navegador"));
            s.setSistemaoperativo(rs.getString("sistemaoperativo"));

            s.setFechalogin(rs.getString("fechalogin"));

            return s;
        });
    }

    // LISTAR TODAS LAS SESIONES (HISTORIAL COMPLETO)
public List<SesionDTO> listarTodasSesiones() {

    String sql = "SELECT * FROM fn_listar_todas_sesiones()";

    return jdbcTemplate.query(sql, (rs, rowNum) -> {

        SesionDTO s = new SesionDTO();

        s.setIdsesion(rs.getLong("idsesion"));
        s.setIdusuario(rs.getLong("idusuario"));

        s.setNombres(rs.getString("nombres"));
        s.setApellidos(rs.getString("apellidos"));

        s.setNombrerol(rs.getString("nombrerol"));

        s.setIp(rs.getString("ip"));
        s.setNavegador(rs.getString("navegador"));
        s.setSistemaoperativo(rs.getString("sistemaoperativo"));

        s.setFechalogin(rs.getString("fechalogin"));

        return s;
    });
}

    // EXPULSAR SESION
    public void banearSesion(Long idsesion) {

        jdbcTemplate.update(
                "UPDATE sesionusuario SET activa = false WHERE idsesion = ?",
                idsesion
        );
    }

    // VALIDAR SI LA SESION SIGUE ACTIVA
    public boolean sesionActiva(Long idsesion) {

        String sql = """
            SELECT COUNT(*)
            FROM sesionusuario
            WHERE idsesion = ?
            AND activa = true
        """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                idsesion
        );

        return count != null && count > 0;
    }
}