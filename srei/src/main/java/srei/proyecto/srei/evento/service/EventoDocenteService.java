package srei.proyecto.srei.evento.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import srei.proyecto.srei.evento.dto.CrearEventoDocenteDTO;
import srei.proyecto.srei.evento.repository.EventoDocenteRepository;
import srei.proyecto.srei.usuario.entity.Usuario;
import srei.proyecto.srei.usuario.repository.UsuarioRepository;

import java.util.Map;
import java.util.List;
import java.io.File;
import java.io.IOException;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EventoDocenteService {

    private final EventoDocenteRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;

    /* ================= CREAR EVENTO NORMAL ================= */

    public Map<String, Object> crearEvento(CrearEventoDocenteDTO dto, String correo) {

        Usuario usuario = usuarioRepository
                .findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Long idusuario = usuario.getIdusuario();

        return eventoRepository.crearEvento(
                idusuario,
                dto.getIdambito(),
                dto.getNombreevento(),
                dto.getDescripcion(),
                dto.getFechainicio(),
                dto.getFechafin(),
                dto.getLugar(),
                dto.getAforo(),
                dto.getIdtipoevento()
        );
    }

    /* ================= CREAR EVENTO CON ARCHIVOS ================= */

    public Map<String, Object> crearEventoConArchivos(
            Long idambito,
            Long idtipoevento,
            String nombreevento,
            String descripcion,
            String fechainicio,
            String fechafin,
            String lugar,
            Integer aforo,
            MultipartFile imagen,
            MultipartFile pdf,
            String correo
    ) {

        Usuario usuario = usuarioRepository
                .findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Long idusuario = usuario.getIdusuario();

        // Convertir fechas
        LocalDateTime fechaInicioParsed = LocalDateTime.parse(fechainicio);
        LocalDateTime fechaFinParsed = LocalDateTime.parse(fechafin);

        // Crear evento
        Map<String, Object> resultado = eventoRepository.crearEvento(
                idusuario,
                idambito,
                nombreevento,
                descripcion,
                fechaInicioParsed,
                fechaFinParsed,
                lugar,
                aforo.toString(),
                idtipoevento
        );

        Long idevento = ((Number) resultado.get("idevento")).longValue();

        // Guardar archivos
        String urlImagen = null;
        String urlPdf = null;

        try {

            // 🔥 RUTA CORREGIDA
            String rutaBase = System.getProperty("user.dir") + "/uploads/";

            File carpeta = new File(rutaBase);
            if (!carpeta.exists()) {
                boolean creada = carpeta.mkdirs();
                System.out.println("Carpeta creada: " + creada);
            }

            // Imagen
            if (imagen != null && !imagen.isEmpty()) {
                String nombreImagen = UUID.randomUUID() + "_" + imagen.getOriginalFilename();
                File archivoImagen = new File(rutaBase + nombreImagen);
                imagen.transferTo(archivoImagen);

                urlImagen = "uploads/" + nombreImagen;
            }

            // PDF
            if (pdf != null && !pdf.isEmpty()) {
                String nombrePdf = UUID.randomUUID() + "_" + pdf.getOriginalFilename();
                File archivoPdf = new File(rutaBase + nombrePdf);
                pdf.transferTo(archivoPdf);

                urlPdf = "uploads/" + nombrePdf;
            }

        } catch (IOException e) {
            e.printStackTrace(); // 🔥 IMPORTANTE PARA DEBUG
            throw new RuntimeException("Error guardando archivos", e);
        }

        // Guardar en BD
        eventoRepository.guardarArchivosEvento(idevento, urlImagen, urlPdf);

        return resultado;
    }

    /* ================= LISTAR EVENTOS ================= */

    public List<Map<String, Object>> listarEventosPorDocente(String correo) {
        return eventoRepository.listarEventosPorDocente(correo);
    }

    /* ================= DETALLE EVENTO ================= */

    public Map<String, Object> obtenerDetalleEvento(Long idEvento, String correo) {
        return eventoRepository.obtenerDetalleEvento(idEvento, correo);
    }
}