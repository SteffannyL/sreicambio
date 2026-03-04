package srei.proyecto.srei.rol.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import srei.proyecto.srei.rol.entity.UsuarioRol;

import java.util.List;

public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, Long> {
    List<UsuarioRol> findByUsuarioIdusuario(Long idusuario);
}