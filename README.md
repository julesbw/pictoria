# Pictoria

MVP local de una app educativa para aprender sobre pinturas famosas. El usuario
ve una obra, responde preguntas de opción múltiple sobre artista, título o
movimiento, recibe contexto breve y puede guardar favoritos en una galería local.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP
- Dataset local JSON
- Cache local de imágenes
- `localStorage` para idioma, favoritos y sesión del quiz

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Nota para trabajo asistido: si Codex ejecuta `npm run dev`, debe matar ese
proceso antes de terminar. No debe dejar el servidor de desarrollo corriendo,
porque puede bloquear el entorno del usuario.

## Scripts

```bash
npm run dev
npm run dev:clean
npm run build
npm run lint
npm run cache:images
npm run clean
```

Durante desarrollo, preferir `npx tsc --noEmit` para verificación rápida si el
servidor dev está activo. No correr `npm run build` mientras `npm run dev` está
activo, porque ambos escriben en `.next`.

## Rutas

- `/`: home con selector de idioma, entrada al quiz clásico, retos de 10 preguntas y catálogo.
- `/quiz`: quiz clásico de muerte súbita.
- `/quiz?mode=famous`: reto Top 10, 10 preguntas de dificultad fácil.
- `/quiz?mode=interested`: reto Interesado, 10 preguntas de dificultad media.
- `/quiz?mode=art-lover`: reto Amante del Arte, 10 preguntas de dificultad alta.
- `/explore`: catálogo de obras con filtros.
- `/gallery`: favoritos locales.
- `/artists/[id]`: ficha de artista con retrato, contexto y obras relacionadas.
- `/api/artworks/[id]/image`: endpoint local para resolver imágenes cacheadas.

## Idioma

La app soporta español e inglés. La preferencia se cambia desde el selector
`ES / EN` en home y se guarda en `localStorage` bajo `pictoria:language`.

Las traducciones visibles viven en `lib/localization.ts`. El dataset fuente se
mantiene con valores originales para no romper sesiones persistidas.

## Quiz

La lógica principal vive en `lib/quiz.ts` y la sesión en `lib/quiz-session.ts`.
La sesión se guarda en `localStorage` por modo: `pictoria:quiz-session:classic`,
`pictoria:quiz-session:famous-10`, `pictoria:quiz-session:interested-10` y
`pictoria:quiz-session:art-lover-10`. La llave anterior `pictoria:quiz-session`
solo se lee para migrar sesiones viejas.

Modo clásico:

- Se entra desde `/quiz`.
- El home muestra dos CTAs principales: `Jugar Clásico` y `Jugar Quiz`.
- `Jugar Clásico` cambia a `Reanudar` solo si hay una sesión clásica activa con
  progreso real; una sesión recién creada en ronda 1 sin respuestas no cuenta.
- Una respuesta incorrecta termina la partida.
- La pantalla final muestra ronda alcanzada, respuesta elegida, respuesta
  correcta y score de racha, por ejemplo `3 aciertos seguidos`.
- Permite generar una tarjeta compartible con el score de racha; este marcador
  no usa formato `x/10`.

Retos de 10 preguntas:

- Se eligen desde `Jugar Quiz`, que abre un modal sobre el home con fondo oscuro/blur.
- Top 10 se entra desde `/quiz?mode=famous` y usa dificultad fácil.
- Interesado se entra desde `/quiz?mode=interested` y usa dificultad media.
- Amante del Arte se entra desde `/quiz?mode=art-lover` y prioriza dificultad alta.
- Cada reto recorre 10 obras.
- Los errores no terminan la partida.
- Al final muestra cuántas respuestas acertaste.
- Permite generar una tarjeta compartible con una pintura aleatoria del reto.
- La tarjeta se abre grande en pantalla y se puede descargar como PNG o compartir
  con las opciones nativas del dispositivo.

Los botones de retos en home permiten continuar una sesión activa del mismo modo
y no se bloquean por sesiones clásicas ni por otros retos.

## Imágenes

El frontend usa `/api/artworks/:id/image` para resolver imágenes. En local, esa
ruta consulta `data/artwork-image-cache.json` y sirve imágenes desde
`public/artworks` o `public/artworks/cache`.

Si falta una imagen y la obra tiene `wikimedia_file`, la ruta consulta Wikimedia,
descarga un thumbnail, guarda el archivo localmente y actualiza el cache.

Para precachear el dataset:

```bash
npm run cache:images
```

La tarjeta compartible de los retos de 10 preguntas usa la ruta local `image_url` de la obra y la
carga como `Blob` antes de dibujarla en canvas. Esto evita fallos al probar desde
teléfono mediante túneles como Cloudflare.

## Favoritos

Los favoritos viven en `lib/favorites.ts` y se guardan en `localStorage` bajo
`pictoria:favorites`. No se duplican y la galería se sincroniza con eventos
locales.

## Utilidades de desarrollo

En `NODE_ENV=development`, `/quiz` muestra un botón `Dev: saltar 10`. Ese
botón crea una sesión de 10 preguntas completada con puntaje aleatorio para probar la
pantalla final y la tarjeta de compartir sin responder las 10 preguntas.

## Estado del MVP

Todavía no usa Supabase, autenticación, IA, rankings ni multijugador. El proyecto
está pensado para mantenerse modular y migrar después a backend/storage real.

Para contexto completo de decisiones, archivos importantes y próximos pasos, ver
`PROJECT_CONTEXT.md`.
