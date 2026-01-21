# 🎯 REGLAS DE ORO - Instrument Collector

Este documento define los estándares no negociables para el desarrollo del proyecto **Instrument Collector**. Estas reglas garantizan la escalabilidad, mantenibilidad y robustez de la plataforma.

---

## 📋 INSTRUCCIONES DE SISTEMA

### CONTEXTO DEL PROYECTO
**Proyecto:** Instrument Collector (Plataforma de gestión de colecciones de instrumentos y enciclopedia musical).
**Stack:**
- Frontend: Next.js 14/15 + React 18/19 + Tailwind CSS + Framer Motion.
- Backend: Next.js Server Actions & API Routes.
- DB: MongoDB Atlas (Mongoose).
- AI/ML: Google Gemini 2.0 Flash (Vision & Text).
- Media: Cloudinary.
- API Externas: Discogs, Spotify, Reverb, eBay.

---

## ⚡ REGLAS NO NEGOCIABLES

### 1. TypeScript Strict Mode
- **Regla**: El código debe compilar sin errores en modo estricto. Prohibido el uso de `any` injustificado.
- **Acción**: Usar interfaces/tipos explícitos para todas las respuestas de API y modelos de datos.

### 2. Zod Validation FIRST (Server & Client)
- **Regla**: Todo input externo (formularios, queries, bodies, uploads) debe ser validado con Zod antes de cualquier lógica de negocio.
- **Patrón**: Usar `createSafeAction` (en `src/lib/safe-action.ts`) para envolver Server Actions con esquemas de validación obligatorios.

### 3. AppError para Gestión de Errores
- **Regla**: No lanzar `Error()` genéricos. Usar una clase base `AppError` o respuestas de tipo `ActionResponse` consistentes.
- **Objetivo**: Proporcionar códigos de error legibles y mensajes amigables al usuario (Safe Error Handling).

### 4. Logging Estructurado
- **Regla**: Eventos críticos (Sincronización de API, Importación Masiva, Fallos de IA) deben loguearse con estructura: `origen`, `accion`, `correlacion_id`, `detalles`.
- **Patrón**: Implementar y usar un logger centralizado en `src/lib/logger.ts`.

### 5. Operaciones DB Atómicas (Transactions)
- **Regla**: Operaciones que afecten a múltiples colecciones (ej: sincronización bidireccional entre Instrumentos y Artistas) deben usar transacciones de Mongoose (`session.withTransaction`).
- **Razón**: Evitar "huérfanos" o estados inconsistentes entre el catálogo y la colección del usuario.

### 6. NO Browser Storage APIs en Lógica Core
- **Regla**: Evitar `localStorage` o `sessionStorage` para estados críticos que deban ser consistentes entre servidor y cliente (Hydration Safety).
- **Alternativa**: React Context para UI state, Cookies para persistencia ligera o MongoDB para persistencia real.

### 7. Performance Medible & SLAs
- **Regla**: Los procesos pesados (Scraping, AI Search, Importación masiva) deben medir su ejecución.
- **SLA Referencia**: 
  - Búsqueda simple: < 300ms.
  - Enriquecimiento con IA: < 3000ms.
  - Carga de Dashboard: < 500ms.

### 8. Seguridad de Secretos
- **Regla**: NUNCA hardcodear API Keys (Gemini, Discogs, Cloudinary). Usar variables de entorno `.env.local` y Vercel Env Vars.
- **Acción**: Validar que las variables existan en el arranque o lanzar un error descriptivo.

---

## 🚫 RED FLAGS (RECHAZO AUTOMÁTICO)
- ❌ Uso de `any`.
- ❌ `console.log` de datos sensibles o keys.
- ❌ Queries a base de datos en loops (N+1 problema).
- ❌ Funciones de más de 50 líneas (Falta de responsabilidad única).
- ❌ Promesas sin `await` (Floating promises).
- ❌ Edición de archivos de sistema sin justificación técnica.

---

## ✅ MEJORES PRÁCTICAS
- **Funciones Puras**: Separar la lógica de cálculo de la lógica de IO (Base de datos/API).
- **Retry Logic**: Implementar reintentos con backoff exponencial para llamadas a Discogs/Spotify (sujetas a rate leaks).
- **JSDoc**: Documentar funciones complejas de scraping o sincronización para facilitar el mantenimiento.

---

## 🎬 EJECUCIÓN
**Antes de generar código:**
1. ¿Existe esquema Zod para el input?
2. ¿Necesita transacción de DB?
3. ¿Cómo vamos a loguear el éxito/fallo?
4. ¿Qué SLA esperamos?
