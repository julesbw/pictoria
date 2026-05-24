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
  fun_fact?: string;
  image_url?: string;
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
  wikimedia_file?: string;
  description: string;
  museum?: string;
  source_image_url?: string;
  cloudinary_public_id?: string;
  cloudinary_url?: string;
  thumbnail_url?: string;
  blur_data_url?: string;
  width?: number;
  height?: number;
  aspect_ratio?: number;
  attribution?: string;
  license?: string;
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
