package srei.proyecto.srei.rol.controller;

import srei.proyecto.srei.rol.dto.UsuarioAdminDTO;
import srei.proyecto.srei.rol.service.UsuarioAdminService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private final UsuarioAdminService service;

    public AdminController(UsuarioAdminService service) {
        this.service = service;
    }

    // 🔹 LISTAR TODOS
    @GetMapping("/usuarios")
    public List<UsuarioAdminDTO> listarUsuarios() {
        return service.listarUsuarios();
    }

    // 🔹 OBTENER POR ID
    @GetMapping("/usuarios/{id}")
    public UsuarioAdminDTO obtenerUsuarioPorId(@PathVariable Long id) {
        return service.obtenerUsuarioPorId(id);
    }

    // 🔹 CAMBIAR ESTADO
    @PutMapping("/usuarios/{id}/estado")
    public void cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean activo) {

        service.cambiarEstado(id, activo);
    }

    // 🔹 ACTUALIZAR USUARIO
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody UsuarioAdminDTO usuario) {

        service.actualizarUsuario(id, usuario);
        return ResponseEntity.ok().build();
    }

    // 🔹 DASHBOARD (estadísticas)
    @GetMapping("/dashboard")
    public Map<String, Object> obtenerEstadisticas() {
        return service.obtenerEstadisticas();
    }

    // 🔹 USUARIOS REGISTRADOS POR MES
    @GetMapping("/usuarios/registro-mensual")
    public List<Map<String,Object>> obtenerUsuariosPorMes(){
        return service.obtenerUsuariosPorMes();
    }

}