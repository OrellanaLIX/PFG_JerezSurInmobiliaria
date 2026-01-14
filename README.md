# 🏠 JerezSur Inmobiliaria - Plataforma de Gestión Integral

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17%2B-orange)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📌 Sobre el Proyecto
JerezSur Inmobiliaria es una solución digital completa diseñada para modernizar el sector inmobiliario local. Este proyecto nace como TFG para el ciclo de Desarrollo de Aplicaciones Web (DAW), enfocándose en resolver las carencias de usabilidad, rendimiento y SEO detectadas en el mercado actual.

La plataforma permite la gestión eficiente de inmuebles, la automatización de citas y una experiencia de búsqueda avanzada para el cliente final.

## 🚀 Características Principales
- **Gestión Multi-rol:** Paneles diferenciados para Agentes y Clientes.
- **Búsqueda Avanzada:** Filtros dinámicos y visualización en mapa interactivo.
- **Gestión Documental:** Subida y optimización de imágenes en la nube.
- **Calendario Inteligente:** Sistema de reserva de citas con integración de estados.
- **SEO & Performance:** Optimización para motores de búsqueda y diseño 100% responsive.

## 🛠️ Stack Tecnológico
- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA.
- **Frontend:** React.
- **Base de Datos:** MySQL.
- **Infraestructura:** Docker & GitHub Actions (CI/CD).

## 🏛️ Arquitectura
El proyecto sigue los principios de **Clean Architecture**, dividiendo la lógica de negocio de la infraestructura para garantizar la escalabilidad y facilidad de testeo.

```bash
src/
 └── main/
     └── java/com/jerezsur/
         ├── config/         # Seguridad y Beans
         ├── controller/     # Endpoints REST y Web
         ├── service/        # Lógica de Negocio
         ├── repository/     # Persistencia de Datos
         ├── entity/         # Modelos de Dominio
         └── dto/            # Objetos de Transferencia de Datos
