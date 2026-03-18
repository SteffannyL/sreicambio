package srei.proyecto.srei.admin.service;

import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ScheduledFuture;

@Service
public class BackupSchedulerService {

    private final TaskScheduler scheduler;
    private final DatabaseBackupService backupService;

    private ScheduledFuture<?> tarea;

    public BackupSchedulerService(TaskScheduler scheduler,
                                  DatabaseBackupService backupService) {
        this.scheduler = scheduler;
        this.backupService = backupService;
    }

    public void programarBackup(LocalDateTime fecha) {

        if (tarea != null) {
            tarea.cancel(false);
        }

        tarea = scheduler.schedule(() -> {

            try {
                backupService.crearBackup(
                        "G:/Mi unidad/backups_srei"
                );
                System.out.println("Backup automático ejecutado");

            } catch (Exception e) {
                e.printStackTrace();
            }

        }, java.sql.Timestamp.valueOf(fecha));
    }

}