package srei.proyecto.srei.evento.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class EventoDocenteRepository {

    private final JdbcTemplate jdbcTemplate;

    /* ================= CREAR EVENTO ================= */

    public Map<String, Object> crearEvento(
            Long idusuario,
            Long idambito,
            String nombreevento,
            String descripcion,
            java.time.LocalDateTime fechainicio,
            java.time.LocalDateTime fechafin,
            String lugar,
            String aforo,
            Long idtipoevento
    ) {

        String sql = "SELECT * FROM sp_crear_evento_docente(?, ?, ?, ?, ?, ?, ?, ?, ?)";

        return jdbcTemplate.queryForMap(
                sql,
                idusuario,
                idambito,
                nombreevento,
                descripcion,
                fechainicio,
                fechafin,
                lugar,
                aforo,
                idtipoevento
        );
    }

    /* ================= LISTAR EVENTOS ================= */

    public List<Map<String, Object>> listarEventosPorDocente(String correo) {
        return jdbcTemplate.queryForList(
                "SELECT * FROM fn_listar_eventos_docente(?)",
                correo
        );
    }

    /* ================= DETALLE EVENTO ================= */

    public Map<String, Object> obtenerDetalleEvento(Long idEvento, String correo) {
        String sql = "SELECT * FROM fn_obtener_evento_detalle_docente(?, ?)";
        return jdbcTemplate.queryForMap(sql, idEvento, correo);
    }

    /* ================= GUARDAR ARCHIVOS ================= */

    public void guardarArchivosEvento(Long idevento, String urlImagen, String urlPdf) {
        String sql = "INSERT INTO evento_archivo (idevento, url_imagen, url_pdf) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, idevento, urlImagen, urlPdf);
    }
}