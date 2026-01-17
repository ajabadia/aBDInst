# Roadmap del Proyecto: Fase 3 (Advanced Features & Community)

Este documento detalla el plan de implementación para las próximas características avanzadas de Instrument Collector.

## 1. Public Showrooms (Compartir Colección) 🚀 **(EN PROGRESO)**
Permitir a los usuarios compartir partes de su colección públicamente.
- **Ruta**: `/s/[uuid]` (Enlaces cortos y limpios).
- **Funcionalidad**:
    - Crear múltiples "Exhibiciones" (ej. "Mis Guitarras Vintage", "Pedalera de Directo").
    - **Privacidad**: Ocultar precios, valores y números de serie por defecto.
    - **Estética**: Layouts "Hero" inmersivos, distintos al Dashboard de gestión.
- **Tecnología**: Nuevo modelo `Showroom` en MongoDB.

## 2. Herramientas Profesionales (Seguros & PDF)
- **Generador de Reportes**: Exportación de inventario en PDF.
- **Caso de Uso**: Pólizas de seguro y auditorías.
- **Contenido**:
    - Resumen de valor total.
    - Listado de ítems con fotos principales, N/S y condición.
    - Firma digital de generación.

## 3. Blog & Base de Conocimiento (AI-Powered)
Sistema de gestión de contenidos (CMS) asistido por IA.
- **Objetivo**: SEO y educación de la comunidad.
- **Flujo Admin**:
    1.  Admin propone tema.
    2.  IA redacta borrador estructurado con datos del catálogo.
    3.  Admin revisa y publica.
- **Modelo**: `Article` (título, contenido, autor, tags).

## 4. Hardware & IoT (Taller 2.0)
Monitorización ambiental proactiva.
- **Funcionalidad**:
    - Ingesta de datos de sensores (Temp/Humedad).
    - Alertas en tiempo real (ej. "Peligro: Baja humedad en estudio").
- **IoT Integration**: Hardware sensors API.

## Phase 4: Museum, Social & Gamification (New)
- **Exhibitions (Exposiciones)**:
    - **Types**: Open Call (Public Join) vs Invitation Only.
    - **Dynamics**: Showcase (Standard) vs Contest (Voting/Jury).
    - **Lifecycle**: Scheduled (Start/End Dates), Current, Past (Archive Mode).
    - **Management**: Admins create events; Users "submit" instruments.
- **Enhanced Showroom Hub**:
    - Public `/showrooms` page becomes "The Museum Hall".
    - Sections: "Now Showing", "Coming Soon", "Past Exhibitions".
- **Gamification & Rewards**:
    - **Awards**: Virtual Medals/Trophies for contest winners or participation.
    - **Profile Integration**: "Trophy Case" and "Exhibition History" on User Profiles.
- **Landing Page Upgrade**:
    - Dynamic feed of Blog Articles and Active Exhibitions.

## 5. Hardware & IoT (Taller 2.0)
- **IoT Integration**: Hardware sensors API.
- **Luthier AI**: Diagnóstico visual de problemas de mantenimiento mediante fotos.
- **Smart Sales**: Generador de descripciones de venta persuasivas para Reverb/Wallapop.
