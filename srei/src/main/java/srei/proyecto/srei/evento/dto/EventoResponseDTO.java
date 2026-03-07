package srei.proyecto.srei.evento.dto;

import java.time.OffsetDateTime;

public class EventoResponseDTO {

    private Long idevento;
    private String nombreevento;
    private String descripcion;
    private OffsetDateTime fechainicio;
    private OffsetDateTime fechafin;
    private String lugar;

    public EventoResponseDTO(
            Long idevento,
            String nombreevento,
            String descripcion,
            OffsetDateTime fechainicio,
            OffsetDateTime fechafin,
            String lugar) {

        this.idevento = idevento;
        this.nombreevento = nombreevento;
        this.descripcion = descripcion;
        this.fechainicio = fechainicio;
        this.fechafin = fechafin;
        this.lugar = lugar;
    }

    public Long getIdevento() { return idevento; }
    public String getNombreevento() { return nombreevento; }
    public String getDescripcion() { return descripcion; }
    public OffsetDateTime getFechainicio() { return fechainicio; }
    public OffsetDateTime getFechafin() { return fechafin; }
    public String getLugar() { return lugar; }
}