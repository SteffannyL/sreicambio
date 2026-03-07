package srei.proyecto.srei.evento.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import srei.proyecto.srei.evento.dto.CrearEventoDTO;
import srei.proyecto.srei.usuario.entity.Usuario;
import srei.proyecto.srei.usuario.repository.UsuarioRepository;

import java.sql.Types;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventoService {

    private final JdbcTemplate jdbcTemplate;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Map<String, Object> crearEvento(CrearEventoDTO dto, String correo) {

        Usuario usuario = usuarioRepository
                .findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return jdbcTemplate.execute(
                "CALL sp_crear_evento_docente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (CallableStatementCallback<Map<String, Object>>) cs -> {

                    cs.setLong(1, usuario.getIdusuario());
                    cs.setLong(2, dto.getIdambito());
                    cs.setString(3, dto.getNombreevento());
                    cs.setString(4, dto.getDescripcion());
                    cs.setTimestamp(5, Timestamp.valueOf(dto.getFechainicio()));
                    cs.setTimestamp(6, Timestamp.valueOf(dto.getFechafin()));
                    cs.setString(7, dto.getLugar());
                    cs.setString(8, dto.getAforo());
                    cs.setLong(9, dto.getIdtipoevento());

                    cs.registerOutParameter(10, Types.BIGINT);
                    cs.registerOutParameter(11, Types.VARCHAR);

                    cs.execute();

                    Map<String, Object> result = new HashMap<>();
                    result.put("idevento", cs.getLong(10));
                    result.put("mensaje", cs.getString(11));

                    return result;
                }
        );
    }
    
    
}