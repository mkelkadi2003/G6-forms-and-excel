import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CategoryId, Team } from "../types";
import { CATEGORIES, MAX_SCORE, rankTeams, totalScore } from "../data";
import { GlowButton, SectionTitle } from "./ui";
import { ScorePanel } from "./ScorePanel";

interface Props {
  teams: Team[];
  onScore: (teamId: string, cat: CategoryId, value: number) => void;
  onAwards: () => void;
  canAward: boolean;
}

const medal = ["🥇", "🥈", "🥉"];

export const Leaderboard: React.FC<Props> = ({ teams, onScore, onAwards, canAward }) => {
  const [editing, setEditing] = useState(false);
  const ranked = rankTeams(teams);
  const top = ranked[0] ? totalScore(ranked[0]) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <SectionTitle kicker="The Final Competition" title="🏆 Digital Leaderboard" subtitle={`Maximum score: ${MAX_SCORE} points. Scores update live as the teacher awards points.`} />

      {/* Scoring rubric */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((c) => (
          <div key={c.id} className="glass rounded-full px-4 py-1.5 text-sm font-bold flex items-center gap-2" title={c.hint}>
            <span>{c.emoji}</span>
            <span className="text-white/80">{c.label}</span>
            <span className="text-neon-gold">{c.max}</span>
          </div>
        ))}
      </div>

      {/* Animated bars */}
      <div className="glass rounded-3xl p-5 md:p-8 space-y-4">
        <AnimatePresence>
          {ranked.map((t, i) => {
            const score = totalScore(t);
            const pct = (score / MAX_SCORE) * 100;
            const isLeader = i === 0 && score > 0;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="flex items-center gap-3 md:gap-5"
              >
                <div className="w-14 text-center font-display font-extrabold text-3xl md:text-4xl">
                  {i < 3 && score > 0 ? medal[i] : <span className="text-white/40">{i + 1}</span>}
                </div>
                <div
                  className={`h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br ${t.color.from} ${t.color.to} flex items-center justify-center text-3xl shrink-0 ${
                    isLeader ? "animate-wiggle" : ""
                  }`}
                  style={{ boxShadow: `0 0 20px ${t.color.hex}88` }}
                >
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-display font-extrabold text-xl md:text-2xl truncate" style={{ color: t.color.hex }}>
                      {t.name}
                      {isLeader && <span className="ml-2 text-sm text-yellow-300 uppercase tracking-widest">Leading!</span>}
                    </span>
                    <motion.span key={score} initial={{ scale: 1.5, color: "#ffd54a" }} animate={{ scale: 1, color: "#ffffff" }} className="font-display font-extrabold text-2xl md:text-3xl">
                      {score}
                      <span className="text-sm text-white/50"> / {MAX_SCORE}</span>
                    </motion.span>
                  </div>
                  <div className="h-7 md:h-9 rounded-full bg-white/10 overflow-hidden border border-white/10 relative">
                    <motion.div
                      className="h-full rounded-full relative"
                      style={{ background: `linear-gradient(90deg, ${t.color.hex}, ${t.color.hex}99)`, boxShadow: `0 0 18px ${t.color.hex}` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, score > 0 ? 4 : 0)}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 16 }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
                    </motion.div>
                    {/* category segments */}
                    <div className="absolute inset-0 flex items-center px-2 gap-1 text-[10px] md:text-xs font-bold text-space-950/80 pointer-events-none">
                      {CATEGORIES.filter((c) => t.scores[c.id] > 0).map((c) => (
                        <span key={c.id} className="bg-white/60 rounded px-1 hidden md:inline">
                          {c.emoji} {t.scores[c.id]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {top === 0 && <p className="text-center text-white/50 font-bold">No points yet. Award points in the missions or open the editor below.</p>}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <GlowButton variant={editing ? "ghost" : "purple"} size="lg" onClick={() => setEditing((e) => !e)}>
          {editing ? "✔ Done Editing" : "✏️ Edit All Scores"}
        </GlowButton>
        <GlowButton variant="gold" size="lg" className={canAward ? "animate-pulse-glow" : ""} sound="click" onClick={onAwards}>
          🎉 Start the Award Ceremony
        </GlowButton>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <ScorePanel teams={teams} categories={CATEGORIES} onScore={onScore} title="✏️ Master Score Editor (all 7 categories)" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
