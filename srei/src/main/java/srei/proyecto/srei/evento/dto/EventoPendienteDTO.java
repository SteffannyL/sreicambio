package srei.proyecto.srei.evento.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventoPendienteDTO {

    private Long idevento;
    private String nombreevento;
    private String descripcion;
    private LocalDateTime fechainicio;
    private String comentario;
    private String nombreDocente;
    private String urlImagen;
private String urlPdf;

}