import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GameState, Screen } from "../types";
import { playSound } from "../sound";
import { Timer } from "./Timer";
import { SchoolEmblem } from "./Brand";
import { GlowButton } from "./ui";

interface Props {
  state: GameState;
  go: (s: Screen) => void;
  toggleMute: () => void;
  restart: () => void;
}

const NAV: { id: Screen; label: string; emoji: string; needs?: (s: GameState) => boolean }[] = [
  { id: "teams", label: "Teams", emoji: "👥" },
  { id: "hub", label: "Missions", emoji: "🗺️", needs: (s) => s.teams.length > 0 },
  { id: "mission1", label: "Mission 1", emoji: "📝", needs: (s) => s.teams.length > 0 },
  { id: "mission2", label: "Mission 2", emoji: "📊", needs: (s) => s.mission1Complete },
  { id: "leaderboard", label: "Leaderboard", emoji: "🏆", needs: (s) => s.teams.length > 0 },
  { id: "awards", label: "Awards", emoji: "🎉", needs: (s) => s.teams.length > 0 },
];

export const HUD: React.FC<Props> = ({ state, go, toggleMute, restart }) => {
  const [confirm, setConfirm] = useState(false);
  if (state.screen === "intro") return null;

  return (
    <>
      <header className="sticky top-0 z-40 no-print">
        <div className="glass border-x-0 border-t-0 px-4 py-2 flex items-center gap-3 flex-wrap">
          <button onClick={() => { playSound("click"); go("hub"); }} className="flex items-center gap-2 cursor-pointer">
            <SchoolEmblem className="h-9 w-9" />
            <span className="font-display font-extrabold text-lg leading-tight hidden sm:block">
              <span className="shimmer-text">SAVE THE TECH FAIR!</span>
            </span>
          </button>
          <nav className="flex items-center gap-1 flex-wrap ml-2">
            {NAV.map((n) => {
              const enabled = n.needs ? n.needs(state) : true;
              const active = state.screen === n.id || (n.id === "mission1" && state.screen === "success1") || (n.id === "mission2" && state.screen === "success2");
              return (
                <button
                  key={n.id}
                  disabled={!enabled}
                  onClick={() => {
                    playSound("click");
                    go(n.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    active ? "bg-cyan-400 text-space-950 shadow-[0_0_16px_rgba(34,229,255,0.7)]" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-1">{enabled ? n.emoji : "🔒"}</span>
                  <span className="hidden md:inline">{n.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span
              className="hidden lg:inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-extrabold bg-yellow-300/10 border border-yellow-300/40 text-yellow-200"
              title="A teacher password is required to move to the next step"
            >
              🔒 Teacher Lock ON
            </span>
            <Timer />
            <button
              onClick={toggleMute}
              className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 text-xl hover:bg-white/20 cursor-pointer"
              title={state.muted ? "Unmute sounds" : "Mute sounds"}
            >
              {state.muted ? "🔇" : "🔊"}
            </button>
            <button
              onClick={() => {
                playSound("click");
                setConfirm(true);
              }}
              className="h-10 px-3 rounded-xl bg-white/10 border border-white/20 text-sm font-bold hover:bg-red-500/40 cursor-pointer"
              title="Restart game"
            >
              ↺ Restart
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="glass rounded-3xl p-8 max-w-md text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl">⚠️</div>
              <h3 className="text-2xl font-display font-extrabold">Restart the whole game?</h3>
              <p className="text-white/70">All teams, scores and progress will be erased. This cannot be undone!</p>
              <div className="flex gap-3 justify-center">
                <GlowButton variant="ghost" onClick={() => setConfirm(false)}>
                  Cancel
                </GlowButton>
                <GlowButton
                  variant="red"
                  onClick={() => {
                    setConfirm(false);
                    restart();
                  }}
                >
                  Yes, Restart
                </GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
