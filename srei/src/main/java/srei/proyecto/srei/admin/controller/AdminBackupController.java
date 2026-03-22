package srei.proyecto.srei.admin.controller;

import lombok.RequiredArgsConstructor;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import srei.proyecto.srei.admin.dto.BackupRequest;
import srei.proyecto.srei.admin.model.BackupHistorial;
import srei.proyecto.srei.admin.repository.BackupHistorialRepository;
import srei.proyecto.srei.admin.service.DatabaseBackupService;

@RestController
@RequestMapping("/api/admin/backup")
@RequiredArgsConstructor
public class AdminBackupController {

    private final DatabaseBackupService backupService;
    private final BackupHistorialRepository backupRepository;

    // =========================================
    // CREAR BACKUP
    // =========================================
    @PostMapping("/crear")
    public Map<String,String> crearBackup(@RequestBody BackupRequest request)
            throws Exception {

        String ruta = backupService.crearBackup(request.getCarpeta());

        return Map.of("ruta", ruta);
    }

    // =========================================
    // PROGRAMAR POR FECHA
    // =========================================
    @PostMapping("/programar")
    public Map<String,String> programarBackup(@RequestBody BackupRequest request) {

        LocalDateTime fecha = LocalDateTime.parse(request.getFecha());

        backupService.programarBackupFecha(
                request.getCarpeta(),
                fecha
        );

        return Map.of("mensaje","Backup programado correctamente");
    }

    // =========================================
    // PROGRAMAR INTERVALO
    // =========================================
    @PostMapping("/programar-intervalo")
    public Map<String,String> programarIntervalo(@RequestBody BackupRequest request) {

        backupService.programarBackupIntervalo(
                request.getCarpeta(),
                request.getTiempo(),
                request.getTipo()
        );

        return Map.of("mensaje","Backup automático configurado");
    }

    // =========================================
    // CANCELAR PROGRAMACIÓN
    // =========================================
    @PostMapping("/cancelar-programacion")
    public Map<String,String> cancelarProgramacion(){

        backupService.cancelarProgramacion();

        return Map.of("mensaje","Programación cancelada");
    }

    // =========================================
    // HISTORIAL
    // =========================================
    @GetMapping("/historial")
    public List<BackupHistorial> historial(){
        return backupRepository.findAll();
    }

    // =========================================
    // DESCARGAR
    // =========================================
    @GetMapping("/descargar/{nombre}")
    public ResponseEntity<Resource> descargar(@PathVariable String nombre) throws Exception {

        Path path = Paths.get("G:/Mi unidad/backups_srei").resolve(nombre);

        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + nombre + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    // =========================================
    // RESTAURAR
    // =========================================
    @PostMapping("/restaurar/{nombre}")
    public Map<String,String> restaurar(@PathVariable String nombre)
            throws Exception {

        String ruta = "G:/Mi unidad/backups_srei/" + nombre;

        backupService.restaurarBackup(ruta);

        return Map.of("mensaje","Base restaurada correctamente");
    }

    // =========================================
    // CREAR DB
    // =========================================
    @PostMapping("/crear-db/{nombre}")
    public Map<String,String> crearDb(@PathVariable String nombre) throws Exception {

        backupService.crearBaseDatos(nombre);

        return Map.of("mensaje", "Base creada: " + nombre);
    }

    // =========================================
    // RESTAURAR EN DB ESPECÍFICA
    // =========================================
    @PostMapping("/restaurar-en-db")
    public Map<String,String> restaurarEnDb(
            @RequestParam String nombreBackup,
            @RequestParam String nombreDb
    ) throws Exception {

        String ruta = "G:/Mi unidad/backups_srei/" + nombreBackup;

        backupService.restaurarBackupEnDb(ruta, nombreDb);

        return Map.of("mensaje", "Restaurado en DB: " + nombreDb);
    }

    // =========================================
    // CAMBIAR DB
    // =========================================
    @PostMapping("/cambiar-db/{nombre}")
    public Map<String,String> cambiarDb(@PathVariable String nombre) throws Exception {

        backupService.cambiarBaseDatos(nombre);

        return Map.of(
                "mensaje",
                "Base cambiada a " + nombre + " (reinicia backend)"
        );
    }

    // =========================================
    // LISTAR BASES
    // =========================================
    @GetMapping("/bases")
    public List<Map<String, Object>> listarBases() throws Exception {
        return backupService.listarBases();
    }

    // =========================================
    // 🔥 NUEVO: DB ACTUAL
    // =========================================
    @GetMapping("/db-actual")
    public Map<String, String> obtenerDbActual(){

        String db = backupService.obtenerBaseActual();

        Map<String, String> resp = new HashMap<>();
        resp.put("database", db);

        return resp;
    }

}