# 🏠 JerezSur Inmobiliaria - Plataforma de Gestión Integral

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4-brightgreen)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

## 📌 Sobre el Proyecto
JerezSur Inmobiliaria es una plataforma de gestión inmobiliaria con **frontend y backend desacoplados**, desarrollada como Proyecto Fin de Grado del ciclo de Desarrollo de Aplicaciones Web (DAW).

El proyecto nace de un caso real: la inmobiliaria pertenece a la familia del autor, por lo que está diseñado desde el inicio para evolucionar hacia una herramienta en **producción real**, más allá de la entrega académica.

La plataforma se compone de tres aplicaciones independientes que comparten una única API:
- **Catálogo público** (React): búsqueda de inmuebles, ficha de detalle con mapa y galería, y reserva de citas.
- **Panel de administración** (React): gestión de inmuebles, citas, clientes, propietarios, contratos y dashboard con estadísticas.
- **API REST** (Spring Boot): lógica de negocio, persistencia y conexión con todos los servicios externos.

## 🚀 Características Principales
- **Gestión Multi-rol:** roles diferenciados (interesado, vendedor, ambos, trabajador) con permisos y vistas específicas vía JWT.
- **Búsqueda Avanzada:** filtros dinámicos y mapa interactivo (Google Maps) en cada ficha de inmueble.
- **Gestión Documental:** subida, optimización y entrega de imágenes mediante **Cloudinary**.
- **Citas Inteligentes:** reserva de visitas con flujo de estados (pendiente → confirmada → completada/cancelada) y botón de **"Añadir a Google Calendar"**.
- **Notificaciones automáticas:** emails transaccionales (Mailtrap/SMTP) y avisos por WhatsApp (**CallMeBot**) a clientes y agencia.
- **Login social:** acceso con **Google OAuth 2.0**, con arquitectura multi-proveedor preparada para Facebook y Apple Sign In.
- **Sindicación XML:** feed automático de inmuebles compatible con portales como Idealista o Fotocasa, generado on-demand desde el panel.
- **Dashboard con analítica:** gráficas de ventas/alquileres y distribución de clientes generadas por un microservicio en Python.
- **SEO & Performance:** auditado con Lighthouse — code splitting, imágenes WebP, accesibilidad WCAG AA, sitemap y datos estructurados Schema.org.

## 🛠️ Stack Tecnológico
| Capa | Tecnologías |
|---|---|
| **Backend** | Java 21, Spring Boot 4, Spring Security (JWT), Spring Data JPA / Hibernate |
| **Base de datos** | MySQL 8 |
| **Frontend público y panel admin** | React 19, TypeScript, Vite, SCSS (dos SPAs independientes) |
| **Microservicio de estadísticas** | Python, Flask, Matplotlib |
| **Infraestructura** | Docker Compose + proxy inverso Nginx con HTTPS (certificado autofirmado) |
| **Integraciones externas** | Cloudinary, Google OAuth 2.0, Google Calendar, Google Maps, Mailtrap (SMTP), CallMeBot (WhatsApp API) |

## 🏛️ Arquitectura del Backend
La API sigue una arquitectura en capas (Controller → Service → Repository), con DTOs para desacoplar la API del modelo de datos y evitar referencias circulares de JPA:

```
JerezSur-Inmobiliaria/
└── src/main/java/com/jerezsur/inmobiliaria/
    ├── config/        # Seguridad, CORS, beans de Cloudinary/Mail/OAuth
    ├── controllers/   # Endpoints REST
    ├── services/      # Lógica de negocio (@Transactional)
    ├── repositories/  # Interfaces JPA (Spring Data)
    ├── models/        # Entidades JPA y enums de dominio
    ├── dto/           # Objetos de transferencia (request/response)
    ├── security/      # Filtro JWT y verificación de proveedores OAuth
    ├── exceptions/    # Excepciones de dominio
    ├── handlers/      # Manejo centralizado de errores (@ControllerAdvice)
    └── helper/        # Utilidades (generación de XML, mapeo provincia ↔ CP, etc.)
```

## 📂 Estructura del Repositorio

```
JerezSur-docker/
├── docker-compose.yml
├── nginx.conf              # Proxy inverso, redirección HTTPS y enrutado por servicio
├── init-ssl.sh             # Genera el certificado autofirmado en el primer arranque
├── JerezSur-Inmobiliaria/  # Backend (Spring Boot)
├── JerezSur-frontend/      # Frontend público (React + TS + Vite)
├── JerezSur-admin/         # Panel de administración (React + TS + Vite)
└── Python/                 # Microservicio Flask (gráficas del dashboard)
```

## 🐳 Despliegue con Docker Compose
Todo el sistema se levanta con un único comando desde `JerezSur-docker/`:

```bash
docker compose up --build
```

Nginx actúa como proxy inverso único (puertos 80/443) y enruta cada petición al servicio correspondiente:

| Ruta | Servicio |
|---|---|
| `/` | Frontend público (React) |
| `/admin/` | Panel de administración (React) |
| `/api/` | Backend (Spring Boot REST API) |
| `/grafico/` | Microservicio de estadísticas (Flask) |

Las credenciales y claves (BD, JWT, Cloudinary, Mailtrap, Google OAuth, CallMeBot) se configuran mediante variables de entorno y no se versionan en el repositorio.

## 📡 Sindicación de Inmuebles
La agencia edita el catálogo una sola vez desde el panel y un feed XML generado **on-demand** permite que portales como Idealista o Fotocasa importen el inventario automáticamente, sin volcado manual:

```
GET /api/portal/feed.xml             → todos los inmuebles disponibles
GET /api/portal/feed-ventas.xml      → solo en venta
GET /api/portal/feed-alquileres.xml  → solo en alquiler
```

## ⚡ Rendimiento y Accesibilidad
El frontend público ha sido auditado y optimizado con Lighthouse:
- **Performance:** code splitting con `React.lazy()` + `manualChunks` (bundle inicial: 382 KB → ~80 KB), imágenes en WebP, `font-display: swap`, `dns-prefetch`/`preconnect`.
- **Accesibilidad (WCAG AA):** contraste de color corregido, skip link, foco visible y controles de pausa/avance en el carrusel.
- **SEO:** `sitemap.xml`, datos estructurados Schema.org y meta tags Open Graph completos.

## 🚧 Próximos Pasos
Tras la entrega académica, el proyecto continúa en desarrollo activo con el objetivo de convertirse en la herramienta de gestión real de la inmobiliaria: activación de Facebook/Apple Sign In, despliegue en producción y mejoras continuas guiadas por el uso real de la agencia.
