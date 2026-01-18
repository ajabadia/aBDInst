# Redis Quick Start

## Situación Actual
Docker Desktop no está corriendo. Tienes 3 opciones:

## Opción 1: Usar Docker (Recomendado)

### Paso 1: Iniciar Docker Desktop
1. Abre Docker Desktop desde el menú de inicio
2. Espera a que el ícono de Docker en la bandeja del sistema esté verde

### Paso 2: Ejecutar script automático
```bash
# Desde PowerShell en la raíz del proyecto
.\scripts\setup-redis.bat
```

O manualmente:
```bash
docker run -d --name redis-ratelimit -p 6379:6379 redis:alpine
```

### Paso 3: Configurar .env.local
Añade esta línea a tu archivo `.env.local`:
```env
REDIS_URL=redis://localhost:6379
```

### Paso 4: Reiniciar app
```bash
npm run dev
```

Deberías ver en consola: `✓ Redis connected`

---

## Opción 2: WSL2 + Redis (Sin Docker Desktop)

### Instalar en WSL2
```bash
# Abrir WSL2
wsl

# Instalar Redis
sudo apt-get update
sudo apt-get install redis-server

# Iniciar Redis
sudo service redis-server start

# Verificar
redis-cli ping
# Debe responder: PONG
```

### Configurar .env.local
```env
REDIS_URL=redis://localhost:6379
```

---

## Opción 3: Continuar sin Redis (Desarrollo Rápido)

**No hagas nada.** La aplicación funcionará perfectamente usando el fallback in-memory.

### Ventajas
- ✅ Cero configuración
- ✅ Funciona inmediatamente
- ✅ Perfecto para desarrollo local

### Limitaciones
- ⚠️ Rate limits se resetean al reiniciar la app
- ⚠️ No funciona en multi-instancia (pero no lo necesitas en desarrollo)

---

## Verificación

### Con Redis
```bash
# Verificar que Redis está corriendo
docker ps | findstr redis
# O en WSL: redis-cli ping

# Ver logs de tu app
npm run dev
# Busca: "✓ Redis connected"
```

### Sin Redis
```bash
# Ver logs de tu app
npm run dev
# Busca: "falling back to memory" (es normal y esperado)
```

---

## Comandos Útiles

### Docker
```bash
# Ver estado
docker ps | findstr redis

# Detener
docker stop redis-ratelimit

# Iniciar de nuevo
docker start redis-ratelimit

# Eliminar
docker rm -f redis-ratelimit

# Ver logs
docker logs redis-ratelimit
```

### WSL2
```bash
# Estado del servicio
sudo service redis-server status

# Detener
sudo service redis-server stop

# Iniciar
sudo service redis-server start

# Conectar a CLI
redis-cli
```

---

## Troubleshooting

### "Docker daemon is not running"
→ Inicia Docker Desktop y espera a que esté listo

### "Port 6379 already in use"
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :6379

# Detener el contenedor existente
docker stop redis-ratelimit
docker rm redis-ratelimit
```

### "Connection refused" en la app
1. Verifica que Redis está corriendo: `docker ps`
2. Verifica `REDIS_URL` en `.env.local`
3. Reinicia la app: `npm run dev`

### La app funciona pero no veo "Redis connected"
→ Esto es normal si no configuraste Redis. La app usa fallback in-memory automáticamente.

---

## ¿Qué opción elegir?

- **Desarrollo local solo**: Opción 3 (sin Redis) está bien
- **Simular producción**: Opción 1 (Docker)
- **Sin Docker Desktop**: Opción 2 (WSL2)
