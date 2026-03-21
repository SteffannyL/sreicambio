package srei.proyecto.srei.evento.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/decano")
@PreAuthorize("hasAuthority('ROLE_DECANO')")
public class DecanoController {

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Decano funcionando");
    }
}