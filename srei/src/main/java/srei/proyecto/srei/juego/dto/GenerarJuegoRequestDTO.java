package srei.proyecto.srei.juego.dto;

public class GenerarJuegoRequestDTO {

    private String prompt;
    private String modelo;

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }
}