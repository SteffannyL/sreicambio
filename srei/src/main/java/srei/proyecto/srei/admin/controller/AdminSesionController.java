package srei.proyecto.srei.admin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import srei.proyecto.srei.admin.dto.SesionDTO;
import srei.proyecto.srei.admin.service.AdminSesionService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdminSesionController {

    private final AdminSesionService service;

    // ADMIN - ver sesiones activas
    @GetMapping("/api/admin/sesiones")
    public List<SesionDTO> listarSesiones() {
        return service.listarSesiones();
    }

    // ADMIN - expulsar sesión
    @PutMapping("/api/admin/sesiones/{id}/ban")
    public void banearSesion(@PathVariable Long id) {
        service.banearSesion(id);
    }

    // TODOS LOS USUARIOS - validar sesión
    @GetMapping("/api/sesiones/validar/{id}")
    public ResponseEntity<Boolean> validarSesion(@PathVariable Long id) {

        boolean activa = service.sesionActiva(id);

        return ResponseEntity.ok(activa);
    }

    // ADMIN - reporte de sesiones
    @GetMapping("/api/admin/sesiones/reporte")
    public List<SesionDTO> reporteSesiones(@RequestParam String tipo) {

    if ("todas".equalsIgnoreCase(tipo)) {
        return service.listarTodasSesiones();
    }

    // por defecto devuelve activas
    return service.listarSesiones();
    }
}