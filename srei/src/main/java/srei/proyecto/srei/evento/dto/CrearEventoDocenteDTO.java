package srei.proyecto.srei.evento.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CrearEventoDocenteDTO {

    private Long idambito;
    private String nombreevento;
    private String descripcion;

    private LocalDateTime fechainicio;
    private LocalDateTime fechafin;

    private String lugar;
    private String aforo;

    private Long idtipoevento;
}