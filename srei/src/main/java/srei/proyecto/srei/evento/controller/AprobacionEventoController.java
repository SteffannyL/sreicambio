package srei.proyecto.srei.evento.controller;

import java.util.Map;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import srei.proyecto.srei.evento.dto.AprobarEventoDTO;
import srei.proyecto.srei.evento.service.AprobacionEventoService;

@RestController
@RequiredArgsConstructor
public class AprobacionEventoController {

    private final AprobacionEventoService eventoService;

    @PostMapping("/api/coordinador/aprobar-evento")
    public ResponseEntity<?> aprobar(@RequestBody AprobarEventoDTO dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        System.out.println("Usuario autenticado: " + auth.getName());
        System.out.println("Authorities reales: " + auth.getAuthorities());

        eventoService.aprobarEvento(dto);

        return ResponseEntity.ok(
            Map.of("mensaje", "Evento procesado correctamente")
        );
    }
    @GetMapping("/api/coordinador/eventos-pendientes")
public ResponseEntity<?> listarPendientes() {
    return ResponseEntity.ok(eventoService.listarPendientes());
}
}