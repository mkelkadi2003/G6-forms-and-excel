import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CategoryId, GameState, Screen, SheetState, VisitorId } from "./types";
import { MISSION1_TASKS, MISSION2_TASKS, emptyScores, makeTeam } from "./data";
import { SCREENS, SCREEN_LABELS, SCREEN_ORDER } from "./config";
import { playSound, setMuted } from "./sound";
import { GateProvider } from "./GateContext";
import { Background } from "./components/ui";
import { BrandFooter } from "./components/Brand";
import { PasswordGate } from "./components/PasswordGate";
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

interface PendingStep {
  label: string;
  action: () => void;
}

const initialState = (): GameState => ({
  screen: "intro",
  teams: [makeTeam(0), makeTeam(1), makeTeam(2)],
  mission1Complete: false,
  mission2Complete: false,
  budgetEmergency: false,
  muted: false,
  sheets: {},
});

const load = (): GameState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed && Array.isArray(parsed.teams) && parsed.teams.length) {
        return {
          ...initialState(),
          ...parsed,
          // Keep the teacher on the same step after a refresh (no forward jump).
          screen: SCREENS.includes(parsed.screen) ? parsed.screen : "intro",
          sheets: parsed.sheets && typeof parsed.sheets === "object" ? parsed.sheets : {},
          teams: parsed.teams.map((t) => ({
            ...t,
            scores: { ...emptyScores(), ...t.scores },
            m1Tasks: t.m1Tasks?.length ? t.m1Tasks : MISSION1_TASKS.map(() => false),
            m2Tasks: t.m2Tasks?.length ? t.m2Tasks : MISSION2_TASKS.map(() => false),
          })),
        };
      }
    }
  } catch {
    /* ignore corrupted saved data */
  }
  return initialState();
};

export default function App() {
  const [state, setState] = useState<GameState>(load);
  const [pending, setPending] = useState<PendingStep | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const pendingRef = useRef<PendingStep | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    setMuted(state.muted);
  }, [state.muted]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.screen]);

  /** Every protected action waits for the teacher password. */
  const requestStep = useCallback((label: string, action: () => void) => {
    const step = { label, action };
    pendingRef.current = step;
    setPending(step);
  }, []);

  const cancelStep = () => {
    pendingRef.current = null;
    setPending(null);
  };

  /** Forward navigation is gated; going back to review a previous step stays free. */
  const go = useCallback(
    (screen: Screen) => {
      const current = stateRef.current.screen;
      if (SCREEN_ORDER[screen] > SCREEN_ORDER[current]) {
        requestStep(SCREEN_LABELS[screen], () => setState((s) => ({ ...s, screen })));
      } else {
        setState((s) => ({ ...s, screen }));
      }
    },
    [requestStep]
  );

  const approveStep = () => {
    const step = pendingRef.current;
    pendingRef.current = null;
    setPending(null);
    if (step) step.action();
  };

  const toggleMute = () => {
    setState((s) => ({ ...s, muted: !s.muted }));
    if (state.muted) setTimeout(() => playSound("click"), 50);
  };

  const restart = () =>
    requestStep("Restart the whole game", () => {
      localStorage.removeItem(STORAGE_KEY);
      setState(initialState());
    });

  const setScore = (teamId: string, cat: CategoryId, value: number) =>
    setState((s) => ({ ...s, teams: s.teams.map((t) => (t.id === teamId ? { ...t, scores: { ...t.scores, [cat]: value } } : t)) }));

  const setSheet = (teamId: string, sheet: SheetState) =>
    setState((s) => ({ ...s, sheets: { ...s.sheets, [teamId]: sheet } }));

  const toggleTask = (field: "m1Tasks" | "m2Tasks") => (teamId: string, index: number) =>
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, [field]: t[field].map((v, i) => (i === index ? !v : v)) } : t)),
    }));

  const assignVisitors = (map: Record<string, VisitorId>) =>
    setState((s) => ({ ...s, teams: s.teams.map((t) => ({ ...t, visitor: map[t.id] ?? t.visitor })) }));

  const completeMission1 = () =>
    requestStep("Complete Mission 1 & unlock Mission 2", () => setState((s) => ({ ...s, mission1Complete: true, screen: "success1" })));

  const completeMission2 = () =>
    requestStep("Complete Mission 2 & open the Final Leaderboard", () => setState((s) => ({ ...s, mission2Complete: true, screen: "success2" })));

  // The gate is requested inside MissionTwo so the surprise alert only appears AFTER approval.
  const triggerEmergency = () => setState((s) => ({ ...s, budgetEmergency: true }));

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
            sheets={state.sheets}
            onSheetChange={setSheet}
            budgetEmergency={state.budgetEmergency}
            onToggleTask={toggleTask("m2Tasks")}
            onScore={setScore}
            onTriggerEmergency={triggerEmergency}
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
    <GateProvider value={{ requestStep }}>
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
        <PasswordGate open={pending !== null} label={pending?.label ?? ""} onCancel={cancelStep} onSuccess={approveStep} />
      </div>
    </GateProvider>
  );
}
