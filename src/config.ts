import type { Screen } from "./types";

/** Teacher password required to move the game forward. Change this before publishing if needed. */
export const TEACHER_PIN = "2345";

/** Step order – moving to any later step requires the teacher password. */
export const SCREEN_ORDER: Record<Screen, number> = {
  intro: 0,
  teams: 1,
  hub: 2,
  mission1: 3,
  success1: 4,
  mission2: 5,
  success2: 6,
  leaderboard: 7,
  awards: 8,
};

export const SCREEN_LABELS: Record<Screen, string> = {
  intro: "Mission Intro",
  teams: "Team Selection",
  hub: "Mission Control",
  mission1: "Mission 1 · Registration",
  success1: "Mission 1 Success",
  mission2: "Mission 2 · Money Master",
  success2: "Mission 2 Success",
  leaderboard: "Final Leaderboard",
  awards: "Award Ceremony",
};

export const SCREENS: Screen[] = [
  "intro",
  "teams",
  "hub",
  "mission1",
  "success1",
  "mission2",
  "success2",
  "leaderboard",
  "awards",
];
