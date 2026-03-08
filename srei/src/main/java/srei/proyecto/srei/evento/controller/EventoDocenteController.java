package srei.proyecto.srei.evento.controller;

import org.springframework.web.bind.annotation.*;
import srei.proyecto.srei.evento.service.EventoDocenteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/docente/eventos")
@CrossOrigin
public class EventoDocenteController {

    private final EventoDocenteService service;

    public EventoDocenteController(EventoDocenteService service) {
        this.service = service;
    }

    @GetMapping("/{idUsuario}")
    public List<Map<String, Object>> listarEventos(@PathVariable Long idUsuario) {
        return service.listarEventosDocente(idUsuario);
    }
}