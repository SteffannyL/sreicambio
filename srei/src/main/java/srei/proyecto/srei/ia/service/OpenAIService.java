package srei.proyecto.srei.ia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
public class OpenAIService {

    private final WebClient webClient;

    @Value("${openai.api.key}")
    private String apiKey;

    public OpenAIService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.openai.com/v1").build();
    }

    public String generarQuiz(String prompt) {

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of(
                "role", "user",
                "content", prompt
        ));

        body.put("messages", messages);
        body.put("temperature", 0.2);
        body.put("max_tokens", 800);

        Map response = webClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) {
            return null;
        }

        try {
            List choices = (List) response.get("choices");
            Map firstChoice = (Map) choices.get(0);
            Map message = (Map) firstChoice.get("message");

            return (String) message.get("content");

        } catch (Exception e) {
            System.out.println("❌ Error parseando respuesta OpenAI");
            return null;
        }
    }
}