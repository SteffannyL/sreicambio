package srei.proyecto.srei.rol.service;

import srei.proyecto.srei.rol.dto.UsuarioAdminDTO;
import srei.proyecto.srei.rol.repository.UsuarioAdminRepository;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;

@Service
public class UsuarioAdminService {

    private final UsuarioAdminRepository repository;

    public UsuarioAdminService(UsuarioAdminRepository repository) {
        this.repository = repository;
    }

    // 🔹 LISTAR USUARIOS
    public List<UsuarioAdminDTO> listarUsuarios() {
        return repository.listarUsuarios();
    }

    // 🔹 CAMBIAR ESTADO
    public void cambiarEstado(Long idusuario, Boolean activo) {
        repository.cambiarEstado(idusuario, activo);
    }

    // 🔹 OBTENER USUARIO POR ID
    public UsuarioAdminDTO obtenerUsuarioPorId(Long id) {
        return repository.obtenerUsuarioPorId(id);
    }

    // 🔹 ACTUALIZAR USUARIO
    public void actualizarUsuario(Long id, UsuarioAdminDTO usuario) {
        repository.actualizarUsuario(id, usuario);
    }

    // 🔹 ESTADÍSTICAS DEL DASHBOARD
    public Map<String, Object> obtenerEstadisticas() {
        return repository.obtenerEstadisticas();
    }

    // 🔹 USUARIOS REGISTRADOS POR MES
    public List<Map<String, Object>> obtenerUsuariosPorMes() {
        return repository.obtenerUsuariosPorMes();
    }

}