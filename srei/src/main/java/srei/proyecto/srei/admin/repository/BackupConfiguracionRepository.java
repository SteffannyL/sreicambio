package srei.proyecto.srei.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import srei.proyecto.srei.admin.model.BackupConfiguracion;

public interface BackupConfiguracionRepository
        extends JpaRepository<BackupConfiguracion, Long> {

    BackupConfiguracion findTopByOrderByIdDesc();

}