export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string;
          name: string;
          nationality: string | null;
          birth_year: number | null;
          death_year: number | null;
          bio: string | null;
          fun_fact: string | null;
          image_url: string | null;
        };
        Insert: {
          id: string;
          name: string;
          nationality?: string | null;
          birth_year?: number | null;
          death_year?: number | null;
          bio?: string | null;
          fun_fact?: string | null;
          image_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["artists"]["Insert"]>;
        Relationships: [];
      };
      artworks: {
        Row: {
          id: string;
          title: string;
          artist_id: string;
          movement_id: string;
          year: string | null;
          image_url: string;
          wikimedia_file: string | null;
          description: string;
          museum: string | null;
          source_image_url: string | null;
          cloudinary_public_id: string | null;
          cloudinary_url: string | null;
          thumbnail_url: string | null;
          blur_data_url: string | null;
          width: number | null;
          height: number | null;
          aspect_ratio: number | null;
          attribution: string | null;
          license: string | null;
          difficulty: "easy" | "medium" | "hard";
          public_domain: boolean;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          artist_id: string;
          movement_id: string;
          year?: string | null;
          image_url: string;
          wikimedia_file?: string | null;
          description: string;
          museum?: string | null;
          source_image_url?: string | null;
          cloudinary_public_id?: string | null;
          cloudinary_url?: string | null;
          thumbnail_url?: string | null;
          blur_data_url?: string | null;
          width?: number | null;
          height?: number | null;
          aspect_ratio?: number | null;
          attribution?: string | null;
          license?: string | null;
          difficulty: "easy" | "medium" | "hard";
          public_domain?: boolean;
          source?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["artworks"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey";
            columns: ["artist_id"];
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "artworks_movement_id_fkey";
            columns: ["movement_id"];
            referencedRelation: "movements";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: {
          user_id: string;
          artwork_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          artwork_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "favorites_artwork_id_fkey";
            columns: ["artwork_id"];
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      movements: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          theme_key: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          theme_key: string;
        };
        Update: Partial<Database["public"]["Tables"]["movements"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          mode: "classic" | "famous_10" | "interested_10" | "art_lover_10" | "vs";
          score_correct: number;
          score_total: number;
          score_unanswered: number;
          round_reached: number | null;
          final_artwork_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          mode: "classic" | "famous_10" | "interested_10" | "art_lover_10" | "vs";
          score_correct: number;
          score_total: number;
          score_unanswered?: number;
          round_reached?: number | null;
          final_artwork_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_results"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "quiz_results_final_artwork_id_fkey";
            columns: ["final_artwork_id"];
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_results_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_results_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: "classic" | "famous_10" | "interested_10" | "art_lover_10" | "vs";
          round: number;
          score_correct: number;
          score_total: number;
          score_unanswered: number;
          current_artwork_id: string;
          current_question_type: "guess_artist" | "guess_artwork" | "guess_movement";
          current_options: string[];
          current_correct_answer: string;
          selected_answer: string | null;
          question_started_at: string;
          timed_out: boolean;
          artwork_queue: string[] | null;
          completed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: "classic" | "famous_10" | "interested_10" | "art_lover_10" | "vs";
          round?: number;
          score_correct?: number;
          score_total?: number;
          score_unanswered?: number;
          current_artwork_id: string;
          current_question_type: "guess_artist" | "guess_artwork" | "guess_movement";
          current_options: string[];
          current_correct_answer: string;
          selected_answer?: string | null;
          question_started_at?: string;
          timed_out?: boolean;
          artwork_queue?: string[] | null;
          completed?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quiz_sessions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_current_artwork_id_fkey";
            columns: ["current_artwork_id"];
            referencedRelation: "artworks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vs_answers: {
        Row: {
          id: string;
          room_id: string | null;
          round_id: string | null;
          user_id: string | null;
          selected_option: string;
          is_correct: boolean;
          response_time_ms: number | null;
          points_earned: number | null;
          answered_at: string | null;
        };
        Insert: {
          id?: string;
          room_id?: string | null;
          round_id?: string | null;
          user_id?: string | null;
          selected_option: string;
          is_correct: boolean;
          response_time_ms?: number | null;
          points_earned?: number | null;
          answered_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["vs_answers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "vs_answers_room_id_fkey";
            columns: ["room_id"];
            referencedRelation: "vs_rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vs_answers_round_id_fkey";
            columns: ["round_id"];
            referencedRelation: "vs_rounds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vs_answers_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      vs_room_players: {
        Row: {
          id: string;
          room_id: string | null;
          user_id: string | null;
          display_name: string | null;
          score: number | null;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          room_id?: string | null;
          user_id?: string | null;
          display_name?: string | null;
          score?: number | null;
          joined_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["vs_room_players"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "vs_room_players_room_id_fkey";
            columns: ["room_id"];
            referencedRelation: "vs_rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vs_room_players_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      vs_rooms: {
        Row: {
          id: string;
          room_code: string;
          status: string;
          created_by: string | null;
          winner_user_id: string | null;
          current_round: number | null;
          total_rounds: number | null;
          created_at: string | null;
          started_at: string | null;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          room_code: string;
          status?: string;
          created_by?: string | null;
          winner_user_id?: string | null;
          current_round?: number | null;
          total_rounds?: number | null;
          created_at?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["vs_rooms"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "vs_rooms_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vs_rooms_winner_user_id_fkey";
            columns: ["winner_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      vs_rounds: {
        Row: {
          id: string;
          room_id: string | null;
          round_number: number;
          question_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          room_id?: string | null;
          round_number: number;
          question_id: string;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["vs_rounds"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "vs_rounds_room_id_fkey";
            columns: ["room_id"];
            referencedRelation: "vs_rooms";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      advance_vs_room: {
        Args: {
          p_room_id: string;
        };
        Returns: void;
      };
      join_vs_room: {
        Args: {
          p_room_code: string;
          p_display_name?: string | null;
        };
        Returns: string;
      };
      submit_vs_answer: {
        Args: {
          p_room_id: string;
          p_round_id: string;
          p_selected_option: string;
          p_is_correct: boolean;
          p_response_time_ms?: number | null;
          p_points_earned?: number;
        };
        Returns: boolean;
      };
    };
    Enums: {
      difficulty: "easy" | "medium" | "hard";
      match_status: "waiting" | "active" | "completed" | "cancelled";
      question_type: "guess_artist" | "guess_artwork" | "guess_movement";
      quiz_mode: "classic" | "famous_10" | "interested_10" | "art_lover_10" | "vs";
    };
    CompositeTypes: Record<string, never>;
  };
}
