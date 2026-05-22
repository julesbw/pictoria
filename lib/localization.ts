import type { Artwork, MovementThemeKey, QuestionType } from "@/types";

export type Language = "es" | "en";

export const defaultLanguage: Language = "es";

export const languageLabels: Record<Language, string> = {
  es: "ES",
  en: "EN",
};

const artworkTitlesEs: Record<string, string> = {
  "artwork-starry-night": "La noche estrellada",
  "artwork-sunflowers": "Los girasoles",
  "artwork-mona-lisa": "Mona Lisa",
  "artwork-birth-of-venus": "El nacimiento de Venus",
  "artwork-persistence-memory": "La persistencia de la memoria",
  "artwork-guernica": "Guernica",
  "artwork-girl-pearl": "La joven de la perla",
  "artwork-the-scream": "El grito",
  "artwork-impression-sunrise": "Impresión, sol naciente",
  "artwork-water-lilies": "Nenúfares",
  "artwork-las-meninas": "Las Meninas",
  "artwork-night-watch": "La ronda de noche",
  "artwork-the-kiss": "El beso",
  "artwork-liberty-leading": "La Libertad guiando al pueblo",
  "artwork-great-wave": "La gran ola de Kanagawa",
  "artwork-school-athens": "La escuela de Atenas",
  "artwork-creation-adam": "La creación de Adán",
  "artwork-arnolfini": "Retrato Arnolfini",
  "artwork-fighting-temeraire": "El Temerario remolcado a su último atraque",
  "artwork-ophelia": "Ofelia",
  "artwork-the-swing": "El columpio",
  "artwork-third-may": "El tres de mayo de 1808",
  "artwork-whistlers-mother": "La madre de Whistler",
  "artwork-hay-wain": "El carro de heno",
  "artwork-ambassadors": "Los embajadores",
  "artwork-sleeping-gypsy": "La gitana dormida",
  "artwork-sunday-afternoon": "Tarde de domingo en la isla de la Grande Jatte",
  "artwork-milkmaid": "La lechera",
  "artwork-garden-delights": "El jardín de las delicias",
  "artwork-madame-x": "Madame X",
};

const artworkDescriptionsEn: Record<string, string> = {
  "artwork-starry-night": "Van Gogh painted this turbulent sky during his stay in Saint-Remy. The work turns the night landscape into an emotional experience, with swirls of color and light that seem to move.",
  "artwork-sunflowers": "The sunflower series captures Van Gogh's interest in color as an expressive language. Its intense yellows suggest energy, hospitality, and an almost physical vitality.",
  "artwork-mona-lisa": "Lisa Gherardini's enigmatic expression, the sfumato technique, and the deep landscape make this painting an emblem of Renaissance portraiture and psychological observation.",
  "artwork-birth-of-venus": "Botticelli depicts the mythical birth of Venus with elegant lines and idealized beauty. The work connects classical mythology with Florentine humanist culture.",
  "artwork-persistence-memory": "Dali's soft watches turn time into flexible matter. The scene combines precise technique with dream logic, a hallmark of Surrealism.",
  "artwork-guernica": "Picasso painted Guernica in response to the bombing of the Basque town. Its fragmented, monochrome composition turns civilian suffering into a universal visual protest.",
  "artwork-girl-pearl": "More than a formal portrait, this Vermeer tronie studies light, gesture, and presence. The earring acts as a luminous focus within an intimate composition.",
  "artwork-the-scream": "Munch condenses modern anxiety into a figure that seems to vibrate with the landscape. The red sky and undulating lines make an extreme emotion visible.",
  "artwork-impression-sunrise": "This painting gave Impressionism its name. Monet privileges the luminous sensation of the harbor over academic detail, using quick brushstrokes and shifting atmosphere.",
  "artwork-water-lilies": "In his water lilies, Monet turns the garden into a field of color and reflections. The water's surface dissolves boundaries between sky, light, and vegetation.",
  "artwork-las-meninas": "Velazquez builds a court scene full of crossed gazes. The painting plays with the positions of viewer, painter, and royal family, turning portraiture into a reflection on representation.",
  "artwork-night-watch": "Rembrandt transforms a group portrait into a dramatic scene of movement, light, and hierarchy. The composition seems to catch the militia just before it sets out.",
  "artwork-the-kiss": "Klimt combines golden ornament, decorative planes, and an intimate scene. The work belongs to his golden period and joins eroticism, symbolism, and ornamental design.",
  "artwork-liberty-leading": "Delacroix personifies liberty as a figure leading the people through smoke, bodies, and flags. The painting blends recent history, political allegory, and Romantic energy.",
  "artwork-great-wave": "Hokusai depicts a monumental wave threatening small boats beneath Mount Fuji. The print shows the force of nature and the graphic precision of ukiyo-e.",
  "artwork-school-athens": "Raphael gathers classical philosophers inside an ideal architecture. Perspective, balance, and intellectual references summarize the humanist ambition of the Renaissance.",
  "artwork-creation-adam": "Michelangelo condenses the biblical story into the near contact of two fingers. The tension of the gesture turns creation into an image of energy, body, and spirit.",
  "artwork-arnolfini": "Van Eyck uses meticulous detail, domestic symbols, and a convex mirror to build a scene loaded with meaning. It is a key work of early Flemish oil painting.",
  "artwork-fighting-temeraire": "Turner shows an old warship being towed toward dismantling. The sunset turns the industrial episode into a meditation on memory, progress, and loss.",
  "artwork-ophelia": "Millais depicts Ophelia surrounded by detailed vegetation and still water. Botanical beauty contrasts with the literary tragedy taken from Shakespeare.",
  "artwork-the-swing": "Fragonard creates a Rococo scene of play, desire, and theatricality. The motion of the swing, pink tones, and vegetation reinforce the image's light, secretive character.",
  "artwork-third-may": "Goya denounces wartime violence through a nocturnal execution scene. The light illuminates the central victim and turns the painting into a direct moral accusation.",
  "artwork-whistlers-mother": "Whistler organizes his mother's portrait through austerity, profile, and tonal harmony. The work moves between family image and formal experiment in composition.",
  "artwork-hay-wain": "Constable paints an English rural landscape with attention to sky, water, and daily life. The scene feels calm while also constructing a cultural idea of the countryside.",
  "artwork-ambassadors": "Holbein combines portraiture, scientific objects, and an anamorphic skull. The painting celebrates knowledge and status while also recalling the fragility of life.",
  "artwork-sleeping-gypsy": "Rousseau imagines a strange, silent night scene: a sleeping figure, a curious lion, and a desert landscape. His naive style creates an almost surreal atmosphere.",
  "artwork-sunday-afternoon": "Seurat builds the scene with carefully ordered points of color. Pointillism turns modern leisure into an almost scientific composition of light and perception.",
  "artwork-milkmaid": "Vermeer transforms a domestic task into a scene of luminous concentration. Side light, bread, and pitcher give quiet monumentality to the everyday.",
  "artwork-garden-delights": "Bosch unfolds a triptych filled with creatures, pleasures, and punishments. The work combines fantastic imagination, religious morality, and a visual density that rewards close looking.",
  "artwork-madame-x": "Sargent portrays Virginie Gautreau with severe, theatrical elegance. The pose, the contrast between black dress and pale skin, caused scandal and fascination in Paris at the time.",
};

const movementNames: Record<MovementThemeKey, Record<Language, string>> = {
  impressionism: { es: "Impresionismo", en: "Impressionism" },
  post_impressionism: { es: "Postimpresionismo", en: "Post-Impressionism" },
  surrealism: { es: "Surrealismo", en: "Surrealism" },
  cubism: { es: "Cubismo", en: "Cubism" },
  renaissance: { es: "Renacimiento", en: "Renaissance" },
  baroque: { es: "Barroco", en: "Baroque" },
  modernism: { es: "Modernismo", en: "Modernism" },
};

const nationalities: Record<string, Record<Language, string>> = {
  Dutch: { es: "Neerlandés", en: "Dutch" },
  Italian: { es: "Italiano", en: "Italian" },
  Spanish: { es: "Español", en: "Spanish" },
  Norwegian: { es: "Noruego", en: "Norwegian" },
  French: { es: "Francés", en: "French" },
  Austrian: { es: "Austriaco", en: "Austrian" },
  Japanese: { es: "Japonés", en: "Japanese" },
  Flemish: { es: "Flamenco", en: "Flemish" },
  British: { es: "Británico", en: "British" },
  American: { es: "Estadounidense", en: "American" },
  "German-Swiss": { es: "Alemán-suizo", en: "German-Swiss" },
};

const questionPrompts: Record<QuestionType, Record<Language, string>> = {
  guess_artist: {
    es: "¿Quién pintó esta obra?",
    en: "Who painted this artwork?",
  },
  guess_artwork: {
    es: "¿Cómo se llama esta pintura?",
    en: "What is this painting called?",
  },
  guess_movement: {
    es: "¿A qué movimiento pertenece esta obra?",
    en: "Which movement does this artwork belong to?",
  },
};

const artworkIdsByEnglishTitle = new Map<string, string>([
  ["The Starry Night", "artwork-starry-night"],
  ["Sunflowers", "artwork-sunflowers"],
  ["Mona Lisa", "artwork-mona-lisa"],
  ["The Birth of Venus", "artwork-birth-of-venus"],
  ["The Persistence of Memory", "artwork-persistence-memory"],
  ["Guernica", "artwork-guernica"],
  ["Girl with a Pearl Earring", "artwork-girl-pearl"],
  ["The Scream", "artwork-the-scream"],
  ["Impression, Sunrise", "artwork-impression-sunrise"],
  ["Water Lilies", "artwork-water-lilies"],
  ["Las Meninas", "artwork-las-meninas"],
  ["The Night Watch", "artwork-night-watch"],
  ["The Kiss", "artwork-the-kiss"],
  ["Liberty Leading the People", "artwork-liberty-leading"],
  ["The Great Wave off Kanagawa", "artwork-great-wave"],
  ["The School of Athens", "artwork-school-athens"],
  ["The Creation of Adam", "artwork-creation-adam"],
  ["Arnolfini Portrait", "artwork-arnolfini"],
  ["The Fighting Temeraire", "artwork-fighting-temeraire"],
  ["Ophelia", "artwork-ophelia"],
  ["The Swing", "artwork-the-swing"],
  ["The Third of May 1808", "artwork-third-may"],
  ["Whistler's Mother", "artwork-whistlers-mother"],
  ["The Hay Wain", "artwork-hay-wain"],
  ["The Ambassadors", "artwork-ambassadors"],
  ["The Sleeping Gypsy", "artwork-sleeping-gypsy"],
  ["A Sunday Afternoon on the Island of La Grande Jatte", "artwork-sunday-afternoon"],
  ["The Milkmaid", "artwork-milkmaid"],
  ["The Garden of Earthly Delights", "artwork-garden-delights"],
  ["Madame X", "artwork-madame-x"],
]);

export function getLocalizedArtworkTitle(artwork: Artwork, language: Language) {
  if (language === "en") return artwork.title;
  return artworkTitlesEs[artwork.id] ?? artwork.title;
}

export function getLocalizedArtworkDescription(artwork: Artwork, language: Language) {
  if (language === "es") return artwork.description;
  return artworkDescriptionsEn[artwork.id] ?? artwork.description;
}

export function getLocalizedMovementName(
  themeKey: MovementThemeKey | undefined,
  fallback: string | undefined,
  language: Language,
) {
  return themeKey ? movementNames[themeKey]?.[language] ?? fallback : fallback;
}

export function getLocalizedNationality(
  nationality: string | undefined,
  language: Language,
) {
  if (!nationality) return undefined;
  return nationalities[nationality]?.[language] ?? nationality;
}

export function getLocalizedQuestionPrompt(questionType: QuestionType, language: Language) {
  return questionPrompts[questionType][language];
}

export function getLocalizedQuizAnswer(
  questionType: QuestionType,
  rawAnswer: string,
  language: Language,
) {
  if (language === "en" || questionType === "guess_artist") return rawAnswer;

  if (questionType === "guess_movement") {
    const movement = Object.values(movementNames).find((names) => names.en === rawAnswer);
    return movement?.es ?? rawAnswer;
  }

  const artworkId = artworkIdsByEnglishTitle.get(rawAnswer);
  return artworkId ? artworkTitlesEs[artworkId] : rawAnswer;
}
