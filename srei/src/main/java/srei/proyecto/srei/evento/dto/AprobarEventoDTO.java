package srei.proyecto.srei.evento.dto;
import lombok.Data;

@Data
public class AprobarEventoDTO {
    private Long idevento;
    private String estado; // aprobado o rechazado
    private String comentario;
}