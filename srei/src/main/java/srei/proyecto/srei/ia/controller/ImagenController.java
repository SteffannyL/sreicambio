package srei.proyecto.srei.ia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import srei.proyecto.srei.ia.service.IaService;

import java.util.Map;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin(origins = "http://localhost:4200")
public class ImagenController {

    private final IaService iaService;

    public ImagenController(IaService iaService) {
        this.iaService = iaService;
    }

    @PostMapping("/generar-imagen")
    public Map<String, String> generarImagen(@RequestBody Map<String, String> req) {

        String prompt = req.get("prompt");

        String img = iaService.generarImagen(prompt);

        return Map.of("url", img);
    }
}