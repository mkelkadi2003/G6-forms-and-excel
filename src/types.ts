export type CategoryId =
  | "bestForm"
  | "creativeDesign"
  | "branching"
  | "excelFormulas"
  | "bestChart"
  | "teamwork"
  | "problemSolving";

export interface Category {
  id: CategoryId;
  label: string;
  max: number;
  emoji: string;
  mission: 1 | 2 | "both";
  hint: string;
}

export interface TeamColor {
  name: string;
  hex: string;
  from: string;
  to: string;
  ring: string;
}

export type VisitorId = "robotStudent" | "scienceParent" | "techTeacher";

export interface Visitor {
  id: VisitorId;
  title: string;
  emoji: string;
  description: string;
  checks: string[];
  color: string;
}

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  emoji: string;
  scores: Record<CategoryId, number>;
  visitor: VisitorId | null;
  m1Tasks: boolean[];
  m2Tasks: boolean[];
}

export type Screen =
  | "intro"
  | "teams"
  | "hub"
  | "mission1"
  | "success1"
  | "mission2"
  | "success2"
  | "leaderboard"
  | "awards";

export interface GameState {
  screen: Screen;
  teams: Team[];
  mission1Complete: boolean;
  mission2Complete: boolean;
  budgetEmergency: boolean;
  muted: boolean;
}
