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

        String estadoUpper = estado.toUpperCase();

        String sql = switch (estadoUpper) {
            case "APROBADO" -> "SELECT * FROM fn_reporte_eventos_aprobados()";
            case "RECHAZADO" -> "SELECT * FROM fn_reporte_eventos_rechazados()"; // 🔥 FIX REAL
            default -> "SELECT * FROM fn_reporte_eventos_pendientes()";
        };

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            EventoPendienteDTO dto = new EventoPendienteDTO();

            dto.setIdevento(rs.getLong("idevento"));
            dto.setNombreevento(rs.getString("nombreevento"));
            dto.setDescripcion(rs.getString("descripcion"));

            if (rs.getTimestamp("fechainicio") != null) {
                dto.setFechainicio(rs.getTimestamp("fechainicio").toLocalDateTime());
            }

            dto.setNombreDocente(rs.getString("docente"));

            // 🔥 comentario solo en rechazados
            if ("RECHAZADO".equals(estadoUpper)) {
                dto.setComentario(rs.getString("comentario"));
            }

            dto.setUrlImagen(rs.getString("url_imagen"));
            dto.setUrlPdf(rs.getString("url_pdf"));

            return dto;
        });
    }
}