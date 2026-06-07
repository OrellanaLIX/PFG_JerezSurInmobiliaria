package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "inmueble_extras")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class InmuebleExtra {

    @EmbeddedId
    private InmuebleExtraId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("inmuebleId")
    @JoinColumn(name = "inmueble_id")
    @ToString.Exclude
    private Inmueble inmueble;

    @Column(name = "valor")
    private String valor;

    public String getClave() {
        return id != null ? id.getClave() : null;
    }
}
