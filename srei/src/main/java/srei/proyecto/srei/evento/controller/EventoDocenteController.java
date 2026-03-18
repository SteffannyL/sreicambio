package srei.proyecto.srei.evento.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import srei.proyecto.srei.evento.service.EventoDocenteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/docente")
@RequiredArgsConstructor
public class EventoDocenteController {

    private final EventoDocenteService eventoService;
    private final JdbcTemplate jdbcTemplate;

    /* ================= CREAR EVENTO CON ARCHIVOS ================= */

    @PostMapping(value = "/eventos", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('ROLE_DOCENTE')")
    public ResponseEntity<Map<String, Object>> crearEvento(
            @RequestParam Long idambito,
            @RequestParam Long idtipoevento,
            @RequestParam String nombreevento,
            @RequestParam String descripcion,
            @RequestParam String fechainicio,
            @RequestParam String fechafin,
            @RequestParam String lugar,
            @RequestParam Integer aforo,
            @RequestParam(required = false) MultipartFile imagen,
            @RequestParam(required = false) MultipartFile pdf,
            Authentication authentication
    ) {

        // 🔥 PROTECCIÓN EXTRA (evita NullPointerException y 403 confusos)
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Usuario no autenticado");
        }

        String correo = authentication.getName();

        Map<String, Object> resultado =
                eventoService.crearEventoConArchivos(
                        idambito,
                        idtipoevento,
                        nombreevento,
                        descripcion,
                        fechainicio,
                        fechafin,
                        lugar,
                        aforo,
                        imagen,
                        pdf,
                        correo
                );

        return ResponseEntity.ok(resultado);
    }

    /* ================= LISTAR MIS EVENTOS ================= */

    @GetMapping("/eventos")
    @PreAuthorize("hasAuthority('ROLE_DOCENTE')")
    public ResponseEntity<List<Map<String, Object>>> listarMisEventos(Authentication authentication) {

        String correo = authentication.getName();

        List<Map<String, Object>> eventos =
                eventoService.listarEventosPorDocente(correo);

        return ResponseEntity.ok(eventos);
    }

    /* ================= DETALLE EVENTO ================= */

    @GetMapping("/eventos/{id}")
    @PreAuthorize("hasAuthority('ROLE_DOCENTE')")
    public ResponseEntity<?> obtenerDetalleEvento(
            @PathVariable Long id,
            Authentication authentication) {

        String correo = authentication.getName();

        return ResponseEntity.ok(
                eventoService.obtenerDetalleEvento(id, correo)
        );
    }

    /* ================= LISTAR AMBITOS ================= */

    @GetMapping("/ambitos")
    @PreAuthorize("hasAuthority('ROLE_DOCENTE')")
    public List<Map<String, Object>> listarAmbitos() {

        return jdbcTemplate.queryForList(
                "SELECT idambito, nombre FROM ambito ORDER BY nombre"
        );
    }

    /* ================= LISTAR TIPOS EVENTO ================= */

    @GetMapping("/tipos-evento")
    @PreAuthorize("hasAuthority('ROLE_DOCENTE')")
    public List<Map<String, Object>> listarTiposEvento() {

        return jdbcTemplate.queryForList(
                "SELECT idtipoevento, nombre FROM tipoevento ORDER BY nombre"
        );
    }

}