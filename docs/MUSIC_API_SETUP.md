# Configuración de APIs de Música

Para usar la funcionalidad de importación de álbumes musicales, necesitas configurar las siguientes variables de entorno en tu archivo `.env.local`:

## Discogs API

1. Ve a https://www.discogs.com/settings/developers
2. Crea una nueva aplicación (o usa una existente)
3. Genera un "Personal Access Token"
4. Añade a `.env.local`:
```
DISCOGS_TOKEN=tu_token_aqui
```

## Spotify API

⚠️ **NOTA (Enero 2026)**: Spotify tiene temporalmente bloqueada la creación de nuevas aplicaciones mientras mejoran su seguridad. Esta integración quedará pendiente hasta que se reactive.

~~1. Ve a https://developer.spotify.com/dashboard~~
~~2. Crea una nueva aplicación~~
~~3. Copia el "Client ID" y "Client Secret"~~
~~4. Añade a `.env.local`:~~
```
# SPOTIFY_CLIENT_ID=tu_client_id_aqui (Pendiente)
# SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui (Pendiente)
```

## Notas

- **Discogs** es mejor para vinilos, CDs físicos y ediciones especiales
- **Spotify** proporciona portadas en alta resolución y datos de streaming
- Ambas APIs son gratuitas para uso personal con límites razonables de requests
- Si no configuras las APIs, la búsqueda simplemente no devolverá resultados de esa fuente

## Límites de Rate

- **Discogs**: 60 requests/minuto con autenticación
- **Spotify**: 10,000 requests/día aproximadamente

Una vez configuradas las variables, reinicia el servidor de desarrollo (`npm run dev`).
