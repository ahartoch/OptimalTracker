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
}

// Re-export GameEvent as Event for backward compatibility
export type Event = GameEvent;
