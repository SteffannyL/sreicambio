package srei.proyecto.srei.evento.service;

import org.springframework.stereotype.Service;
import srei.proyecto.srei.evento.repository.EventoDocenteRepository;

import java.util.List;
import java.util.Map;

@Service
public class EventoDocenteService {

    private final EventoDocenteRepository repository;

    public EventoDocenteService(EventoDocenteRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> listarEventosDocente(Long idUsuario) {
        return repository.listarEventosDocente(idUsuario);
    }
}