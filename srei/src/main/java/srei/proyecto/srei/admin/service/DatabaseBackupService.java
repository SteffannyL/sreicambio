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
import java.util.*;
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

    private static final String PSQL =
            "C:/Program Files/PostgreSQL/18/bin/psql.exe";

    private static final String BACKUP_FOLDER =
            "G:/Mi unidad/backups_srei";

    private final BackupHistorialRepository backupRepository;
    private final BackupConfiguracionRepository configRepository;

    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(1);

    private ScheduledFuture<?> tareaProgramada;

    public DatabaseBackupService(
            BackupHistorialRepository backupRepository,
            BackupConfiguracionRepository configRepository
    ) {
        this.backupRepository = backupRepository;
        this.configRepository = configRepository;
    }

    // =========================================
    // DB ACTUAL
    // =========================================
    private String getDatabaseName() {
        return datasourceUrl.substring(datasourceUrl.lastIndexOf("/") + 1);
    }

    public String obtenerBaseActual() {
        return getDatabaseName();
    }

    // =========================================
    // CREAR BACKUP
    // =========================================
    public String crearBackup(String carpeta) throws Exception {

        String DB_NAME = getDatabaseName();

        if (carpeta == null || carpeta.isEmpty()) {
            carpeta = BACKUP_FOLDER;
        }

        new File(carpeta).mkdirs();

        String fecha = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        String archivo = carpeta + "/backup_" + fecha + ".backup";

        ProcessBuilder pb = new ProcessBuilder(
                PG_DUMP, "-U", DB_USER, "-F", "c",
                "-b", "-v", "-f", archivo, DB_NAME
        );

        pb.environment().put("PGPASSWORD", DB_PASSWORD);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
        );

        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }

        int exit = process.waitFor();

        if (exit != 0) {
            throw new RuntimeException("❌ Error creando backup");
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
    // RESTORE DB ACTUAL
    // =========================================
    public void restaurarBackup(String ruta) throws Exception {

        System.out.println("🔄 Restaurando en DB actual: " + getDatabaseName());

        ProcessBuilder pb = new ProcessBuilder(
                PG_RESTORE,
                "-U", DB_USER,
                "-d", getDatabaseName(),
                "--clean",
                "--if-exists",
                "--verbose",
                ruta
        );

        pb.environment().put("PGPASSWORD", DB_PASSWORD);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
        );

        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }

        int exit = process.waitFor();

        if (exit != 0) {
            throw new RuntimeException("❌ Error restaurando backup");
        }

        System.out.println("✅ RESTORE COMPLETADO");
    }

    // =========================================
    // PROGRAMAR POR FECHA (✔ CORRECTO)
    // =========================================
    public void programarBackupFecha(String carpeta, LocalDateTime fecha){

        cancelarProgramacion();

        long delay = java.time.Duration
                .between(LocalDateTime.now(), fecha)
                .toMillis();

        if(delay < 0){
            throw new RuntimeException("Fecha inválida");
        }

        tareaProgramada = scheduler.schedule(() -> {
            try {
                System.out.println("⏰ Ejecutando backup programado...");

                crearBackup(carpeta);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }, delay, TimeUnit.MILLISECONDS);
    }

    // =========================================
    // PROGRAMAR AUTOMÁTICO
    // =========================================
    public void programarBackupIntervalo(String carpeta, long tiempo, String tipo){

        cancelarProgramacion();

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
                System.out.println("🔁 Backup automático ejecutado");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, 0, tiempo, unidad);
    }

    // =========================================
    // CANCELAR
    // =========================================
    public void cancelarProgramacion(){

        if(tareaProgramada != null){
            tareaProgramada.cancel(true);
            System.out.println("🛑 Programación cancelada");
        }

        BackupConfiguracion config =
                configRepository.findTopByOrderByIdDesc();

        if(config != null){
            config.setActivo(false);
            configRepository.save(config);
        }
    }

    // =========================================
    // AUTO RESTORE CONFIG
    // =========================================
    @PostConstruct
    public void iniciarProgramacionGuardada(){

        BackupConfiguracion config =
                configRepository.findTopByOrderByIdDesc();

        if(config != null && config.isActivo()){

            System.out.println("♻️ Restaurando backup automático...");

            programarBackupIntervalo(
                    config.getCarpeta(),
                    config.getTiempo(),
                    config.getTipo()
            );
        }
    }

    // =========================================
    // CREAR DB
    // =========================================
    public void crearBaseDatos(String nombreDb) throws Exception {

        ProcessBuilder pb = new ProcessBuilder(
                PSQL, "-U", DB_USER, "-d", "postgres",
                "-c", "CREATE DATABASE " + nombreDb
        );

        pb.environment().put("PGPASSWORD", DB_PASSWORD);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        new BufferedReader(new InputStreamReader(process.getInputStream()))
                .lines().forEach(System.out::println);

        if(process.waitFor() != 0){
            throw new RuntimeException("❌ Error creando DB");
        }

        System.out.println("✅ DB creada: " + nombreDb);
    }

    // =========================================
    // RESTORE EN DB
    // =========================================
    public void restaurarBackupEnDb(String ruta, String nombreDb) throws Exception {

        System.out.println("🔄 Restaurando en DB: " + nombreDb);

        ProcessBuilder pb = new ProcessBuilder(
                PG_RESTORE,
                "-U", DB_USER,
                "-d", nombreDb,
                "--clean",
                "--if-exists",
                "--verbose",
                ruta
        );

        pb.environment().put("PGPASSWORD", DB_PASSWORD);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
        );

        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println(line);
        }

        if (process.waitFor() != 0) {
            throw new RuntimeException("❌ Error restaurando en DB");
        }

        System.out.println("✅ RESTORE COMPLETADO EN: " + nombreDb);
    }

    // =========================================
    // CAMBIAR DB
    // =========================================
    public void cambiarBaseDatos(String nuevaDb) throws Exception {

        File file = new File("src/main/resources/application.properties");

        List<String> lineas = java.nio.file.Files.readAllLines(file.toPath());

        for (int i = 0; i < lineas.size(); i++) {
            if (lineas.get(i).startsWith("spring.datasource.url")) {
                lineas.set(i,
                        "spring.datasource.url=jdbc:postgresql://localhost:5432/" + nuevaDb);
            }
        }

        java.nio.file.Files.write(file.toPath(), lineas);

        System.out.println("⚠️ DB cambiada a: " + nuevaDb + " (reinicia backend)");
    }

    // =========================================
    // LISTAR BASES
    // =========================================
    public List<Map<String, Object>> listarBases() throws Exception {

        List<Map<String, Object>> bases = new ArrayList<>();

        ProcessBuilder pb = new ProcessBuilder(
                PSQL, "-U", DB_USER, "-d", "postgres",
                "-t", "-A",
                "-c", "SELECT datname FROM pg_database WHERE datistemplate = false;"
        );

        pb.environment().put("PGPASSWORD", DB_PASSWORD);

        BufferedReader reader =
                new BufferedReader(new InputStreamReader(pb.start().getInputStream()));

        String dbName;

        while ((dbName = reader.readLine()) != null) {

            dbName = dbName.trim();
            if (dbName.isEmpty()) continue;

            ProcessBuilder pbCount = new ProcessBuilder(
                    PSQL,
                    "-U", DB_USER,
                    "-d", dbName,
                    "-t",
                    "-A",
                    "-c",
                    "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"
            );

            pbCount.environment().put("PGPASSWORD", DB_PASSWORD);

            BufferedReader readerCount =
                    new BufferedReader(new InputStreamReader(pbCount.start().getInputStream()));

            String countStr = readerCount.readLine();

            int tablas = 0;

            try {
                tablas = Integer.parseInt(countStr.trim());
            } catch (Exception e) {
                tablas = 0;
            }

            Map<String, Object> map = new HashMap<>();
            map.put("nombre", dbName);
            map.put("vacia", tablas == 0);

            bases.add(map);
        }

        return bases;
    }
}