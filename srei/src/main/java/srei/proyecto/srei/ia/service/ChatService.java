package srei.proyecto.srei.ia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final WebClient webClient = WebClient.builder().build();

    public String preguntar(String mensajeUsuario) {

        Map<String, Object> body = Map.of(
                "model", "openrouter/free",
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", "Eres un asistente universitario del sistema SREIW. Responde de forma clara y académica."
                        ),
                        Map.of(
                                "role", "user",
                                "content", mensajeUsuario
                        )
                )
        );

        Map response = webClient.post()
                .uri("https://api.openrouter.ai/api/v1/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost:8080")
                .header("X-Title", "SREIW Chatbot")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("choices")) {
            List choices = (List) response.get("choices");
            if (!choices.isEmpty()) {
                Map firstChoice = (Map) choices.get(0);
                Map message = (Map) firstChoice.get("message");
                return message.get("content").toString();
            }
        }

        return "No se pudo obtener respuesta de la IA.";
    }
}