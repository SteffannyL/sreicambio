package srei.proyecto.srei.evento.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class EventoDocenteRepository {

    private final JdbcTemplate jdbcTemplate;

    public EventoDocenteRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> listarEventosDocente(Long idUsuario) {

        String sql = "SELECT * FROM fn_listar_eventos_docente(?)";

        return jdbcTemplate.queryForList(sql, idUsuario);
    }
}