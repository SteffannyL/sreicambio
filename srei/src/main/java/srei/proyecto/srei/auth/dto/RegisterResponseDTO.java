package srei.proyecto.srei.auth.dto;

import lombok.Data;

@Data
public class RegisterResponseDTO {
    private String mensaje;
    private Long idusuario;
    private String nombres;
    private String correo;
    private Long idtipousuario;
    private String token;
   private String rol;

public String getRol() {
    return rol;
}

public void setRol(String rol) {
    this.rol = rol;
}
}