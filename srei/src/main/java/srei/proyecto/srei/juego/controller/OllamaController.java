package srei.proyecto.srei.juego.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
public class OllamaController {

    private final WebClient.Builder webClientBuilder;

    @GetMapping("/modelos")
    public List<String> obtenerModelos() {

        Map response = webClientBuilder.build()
                .get()
                .uri("http://localhost:11434/api/tags")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<Map<String,Object>> modelos = (List<Map<String,Object>>) response.get("models");

        List<String> nombres = new ArrayList<>();

        for(Map m : modelos){
            nombres.add((String) m.get("name"));
        }

        return nombres;
    }

}