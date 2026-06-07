package com.jerezsur.inmobiliaria.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * DTO de entrada para el registro de nuevos usuarios desde la web pública.
 *
 * El @Pattern de la contraseña impone los mismos requisitos que muestra el formulario
 * de React: mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
 * Esto garantiza que aunque alguien llame al endpoint directamente (sin el formulario)
 * no pueda registrar contraseñas débiles.
 */
@Data
public class RegistroRequest {
    
    @Email(message = "El email debe ser válido")
    private String email;
    
    private String telefono;
    
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    
    private String apellidos;
    
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", 
             message = "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).")
    private String password;

    private String dni;
}
