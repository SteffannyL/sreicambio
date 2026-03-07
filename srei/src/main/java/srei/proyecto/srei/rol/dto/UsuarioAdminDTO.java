package srei.proyecto.srei.rol.dto;

public class UsuarioAdminDTO {

    private Long idusuario;
    private String nombres;
    private String apellidos;
    private String correo;
    private Boolean activo;
    private String tipoUsuario;

    public UsuarioAdminDTO() {}

    public UsuarioAdminDTO(Long idusuario, String nombres, String apellidos,
                           String correo, Boolean activo, String tipoUsuario) {
        this.idusuario = idusuario;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.correo = correo;
        this.activo = activo;
        this.tipoUsuario = tipoUsuario;
    }

    public Long getIdusuario() { return idusuario; }
    public void setIdusuario(Long idusuario) { this.idusuario = idusuario; }

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public String getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(String tipoUsuario) { this.tipoUsuario = tipoUsuario; }
}