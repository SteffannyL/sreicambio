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

    /**
     * Aprobar o rechazar evento (COORDINADOR)
     */
    @Transactional
    public void aprobarEvento(AprobarEventoDTO dto) {

        // Obtener autenticación actual
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Verificar rol desde Spring Security
        boolean esCoordinador = auth.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COORDINADOR"));

        if (!esCoordinador) {
            throw new RuntimeException("No autorizado");
        }

        // Obtener id usuario desde RLS
        Long idUsuario = Long.parseLong(
                jdbcTemplate.queryForObject(
                        "SELECT current_setting('app.currentuserid')",
                        String.class
                )
        );

        // Ejecutar Stored Procedure
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

    /**
     * Listar eventos pendientes para coordinador
     */
    @Transactional
    public List<EventoPendienteDTO> listarPendientes() {

        String sql = """
            SELECT e.idevento,
                   e.nombreevento,
                   e.descripcion,
                   e.fechainicio
            FROM evento e
            LEFT JOIN aprobacionevento ae ON ae.idevento = e.idevento
            LEFT JOIN estadoaprobacionevento ea
                   ON ea.idestadoaprobacionevento = ae.idestadoaprobacionevento
            WHERE ea.nombre IS NULL
               OR ea.nombre = 'pendiente'
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new EventoPendienteDTO(
                        rs.getLong("idevento"),
                        rs.getString("nombreevento"),
                        rs.getString("descripcion"),
                        rs.getDate("fechainicio").toLocalDate()
                )
        );
    }

}