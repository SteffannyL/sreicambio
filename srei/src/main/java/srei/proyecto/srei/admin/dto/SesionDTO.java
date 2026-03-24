package srei.proyecto.srei.admin.dto;

import lombok.Data;

@Data
public class SesionDTO {

    private Long idsesion;
    private Long idusuario;

    private String nombres;
    private String apellidos;
    private String correo;

    private String nombrerol;

    private String ip;
    private String navegador;
    private String sistemaoperativo;

    private String fechalogin;
}