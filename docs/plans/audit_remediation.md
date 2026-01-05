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
  - **Problema**: La callback de `session` realiza una consulta a la base de datos (`User.findById`) en cada request para refrescar los datos del usuario.
  - **Solución Propuesta**:
    - Implementar una estrategia de caché (ej. verificar la actualización solo si han pasado X minutos).
    - O eliminar la consulta forzosa si la consistencia inmediata de nombre/avatar no es crítica, confiando en el token JWT hasta que expire.

- [x] **Serialización de Datos**:
  - **Problema**: Uso extensivo de `JSON.parse(JSON.stringify(obj))` para serializar documentos de Mongoose (ej. en `src/actions/collection.ts`).
  - **Solución Propuesta**:
    - Usar `.lean()` en las consultas de Mongoose donde sea posible para obtener objetos planos de JavaScript directamente.
    - Implementar una utilidad de serialización ligera si `.lean()` no es suficiente (ej. para transformar `_id` a string).

## 3. Calidad de Código y Seguridad
**Prioridad: BAJA/MANTENIMIENTO**

- [x] **Revisión de Secretos**:
  - Aunque no se encontraron secretos hardcodeados obvios, se recomienda rotar cualquier credencial de desarrollo que haya podido ser expuesta en logs anteriores.
  - Verificar que las credenciales en `storageProvider` (User model) se encripten correctamente antes de guardarse.

- [x] **Refactorización de Componentes**:
  - Continuar con la adopción del sistema de diseño en `src/components/ui` para nuevos componentes.
