package srei.proyecto.srei.auth.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {

    private String token;
    private Long idusuario;
    private String nombres;
    private Long idtipousuario;
    private String rol;
public String getRol() {
    return rol;
}

public void setRol(String rol) {
    this.rol = rol;
}

}

