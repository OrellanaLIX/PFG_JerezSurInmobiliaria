package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.LoginRequest;
import com.jerezsur.inmobiliaria.dto.LoginResponseDTO;
import com.jerezsur.inmobiliaria.services.AuthAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthAdminController {

    private final AuthAdminService authAdminService;

    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@Valid @RequestBody LoginRequest dto) {
        try {
            LoginResponseDTO response = authAdminService.loginAdmin(
                    dto.getUsername(),
                    dto.getPassword()
            );
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}