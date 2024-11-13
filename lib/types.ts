export interface Player {
  id: string;
  name: string;
  number: number;
  team: "home" | "away";
}

export interface GameEvent {
  id: string;
  type:
    | "goal"
    | "shot"
    | "foul"
    | "corner"
    | "yellowCard"
    | "redCard"
    | "injury"
    | "offside"
    | "assist";
  x: number;
  y: number;
  timestamp: number;
  team: "home" | "away";
  player?: Player;
  matchId: string;
}

export type MatchLength = 70 | 80 | 90;
export type AgeCategory = "U14" | "U16" | "U19";

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  currentHalf: 1 | 2 | "finished";
  homeSubstitutionWindows: number;
  awaySubstitutionWindows: number;
  startTime: number;
  events: GameEvent[];
  players: Player[];
  legNumber: number;
  category: string;
  matchLength: MatchLength;
  ageCategory: AgeCategory;
}

// Re-export GameEvent as Event for backward compatibility
export type Event = GameEvent;
