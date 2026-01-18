# Vercel Deployment Checklist

## Pre-Deploy

### 1. Variables de Entorno Requeridas
Configura en Vercel Dashboard → Settings → Environment Variables:

```env
# Database (Required)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Auth (Required)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Redis (Recommended - for rate limiting)
REDIS_URL=rediss://default:password@your-db.upstash.io:6379

# AI (Optional)
GEMINI_API_KEY=your-api-key
```

### 2. Upstash Redis Setup
1. Crea cuenta en https://upstash.com
2. Crea database Redis (Regional, EU/US según tu audiencia)
3. Copia `REDIS_URL` (formato: `rediss://...`)
4. Añade a Vercel Environment Variables

Ver guía completa: `docs/UPSTASH_SETUP.md`

### 3. MongoDB Atlas
Asegúrate de:
- ✅ Whitelist IP `0.0.0.0/0` (para Vercel)
- ✅ Connection string usa `mongodb+srv://`
- ✅ Database user tiene permisos correctos

### 4. Build Verification
```bash
# Test build locally
npm run build

# Verify no errors
npm run start
```

## Deploy

### Opción 1: GitHub Integration (Recomendado)
1. Push a GitHub
2. Conecta repo en Vercel
3. Vercel auto-deploys en cada push a `main`

### Opción 2: Vercel CLI
```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Post-Deploy

### 1. Verificar Funcionalidad
- [ ] Landing page carga
- [ ] Login funciona
- [ ] Dashboard accesible
- [ ] Rate limiting activo (ver logs)

### 2. Verificar Redis
En Vercel → Deployment → Functions → Logs:
```
✓ Redis connected
```

Si ves "falling back to memory", revisa `REDIS_URL`

### 3. Performance
- [ ] Lighthouse score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s

### 4. Monitoring
Configura en Vercel:
- ✅ Analytics
- ✅ Speed Insights
- ✅ Error tracking

## Troubleshooting

### Build Fails
```bash
# Check logs
vercel logs

# Common fixes:
# 1. Missing env vars
# 2. TypeScript errors
# 3. Missing dependencies
```

### Runtime Errors
1. Check Function Logs en Vercel Dashboard
2. Verify env vars están en Production
3. Test MongoDB connection string

### Rate Limiting Not Working
1. Verify `REDIS_URL` en Environment Variables
2. Check Upstash Dashboard → Metrics
3. Verify TLS enabled (`rediss://`)

## Domains

### Custom Domain
1. Vercel Dashboard → Settings → Domains
2. Add domain
3. Update DNS records (Vercel provides instructions)
4. Update `NEXTAUTH_URL` to new domain

## Scaling

### Free Tier Limits
- 100 GB bandwidth/month
- 100 GB-hours serverless execution
- Unlimited deployments

### If you need more
- **Pro**: $20/month → 1TB bandwidth
- **Enterprise**: Custom pricing

## Security

### Environment Variables
- ✅ Never commit `.env.local`
- ✅ Use Vercel's encrypted storage
- ✅ Rotate secrets regularly

### Headers
Vercel auto-configures:
- ✅ HTTPS redirect
- ✅ Security headers
- ✅ CORS (if needed)

## Maintenance

### Updates
```bash
# Update dependencies
npm update

# Test locally
npm run build && npm run start

# Deploy
git push
```

### Monitoring
- Check Vercel Analytics weekly
- Review Upstash usage monthly
- Monitor MongoDB Atlas metrics

## Rollback

Si algo sale mal:
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → **Promote to Production**

Instant rollback, zero downtime.
