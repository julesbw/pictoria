# Pictoria — Contexto del proyecto

## Resumen

Pictoria es una web app educativa tipo quiz para aprender sobre pinturas famosas. El usuario ve una obra, responde una pregunta de opción múltiple sobre artista, título o movimiento, recibe feedback educativo y puede guardar obras favoritas en una galería.

El proyecto está en fase MVP con integración incremental de Supabase. Usa
`localStorage` como fallback para idioma, favoritos y sesiones de quiz, y
sincroniza favoritos/sesiones con Supabase cuando hay variables de entorno y
Auth anónimo disponibles. Todavía no tiene login visible, IA, rankings ni
multijugador.

## Notas operativas para Codex

- Antes de trabajar, leer este archivo de contexto.
- Si Codex ejecuta `npm run dev`, debe matar el proceso antes de terminar su turno.
  Dejar el servidor de desarrollo vivo puede impedir que el usuario vea o levante
  correctamente la app desde su propio entorno.

## Stack actual

- Next.js con App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP
- Dataset local JSON
- Supabase para catálogo remoto, favoritos y sesiones cuando está configurado
- Auth anónimo de Supabase como identidad temporal
- Cloudinary para entrega remota de imágenes cuando está sincronizado
- Cache local de imágenes
- `localStorage` como fallback para favoritos, sesión del quiz e idioma

## Rutas principales

- `/`: home.
- `/quiz`: flujo principal del quiz.
- `/explore`: catálogo de obras con filtros.
- `/gallery`: favoritos locales.
- `/artists/[id]`: ficha de autor con imagen, contexto, fun fact y obras relacionadas.
- `/privacy`: aviso de privacidad.
- `/terms`: términos de uso.
- `/licenses`: notas de licencias y fuentes.
- `/api/artworks/[id]/image`: endpoint local para resolver imágenes cacheadas.

## Datos

El dataset principal vive en:

```txt
data/seed-artworks.json
```

Actualmente contiene 30 obras. Cada obra incluye:

- `id`
- `title`
- `artist_id`
- `movement_id`
- `year`
- `image_url`
- `wikimedia_file`
- `description`
- `museum`
- `source_image_url`
- `cloudinary_public_id`
- `cloudinary_url`
- `thumbnail_url`
- `blur_data_url`
- `width`
- `height`
- `aspect_ratio`
- `attribution`
- `license`
- `difficulty`
- `public_domain`
- `source`
- `artist`
- `movement`

Los tipos principales están en:

```txt
types/index.ts
```

## Idioma / localización

La app soporta por ahora dos idiomas:

- Español (`es`)
- Inglés (`en`)

La preferencia se elige desde un botón pequeño `ES / EN` en la página de inicio
y se persiste en `localStorage` bajo:

```txt
pictoria:language
```

El proveedor vive en:

```txt
components/language/LanguageProvider.tsx
```

El selector visual vive en:

```txt
components/language/LanguageToggle.tsx
```

Las traducciones y helpers de visualización viven en:

```txt
lib/localization.ts
```

Actualmente la localización no modifica el dataset fuente. En su lugar,
`lib/localization.ts` traduce en capa de presentación:

- títulos de obras
- descripciones manuales
- nombres de movimientos
- nacionalidades
- prompts y respuestas visibles del quiz
- copy principal de home/explore/gallery/navbar

La lógica del quiz sigue guardando y comparando respuestas con los valores
originales del dataset para evitar romper la sesión persistida. Los componentes
solo transforman el texto visible según el idioma activo.

## Catálogo, Supabase y Cloudinary

La app puede leer el catálogo desde Supabase mediante:

```txt
lib/artworks.ts
```

Si Supabase no está configurado o no devuelve datos, cae al dataset local
`data/seed-artworks.json`.

La integración de Supabase vive en:

```txt
lib/supabase/client.ts
lib/supabase/auth.ts
lib/supabase/url.ts
types/supabase.ts
supabase/migrations/
scripts/seed-supabase.mjs
```

La identidad remota actual usa Auth anónimo. No existe todavía UI de login o
cuentas.

Para preparar Supabase:

```bash
npm run seed:supabase
```

Las migraciones actuales son:

```txt
supabase/migrations/202605220001_initial_pictoria_schema.sql
supabase/migrations/202605240001_add_cloudinary_artwork_images.sql
```

Cloudinary está integrado para migrar y servir imágenes remotas. Los scripts
relevantes son:

```txt
scripts/migrate-artwork-images-to-cloudinary.mjs
lib/server/cloudinary.ts
```

Comandos:

```bash
npm run migrate:cloudinary
npm run sync:cloudinary
```

`migrate:cloudinary` sube imágenes locales y genera
`data/cloudinary-artwork-migration.json`. `sync:cloudinary` sincroniza ese
manifest con Supabase.

## Cache local de imágenes

La arquitectura local de imágenes conserva un fallback sin depender de
Cloudinary/Supabase:

```txt
Frontend
  ↓
GET /api/artworks/:id/image
  ↓
Backend local
  ↓
1. Buscar en data/artwork-image-cache.json
2. Si existe, redirigir a local_cached_url
3. Si no existe:
   a. Consultar Wikimedia API
   b. Obtener thumbnail y metadatos
   c. Descargar imagen
   d. Guardar en public/artworks/cache
   e. Guardar metadatos en data/artwork-image-cache.json
   f. Redirigir a local_cached_url
```

Archivos importantes:

```txt
app/api/artworks/[id]/image/route.ts
lib/server/artwork-image-cache.ts
data/artwork-image-cache.json
public/artworks/
public/artworks/cache/
scripts/cache-artwork-images.mjs
```

Comando para precachear imágenes:

```bash
npm run cache:images
```

En componentes visuales, `ArtworkImage` prioriza `thumbnail_url`,
`cloudinary_url` e `image_url` según disponibilidad.

## Quiz

La lógica principal vive en:

```txt
lib/quiz.ts
```

Actualmente existen cuatro modos de quiz:

- Clásico: se entra desde `/quiz`. Es el flujo principal de muerte súbita.
- Top 10: se entra desde `/quiz?mode=famous`. Es un reto de 10 preguntas de
  dificultad fácil; si el dataset no tiene 10 obras fáciles, completa con obras
  de dificultad media.
- Interesado: se entra desde `/quiz?mode=interested`. Es un reto de 10 preguntas
  de dificultad media.
- Amante del Arte: se entra desde `/quiz?mode=art-lover`. Es un reto de 10
  preguntas de dificultad alta; como el dataset actual tiene menos de 10 obras
  `hard`, completa con obras `medium` para mantener siempre 10 preguntas.

Garantías actuales:

- La respuesta correcta siempre está entre las opciones.
- Hay exactamente 4 opciones.
- No hay opciones duplicadas.
- El usuario no puede responder dos veces la misma pregunta.
- Cada pregunta tiene un límite de 10 segundos.
- Si se acaba el tiempo, cuenta como intento incorrecto.
- Una respuesta correcta muestra explicación y permite avanzar.
- Una respuesta correcta también muestra ficha breve con obra, autor y respuesta correcta.
- En el modo clásico, una respuesta incorrecta termina la partida.
- En los retos de 10 preguntas, una respuesta incorrecta no termina la partida;
  el usuario avanza hasta completar las 10 obras.
- La pantalla final del modo clásico muestra ronda alcanzada, respuesta elegida,
  respuesta correcta y score de racha (`N aciertos seguidos`), no un marcador
  `x/10`.
- La pantalla final del modo clásico permite abrir una tarjeta de resultado
  compartible con una pintura y el score de racha.
- La pantalla final de los retos de 10 preguntas muestra cuántas respuestas
  acertó el usuario y cuántas quedaron sin responder.
- La pantalla final de los retos de 10 preguntas permite abrir una tarjeta de resultado
  compartible con una pintura y el marcador. Al hacer clic en compartir, se
  elige una pintura aleatoria del reto, se genera el PNG y se abre grande en
  un modal. Desde ahí se puede descargar como PNG o usar el diálogo nativo de
  compartir del navegador/dispositivo.

La selección de obras para los retos de 10 preguntas vive en:

```txt
lib/quiz.ts
```

El flujo visual del resultado final vive en:

```txt
components/quiz/QuizFinalPanel.tsx
```

La exportación PNG de la tarjeta compartible también vive en:

```txt
components/quiz/QuizFinalPanel.tsx
```

Para generar la tarjeta, la imagen se carga con `fetch` como `Blob` y luego se
dibuja en canvas mediante un object URL. Esto evita fallos silenciosos de
`HTMLImageElement` al probar desde teléfono mediante túneles como Cloudflare.

Los botones de inicio y el selector modal de dificultad viven en:

```txt
components/home/HomeContent.tsx
```

En home se muestran dos CTAs principales: `Jugar Clásico` y `Jugar Quiz`.
`Jugar Quiz` abre una pantalla modal sobre el inicio con fondo oscuro/blur para
elegir dificultad: Top 10, Interesado o Amante del Arte.

Las opciones del modal permiten continuar una sesión activa del mismo modo si
existe en `localStorage`. Las sesiones se separan por modo, así que una sesión
de un reto no bloquea el quiz clásico ni los otros retos.

El botón `Jugar Clásico` cambia a `Reanudar` solo cuando hay una
sesión clásica activa con progreso real (`round > 0` o `score.total > 0`). Una
sesión recién creada en ronda 1, sin respuestas, no cuenta como reanudable.

La sesión del quiz se persiste en:

```txt
lib/quiz-session.ts
```

Se guarda en `localStorage` bajo llaves separadas por modo:

```txt
pictoria:quiz-session:classic
pictoria:quiz-session:famous-10
pictoria:quiz-session:interested-10
pictoria:quiz-session:art-lover-10
```

La llave anterior `pictoria:quiz-session` solo se conserva como migración suave
para sesiones persistidas antes de separar los modos.

Se persiste:

- modo de quiz
- ronda
- score, incluyendo correctas, total y no respondidas
- pregunta actual
- opciones
- respuesta correcta
- respuesta seleccionada
- timestamp de inicio de pregunta
- estado de tiempo agotado
- cola de obras para los retos de 10 preguntas
- estado de completado

## Utilidades de desarrollo

En `NODE_ENV=development`, la página `/quiz` muestra un botón `Dev: saltar 10`
en el encabezado. Ese botón crea una sesión completada con puntaje aleatorio
para probar rápidamente la pantalla final y la tarjeta de compartir resultado,
sin responder las 10 preguntas manualmente.

## Favoritos

Los favoritos se manejan en:

```txt
lib/favorites.ts
lib/use-favorites.ts
```

Se guardan en `localStorage` bajo:

```txt
pictoria:favorites
```

Si Supabase está configurado, se sincronizan con la tabla remota de favoritos.
Si falla Supabase, `localStorage` se mantiene como fuente funcional.

Garantías actuales:

- No se duplican.
- Se pueden agregar y quitar.
- El botón indica si una obra ya está guardada.
- Galería se sincroniza con eventos locales.

## Temas visuales

Los temas por movimiento artístico viven en:

```txt
lib/themes.ts
```

La estética de componentes debe seguir saliendo de ahí, no hardcodearse por componente.

El filler neutro para marcos de obra vive en:

```txt
app/globals.css
```

La clase `.artwork-frame` usa actualmente un gris sólido tipo `zinc-200`
para que las imágenes en modo completo no muestren cortes visuales raros.

Movimientos actuales:

- `impressionism`
- `post_impressionism`
- `surrealism`
- `cubism`
- `renaissance`
- `baroque`
- `modernism`

## Componentes relevantes

Layout:

```txt
components/layout/AppShell.tsx
components/layout/Navbar.tsx
components/layout/Footer.tsx
```

Idioma:

```txt
components/language/LanguageProvider.tsx
components/language/LanguageToggle.tsx
lib/localization.ts
```

Obras:

```txt
components/home/HomeContent.tsx
components/artist/ArtistPortrait.tsx
components/artist/ArtistProfileSummary.tsx
components/artwork/ArtworkCard.tsx
components/artwork/ArtworkDetailModal.tsx
components/artwork/ArtworkImage.tsx
components/artwork/FavoriteButton.tsx
```

Quiz:

```txt
components/quiz/QuizCard.tsx
components/quiz/AnswerOption.tsx
components/quiz/ResultPanel.tsx
components/quiz/GameOverPanel.tsx
components/quiz/ScorePanel.tsx
components/quiz/QuizFinalPanel.tsx
```

Temas:

```txt
components/themes/ThemeWrapper.tsx
```

## Decisiones importantes

- El nombre actual de la app es Pictoria.
- El brief original puede mencionar ArtGuess, pero la app ya fue renombrada.
- Supabase ya está conectado de forma incremental, con `localStorage` como fallback.
- Auth anónimo de Supabase se usa solo para sincronización; todavía no hay login visible.
- No agregar IA todavía.
- No agregar rankings ni multijugador todavía.
- Mantener el MVP modular para migrar después.
- Las imágenes deben servirse desde cache local/API o Cloudinary, no directamente desde Wikimedia en el frontend salvo fallbacks controlados.
- En tarjetas de obra, la imagen debe llenar el marco (`object-cover`).
- En modal/detalle de obra, la imagen debe verse completa (`object-contain`) con filler neutro.
- En Home, el hero usa 6 tarjetas destacadas aleatorias en un carrusel 3D
  controlado por wheel/trackpad con GSAP. No usa scroll vertical real ni pin:
  el gesto mueve el carrusel, pero la página no baja hacia espacio vacío.
  Las tarjetas no abren modal desde el hero.
- En Home, el selector de idioma vive junto al eyebrow del hero y cambia entre español e inglés.
- `ArtworkCard` conserva modal y hover por defecto para Explore/Gallery.
- `ArtworkCard`, `ArtworkDetailModal`, `ArtworkImage`, quiz, Explore, Gallery, Navbar y ficha de autor consumen `useLanguage`.
- Las traducciones actuales están en código dentro de `lib/localization.ts`; si el dataset crece mucho, conviene moverlas a campos localizados o archivos dedicados.
- El botón de autor en el modal de obra enlaza a `/artists/[id]`.
- Los perfiles extendidos de autor viven en `lib/artist-profiles.ts` y se mezclan con los autores embebidos del dataset desde `lib/artworks.ts`.
- La página de autor debe priorizar fotografía/retrato del autor, no obras del artista.
- `ArtistPortrait` usa retrato remoto si existe; si falla, cae a inicial, no a una pintura del dataset.
- El retrato de autor debe mostrarse en un marco estándar `aspect-[4/5]`, `max-w-sm`, con `object-contain` y fondo `zinc-200`; no debe crecer según el tamaño original de la imagen.
- Se corrigieron nombres de archivo de retratos que daban `404` en Wikimedia; todavía puede haber `429` por rate limit mientras se cargan directo desde Commons.
- En el modal de obra, la explicación de que el autor es clickeable vive abajo como bloque “Tip”.

## Notas de desarrollo local

- No correr `npm run build` mientras `npm run dev` está activo, porque ambos escriben en `.next` y pueden mezclarse artefactos, causando errores como `Cannot find module './276.js'`.
- Si `.next` queda corrupto durante desarrollo, usar:

```bash
npm run clean
npm run dev:clean
```

- Durante desarrollo, preferir `npx tsc --noEmit` para verificación rápida sin pisar el servidor dev.

## Verificación

Comando principal:

```bash
npm run build
```

Antes de correr build, detener el servidor dev si está activo.

Build actual esperado:

- `/`
- `/quiz`
- `/explore`
- `/gallery`
- `/artists/[id]`
- `/privacy`
- `/terms`
- `/licenses`
- `/api/artworks/[id]/image`

## Próximos pasos sugeridos

Prioridades sugeridas para siguientes iteraciones:

1. Mejorar la experiencia del home cuando hay una sesión activa. Ya muestra
   reanudar/continuar por modo, pero todavía podría ofrecer acciones explícitas
   como descartar o empezar de nuevo.
2. Pulir la tarjeta compartible con variantes visuales o selección automática de pintura según composición, contraste y legibilidad del marcador.
3. Ocultar o retirar el botón `Dev: saltar 10` antes de una demo pública,
   aunque actualmente solo aparece en `NODE_ENV=development`.
4. Agregar tests enfocados para `lib/quiz.ts` y `lib/quiz-session.ts`, porque ahí ya vive lógica de negocio importante: generación de opciones, modos de quiz, sesiones persistidas y estados finales.
5. Pulir persistencia del quiz con pruebas manuales fuertes.
6. Añadir índice/listado de autores.
7. Añadir detalle de obra con más metadatos.
8. Crear scripts de validación del dataset.
9. Validar el flujo remoto completo de Supabase con Auth anónimo, favoritos,
   sesiones y catálogo.
10. Completar o automatizar la migración de imágenes a Cloudinary/Supabase.
