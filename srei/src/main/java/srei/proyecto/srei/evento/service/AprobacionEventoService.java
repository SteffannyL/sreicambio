package srei.proyecto.srei.evento.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

import srei.proyecto.srei.evento.dto.AprobarEventoDTO;
import srei.proyecto.srei.evento.dto.EventoPendienteDTO;

@Service
@RequiredArgsConstructor
public class AprobacionEventoService {

    private final JdbcTemplate jdbcTemplate;

    // aprobar o rechazar evento
    @Transactional
    public void aprobarEvento(AprobarEventoDTO dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean esCoordinador = auth.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COORDINADOR"));

        if (!esCoordinador) {
            throw new RuntimeException("No autorizado");
        }

        Long idUsuario = Long.parseLong(
                jdbcTemplate.queryForObject(
                        "SELECT current_setting('app.currentuserid')",
                        String.class
                )
        );

        jdbcTemplate.execute(
                "CALL sp_aprobar_evento(?, ?, ?, ?)",
                (CallableStatementCallback<Void>) cs -> {
                    cs.setLong(1, dto.getIdevento());
                    cs.setLong(2, idUsuario);
                    cs.setString(3, dto.getEstado());
                    cs.setString(4, dto.getComentario());
                    cs.execute();
                    return null;
                }
        );
    }

    // eventos pendientes
    @Transactional
    public List<EventoPendienteDTO> listarPendientes() {

        String sql = """
            SELECT idevento,
                   nombreevento,
                   descripcion,
                   fechainicio
            FROM evento
            WHERE estadoactual='PENDIENTE'
            ORDER BY fechacreacion DESC
        """;

        return jdbcTemplate.query(sql, (rs,rowNum) ->
                new EventoPendienteDTO(
                        rs.getLong("idevento"),
                        rs.getString("nombreevento"),
                        rs.getString("descripcion"),
                        rs.getTimestamp("fechainicio")
                                .toLocalDateTime()
                                .toLocalDate()
                )
        );
    }

    // eventos aprobados
    @Transactional
    public List<EventoPendienteDTO> listarAprobados() {

        String sql = """
            SELECT idevento,
                   nombreevento,
                   descripcion,
                   fechainicio
            FROM evento
            WHERE estadoactual='APROBADO'
            ORDER BY fechacreacion DESC
        """;

        return jdbcTemplate.query(sql, (rs,rowNum) ->
                new EventoPendienteDTO(
                        rs.getLong("idevento"),
                        rs.getString("nombreevento"),
                        rs.getString("descripcion"),
                        rs.getTimestamp("fechainicio")
                                .toLocalDateTime()
                                .toLocalDate()
                )
        );
    }

    // eventos rechazados
    @Transactional
    public List<EventoPendienteDTO> listarRechazados() {

        String sql = """
            SELECT idevento,
                   nombreevento,
                   descripcion,
                   fechainicio
            FROM evento
            WHERE estadoactual='RECHAZADO'
            ORDER BY fechacreacion DESC
        """;

        return jdbcTemplate.query(sql, (rs,rowNum) ->
                new EventoPendienteDTO(
                        rs.getLong("idevento"),
                        rs.getString("nombreevento"),
                        rs.getString("descripcion"),
                        rs.getTimestamp("fechainicio")
                                .toLocalDateTime()
                                .toLocalDate()
                )
        );
    }

}