# Pictoria / Museo Quiz — Brief técnico para Codex

## 1. Idea general

Construir una web app educativa y gamificada para aprender sobre pinturas famosas.  
La app muestra una pintura y el usuario debe adivinar información como:

- Nombre de la obra.
- Nombre del artista.
- Movimiento artístico.
- Año o periodo aproximado.
- Datos culturales o históricos de la pintura.

Después de responder, el usuario recibe una explicación breve sobre la obra.  
También puede guardar pinturas en una galería personal de favoritos.

La app debe tener una estética visual inspirada en movimientos artísticos o artistas. Por ejemplo:

- Impresionismo: colores pasteles, fondos suaves, pinceladas ligeras.
- Postimpresionismo / Van Gogh: colores intensos, remolinos, contraste azul/amarillo.
- Surrealismo / Dalí: elementos flotantes, fondos oníricos, formas extrañas.
- Cubismo / Picasso: formas geométricas, layouts angulares, bloques de color.
- Renacimiento: tonos sobrios, dorados, marcos clásicos y tipografía elegante.

El MVP debe priorizar que el juego funcione antes de agregar features avanzadas.

---

## 2. Objetivo del MVP

Crear una aplicación funcional donde el usuario pueda:

1. Ver una pintura aleatoria.
2. Responder una pregunta de opción múltiple.
3. Saber si su respuesta fue correcta o incorrecta.
4. Leer una explicación educativa de la obra.
5. Guardar la pintura en favoritos.
6. Ver su galería personal.
7. Ver cambios visuales básicos según el movimiento artístico.

---

## 3. Stack técnico sugerido

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend / BaaS

- Supabase
  - PostgreSQL
  - Auth
  - Row Level Security
  - Storage, opcional para imágenes propias

### Deploy

- Vercel para frontend.
- Supabase para base de datos, auth y storage.

---

## 4. Arquitectura general

```txt
Usuario
  ↓
Next.js App
  ↓
React Components
  ↓
Supabase Client / Server Actions / Route Handlers
  ↓
Supabase
  ├── Auth
  ├── PostgreSQL
  ├── Row Level Security
  └── Storage opcional
```

---

## 5. Módulos principales

### 5.1 Home

Ruta:

```txt
/
```

Debe mostrar:

- Nombre de la app.
- Breve descripción.
- Botón para jugar.
- Botón para explorar galería.
- Botón para iniciar sesión o ver perfil.

---

### 5.2 Quiz

Ruta:

```txt
/quiz
```

Debe mostrar:

- Imagen de la pintura.
- Pregunta actual.
- Cuatro opciones de respuesta.
- Botón o interacción para seleccionar respuesta.
- Feedback visual de correcto/incorrecto.
- Explicación educativa después de responder.
- Botón para guardar en favoritos.
- Botón para continuar a la siguiente pregunta.

Tipos de preguntas iniciales:

```txt
guess_artist
guess_artwork
guess_movement
```

---

### 5.3 Galería personal

Ruta:

```txt
/gallery
```

Debe mostrar:

- Obras favoritas del usuario.
- Tarjetas con imagen, título, artista y movimiento.
- Vista de detalle al hacer clic en una obra.
- Opción para quitar de favoritos.

---

### 5.4 Explorar obras

Ruta:

```txt
/explore
```

Debe mostrar:

- Lista de obras disponibles.
- Filtros básicos por artista, movimiento o dificultad.
- Tarjetas visuales.
- Opción para guardar en favoritos.

Esta ruta puede dejarse como secundaria si el MVP se quiere mantener pequeño.

---

### 5.5 Perfil / progreso

Ruta:

```txt
/profile
```

Debe mostrar:

- Total de intentos.
- Respuestas correctas.
- Porcentaje de aciertos.
- Racha actual.
- Movimientos más jugados.

Esta ruta puede agregarse después de tener quiz y favoritos funcionando.

---

## 6. Estructura de carpetas sugerida

```txt
artguess/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── quiz/
│   │   └── page.tsx
│   ├── gallery/
│   │   └── page.tsx
│   ├── explore/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   └── api/
│       ├── quiz/
│       │   └── route.ts
│       └── artworks/
│           └── route.ts
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── AppShell.tsx
│   ├── artwork/
│   │   ├── ArtworkCard.tsx
│   │   ├── ArtworkDetail.tsx
│   │   └── FavoriteButton.tsx
│   ├── quiz/
│   │   ├── QuizCard.tsx
│   │   ├── AnswerOption.tsx
│   │   ├── ResultPanel.tsx
│   │   └── QuizProgress.tsx
│   └── themes/
│       └── ThemeWrapper.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── quiz.ts
│   ├── artworks.ts
│   ├── themes.ts
│   └── utils.ts
│
├── data/
│   └── seed-artworks.json
│
├── scripts/
│   └── seed-artworks.ts
│
├── types/
│   └── index.ts
│
├── supabase/
│   ├── schema.sql
│   └── policies.sql
│
├── .env.local.example
├── package.json
└── README.md
```

---

## 7. Modelo de base de datos

### 7.1 Tabla `artists`

```sql
create table artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nationality text,
  birth_year int,
  death_year int,
  bio text,
  created_at timestamptz default now()
);
```

---

### 7.2 Tabla `movements`

```sql
create table movements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  theme_key text not null unique,
  created_at timestamptz default now()
);
```

Ejemplos de `theme_key`:

```txt
impressionism
post_impressionism
surrealism
cubism
renaissance
baroque
modernism
```

---

### 7.3 Tabla `artworks`

```sql
create table artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_id uuid references artists(id) on delete set null,
  movement_id uuid references movements(id) on delete set null,
  year text,
  image_url text not null,
  description text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  public_domain boolean default true,
  source text,
  created_at timestamptz default now()
);
```

---

### 7.4 Tabla `favorites`

```sql
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artwork_id uuid not null references artworks(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, artwork_id)
);
```

---

### 7.5 Tabla `quiz_attempts`

```sql
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  artwork_id uuid references artworks(id) on delete cascade,
  question_type text not null check (
    question_type in ('guess_artist', 'guess_artwork', 'guess_movement')
  ),
  user_answer text not null,
  correct_answer text not null,
  is_correct boolean not null,
  created_at timestamptz default now()
);
```

---

### 7.6 Vista opcional `user_progress`

Puede manejarse como vista o calcularse desde `quiz_attempts`.

```sql
create view user_progress as
select
  user_id,
  count(*) as total_attempts,
  count(*) filter (where is_correct = true) as correct_answers,
  round(
    100.0 * count(*) filter (where is_correct = true) / nullif(count(*), 0),
    2
  ) as accuracy_percentage
from quiz_attempts
group by user_id;
```

---

## 8. Políticas RLS sugeridas

Activar RLS en tablas con datos de usuario:

```sql
alter table favorites enable row level security;
alter table quiz_attempts enable row level security;
```

### Favorites

```sql
create policy "Users can view their own favorites"
on favorites for select
using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
on favorites for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
on favorites for delete
using (auth.uid() = user_id);
```

### Quiz attempts

```sql
create policy "Users can view their own quiz attempts"
on quiz_attempts for select
using (auth.uid() = user_id);

create policy "Users can insert their own quiz attempts"
on quiz_attempts for insert
with check (auth.uid() = user_id);
```

### Artworks, artists y movements

Para el MVP, estas tablas pueden ser públicas de solo lectura:

```sql
alter table artworks enable row level security;
alter table artists enable row level security;
alter table movements enable row level security;

create policy "Anyone can read artworks"
on artworks for select
using (true);

create policy "Anyone can read artists"
on artists for select
using (true);

create policy "Anyone can read movements"
on movements for select
using (true);
```

---

## 9. Tipos TypeScript sugeridos

```ts
export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType =
  | "guess_artist"
  | "guess_artwork"
  | "guess_movement";

export type MovementThemeKey =
  | "impressionism"
  | "post_impressionism"
  | "surrealism"
  | "cubism"
  | "renaissance"
  | "baroque"
  | "modernism";

export interface Artist {
  id: string;
  name: string;
  nationality?: string;
  birth_year?: number;
  death_year?: number;
  bio?: string;
}

export interface Movement {
  id: string;
  name: string;
  description?: string;
  theme_key: MovementThemeKey;
}

export interface Artwork {
  id: string;
  title: string;
  artist_id: string;
  movement_id: string;
  year?: string;
  image_url: string;
  description: string;
  difficulty: Difficulty;
  public_domain: boolean;
  source?: string;
  artist?: Artist;
  movement?: Movement;
}

export interface QuizQuestion {
  artwork: Artwork;
  question_type: QuestionType;
  prompt: string;
  options: string[];
  correct_answer: string;
}
```

---

## 10. Sistema de temas visuales

Crear archivo:

```txt
lib/themes.ts
```

Contenido base:

```ts
export const artThemes = {
  impressionism: {
    name: "Impresionismo",
    background: "bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-50",
    card: "bg-white/60 backdrop-blur-md rounded-3xl shadow-sm",
    accent: "text-rose-500",
    button: "bg-pink-300 hover:bg-pink-400 text-stone-900",
  },

  post_impressionism: {
    name: "Postimpresionismo",
    background: "bg-gradient-to-br from-blue-950 via-indigo-800 to-yellow-300",
    card: "bg-blue-950/70 border border-yellow-300 rounded-3xl shadow-xl",
    accent: "text-yellow-300",
    button: "bg-yellow-300 hover:bg-yellow-400 text-blue-950",
  },

  surrealism: {
    name: "Surrealismo",
    background: "bg-gradient-to-br from-purple-200 via-orange-100 to-sky-200",
    card: "bg-white/50 backdrop-blur-md rounded-[2rem] shadow-lg",
    accent: "text-purple-700",
    button: "bg-purple-400 hover:bg-purple-500 text-white",
  },

  cubism: {
    name: "Cubismo",
    background: "bg-gradient-to-br from-stone-200 via-orange-200 to-slate-300",
    card: "bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_#000]",
    accent: "text-orange-700",
    button: "bg-black text-white hover:bg-stone-800",
  },

  renaissance: {
    name: "Renacimiento",
    background: "bg-gradient-to-br from-amber-100 via-stone-100 to-yellow-200",
    card: "bg-white/80 border border-amber-700 rounded-2xl shadow-md",
    accent: "text-amber-800",
    button: "bg-amber-700 hover:bg-amber-800 text-white",
  },

  baroque: {
    name: "Barroco",
    background: "bg-gradient-to-br from-stone-950 via-red-950 to-amber-900",
    card: "bg-black/50 border border-amber-500 rounded-3xl shadow-xl",
    accent: "text-amber-300",
    button: "bg-amber-500 hover:bg-amber-600 text-black",
  },

  modernism: {
    name: "Modernismo",
    background: "bg-gradient-to-br from-slate-100 via-white to-zinc-200",
    card: "bg-white rounded-3xl shadow-sm border border-zinc-200",
    accent: "text-zinc-900",
    button: "bg-zinc-900 hover:bg-zinc-700 text-white",
  },
} as const;
```

---

## 11. Lógica del quiz

Crear archivo:

```txt
lib/quiz.ts
```

Funciones principales:

```ts
generateQuizQuestion(artwork, allArtworks, questionType)
```

Debe:

1. Recibir una obra.
2. Recibir todas las obras disponibles.
3. Elegir el tipo de pregunta.
4. Generar tres respuestas incorrectas.
5. Mezclar la respuesta correcta con las incorrectas.
6. Regresar un objeto `QuizQuestion`.

Tipos de pregunta:

### `guess_artist`

Prompt:

```txt
¿Quién pintó esta obra?
```

Respuesta correcta:

```txt
artwork.artist.name
```

Opciones incorrectas:

```txt
otros artistas
```

### `guess_artwork`

Prompt:

```txt
¿Cómo se llama esta pintura?
```

Respuesta correcta:

```txt
artwork.title
```

Opciones incorrectas:

```txt
otros títulos de obras
```

### `guess_movement`

Prompt:

```txt
¿A qué movimiento pertenece esta obra?
```

Respuesta correcta:

```txt
artwork.movement.name
```

Opciones incorrectas:

```txt
otros movimientos
```

---

## 12. Dataset inicial sugerido

Crear archivo:

```txt
data/seed-artworks.json
```

Incluir inicialmente 30 a 50 obras. Para empezar, pueden usarse obras de dominio público o imágenes provenientes de fuentes abiertas.

Campos por obra:

```json
{
  "title": "The Starry Night",
  "artist": "Vincent van Gogh",
  "movement": "Post-Impressionism",
  "theme_key": "post_impressionism",
  "year": "1889",
  "image_url": "URL_DE_IMAGEN",
  "description": "Breve explicación educativa de la obra.",
  "difficulty": "easy",
  "public_domain": true,
  "source": "Fuente de la imagen"
}
```

Obras sugeridas para MVP:

```txt
1. The Starry Night — Vincent van Gogh
2. Sunflowers — Vincent van Gogh
3. Mona Lisa — Leonardo da Vinci
4. The Last Supper — Leonardo da Vinci
5. The Birth of Venus — Sandro Botticelli
6. The Persistence of Memory — Salvador Dalí
7. Guernica — Pablo Picasso
8. Girl with a Pearl Earring — Johannes Vermeer
9. The Scream — Edvard Munch
10. Impression, Sunrise — Claude Monet
11. Water Lilies — Claude Monet
12. Las Meninas — Diego Velázquez
13. The Night Watch — Rembrandt
14. American Gothic — Grant Wood
15. The Kiss — Gustav Klimt
16. Liberty Leading the People — Eugène Delacroix
17. The Garden of Earthly Delights — Hieronymus Bosch
18. The School of Athens — Raphael
19. The Creation of Adam — Michelangelo
20. The Great Wave off Kanagawa — Hokusai
```

Nota: antes de publicar, verificar disponibilidad legal y fuente de cada imagen.

---

## 13. Variables de entorno

Crear:

```txt
.env.local.example
```

Con:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

No usar `SUPABASE_SERVICE_ROLE_KEY` en cliente. Solo en scripts o backend seguro.

---

## 14. Primeras tareas para Codex

### Tarea 1 — Crear proyecto

Crear una app con:

```bash
npx create-next-app@latest artguess --typescript --tailwind --eslint --app
```

Instalar dependencias:

```bash
npm install @supabase/supabase-js framer-motion clsx
```

---

### Tarea 2 — Crear estructura base

Crear carpetas:

```txt
components/
components/layout/
components/artwork/
components/quiz/
components/themes/
lib/
lib/supabase/
data/
scripts/
types/
supabase/
```

---

### Tarea 3 — Crear tipos

Crear:

```txt
types/index.ts
```

Con los tipos definidos en la sección 9.

---

### Tarea 4 — Crear temas visuales

Crear:

```txt
lib/themes.ts
```

Con los temas definidos en la sección 10.

---

### Tarea 5 — Crear componentes iniciales

Crear:

```txt
components/layout/Navbar.tsx
components/layout/AppShell.tsx
components/artwork/ArtworkCard.tsx
components/artwork/FavoriteButton.tsx
components/quiz/QuizCard.tsx
components/quiz/AnswerOption.tsx
components/quiz/ResultPanel.tsx
components/themes/ThemeWrapper.tsx
```

---

### Tarea 6 — Crear páginas

Crear o completar:

```txt
app/page.tsx
app/quiz/page.tsx
app/gallery/page.tsx
app/explore/page.tsx
```

---

### Tarea 7 — Crear dataset temporal local

Antes de conectar Supabase, usar un archivo local:

```txt
data/seed-artworks.json
```

Con mínimo 10 obras para probar el flujo.

---

### Tarea 8 — Crear lógica de quiz local

Crear:

```txt
lib/quiz.ts
```

Debe generar pregunta, opciones y respuesta correcta a partir del dataset local.

---

### Tarea 9 — Integrar Supabase

Crear:

```txt
lib/supabase/client.ts
lib/supabase/server.ts
```

Después conectar:

- Obtener obras.
- Guardar favoritos.
- Leer galería del usuario.
- Guardar intentos.

---

### Tarea 10 — Crear SQL de Supabase

Crear:

```txt
supabase/schema.sql
supabase/policies.sql
```

Con las tablas y políticas descritas.

---

## 15. Orden recomendado de desarrollo

No empezar por login ni Supabase si todavía no existe la experiencia central.

Orden ideal:

```txt
1. UI local con dataset falso.
2. Quiz funcional local.
3. Sistema de temas visuales.
4. Galería local temporal.
5. Conexión a Supabase.
6. Auth.
7. Favoritos persistentes.
8. Intentos persistentes.
9. Perfil/progreso.
10. Mejoras visuales y animaciones.
```

---

## 16. Criterios de aceptación del MVP

El MVP estará listo cuando:

- El usuario pueda iniciar un quiz.
- La app muestre una obra.
- El usuario pueda elegir entre 4 opciones.
- La app indique correcto/incorrecto.
- La app muestre una explicación educativa.
- La interfaz cambie según el movimiento artístico.
- El usuario pueda guardar una obra como favorita.
- El usuario pueda ver sus favoritos en una galería.
- La app tenga una estructura clara y mantenible.
- El proyecto pueda desplegarse en Vercel.

---

## 17. Prompt inicial para Codex

Usa este prompt para empezar:

```txt
Quiero construir una web app llamada ArtGuess, un juego educativo para aprender sobre pinturas famosas.

Stack:
- Next.js con App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase después, pero primero quiero que funcione localmente con un JSON.

Objetivo:
Crear un MVP donde el usuario vea una pintura, responda una pregunta de opción múltiple sobre el artista, título o movimiento artístico, reciba feedback de correcto/incorrecto, vea una explicación educativa y pueda guardar obras favoritas en una galería local temporal.

Primera fase:
1. Crea la estructura de carpetas recomendada.
2. Crea tipos TypeScript para Artist, Movement, Artwork y QuizQuestion.
3. Crea un archivo data/seed-artworks.json con 10 obras de prueba.
4. Crea lib/quiz.ts para generar preguntas con 4 opciones.
5. Crea lib/themes.ts con temas visuales por movimiento artístico.
6. Crea componentes reutilizables: AppShell, Navbar, ArtworkCard, QuizCard, AnswerOption, ResultPanel, FavoriteButton y ThemeWrapper.
7. Crea las páginas /, /quiz, /gallery y /explore.
8. Por ahora guarda favoritos en localStorage.
9. Usa Tailwind para que el diseño sea limpio, moderno y visualmente artístico.
10. Usa Framer Motion para transiciones suaves.

No conectes Supabase todavía. Primero quiero una demo funcional local.
```

---

## 18. Notas importantes

- Mantener el MVP simple.
- No agregar IA todavía.
- No agregar rankings todavía.
- No agregar multijugador.
- Priorizar la experiencia principal del quiz.
- La estética por movimiento artístico debe ser modular, no hardcodeada en cada componente.
- Evitar imágenes con derechos problemáticos para producción.
- Para pruebas locales pueden usarse URLs temporales, pero antes de deploy deben revisarse fuentes y permisos.
