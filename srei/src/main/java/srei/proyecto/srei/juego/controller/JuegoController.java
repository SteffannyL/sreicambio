package srei.proyecto.srei.juego.controller;

import org.springframework.web.bind.annotation.*;
import srei.proyecto.srei.juego.dto.GenerarJuegoRequestDTO;
import srei.proyecto.srei.juego.dto.GenerarJuegoResponseDTO;
import srei.proyecto.srei.juego.service.JuegoService;

@RestController
@RequestMapping("/api/juegos")
public class JuegoController {

    private final JuegoService juegoService;

    public JuegoController(JuegoService juegoService) {
        this.juegoService = juegoService;
    }

    @PostMapping("/generar")
    public GenerarJuegoResponseDTO generar(@RequestBody GenerarJuegoRequestDTO request) throws Exception {

        String prompt = request.getPrompt();
        String modelo = request.getModelo();

        String url = juegoService.generarJuego(prompt, modelo);

        return new GenerarJuegoResponseDTO(url);
    }
}