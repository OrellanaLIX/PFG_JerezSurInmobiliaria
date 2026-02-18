package com.jerezsur.inmobiliaria.models;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*; // Si usas Lombok
import lombok.Builder.Default;

@Entity
@Table(name = "mensajes_contacto")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MensajeContacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) // 3. El nombre no debería ser nulo
    private String nombre;

    @Column(nullable = false) // 4. El email es clave para responder
    private String email;

    private String telefono;

    @Column(columnDefinition = "TEXT") // 5. Para mensajes largos que superen los 255 caracteres
    private String mensaje;

    @ManyToOne(fetch = FetchType.LAZY) // 6. Fetch Lazy por rendimiento
    @JoinColumn(name = "inmueble_id")
    private Inmueble inmueble;

    @Column(name = "fecha_envio", updatable = false)
    private LocalDateTime fechaEnvio;

    @Column(nullable = false)
    @Default
    private boolean leido = false;

    // 7. Método automático para asignar la fecha justo antes de guardar en DB
    @PrePersist
    protected void onCreate() {
        this.fechaEnvio = LocalDateTime.now();
    }
}