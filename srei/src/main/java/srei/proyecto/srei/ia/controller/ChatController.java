package srei.proyecto.srei.ia.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import srei.proyecto.srei.ia.service.ChatService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ia")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/preguntar")
    @PreAuthorize("hasRole('DOCENTE')")
    public ResponseEntity<?> preguntar(@RequestBody Map<String, String> request) {

        String respuesta = chatService.preguntar(request.get("mensaje"));

        return ResponseEntity.ok(
                Map.of("respuesta", respuesta)
        );
    }
}