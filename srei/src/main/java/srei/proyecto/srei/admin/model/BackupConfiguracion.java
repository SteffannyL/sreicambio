package srei.proyecto.srei.admin.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "backup_configuracion")
@Data
public class BackupConfiguracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean activo;

    private int tiempo;

    private String tipo;

    private String carpeta;
    
}