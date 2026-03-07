package srei.proyecto.srei.usuario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import srei.proyecto.srei.usuario.entity.Usuario;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

}