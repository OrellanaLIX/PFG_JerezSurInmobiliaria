package com.jerezsur.inmobiliaria.repositories;

import com.jerezsur.inmobiliaria.models.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TareaRepository extends JpaRepository<Tarea, Long> {

    List<Tarea> findAllByOrderByFechaAsc();
}