package srei.proyecto.srei.admin.dto;

public class BackupRequest {

    private String carpeta;
    private String fecha;
    private Long tiempo;
    private String tipo;

    public String getCarpeta() {
        return carpeta;
    }

    public void setCarpeta(String carpeta) {
        this.carpeta = carpeta;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public Long getTiempo() {
        return tiempo;
    }

    public void setTiempo(Long tiempo) {
        this.tiempo = tiempo;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
