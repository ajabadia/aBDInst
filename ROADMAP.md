# Roadmap del Proyecto: Fase 3 (Advanced Features & Community)

Este documento detalla el plan de implementación para las próximas características avanzadas de Instrument Collector.

## 1. Public Showrooms (Compartir Colección) ✅ **(COMPLETADO)**
Permitir a los usuarios compartir partes de su colección públicamente.
- **Ruta**: `/dashboard/showrooms` y `/s/[slug]`.
- **Funcionalidad**:
    - Crear múltiples "Exhibiciones" (ej. "Mis Guitarras Vintage", "Pedalera de Directo").
    - **Privacidad**: Ocultar precios, valores y números de serie por defecto.
    - **Estética**: Layouts "Hero" inmersivos.
- **Tecnología**: Modelo `Showroom` en MongoDB.

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

## Phase 4: Museum, Social & Gamification ✅ **(COMPLETADO)**
- **Gamification & Rewards**:
    - **Back-end**: Badges y triggers implementados.
    - **Front-end**: "Trophy Case" implementado en `/dashboard/profile`.
- **Exhibitions (Exposiciones)**:
    - **Status**: Lifecycle Manager completo.
    - **Management**: Panel de Admin disponible en `/dashboard/admin/exhibitions`.
- **Landing Page Admin**:
    - **Status**: Configuración global (Hero/Featured Exhibition) en `/dashboard/admin/cover`.
- **Admin Tools Expansion**:
    - **Requests Queue**: `/dashboard/admin/requests`.
    - **Catalog Manager**: `/dashboard/admin/catalog`.
    - **Evolución**: Mejorar filtros y ordenación en Catalog Admin reutilizando componentes del catálogo público.

## 5. Advanced Instrument Submission (Phase 5) 🚧 **(PRIORIDAD)**
- **Search First**: Flujo obligatorio de búsqueda antes de crear.
- **Global DB**: Alta en base de datos global pero en estado Draft/Pending.
- **Magic Import 2.0**:
    - **Prompt Generator**: Para usuarios sin API Key (External AI).
    - **JSON Validation**: Ingesta de datos externos (Wizard).
    - **Bulk Import**: Revisar/Unificar lógica para permitir subir JSONs externos (o AI-generated) en el importador masivo.
- **Auditoría**: Traza completa de quien crea y modifica (`statusHistory`).
- **Seguridad**: Rate limiting, CAPTCHA para prevenir spam/abuso.
- **UX**: Mejorar campos de entrada (specs más grande, URLs separadas), sanitización de JSON.

## 6. Testing & Estabilidad
- **Tests Unitarios**: Vitest configurado.
- **Tests E2E (Playwright)**:
    - [ ] Auth Specs (Resolviendo timeouts).
    - [ ] CRUD Specs.

## 7. Hardware & IoT (Taller 2.0)
- **IoT Integration**: Hardware sensors API.
- **Luthier AI**: Diagnóstico visual de problemas de mantenimiento.

## 8. Future Concepts
- **Blockchain**: Certificados de posesión.
- **PWA Hardening**: Notificaciones push.
- **Marketplace Live**: Precios tiempo real.

## 5. Hardware & IoT (Taller 2.0)
- **IoT Integration**: Hardware sensors API.
- **Luthier AI**: Diagnóstico visual de problemas de mantenimiento mediante fotos.
- **Smart Sales**: Generador de descripciones de venta persuasivas para Reverb/Wallapop.
