package srei.proyecto.srei.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import srei.proyecto.srei.admin.model.BackupHistorial;

public interface BackupHistorialRepository
        extends JpaRepository<BackupHistorial, Long> {
}