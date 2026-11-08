import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CategoryId, GameState, Screen, VisitorId } from "./types";
import { makeTeam } from "./data";
import { playSound, setMuted } from "./sound";
import { Background } from "./components/ui";
import { BrandFooter } from "./components/Brand";
import { HUD } from "./components/HUD";
import { IntroScreen } from "./components/IntroScreen";
import { TeamSetup } from "./components/TeamSetup";
import { MissionHub } from "./components/MissionHub";
import { MissionOne } from "./components/MissionOne";
import { MissionTwo } from "./components/MissionTwo";
import { SuccessScreen } from "./components/SuccessScreen";
import { Leaderboard } from "./components/Leaderboard";
import { AwardCeremony } from "./components/AwardCeremony";

const STORAGE_KEY = "save-the-tech-fair-v1";

const initialState = (): GameState => ({
  screen: "intro",
  teams: [makeTeam(0), makeTeam(1), makeTeam(2)],
  mission1Complete: false,
  mission2Complete: false,
  budgetEmergency: false,
  muted: false,
});

const load = (): GameState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed && Array.isArray(parsed.teams)) return { ...initialState(), ...parsed, screen: "intro" };
    }
  } catch {
    /* ignore */
  }
  return initialState();
};

export default function App() {
  const [state, setState] = useState<GameState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    setMuted(state.muted);
  }, [state.muted]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.screen]);

  const go = useCallback((screen: Screen) => setState((s) => ({ ...s, screen })), []);
  const toggleMute = () => {
    setState((s) => ({ ...s, muted: !s.muted }));
    if (state.muted) setTimeout(() => playSound("click"), 50);
  };
  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState());
  };

  const setScore = (teamId: string, cat: CategoryId, value: number) =>
    setState((s) => ({ ...s, teams: s.teams.map((t) => (t.id === teamId ? { ...t, scores: { ...t.scores, [cat]: value } } : t)) }));

  const toggleTask = (field: "m1Tasks" | "m2Tasks") => (teamId: string, index: number) =>
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, [field]: t[field].map((v, i) => (i === index ? !v : v)) } : t)),
    }));

  const assignVisitors = (map: Record<string, VisitorId>) =>
    setState((s) => ({ ...s, teams: s.teams.map((t) => ({ ...t, visitor: map[t.id] ?? t.visitor })) }));

  const completeMission1 = () => setState((s) => ({ ...s, mission1Complete: true, screen: "success1" }));
  const completeMission2 = () => setState((s) => ({ ...s, mission2Complete: true, screen: "success2" }));

  const render = () => {
    switch (state.screen) {
      case "intro":
        return <IntroScreen onStart={() => go("teams")} muted={state.muted} toggleMute={toggleMute} />;
      case "teams":
        return <TeamSetup teams={state.teams} setTeams={(teams) => setState((s) => ({ ...s, teams }))} onContinue={() => go("hub")} />;
      case "hub":
        return <MissionHub state={state} go={go} />;
      case "mission1":
        return (
          <MissionOne
            teams={state.teams}
            onToggleTask={toggleTask("m1Tasks")}
            onScore={setScore}
            onAssignVisitors={assignVisitors}
            onComplete={completeMission1}
            isComplete={state.mission1Complete}
          />
        );
      case "success1":
        return <SuccessScreen mission={1} onContinue={() => go("mission2")} />;
      case "mission2":
        return (
          <MissionTwo
            teams={state.teams}
            budgetEmergency={state.budgetEmergency}
            onToggleTask={toggleTask("m2Tasks")}
            onScore={setScore}
            onTriggerEmergency={() => setState((s) => ({ ...s, budgetEmergency: true }))}
            onComplete={completeMission2}
            isComplete={state.mission2Complete}
          />
        );
      case "success2":
        return <SuccessScreen mission={2} onContinue={() => go("leaderboard")} />;
      case "leaderboard":
        return <Leaderboard teams={state.teams} onScore={setScore} onAwards={() => go("awards")} canAward={state.mission1Complete && state.mission2Complete} />;
      case "awards":
        return <AwardCeremony teams={state.teams} onRestart={restart} onLeaderboard={() => go("leaderboard")} />;
    }
  };

  return (
    <div className="min-h-screen font-body">
      <Background />
      <HUD state={state} go={go} toggleMute={toggleMute} restart={restart} />
      <AnimatePresence mode="wait">
        <motion.main
          key={state.screen}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
          transition={{ duration: 0.35 }}
        >
          {render()}
        </motion.main>
      </AnimatePresence>
      <BrandFooter />
    </div>
  );
}
