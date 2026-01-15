//PREGUNTAR A MI MADRE SI ES MEJOR ASI O METO ESTO DENTRO DE INMUEBLE.JAVA

package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "propiedades_adicionales")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropiedadAdicional {

    @Id
    private Long id; // El ID será el mismo que el del Inmueble gracias a @MapsId

    // Datos Fiscales y Legales
    private String referenciaCatastral;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal cuotaIBI;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal gastosComunidad;

    // Documentación (URLs a los archivos subidos o estado)
    private String urlNotaSimple;
    private String urlCertificadoEnergetico;
    
    @Column(columnDefinition = "TEXT")
    private String notasPrivadas; // Para que el trabajador anote cosas que no verá el cliente

    // Relación 1:1 inversa
    @OneToOne
    @MapsId
    @JoinColumn(name = "inmueble_id")
    private Inmueble inmueble;
}