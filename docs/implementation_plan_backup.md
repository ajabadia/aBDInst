# Plan de Implementación Completo: Instrument Collector 🎸☁️

Plan maestro consolidado con todas las fases de desarrollo del proyecto Instrument Collector.

---

## 📍 Estado Actual

### ✅ **Completado (Fase 1 & 2)**
- Sistema de autenticación con NextAuth
- Catálogo maestro de instrumentos
- Colecciones personales de usuarios
- PWA con instalación offline
- Sistema de préstamos
- Historial de mantenimiento
- **Galería BYOS - Fase 1**: Cloudinary configurado y funcional

### 🔄 **En Progreso (Galería BYOS - Fase 2)**
- ✅ Modelo de Usuario con `storageProvider`
- ✅ Sistema de encriptación de credenciales (AES-256-GCM)
- ✅ Proveedor Cloudinary implementado
- ✅ UI de configuración de almacenamiento (`/dashboard/settings/storage`)
- ❌ **Pendiente**: Implementar proveedores adicionales (Google Drive, Dropbox, Terabox)
- ❌ **Pendiente**: Componente de upload con drag & drop
- ❌ **Pendiente**: Galería con lightbox

---

## 🗺️ Roadmap Completo por Fases

### **FASE 2: Galería Personal BYOS (Multi-Provider)**
**Prioridad: ALTA** | **Estado: 60% Completado**

#### Objetivos
- Permitir que cada usuario configure su propio almacenamiento en la nube
- Soportar múltiples proveedores (Cloudinary, Google Drive, Dropbox, Terabox)
- Separación total: fotos de usuarios NUNCA mezcladas con catálogo oficial

#### Tareas Pendientes

##### 2.1 Proveedores de Almacenamiento
- [ ] **Google Drive Provider**
  - Implementar `GoogleDriveProvider` con OAuth2
  - Componente `GoogleDriveSetup.tsx` para configuración
  - Flujo de autorización OAuth
  - Upload/delete/getUrl con Google Drive API

- [ ] **Dropbox Provider**
  - Implementar `DropboxProvider` con OAuth2
  - Componente `DropboxSetup.tsx` para configuración
  - Flujo de autorización OAuth
  - Upload/delete/getUrl con Dropbox API

- [ ] **Terabox Provider**
  - Implementar `TeraboxProvider`
  - Componente `TeraboxSetup.tsx` para configuración
  - Upload/delete/getUrl con Terabox API

##### 2.2 UI de Upload y Galería
- [ ] **ImageUploader Component**
  - Drag & drop con `react-dropzone`
  - Preview antes de subir
  - Progress bar durante upload
  - Validación de tipos y tamaños
  - Mensaje si no hay storage configurado

- [ ] **Gallery Component**
  - Grid responsivo de imágenes
  - Lightbox para vista ampliada
  - Marcar foto como principal
  - Eliminar fotos con confirmación
  - Reorganizar orden de fotos

##### 2.3 Integración en Colección
- [ ] Modificar `UserCollection.ts` con campo `userImages`
- [ ] Actualizar página de detalle de colección
- [ ] API route `/api/upload/collection-images`
- [ ] Mostrar galería personal vs foto del catálogo

---

### **FASE 3: Funcionalidades Avanzadas**
**Prioridad: MEDIA-BAJA** | **Estado: 0% Completado**

#### 🏷️ Grupo 3.1: Etiquetas Personalizadas
**Prioridad: ALTA** | **Complejidad: Baja**

- [ ] Campo `tags: string[]` en `UserCollection`
- [ ] Input con autocomplete para tags
- [ ] Filtro por tags en Dashboard
- [ ] Modal de gestión de tags

#### 📊 Grupo 3.2: Dashboard de Analytics
**Prioridad: ALTA** | **Complejidad: Media**

- [ ] Función de cálculo de valor total
- [ ] Integrar Chart.js o Recharts
- [ ] Gráficos de distribución (tipo/marca/década)
- [ ] Timeline de evolución de valor
- [ ] Cards con métricas clave

#### 🔍 Grupo 3.3: Comparador de Instrumentos
**Prioridad: MEDIA** | **Complejidad: Media**

- [ ] Página `/compare` con selección múltiple
- [ ] Tabla comparativa de specs
- [ ] Resaltar diferencias clave
- [ ] URL shareable

#### 🌐 Grupo 3.4: Colaboración y Comunidad
**Prioridad: MEDIA** | **Complejidad: Alta**

- [ ] Wishlist con campo `isWishlist: boolean`
- [ ] Ruta pública `/users/[id]/wishlist`
- [ ] Schema `Comment` con moderación
- [ ] Sistema de seguir usuarios
- [ ] Feed de actividad
- [ ] Notificaciones básicas

#### 🔔 Grupo 3.5: Notificaciones y Recordatorios
**Prioridad: MEDIA** | **Complejidad: Media**

- [ ] Schema `Reminder` con fecha y tipo
- [ ] Cron jobs para verificación diaria
- [ ] Web Push API
- [ ] Email opcional (Resend/SendGrid)
- [ ] UI de gestión en Settings

#### 📅 Grupo 3.6: Mantenimiento Proactivo
**Prioridad: MEDIA** | **Complejidad: Baja**

- [ ] Extender `maintenanceHistory` con `nextDue`
- [ ] Checklist de estado de componentes
- [ ] Vista de calendario
- [ ] Integración con recordatorios

#### 📄 Grupo 3.7: Exportación Avanzada
**Prioridad: MEDIA** | **Complejidad: Media**

- [ ] PDF profesional con fotos (jsPDF/Puppeteer)
- [ ] Template de catálogo diseñado
- [ ] Exportación Excel/CSV (ExcelJS)
- [ ] Template específico para seguros

#### 🔌 Grupo 3.8: Integraciones Externas
**Prioridad: BAJA** | **Complejidad: Alta**

- [ ] Reverb API para precios de mercado
- [ ] eBay API como alternativa
- [ ] Alertas de precio para wishlist
- [ ] Auto-backup a Google Drive/Dropbox
- [ ] Sincronización con Discogs

#### 💰 Grupo 3.9: Gestión Financiera Avanzada
**Prioridad: BAJA** | **Complejidad: Media**

- [ ] Schema `Insurance` vinculado a items
- [ ] Cálculo automático de depreciación
- [ ] Generación de informes fiscales
- [ ] Alertas de vencimiento de pólizas

#### 🔐 Grupo 3.10: Verificación y Blockchain
**Prioridad: MUY BAJA** | **Complejidad: Muy Alta**

> [!IMPORTANT]
> Esta es la fase final mencionada por el usuario: **Certificador de posesión en blockchain**

- [ ] **Certificados de Autenticidad**
  - Upload y gestión de documentos
  - Almacenamiento seguro de PDFs/imágenes
  - Vinculación con items de colección

- [ ] **Investigación Blockchain**
  - Evaluar soluciones (Polygon, Ethereum L2, Solana)
  - Análisis de costos de gas
  - Selección de red óptima

- [ ] **Smart Contracts**
  - Contrato de registro de propiedad
  - Función de mint de certificado
  - Transferencia de propiedad
  - Historial inmutable

- [ ] **Integración con UI**
  - Botón "Certificar en Blockchain"
  - Modal de confirmación con costos
  - Conexión con wallet (MetaMask, WalletConnect)
  - Visualización de certificado blockchain

- [ ] **NFT Opcional**
  - Tokenización de certificados
  - Metadata IPFS
  - Marketplace integration (OpenSea)

---

### **FASE 7: Refinamiento y Optimización**
**Prioridad: ALTA** (Actual)

#### 🚀 Grupo 7.1: Dashboard Principal 2.0
- [ ] **Widgets Reordenables**: Implementar layout personalizable con `dnd-kit`.
- [ ] **Feed de Actividad**: Integrar `ActivityFeed.tsx` en el dashboard principal.
- [ ] **Quick Action Bar**: Botones de acceso rápido a acciones frecuentes (Monitorizar, Añadir, Escanear).

#### 🛠️ Grupo 7.2: Importador Masivo (Hardening)
- [ ] **Validación Robusta**: Mensajes de error específicos por celda usando Zod.
- [ ] **Modo Dry-Run**: Previsualización exacta antes de escribir en DB.
- [ ] **Rollback**: Capacidad de deshacer una importación por `batchId`.

#### 🖼️ Grupo 7.3: Galería UX/UI
- [ ] **Masonry Layout**: Grid dinámico para imágenes de distintas proporciones.
- [ ] **Optimización**: Low Quality Image Placeholders (LQIP) o Blurhash.
- [ ] **Lightbox Pro**: Zoom, gestos y presentación a pantalla completa.

#### ⚡ Grupo 7.4: Rendimiento y Database
- [ ] **Virtualización**: `react-window` para listas > 50 items.
- [ ] **Índices MongoDB**: Revisar y crear índices compuestos para filtros comunes.

#### 👥 Grupo 7.5: Gestión de Usuarios (Admin)
- [ ] **Admin Dashboard**: Nueva ruta `/admin/users`.
- [ ] **User Table**: Lista con búsqueda y filtros.
- [ ] **Actions**: Modificar roles y estado de bloqueo (Ban).

---

### **FASE 8: Unificación UI/UX (Apple Design System)**
**Prioridad: ALTA** (Post-Refinamiento)

#### 🎨 Grupo 8.1: Design Tokens & Global Styles
- [ ] **Paleta de Colores**:
    - Definir "Midnight Blue" para Dark Mode (`bg-slate-950` a `bg-[#0B0F19]`).
    - Definir Accent Colors estandarizados (System Blue, Green, Red).
    - Gradientes sutiles "Apple Style".
- [ ] **Tipografía**:
    - Implementar `Inter` o `SF Pro` (via `next/font`).
    - Ajustar letter-spacing y line-height global.
- [ ] **Efectos Visuales**:
    - **Glassmorphism 2.0**: `backdrop-blur-xl`, `bg-white/70`, bordes sutiles `white/10`.
    - **Sombras**: Sombras difusas y coloreadas (`shadow-lg`, `shadow-indigo-500/20`).
    - **Bordes**: Estandarizar `rounded-3xl` (contenedores) y `rounded-2xl` (items).

#### 🧩 Grupo 8.2: Librería de Componentes
- [ ] **Botones**:
    - Variantes: Primary (Gradient), Secondary (Glass), Ghost.
    - Estados: Hover (scale-105), Active (scale-95).
- [ ] **Cards**:
    - Transiciones de hover elevadas.
    - Estructura interna consistente (Icono - Título - Valor).
- [ ] **Inputs & Forms**:
    - Inputs "Pill shape" o "Rounded Rect".
    - Focus rings sutiles pero visibles.
- [ ] **Modales y Drawers**:
    - Animaciones de entrada/salida (Framer Motion).
    - Backdrop blurs.

#### 📑 Grupo 8.3: Auditoría por Página
- [ ] **Dashboard (`/dashboard`)**:
    - Ajustar espaciados grid.
    - Animaciones de carga secuenciales.
- [ ] **Instrument List (`/instruments`)**:
    - Mejorar tarjetas de instrumento (Masonry vs Grid).
    - Filtros colapsables o en Sidebar estético.
- [ ] **Instrument Detail (`/instruments/[id]`)**:
    - Header inmersivo con imagen de fondo borrosa.
    - Secciones "Bento Grid" para specs y finanzas.
- [ ] **Admin & Settings**:
    - Eliminar tablas genéricas, usar listas estilizadas.
    - Toggles estilo iOS.

#### ✨ Grupo 8.4: Micro-interacciones & Animaciones
- [ ] **View Transitions**: Transiciones suaves entre páginas.
- [ ] **Feedback Acciones**:
    - Confeti sutil al completar tareas grandes.
    - Vibración (Haptics) en móvil si disponible.
- [ ] **Loading States**: Skeletons animados con "shimmer" premium.
