# Plan de Remediación - Auditoría del Proyecto

> [!IMPORTANT]
> **ESTADO: COMPLETADO (05 Enero 2026)**
> Todas las tareas críticas y de optimización han sido implementadas y verificadas.

> [!NOTE]
> Este documento detalla las acciones correctivas basadas en el informe de auditoría generado el 04 de Enero de 2026.

## 1. Configuración y Build
**Prioridad: ALTA**

- [x] **Corregir errores de TypeScript**:
  - Eliminar `typescript.ignoreBuildErrors: true` de `next.config.ts`.
  - Ejecutar `tsc --noEmit` y resolver todos los errores de tipos reportados.
  - Asegurar que el build de producción (`npm run build`) pase exitosamente sin la bandera de ignorar errores.

- [x] **Seguridad de Imágenes**:
  - Modificar `next.config.ts` para restringir `images.remotePatterns`.
  - Reemplazar el wildcard `hostname: '**'` con dominios de confianza específicos (ej. `res.cloudinary.com`, `lh3.googleusercontent.com` para avatares de Google, etc.).

## 2. Optimización de Rendimiento
**Prioridad: MEDIA**

- [x] **Optimizar Sesión de Usuario (`src/auth.ts`)**:
  - **Problema**: La callback de `session` realiza una consulta a la base de datos (`User.findById`)## 3. Plan de Ejecución

### Fase 1: Configuración & Limpieza (Inmediato)
- [x] **Configuración Sentry**:
  - [x] Crear `instrumentation.ts` para inicialización central.
  - [x] Configurar `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.
  - [x] Unificar opciones en `next.config.ts` (quitar duplicados).
- [x] **Tipado TypeScript**:
  - [x] Crear `types/next-auth.d.ts` para extender Session/User (role, id).
  - [x] Eliminar `as any` en `auth.config.ts` y componentes.

### Fase 2: Rendimiento & Estabilidad
- [x] **Serialización**:
  - [x] Revisar `getInstruments` y usar `.lean()` + serialización explícita (`JSON.parse(JSON.stringify)` o mapeo manual).
  - [x] Revisar paso de props a Client Components (iconos como props vs children).
- [x] **Optimizaciones DB**:
  - [x] Implementar caching en `auth.ts` (evitar fetch de usuario en cada callback si es posible, o usar `unstable_cache`).
- [x] **Componentes UI**:
  - [x] Solucionar errores de hidratación o "plain object" en `Button.tsx` (revisar `icon` prop).

### Fase 3: Hardening Final
- [x] **Validación de Entradas**:
  - [x] Sanitizar inputs regex en `getInstruments` (prevenir NoSQL injection).
- [x] **Tests E2E**:
  - [x] Implementar suite básica con Playwright para flujos críticos (Login, Create Instrument).

## 3. Calidad de Código y Seguridad
**Prioridad: BAJA/MANTENIMIENTO**

- [x] **Revisión de Secretos**:
  - Aunque no se encontraron secretos hardcodeados obvios, se recomienda rotar cualquier credencial de desarrollo que haya podido ser expuesta en logs anteriores.
  - Verificar que las credenciales en `storageProvider` (User model) se encripten correctamente antes de guardarse.

- [x] **Refactorización de Componentes**:
  - Continuar con la adopción del sistema de diseño en `src/components/ui` para nuevos componentes.
