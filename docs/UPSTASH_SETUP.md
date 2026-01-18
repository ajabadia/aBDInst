# Upstash Redis Setup for Vercel

## ¿Por qué Upstash?
- ✅ **Serverless**: Perfecto para Vercel
- ✅ **Gratis**: 10,000 comandos/día en plan gratuito
- ✅ **Global**: Edge locations para baja latencia
- ✅ **Zero Config**: Se integra automáticamente con Vercel

---

## Paso 1: Crear cuenta en Upstash

1. Ve a: https://upstash.com
2. Click en **"Sign Up"**
3. Usa tu cuenta de GitHub (recomendado) o email

---

## Paso 2: Crear base de datos Redis

1. En el dashboard de Upstash, click **"Create Database"**
2. Configuración:
   - **Name**: `instrument-collector-ratelimit` (o el nombre que prefieras)
   - **Type**: **Regional** (más barato y suficiente)
   - **Region**: Elige el más cercano a tus usuarios (ej: `eu-west-1` para Europa)
   - **Eviction**: `noeviction` (recomendado para rate limiting)
   - **TLS**: ✅ Habilitado (por defecto)

3. Click **"Create"**

---

## Paso 3: Obtener credenciales

Una vez creada la base de datos, verás:

### Opción A: REST API (Recomendado para Vercel Edge)
```
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXXXXXXXXXXXXXXXx
```

### Opción B: Redis URL (Compatible con ioredis)
```
REDIS_URL=rediss://default:YOUR_PASSWORD@your-db.upstash.io:6379
```

**Para este proyecto, usa la Opción B (Redis URL)** ya que tenemos `ioredis` configurado.

---

## Paso 4: Configurar variables de entorno

### Desarrollo Local (.env.local)
Crea o edita `.env.local`:
```env
REDIS_URL=rediss://default:YOUR_PASSWORD@your-db.upstash.io:6379
```

⚠️ **Importante**: Usa `rediss://` (con doble 's') para TLS/SSL

### Vercel (Producción)

#### Opción 1: Integración automática (Recomendado)
1. En Vercel Dashboard → Tu proyecto → **Settings** → **Integrations**
2. Busca **"Upstash"** y click **"Add Integration"**
3. Autoriza y selecciona tu base de datos
4. Vercel añadirá automáticamente las variables de entorno

#### Opción 2: Manual
1. En Vercel Dashboard → Tu proyecto → **Settings** → **Environment Variables**
2. Añade:
   - **Key**: `REDIS_URL`
   - **Value**: `rediss://default:YOUR_PASSWORD@your-db.upstash.io:6379`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

---

## Paso 5: Verificar configuración

### Local
```bash
npm run dev
```

Busca en consola:
```
✓ Redis connected
```

### Vercel
Después de hacer deploy:
1. Ve a **Deployments** → Tu último deploy → **Functions**
2. Click en cualquier función → **Logs**
3. Busca `✓ Redis connected`

---

## Monitoreo

### Dashboard de Upstash
- **Metrics**: Comandos ejecutados, latencia, errores
- **Data Browser**: Ver claves en tiempo real
- **Logs**: Historial de operaciones

### Ver rate limits activos
1. En Upstash Dashboard → Tu DB → **Data Browser**
2. Busca claves: `ratelimit:*`
3. Verás todas las entradas activas

---

## Costos

### Plan Gratuito (Forever Free)
- ✅ 10,000 comandos/día
- ✅ 256 MB de almacenamiento
- ✅ TLS incluido
- ✅ Suficiente para ~500-1000 usuarios activos/día

### Si necesitas más
- **Pay as you go**: $0.20 por 100k comandos adicionales
- **Pro**: $10/mes → 1M comandos/día

---

## Troubleshooting

### "Connection refused" o "ECONNREFUSED"
- ✅ Verifica que `REDIS_URL` tenga `rediss://` (doble 's')
- ✅ Verifica que la contraseña sea correcta
- ✅ Verifica que la región de Upstash sea accesible

### "TLS handshake failed"
```typescript
// En src/lib/redis.ts, asegúrate de tener:
redis = new Redis(redisUrl, {
    tls: {
        rejectUnauthorized: true
    }
});
```

### Rate limits no funcionan
1. Verifica en Upstash Dashboard → Metrics que hay actividad
2. Revisa logs de Vercel para errores de Redis
3. Si ves "falling back to memory", hay un problema de conexión

### Límite de comandos alcanzado
- Upstash te notificará por email
- La app automáticamente usará fallback in-memory
- Considera upgrade o optimizar uso

---

## Optimización para Vercel

### Edge Config (Opcional, para ultra-baja latencia)
Si necesitas latencia <10ms, considera:
1. Upstash Redis con **Global Database** (en vez de Regional)
2. O usa Vercel Edge Config para rate limiting simple

### Conexión persistente
El código actual (`src/lib/redis.ts`) ya está optimizado:
- ✅ Singleton pattern (reutiliza conexiones)
- ✅ Lazy connect (solo conecta cuando se necesita)
- ✅ Auto-retry con backoff

---

## Siguiente paso

Una vez configurado:
```bash
# Desarrollo local
npm run dev

# Deploy a Vercel
vercel --prod
```

¡Listo! Tu rate limiting ahora es global y funciona en todas las instancias de Vercel.
