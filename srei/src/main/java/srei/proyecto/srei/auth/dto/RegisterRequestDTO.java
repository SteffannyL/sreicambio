package srei.proyecto.srei.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    @NotBlank(message = "Nombres obligatorios")
    private String nombres;

    @NotBlank(message = "Apellidos obligatorios")
    private String apellidos;

    @NotBlank(message = "Correo obligatorio")
    @Email(message = "Correo inválido")
    private String correo;

    @NotBlank(message = "Contraseña obligatoria")
    @Size(min = 6, message = "Mínimo 6 caracteres")
    private String contrasena;

    @NotNull(message = "Tipo de usuario obligatorio")
    private Long idtipousuario;
}