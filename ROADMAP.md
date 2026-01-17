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

## Phase 4: Museum & Social (New)
- **Rich Instrument Stories**:
    - Users can write multiple "Mini-articles" or notes per instrument.
    - Contextual visibility: Choose which note appears in which Showroom.
- **Enhanced Showroom Experience**:
    - "Museum Card" view: Curated photos + Story + Catalog Link.
    - Click-through details within Showrooms.
- **Virtual Loans**:
    - "Lend" an instrument to another user's Showroom.
    - Attribution system ("Courtesy of @username").

## 5. AI Suite Expansion
- **Luthier AI**: Diagnóstico visual de problemas de mantenimiento mediante fotos.
- **Smart Sales**: Generador de descripciones de venta persuasivas para Reverb/Wallapop.
