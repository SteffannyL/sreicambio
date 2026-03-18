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
import srei.proyecto.srei.evento.repository.EventoCoordinadorRepository;

@Service
@RequiredArgsConstructor
public class AprobacionEventoService {

    private final JdbcTemplate jdbcTemplate;

    // 🔥 NUEVO (para reportes)
    private final EventoCoordinadorRepository eventoCoordinadorRepository;

    // ===============================
    // 🔹 APROBAR / RECHAZAR EVENTO
    // ===============================
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

    // ===============================
    // 🔹 LISTAR PENDIENTES
    // ===============================
    public List<EventoPendienteDTO> listarPendientes() {

        String sql = "SELECT * FROM fn_listar_eventos_pendientes()";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            EventoPendienteDTO dto = new EventoPendienteDTO();

            dto.setIdevento(rs.getLong("idevento"));
            dto.setNombreevento(rs.getString("nombreevento"));
            dto.setDescripcion(rs.getString("descripcion"));
            dto.setFechainicio(rs.getTimestamp("fechainicio").toLocalDateTime());
            dto.setNombreDocente(null); // 🔥 aquí aún no viene en esta función

            return dto;
        });
    }

    // ===============================
    // 🔹 LISTAR APROBADOS
    // ===============================
    public List<EventoPendienteDTO> listarAprobados(){

        String sql="SELECT * FROM fn_listar_eventos_aprobados()";

        return jdbcTemplate.query(sql,(rs,rowNum)->{

            EventoPendienteDTO dto = new EventoPendienteDTO();

            dto.setIdevento(rs.getLong("idevento"));
            dto.setNombreevento(rs.getString("nombreevento"));
            dto.setDescripcion(rs.getString("descripcion"));
            dto.setFechainicio(rs.getTimestamp("fechainicio").toLocalDateTime());
            dto.setNombreDocente(null);

            return dto;
        });
    }

    // ===============================
    // 🔹 LISTAR RECHAZADOS
    // ===============================
    public List<EventoPendienteDTO> listarRechazados(){

        String sql="SELECT * FROM fn_listar_eventos_rechazados()";

        return jdbcTemplate.query(sql,(rs,rowNum)->{

            EventoPendienteDTO dto = new EventoPendienteDTO();

            dto.setIdevento(rs.getLong("idevento"));
            dto.setNombreevento(rs.getString("nombreevento"));
            dto.setDescripcion(rs.getString("descripcion"));
            dto.setFechainicio(rs.getTimestamp("fechainicio").toLocalDateTime());
            dto.setNombreDocente(null);

            return dto;
        });
    }

    // ===============================
    // 🔹 CONTADORES
    // ===============================
    public int contarPendientes(){
        String sql="SELECT fn_contar_eventos_pendientes()";
        return jdbcTemplate.queryForObject(sql,Integer.class);
    }

    public int contarAprobados(){
        String sql="SELECT fn_contar_eventos_aprobados()";
        return jdbcTemplate.queryForObject(sql,Integer.class);
    }

    public int contarRechazados(){
        String sql="SELECT fn_contar_eventos_rechazados()";
        return jdbcTemplate.queryForObject(sql,Integer.class);
    }

    // ===============================
    // 🔥 REPORTES (NUEVO)
    // ===============================
    public List<EventoPendienteDTO> reporteEventos(String estado) {
        return eventoCoordinadorRepository.listarReporte(estado);
    }

}