package srei.proyecto.srei.juego.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import srei.proyecto.srei.juego.util.PromptValidator;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

@Service
public class JuegoService {

    @Autowired
    private WebClient.Builder webClientBuilder;

    public String generarJuego(String prompt, String modelo) throws IOException {

        if(!PromptValidator.esValido(prompt)){
            throw new RuntimeException("Prompt no permitido");
        }

        String preguntasJson = generarConIA(prompt, modelo);

        preguntasJson = limpiarJson(preguntasJson);

        String plantilla = cargarPlantilla();

        String htmlFinal = plantilla.replace("{{PREGUNTAS}}", preguntasJson);

        String id = UUID.randomUUID().toString();
        String nombreArchivo = "juego_" + id + ".html";

        String carpeta = "src/main/resources/static/juegos/";

        File folder = new File(carpeta);

        if(!folder.exists()){
            folder.mkdirs();
        }

        FileWriter writer = new FileWriter(carpeta + nombreArchivo);
        writer.write(htmlFinal);
        writer.close();

        return "/juegos/" + nombreArchivo;
    }

    private String generarConIA(String promptUsuario, String modelo){

        String promptIA = """
Genera un quiz en formato JSON válido.

Reglas estrictas:
- SOLO JSON (sin texto adicional)
- EXACTAMENTE 8 preguntas
- Cada pregunta con 4 opciones
- correct debe ser número (0-3)
- NO usar ;
- NO texto fuera del JSON
- JSON perfectamente cerrado

Formato:
[
  {
    "question":"...",
    "options":["A","B","C","D"],
    "correct":0
  }
]

Tema:
""" + promptUsuario;

        Map<String,Object> options = new HashMap<>();
        options.put("temperature",0.2);
        options.put("top_p",0.9);
        options.put("num_predict",400);

        Map<String,Object> body = new HashMap<>();
        body.put("model",modelo);
        body.put("prompt",promptIA);
        body.put("stream",false);
        body.put("options",options);

        Map response = webClientBuilder.build()
                .post()
                .uri("http://localhost:11434/api/generate")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if(response == null){
            return getJsonFallback();
        }

        return (String) response.get("response");
    }

    private String limpiarJson(String json){

        if(json == null) return getJsonFallback();

        json = json.replace("```json","")
                   .replace("```","")
                   .trim();

        int start = json.indexOf("[");
        int end = json.lastIndexOf("]");

        if(start == -1 || end == -1){
            return getJsonFallback();
        }

        json = json.substring(start, end + 1);

        try {
            new ObjectMapper().readTree(json);
            return json;
        } catch (Exception e) {
            System.out.println("❌ JSON inválido de IA, usando fallback");
            return getJsonFallback();
        }
    }

    private String getJsonFallback(){
        return """
[
  {
    "question":"¿Cuál es la capital del Ecuador?",
    "options":["Quito","Guayaquil","Cuenca","Loja"],
    "correct":0
  },
  {
    "question":"¿Qué moneda usa Ecuador?",
    "options":["Peso","Dólar","Euro","Sol"],
    "correct":1
  },
  {
    "question":"¿En qué continente está Ecuador?",
    "options":["Europa","Asia","América","África"],
    "correct":2
  },
  {
    "question":"¿Qué región es conocida por Galápagos?",
    "options":["Costa","Sierra","Oriente","Insular"],
    "correct":3
  }
]
""";
    }

    private String cargarPlantilla() throws IOException {

        File file = new File("src/main/resources/templates/quiz-template.html");

        return new String(Files.readAllBytes(file.toPath()));
    }
}