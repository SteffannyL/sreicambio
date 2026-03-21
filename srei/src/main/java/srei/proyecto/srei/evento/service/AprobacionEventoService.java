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
    // 🔹 LISTAR (UNIFICADO CON BD)
    // ===============================

    public List<EventoPendienteDTO> listarPendientes() {
        return eventoCoordinadorRepository.listarReporte("PENDIENTE");
    }

    public List<EventoPendienteDTO> listarAprobados() {
        return eventoCoordinadorRepository.listarReporte("APROBADO");
    }

    public List<EventoPendienteDTO> listarRechazados() {
        return eventoCoordinadorRepository.listarReporte("RECHAZADO");
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
    // 🔥 REPORTES
    // ===============================

    public List<EventoPendienteDTO> reporteEventos(String estado) {
        return eventoCoordinadorRepository.listarReporte(estado);
    }
}