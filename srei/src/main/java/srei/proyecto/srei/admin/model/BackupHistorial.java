package srei.proyecto.srei.admin.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "backup_historial")
public class BackupHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idbackup;

    private String nombreArchivo;
    private String ruta;
    private LocalDateTime fecha;
    private Long tamano;
    private String estado;

    public Long getIdbackup() {
        return idbackup;
    }

    public void setIdbackup(Long idbackup) {
        this.idbackup = idbackup;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getRuta() {
        return ruta;
    }

    public void setRuta(String ruta) {
        this.ruta = ruta;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Long getTamano() {
        return tamano;
    }

    public void setTamano(Long tamano) {
        this.tamano = tamano;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}