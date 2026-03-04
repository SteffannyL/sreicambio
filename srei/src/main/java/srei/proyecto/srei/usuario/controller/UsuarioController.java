package srei.proyecto.srei.usuario.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import srei.proyecto.srei.usuario.entity.Usuario;
import srei.proyecto.srei.usuario.repository.UsuarioRepository;
import srei.proyecto.srei.usuario.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    // Listar usuarios → solo con permiso VER_USUARIOS
    @GetMapping
    @PreAuthorize("hasAuthority('VER_USUARIOS')")
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // Crear usuario → solo con permiso CREAR_USUARIO
  @PostMapping
@PreAuthorize("hasAuthority('CREAR_USUARIO')")
public Usuario crearUsuario(@RequestBody Usuario usuario) {
    return usuarioService.crearUsuario(usuario);
}

    // Ver mi perfil → cualquier usuario autenticado
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public Usuario miPerfil(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}