package srei.proyecto.srei.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import srei.proyecto.srei.auth.dto.LoginRequestDTO;
import srei.proyecto.srei.auth.dto.LoginResponseDTO;
import srei.proyecto.srei.auth.dto.RegisterRequestDTO;
import srei.proyecto.srei.auth.dto.RegisterResponseDTO;
import srei.proyecto.srei.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/login")
    public LoginResponseDTO login(
            @RequestBody LoginRequestDTO dto,
            HttpServletRequest request
    ) {

        System.out.println("ENTRO AL LOGIN -> " + dto.getCorreo());

        return service.login(dto, request);
    }

    @PostMapping("/register")
    public RegisterResponseDTO register(@Valid @RequestBody RegisterRequestDTO dto) {
        return service.register(dto);
    }

    @PostMapping("/logout/{idsesion}")
public void logout(@PathVariable Long idsesion) {
    service.logout(idsesion);
}
}