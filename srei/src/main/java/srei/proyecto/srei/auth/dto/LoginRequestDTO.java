package srei.proyecto.srei.auth.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {

    private String correo;
    private String contrasena;

}