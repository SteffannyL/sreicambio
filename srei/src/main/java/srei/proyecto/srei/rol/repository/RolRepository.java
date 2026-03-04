package srei.proyecto.srei.rol.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import srei.proyecto.srei.rol.entity.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {
    Rol findByNombrerol(String nombrerol);
}