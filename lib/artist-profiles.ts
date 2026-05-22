import type { Artist } from "@/types";

type ArtistProfile = Pick<Artist, "bio" | "fun_fact" | "image_url">;

const commonsFile = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

export const artistProfiles: Record<string, ArtistProfile> = {
  "artist-van-gogh": {
    image_url: commonsFile("Vincent van Gogh - Self-Portrait - Google Art Project.jpg"),
    bio: "Pintor neerlandes que llevo el color y la pincelada a un terreno intensamente emocional. Su obra, poco reconocida en vida, fue decisiva para el postimpresionismo y para buena parte del arte moderno.",
    fun_fact: "En Arles preparo una habitacion para recibir a Gauguin y decoro la casa con sus famosos girasoles.",
  },
  "artist-da-vinci": {
    image_url: commonsFile("A portrait of Leonardo, edit.jpg"),
    bio: "Artista, inventor y observador incansable del Renacimiento italiano. Sus pinturas combinan investigacion cientifica, composicion refinada y una mirada psicologica poco comun para su epoca.",
    fun_fact: "Escribia muchas notas de derecha a izquierda, en una escritura especular que todavia intriga a lectores modernos.",
  },
  "artist-botticelli": {
    image_url: commonsFile("Sandro Botticelli 083.jpg"),
    bio: "Pintor florentino asociado al primer Renacimiento. Sus figuras lineales, ritmos elegantes y temas mitologicos conectan el arte con el humanismo de la Florencia medicea.",
    fun_fact: "La Birth of Venus fue pintada sobre lienzo, un soporte menos habitual que la tabla en la Florencia de su tiempo.",
  },
  "artist-dali": {
    image_url: commonsFile("Salvador Dalí 1939.jpg"),
    bio: "Figura central del surrealismo, famoso por su tecnica precisa aplicada a imagenes imposibles. Dalí convirtio el sueño, el deseo y la provocacion en parte de su lenguaje artistico.",
    fun_fact: "Su bigote fue una de sus marcas personales mas reconocibles y lo uso casi como una extension de su personaje publico.",
  },
  "artist-picasso": {
    image_url: commonsFile("Pablo picasso 1.jpg"),
    bio: "Artista español que transformo el arte del siglo XX. Paso por multiples estilos y, junto con Braque, impulso el cubismo como una nueva forma de representar el espacio.",
    fun_fact: "Su nombre completo era extraordinariamente largo; incluia una cadena de nombres familiares y religiosos.",
  },
  "artist-vermeer": {
    image_url: commonsFile("Johannes Vermeer - The Procuress - Google Art Project.jpg"),
    bio: "Pintor neerlandes del Siglo de Oro, recordado por escenas intimas, luz cuidadosamente construida y una calma casi cinematografica. Su produccion conocida es reducida, pero muy influyente.",
    fun_fact: "Se conservan poco mas de treinta pinturas atribuidas con seguridad a Vermeer.",
  },
  "artist-munch": {
    image_url: commonsFile("Edvard Munch 1921.jpg"),
    bio: "Pintor noruego vinculado al simbolismo y al expresionismo. Exploro ansiedad, deseo, enfermedad y soledad con una intensidad visual que anticipo el arte moderno.",
    fun_fact: "The Scream existe en varias versiones, incluyendo pintura, pastel y litografia.",
  },
  "artist-monet": {
    image_url: commonsFile("Claude Monet 1899 Nadar crop.jpg"),
    bio: "Pintor frances y figura clave del impresionismo. Estudio los cambios de luz y atmosfera en series de un mismo motivo, desde catedrales hasta nenufares.",
    fun_fact: "Su jardin en Giverny fue diseñado en parte como laboratorio visual para sus pinturas.",
  },
  "artist-velazquez": {
    image_url: commonsFile("Diego Velázquez Autorretrato 45 x 38 cm - Colección Real Academia de Bellas Artes de San Carlos - Museo de Bellas Artes de Valencia.jpg"),
    bio: "Pintor español del Barroco y artista de corte de Felipe IV. Sus composiciones mezclan naturalismo, inteligencia espacial y una reflexion sofisticada sobre mirar y ser mirado.",
    fun_fact: "En Las Meninas se pinto a si mismo trabajando dentro de la escena.",
  },
  "artist-rembrandt": {
    image_url: commonsFile("Rembrandt Harmensz. van Rijn - Self-Portrait - Google Art Project.jpg"),
    bio: "Maestro neerlandes del Barroco, famoso por sus retratos, escenas biblicas y uso dramatico de la luz. Sus autorretratos forman una especie de biografia visual.",
    fun_fact: "Se autorretrato durante decadas, dejando un registro extraordinario de su propio envejecimiento.",
  },
  "artist-klimt": {
    image_url: commonsFile("Klimt.jpg"),
    bio: "Pintor austriaco asociado a la Secesion de Viena. Su obra une simbolismo, ornamentacion, erotismo y superficies doradas de gran potencia decorativa.",
    fun_fact: "Su llamada etapa dorada estuvo influida por mosaicos bizantinos que vio en Ravena.",
  },
  "artist-delacroix": {
    image_url: commonsFile("Eugene delacroix.jpg"),
    bio: "Pintor frances del Romanticismo. Uso color, movimiento y drama historico para construir imagenes cargadas de energia politica y emocional.",
    fun_fact: "Sus diarios son una fuente importante para entender el pensamiento artistico del siglo XIX.",
  },
  "artist-hokusai": {
    image_url: commonsFile("Hokusai portrait.jpg"),
    bio: "Artista japones del periodo Edo, maestro del ukiyo-e. Sus grabados influyeron profundamente en artistas europeos del siglo XIX y en la cultura visual global.",
    fun_fact: "Cambio de nombre artistico muchas veces a lo largo de su carrera.",
  },
  "artist-raphael": {
    image_url: commonsFile("Raffaello Sanzio.jpg"),
    bio: "Pintor y arquitecto del Alto Renacimiento. Su obra fue admirada por la claridad compositiva, la gracia de las figuras y el equilibrio intelectual de sus escenas.",
    fun_fact: "Murio joven, a los 37 años, pero dejo una produccion enorme y un taller muy influyente.",
  },
  "artist-michelangelo": {
    image_url: commonsFile("Volterra - Portrait of Michelangelo.jpg"),
    bio: "Escultor, pintor, arquitecto y poeta del Renacimiento italiano. Su obra explora la energia del cuerpo humano y la tension entre materia, espiritu y forma.",
    fun_fact: "Se consideraba ante todo escultor, aunque algunas de sus pinturas son de las mas famosas del mundo.",
  },
  "artist-van-eyck": {
    image_url: commonsFile("Portrait of a Man in a Turban (Jan van Eyck).jpg"),
    bio: "Pintor flamenco del siglo XV, celebre por su precision optica y dominio del oleo. Sus obras muestran texturas, reflejos y detalles con una minuciosidad asombrosa.",
    fun_fact: "Su lema personal, Als ich can, aparece en algunas obras y significa aproximadamente Como puedo.",
  },
  "artist-turner": {
    image_url: commonsFile("Turner selfportrait.jpg"),
    bio: "Pintor britanico del Romanticismo, fascinado por luz, clima y fuerzas naturales. Sus escenas marinas y atmosfericas anticipan preocupaciones de la pintura moderna.",
    fun_fact: "Fue apodado el pintor de la luz por su manera de disolver formas en atmosfera.",
  },
  "artist-millais": {
    image_url: commonsFile("Portrait of John Everett Millais by William Holman Hunt.jpg"),
    bio: "Pintor britanico y cofundador de la Hermandad Prerrafaelita. Busco detalle intenso, color luminoso y una vuelta a la sinceridad visual anterior a Rafael.",
    fun_fact: "Ophelia se pinto con una precision botanica tan grande que aun se identifican muchas plantas representadas.",
  },
  "artist-fragonard": {
    image_url: commonsFile("Jean-Honoré Fragonard by Marguerite Gérard.jpg"),
    bio: "Pintor frances del Rococo, asociado a escenas galantes, movimiento ligero y una pincelada viva. Su obra captura el gusto aristocratico previo a la Revolucion francesa.",
    fun_fact: "The Swing se volvio una de las imagenes mas reconocibles del Rococo por su mezcla de juego, teatralidad y picardia.",
  },
  "artist-goya": {
    image_url: commonsFile("Self-portrait at 69 Years by Francisco de Goya.jpg"),
    bio: "Pintor y grabador español que transito del retrato cortesano a visiones oscuras de guerra, supersticion y violencia. Su obra abre caminos hacia la modernidad.",
    fun_fact: "Sus Pinturas negras fueron realizadas directamente sobre los muros de su casa.",
  },
  "artist-whistler": {
    image_url: commonsFile("Whistler - Self Portrait, c.1896, GLAHA 46329.jpg"),
    bio: "Artista estadounidense activo en Europa, defensor de la autonomia estetica del arte. Sus composiciones buscan armonia tonal, atmosfera y elegancia visual.",
    fun_fact: "Llamo a muchos cuadros arreglos o nocturnos, usando terminos musicales para hablar de pintura.",
  },
  "artist-constable": {
    image_url: commonsFile("John Constable by Daniel Gardner, 1796.JPG"),
    bio: "Pintor britanico de paisajes, atento al cielo, el clima y la vida rural. Su observacion directa influyo en la pintura al aire libre posterior.",
    fun_fact: "Hacia estudios de nubes con notas sobre hora, viento y condiciones atmosfericas.",
  },
  "artist-holbein": {
    image_url: commonsFile("Hans Holbein the Younger, self-portrait.jpg"),
    bio: "Pintor aleman-suizo del Renacimiento del norte, maestro del retrato cortesano. Sus imagenes combinan exactitud, simbolismo y una presencia psicologica sobria.",
    fun_fact: "The Ambassadors contiene una calavera anamorfica que solo se ve correctamente desde un angulo extremo.",
  },
  "artist-rousseau": {
    image_url: commonsFile("Douanier Rousseau.png"),
    bio: "Pintor frances autodidacta, famoso por escenas selvaticas de imaginacion densa y estilo ingenuo. Su obra fue admirada por varias vanguardias modernas.",
    fun_fact: "Nunca viajo a las selvas que pintaba; muchas imagenes nacieron de jardines botanicos, libros e imaginacion.",
  },
  "artist-seurat": {
    image_url: commonsFile("Georges Seurat 1888.jpg"),
    bio: "Pintor frances asociado al neoimpresionismo. Desarrolló una tecnica de puntos y pequeñas pinceladas de color basada en teorias opticas.",
    fun_fact: "A Sunday Afternoon on the Island of La Grande Jatte le tomo cerca de dos años de trabajo.",
  },
  "artist-bosch": {
    image_url: commonsFile("Hieronymus Bosch.jpg"),
    bio: "Pintor neerlandes conocido por visiones morales llenas de criaturas, simbolos y escenas fantasticas. Su imaginacion visual sigue siendo una de las mas enigmaticas del arte europeo.",
    fun_fact: "Muchos detalles de The Garden of Earthly Delights aun no tienen una interpretacion definitiva.",
  },
  "artist-sargent": {
    image_url: commonsFile("John Singer Sargent 1903.jpg"),
    bio: "Retratista estadounidense cosmopolita, famoso por su virtuosismo tecnico y elegancia social. Sus pinceladas parecen espontaneas, pero revelan gran control.",
    fun_fact: "Madame X causo escandalo en Paris por la pose y el tirante originalmente caido del vestido.",
  },
};
