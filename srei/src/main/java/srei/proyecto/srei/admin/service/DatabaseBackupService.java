package srei.proyecto.srei.admin.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import srei.proyecto.srei.admin.model.BackupConfiguracion;
import srei.proyecto.srei.admin.model.BackupHistorial;
import srei.proyecto.srei.admin.repository.BackupConfiguracionRepository;
import srei.proyecto.srei.admin.repository.BackupHistorialRepository;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;

@Service
public class DatabaseBackupService {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "postgreAdmin@1";

    private static final String PG_DUMP =
            "C:/Program Files/PostgreSQL/18/bin/pg_dump.exe";

    private static final String PG_RESTORE =
            "C:/Program Files/PostgreSQL/18/bin/pg_restore.exe";

    private static final String BACKUP_FOLDER =
            "G:/Mi unidad/backups_srei";

    private final BackupHistorialRepository backupRepository;
    private final BackupConfiguracionRepository configRepository;

    public DatabaseBackupService(
            BackupHistorialRepository backupRepository,
            BackupConfiguracionRepository configRepository
    ) {
        this.backupRepository = backupRepository;
        this.configRepository = configRepository;
    }

    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(1);

    private ScheduledFuture<?> tareaProgramada;

    // =========================================
    // OBTENER NOMBRE BD
    // =========================================

    private String getDatabaseName() {
        return datasourceUrl.substring(datasourceUrl.lastIndexOf("/") + 1);
    }

    // =========================================
    // CREAR BACKUP
    // =========================================

    public String crearBackup(String carpeta) throws Exception {

        String DB_NAME = getDatabaseName();

        if(carpeta == null || carpeta.isEmpty()){
            carpeta = BACKUP_FOLDER;
        }

        new File(carpeta).mkdirs();

        String fecha = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        String archivo = carpeta + "/backup_" + fecha + ".backup";

        ProcessBuilder pb = new ProcessBuilder(
                PG_DUMP,
                "-U", DB_USER,
                "-F", "c",
                "-b",
                "-v",
                "-f", archivo,
                DB_NAME
        );

        pb.environment().put("PGPASSWORD", DB_PASSWORD);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        BufferedReader reader =
                new BufferedReader(new InputStreamReader(process.getInputStream()));

        String line;
        while((line = reader.readLine()) != null){
            System.out.println(line);
        }

        int exit = process.waitFor();

        if(exit != 0){
            throw new RuntimeException("Error creando backup");
        }

        File file = new File(archivo);

        BackupHistorial backup = new BackupHistorial();
        backup.setNombreArchivo(file.getName());
        backup.setRuta(file.getAbsolutePath());
        backup.setFecha(LocalDateTime.now());
        backup.setTamano(file.length());
        backup.setEstado("COMPLETADO");

        backupRepository.save(backup);

        return archivo;
    }

    // =========================================
    // EJECUTAR SCHEDULER
    // =========================================

    private void ejecutarScheduler(String carpeta, long tiempo, String tipo){

        TimeUnit unidad;

        switch (tipo.toLowerCase()) {
            case "minutos": unidad = TimeUnit.MINUTES; break;
            case "horas": unidad = TimeUnit.HOURS; break;
            case "dias": unidad = TimeUnit.DAYS; break;
            case "semanas":
                unidad = TimeUnit.DAYS;
                tiempo = tiempo * 7;
                break;
            default:
                throw new RuntimeException("Tipo inválido");
        }

        tareaProgramada = scheduler.scheduleAtFixedRate(() -> {
            try {
                crearBackup(carpeta);
                System.out.println("Backup automático ejecutado");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, 0, tiempo, unidad);
    }

    // =========================================
    // PROGRAMAR INTERVALO
    // =========================================

    public void programarBackupIntervalo(
            String carpeta,
            long tiempo,
            String tipo
    ) {

        cancelarProgramacion();

        BackupConfiguracion config = new BackupConfiguracion();
        config.setActivo(true);
        config.setTiempo((int) tiempo);
        config.setTipo(tipo);
        config.setCarpeta(carpeta);

        configRepository.save(config);

        ejecutarScheduler(carpeta, tiempo, tipo);
    }

    // =========================================
    // PROGRAMAR FECHA
    // =========================================

    public void programarBackupFecha(
            String carpeta,
            LocalDateTime fecha
    ) {

        cancelarProgramacion();

        long delay = java.time.Duration
                .between(LocalDateTime.now(), fecha)
                .toMillis();

        if(delay < 0){
            throw new RuntimeException("Fecha inválida");
        }

        scheduler.schedule(() -> {
            try {
                crearBackup(carpeta);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, delay, TimeUnit.MILLISECONDS);
    }

    // =========================================
    // CANCELAR
    // =========================================

    public void cancelarProgramacion(){

        if(tareaProgramada != null){
            tareaProgramada.cancel(true);
            System.out.println("Programación cancelada");
        }

        BackupConfiguracion config =
                configRepository.findTopByOrderByIdDesc();

        if(config != null){
            config.setActivo(false);
            configRepository.save(config);
        }
    }

    // =========================================
    // AUTO-INICIO
    // =========================================

    @PostConstruct
    public void iniciarProgramacionGuardada(){

        BackupConfiguracion config =
                configRepository.findTopByOrderByIdDesc();

        if(config != null && config.isActivo()){

            System.out.println("Restaurando backup automático...");

            ejecutarScheduler(
                    config.getCarpeta(),
                    config.getTiempo(),
                    config.getTipo()
            );
        }
    }

    // =========================================
    // RESTORE
    // =========================================

    public void restaurarBackup(String ruta) throws Exception {

        String DB_NAME = getDatabaseName();

        ProcessBuilder pb = new ProcessBuilder(
                PG_RESTORE,
                "-U", DB_USER,
                "-d", DB_NAME,
                "--clean",
                "--if-exists",
                "--verbose",
                ruta
        );

        pb.environment().put("PGPASSWORD", DB_PASSWORD);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        BufferedReader reader =
                new BufferedReader(new InputStreamReader(process.getInputStream()));

        String line;
        while((line = reader.readLine()) != null){
            System.out.println(line);
        }

        process.waitFor();

        System.out.println("RESTORE COMPLETADO");
    }
}