package srei.proyecto.srei.evento.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import srei.proyecto.srei.evento.dto.CrearEventoDTO;
import srei.proyecto.srei.evento.service.EventoService;

//@RestController
//@RequestMapping("/api/docente/eventos")
//@RequiredArgsConstructor
//public class EventoController {

//```
//private final EventoService eventoService;

//@PostMapping
//@PreAuthorize("hasRole('DOCENTE')")
//public ResponseEntity<?> crearEvento(
       // @RequestBody CrearEventoDTO dto,
       // Authentication authentication) {

  //  String correo = authentication.getName();

   // return ResponseEntity.ok(
           // eventoService.crearEvento(dto, correo)
 //   );
//}
//```

//}
