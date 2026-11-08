import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, CategoryId, Team } from "../types";
import { totalScore } from "../data";
import { playSound } from "../sound";
import { Card, Stars } from "./ui";

interface Props {
  teams: Team[];
  categories: Category[];
  onScore: (teamId: string, cat: CategoryId, value: number) => void;
  title?: string;
}

interface Pop {
  id: number;
  teamId: string;
  text: string;
}

export const ScorePanel: React.FC<Props> = ({ teams, categories, onScore, title = "⭐ Award Points" }) => {
  const [pops, setPops] = useState<Pop[]>([]);

  const change = (team: Team, cat: Category, delta: number) => {
    const current = team.scores[cat.id];
    const next = Math.max(0, Math.min(cat.max, current + delta));
    if (next === current) return;
    playSound(delta > 0 ? "points" : "minus");
    onScore(team.id, cat.id, next);
    const id = Date.now() + Math.random();
    setPops((p) => [...p, { id, teamId: team.id, text: `${delta > 0 ? "+" : ""}${delta}` }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900);
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-2xl font-display font-extrabold">{title}</h3>
        <span className="text-sm text-white/60 font-bold">Teacher panel · click + / − to award points</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-white/60">
              <th className="px-3 py-1">Team</th>
              {categories.map((c) => (
                <th key={c.id} className="px-3 py-1 text-center" title={c.hint}>
                  <div className="text-lg">{c.emoji}</div>
                  <div>{c.label}</div>
                  <div className="text-white/40">max {c.max}</div>
                </th>
              ))}
              <th className="px-3 py-1 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id} className="bg-white/5">
                <td className="px-3 py-2 rounded-l-2xl relative">
                  <div className="flex items-center gap-2">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${team.color.from} ${team.color.to} flex items-center justify-center text-xl shrink-0`}>
                      {team.emoji}
                    </div>
                    <span className="font-display font-bold whitespace-nowrap" style={{ color: team.color.hex }}>
                      {team.name}
                    </span>
                  </div>
                  <AnimatePresence>
                    {pops
                      .filter((p) => p.teamId === team.id)
                      .map((p) => (
                        <motion.span
                          key={p.id}
                          initial={{ opacity: 1, y: 0, scale: 0.8 }}
                          animate={{ opacity: 0, y: -40, scale: 1.4 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.9 }}
                          className={`absolute left-14 top-0 font-display font-extrabold text-2xl pointer-events-none ${
                            p.text.startsWith("+") ? "text-lime-300" : "text-red-300"
                          }`}
                        >
                          {p.text}
                        </motion.span>
                      ))}
                  </AnimatePresence>
                </td>
                {categories.map((c) => {
                  const v = team.scores[c.id];
                  const stars = Math.round((v / c.max) * 5);
                  return (
                    <td key={c.id} className="px-2 py-2 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <div className="inline-flex items-center gap-1 bg-space-950/60 rounded-xl p-1">
                          <button
                            onClick={() => change(team, c, c.max >= 20 ? -5 : -1)}
                            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-red-500/50 font-extrabold cursor-pointer"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={v}
                            min={0}
                            max={c.max}
                            onChange={(e) => {
                              const n = Math.max(0, Math.min(c.max, Number(e.target.value) || 0));
                              onScore(team.id, c.id, n);
                            }}
                            className="w-12 text-center bg-transparent font-display font-extrabold text-xl outline-none"
                            style={{ color: v === c.max ? "#ffd54a" : "white" }}
                          />
                          <button
                            onClick={() => change(team, c, c.max >= 20 ? 5 : 1)}
                            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-lime-400/60 font-extrabold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <Stars count={stars} size="text-sm" />
                      </div>
                    </td>
                  );
                })}
                <td className="px-3 py-2 rounded-r-2xl text-center">
                  <motion.div key={totalScore(team)} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-display font-extrabold text-3xl text-glow-gold text-yellow-300">
                    {totalScore(team)}
                  </motion.div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-white/50">
        Tip: big categories (20 pts) move in steps of 5, small categories (10 pts) move in steps of 1. You can also type a number directly.
      </p>
    </Card>
  );
};
