package srei.proyecto.srei.evento.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import srei.proyecto.srei.evento.dto.EventoPendienteDTO;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class EventoCoordinadorRepository {

    private final JdbcTemplate jdbcTemplate;

    public List<EventoPendienteDTO> listarReporte(String estado) {

        String sql = switch (estado.toUpperCase()) {
            case "APROBADO" -> "SELECT * FROM fn_reporte_eventos_aprobados()";
            case "RECHAZADO" -> "SELECT * FROM fn_reporte_eventos_rechazados()";
            default -> "SELECT * FROM fn_reporte_eventos_pendientes()";
        };

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            EventoPendienteDTO dto = new EventoPendienteDTO();
            dto.setIdevento(rs.getLong("idevento"));
            dto.setNombreevento(rs.getString("nombreevento"));
            dto.setDescripcion(rs.getString("descripcion"));
            dto.setFechainicio(rs.getTimestamp("fechainicio").toLocalDateTime());
            dto.setNombreDocente(rs.getString("docente")); // 🔥 clave
            return dto;
        });
    }
}