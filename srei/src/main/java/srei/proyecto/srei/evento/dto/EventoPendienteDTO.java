package srei.proyecto.srei.evento.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class EventoPendienteDTO {

    private Long idevento;
    private String nombreevento;
    private String descripcion;
    private LocalDate fechainicio;
}