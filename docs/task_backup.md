# Task List: Instrument Collector 🎸

## Estado Actual
- ✅ Fase 1 completada (Auth, Catálogo, Colecciones, PWA)
- 🔄 Galería BYOS - Fase 1 (Cloudinary) completada
- 🔄 Galería BYOS - Fase 2 en progreso (60%)

---

## Fase 2: Galería Personal BYOS (Multi-Provider)

### 2.1 Proveedores de Almacenamiento ✅
- [x] Implementar `GoogleDriveProvider` con OAuth2
  - [x] Clase provider en `src/lib/storage-providers/google-drive.ts`
  - [x] Componente `GoogleDriveSetup.tsx`
  - [x] Flujo OAuth2 con Google
  - [x] Métodos upload/delete/getUrl

- [x] Implementar `DropboxProvider` con OAuth2
  - [x] Clase provider en `src/lib/storage-providers/dropbox.ts`
  - [x] Componente `DropboxSetup.tsx`
  - [x] Flujo OAuth2 con Dropbox
  - [x] Métodos upload/delete/getUrl

- [x] Implementar `TeraboxProvider`
  - [x] Clase provider en `src/lib/storage-providers/terabox.ts`
  - [x] Componente `TeraboxSetup.tsx`
  - [x] Métodos upload/delete/getUrl

### 2.2 UI de Upload y Galería ✅
- [x] Componente `ImageUploader`
  - [x] Integrar `react-dropzone`
  - [x] Preview de imágenes
  - [x] Progress bar
  - [x] Validación de archivos
  - [x] Mensaje si no hay storage configurado

- [x] Componente `Gallery`
  - [x] Grid responsivo
  - [x] Lightbox para vista ampliada
  - [x] Marcar foto como principal
  - [x] Eliminar fotos
  - [x] Reorganizar orden

### 2.3 Integración ✅
- [x] Actualizar `UserCollection.ts` con `userImages`
- [x] API route `/api/upload/collection-images`
- [x] Integrar en página de detalle de colección
- [x] Diferenciar galería personal vs catálogo

---

## Fase 3: Funcionalidades Avanzadas

### 3.1 Etiquetas Personalizadas ✅
- [x] Campo `tags: string[]` en schema
- [x] Input con autocomplete
- [x] Filtro por tags
- [x] Gestión de tags

### 3.2 Dashboard de Analytics ✅
- [x] Cálculo de valor total
- [x] Integrar Chart.js/Recharts (ValueEvolutionChart)
- [x] Gráficos de distribución
- [x] Timeline de evolución (Histórico de Portafolio)
- [x] Cards de métricas

### 3.3 Comparador de Instrumentos ✅
- [x] Página `/compare` (colección)
- [x] Tabla comparativa
- [x] Resaltar diferencias
- [x] Selector de instrumentos
- [x] Comparador de catálogo `/instruments/compare`

### 3.4 Colaboración y Comunidad ✅
- [x] Sistema de wishlist
- [x] Wishlist pública
- [x] Comentarios con moderación
- [x] Seguir usuarios
- [x] Feed de actividad

### 3.5 Notificaciones y Recordatorios ✅
- [x] Schema `Reminder`
- [x] UI de gestión (Notificaciones)
- [x] Cron jobs (Implementado Lazy Check)
- [x] Web Push API
- [x] Email opcional
- [x] UI de gestión

### 3.6 Mantenimiento Proactivo
- [x] Campo `nextDue` en mantenimiento (Schema Updated)
- [x] Checklist de componentes / UI Programador
- [x] Vista de calendario / Dashboard
- [x] Integración con recordatorios (Automático)

### 3.7 Exportación Avanzada
- [x] PDF profesional (Ficha PDF)
- [x] Exportación CSV (Dashboard)

## Fase 4.0: Módulo de Valoración y Mercado ✅
- [x] Schema `MarketValue` (Campo en Instrument).
- [x] Server Actions: `addValuation` (Unified Schema).
- [x] Server Actions: `estimateValueAI` (Stub creado).
- [x] UI: `ValuationModal` para añadir puntos de datos (Valores y Rangos).
- [x] UI: `ValuationHistoryModal` (Gestión de historial).
- [x] UI: `InstrumentValueChart` (Recharts, Multi-Series, Monthly Avg).
- [x] Lógica de ROI (Calculado vs Precio Compra).
- [x] Fix: `ValueEvolutionChart` (Lógica de portafolio y snapshot).
- [x] Fix: Persistencia unificada (Formulario + Modal + AI).
- [x] Estimación con IA (Gemini) - Prompt actualizado ✅

### 3.8 Importación Masiva (Magic Importer v2) ✅
- [x] Acción `analyzeBulkList` con IA.
- [x] Componente `BulkImporter` (UI de texto/tabla).
- [x] Integración en `/instruments`.
- [x] Configuración dinámica de IA (`SystemConfig`).
- [x] UI Admin para Prompts/Modelos.

### 3.9 Gestión Financiera ✅
- [x] Schema `Insurance`.
- [x] Acción `saveInsurancePolicy` y cálculos.
- [x] UI: `InstrumentFinanceSection` (Detalle).
- [x] UI: `FinanceOverview` (Dashboard).
- [x] Dashboard de Finanzas Global (Resumen).

## Fase 5: Gestión Avanzada de Inventario (Multi-Instancia) ✅
- [x] Schema Update: `inventorySerial`, `ownershipHistory`.
- [x] Update `addToCollection`: Permitir duplicados.
- [x] UI: Selector de instancias en `InstrumentDetail`.
- [x] UI: Campos `condition`, `provenance`, `isOriginalOwner`.

## Fase 6: Automatización y Scraping (En Progreso)
- [/] **Scraping de Precios y Alertas**:
    - [x] Schema `PriceAlert` y `ScrapedListing`.
    - [x] UI: `AlertsManager` (Dashboard de alertas personalizadas).
    - [x] UI: Integración "Quick Track" en `ValuationSection`.
    - [x] Scraper Básico de Reverb (Nota: Requiere Proxy residencial para evitar bloqueos 403).
    - [ ] Integración con Wallapop, eBay, Mercasonic.
    - [ ] Tarea cron para actualizar valores estimados automáticamente.
    - [ ] Alertas de "Chollos" o bajadas de precio.

### 3.11 Investigaciones y Correcciones 🐞
- [x] Investigar aviso "(pwa) PWA support is disabled"
  - [x] Revisar `next.config.mjs` / `next.config.ts` (Validado: `disable: process.env.NODE_ENV === "development"`)
  - [x] Verificar configuración de `next-pwa`
  - [x] Comprobar entorno (Dev vs Prod)

---

## Fase 7: Refinamiento y Optimización (Actual)
#### 🚀 Grupo 7.1: Dashboard Principal 2.0
- [/] **Widgets Reordenables**: Implementado layout fijo pero interactivo (Tabs/Sidebar).
- [x] **Feed de Actividad**: Integrado en el sidebar.
- [x] **Quick Action Bar**: Implementada en Hero Section.
- [ ] **7.2 Importador Masivo (Hardening)**:
    - [ ] Test con CSVs complejos/reales.
    - [ ] Mejorar feedback de errores por fila.
    - [ ] Opción de "Deshacer importación".
- [ ] **7.3 Galería UX/UI**:
    - [ ] Optimización de carga (Masonry + Lazy).
    - [ ] Modo "presentación" pantalla completa.
- [ ] **7.4 Rendimiento (Vital)**:
    - [ ] Virtualización de listas largas (`react-window`) en Explorador.
    - [ ] Optimización de queries a BD (Índices faltantes).
- [ ] **7.5 Gestión de Usuarios (Admin)**:
    - [ ] Tabla de usuarios registrados.
    - [ ] Modificar Roles (Admin/User).
    - [ ] **7.5 Gestión de Usuarios (Admin)**:
    - [ ] Tabla de usuarios registrados.
    - [ ] Modificar Roles (Admin/User).
    - [ ] Ban/Unban usuarios.

---

## Fase 8: Unificación UI/UX (Apple Design System) Post-Refinamiento
- [x] **8.1 Design Tokens & Global Styles**:
    - [x] Paleta: "Midnight Blue", Accent Colors, Gradientes.
    - [x] Tipografía: Inter/SF Pro, ajustes de tracking.
    - [x] Efectos: Glassmorphism 2.0, sombras difusas, bordes `3xl`.
- [/] **8.2 Librería de Componentes**:
    - [x] Botones (Primary, Glass, Ghost) con micro-interacciones.
    - [ ] Cards consistentes con hover effects.
    - [ ] Inputs & Forms estilizados (Pill shape).
    - [ ] Modales con animaciones Framer Motion.
- [ ] **8.3 Auditoría por Página**:
    - [ ] Dashboard (Layout, grids, carga secuencial).
    - [ ] Instrument List (Masonry, filtros).
    - [ ] Instrument Detail (Header inmersivo, Bento grids).
    - [ ] Admin & Settings (Listas estilizadas).
- [ ] **8.4 Micro-interacciones**:
    - [ ] View Transitions entre rutas.
    - [ ] Feedback háptico/visual (Confeti, Success states).
    - [ ] Skeletons animados "shimmer".
