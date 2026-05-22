import type { Artwork, Difficulty, QuestionType, QuizQuestion } from "@/types";

export const famousQuizArtworkIds = [
  "artwork-mona-lisa",
  "artwork-starry-night",
  "artwork-the-scream",
  "artwork-girl-pearl",
  "artwork-birth-of-venus",
  "artwork-persistence-memory",
  "artwork-guernica",
  "artwork-great-wave",
  "artwork-creation-adam",
  "artwork-the-kiss",
];

const quizDifficultyPriority: Record<Difficulty, Difficulty[]> = {
  easy: ["easy", "medium", "hard"],
  medium: ["medium", "easy", "hard"],
  hard: ["hard", "medium", "easy"],
};

const questionTypes: QuestionType[] = [
  "guess_artist",
  "guess_artwork",
  "guess_movement",
];

export function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export function selectRandomArtwork(artworks: Artwork[]) {
  if (artworks.length === 0) {
    throw new Error("Cannot select an artwork from an empty dataset.");
  }

  return artworks[Math.floor(Math.random() * artworks.length)];
}

export function selectRandomQuestionType() {
  return questionTypes[Math.floor(Math.random() * questionTypes.length)];
}

function uniqueOptions(values: string[], correctAnswer: string) {
  return Array.from(new Set(values.map((value) => value.trim())))
    .filter((value) => value.length > 0 && value !== correctAnswer);
}

function getQuestionConfig(artwork: Artwork, allArtworks: Artwork[], questionType: QuestionType) {
  if (questionType === "guess_artist") {
    const correctAnswer = artwork.artist?.name ?? "Artista desconocido";
    return {
      prompt: "¿Quién pintó esta obra?",
      correctAnswer,
      distractors: uniqueOptions(
        shuffle(allArtworks.map((candidate) => candidate.artist?.name ?? "")),
        correctAnswer,
      ),
    };
  }

  if (questionType === "guess_artwork") {
    const correctAnswer = artwork.title;
    return {
      prompt: "¿Cómo se llama esta pintura?",
      correctAnswer,
      distractors: uniqueOptions(
        shuffle(allArtworks.map((candidate) => candidate.title)),
        correctAnswer,
      ),
    };
  }

  const correctAnswer = artwork.movement?.name ?? "Movimiento desconocido";
  return {
    prompt: "¿A qué movimiento pertenece esta obra?",
    correctAnswer,
    distractors: uniqueOptions(
      shuffle(allArtworks.map((candidate) => candidate.movement?.name ?? "")),
      correctAnswer,
    ),
  };
}

export function generateQuizQuestion(
  artwork: Artwork,
  allArtworks: Artwork[],
  questionType: QuestionType = selectRandomQuestionType(),
): QuizQuestion {
  const config = getQuestionConfig(artwork, allArtworks, questionType);
  const fallbackOptions = allArtworks
    .flatMap((candidate) => [
      candidate.title,
      candidate.artist?.name ?? "",
      candidate.movement?.name ?? "",
    ])
    .filter(Boolean);

  const distractors = uniqueOptions(
    [...config.distractors, ...shuffle(fallbackOptions)],
    config.correctAnswer,
  ).slice(0, 3);

  const options = shuffle([config.correctAnswer, ...distractors]);

  if (!options.includes(config.correctAnswer)) {
    throw new Error("Generated quiz question is missing the correct answer.");
  }

  if (new Set(options).size !== options.length) {
    throw new Error("Generated quiz question contains duplicated options.");
  }

  if (options.length !== 4) {
    throw new Error("Generated quiz question must contain exactly four options.");
  }

  return {
    artwork,
    question_type: questionType,
    prompt: config.prompt,
    options,
    correct_answer: config.correctAnswer,
  };
}

export function generateRandomQuizQuestion(artworks: Artwork[]) {
  return generateQuizQuestion(selectRandomArtwork(artworks), artworks);
}

export function getFamousQuizArtworks(artworks: Artwork[]) {
  const artworkMap = new Map(artworks.map((artwork) => [artwork.id, artwork]));

  return famousQuizArtworkIds.map((id) => {
    const artwork = artworkMap.get(id);

    if (!artwork) {
      throw new Error(`Famous quiz artwork not found: ${id}`);
    }

    return artwork;
  });
}

export function getDifficultyQuizArtworks(
  artworks: Artwork[],
  difficulty: Difficulty,
  count = 10,
) {
  const selected: Artwork[] = [];
  const selectedIds = new Set<string>();

  for (const candidateDifficulty of quizDifficultyPriority[difficulty]) {
    for (const artwork of artworks) {
      if (artwork.difficulty !== candidateDifficulty || selectedIds.has(artwork.id)) {
        continue;
      }

      selected.push(artwork);
      selectedIds.add(artwork.id);

      if (selected.length >= count) return selected;
    }
  }

  if (selected.length < count) {
    throw new Error(`Cannot build a ${count}-question quiz for ${difficulty} difficulty.`);
  }

  return selected;
}

export function isCorrectAnswer(question: QuizQuestion, answer: string) {
  return question.correct_answer === answer;
}
