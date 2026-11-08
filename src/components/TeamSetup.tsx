import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Team } from "../types";
import { TEAM_COLORS, TEAM_EMOJIS, makeTeam, totalScore } from "../data";
import { playSound } from "../sound";
import { Card, GlowButton, SectionTitle } from "./ui";

interface Props {
  teams: Team[];
  setTeams: (t: Team[]) => void;
  onContinue: () => void;
}

export const TeamSetup: React.FC<Props> = ({ teams, setTeams, onContinue }) => {
  const update = (id: string, patch: Partial<Team>) => setTeams(teams.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id: string) => {
    playSound("minus");
    setTeams(teams.filter((t) => t.id !== id));
  };
  const add = () => {
    if (teams.length >= 8) return;
    playSound("points");
    setTeams([...teams, makeTeam(teams.length)]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <SectionTitle
        kicker="Step 1 · Recruit your heroes"
        title="🦸 Digital Rescue Teams"
        subtitle="Teacher: type each team's name, pick a colour and a mascot. You can have up to 8 teams."
      />

      <div className="grid md:grid-cols-2 gap-5">
        <AnimatePresence>
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
            >
              <Card glow={team.color.hex} className="space-y-4 overflow-hidden">
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
                  style={{ background: team.color.hex }}
                />
                <div className="flex items-center gap-3 relative">
                  <div
                    className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${team.color.from} ${team.color.to} flex items-center justify-center text-4xl shadow-lg shrink-0`}
                  >
                    {team.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-widest text-white/50 font-bold">Team {idx + 1}</div>
                    <input
                      value={team.name}
                      onChange={(e) => update(team.id, { name: e.target.value })}
                      maxLength={24}
                      placeholder="Type team name…"
                      className="w-full bg-transparent border-b-2 border-white/20 focus:border-cyan-400 outline-none font-display font-extrabold text-2xl text-white py-1"
                    />
                  </div>
                  <button
                    onClick={() => remove(team.id)}
                    className="h-9 w-9 rounded-xl bg-white/10 hover:bg-red-500/50 text-white/70 hover:text-white cursor-pointer"
                    title="Remove team"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Team colour</div>
                  <div className="flex flex-wrap gap-2">
                    {TEAM_COLORS.map((c) => (
                      <button
                        key={c.name}
                        title={c.name}
                        onClick={() => {
                          playSound("click");
                          update(team.id, { color: c });
                        }}
                        className={`h-8 w-8 rounded-full transition-transform hover:scale-110 cursor-pointer ${
                          team.color.name === c.name ? "ring-4 ring-white scale-110" : "ring-2 ring-white/20"
                        }`}
                        style={{ background: c.hex, boxShadow: team.color.name === c.name ? `0 0 16px ${c.hex}` : undefined }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Mascot</div>
                  <div className="flex flex-wrap gap-1">
                    {TEAM_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          playSound("click");
                          update(team.id, { emoji: e });
                        }}
                        className={`h-9 w-9 rounded-lg text-xl cursor-pointer transition-transform hover:scale-110 ${
                          team.emoji === e ? "bg-white/25 ring-2 ring-cyan-400" : "bg-white/5"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-white/60 pt-1">
                  <span style={{ color: team.color.hex }}>{team.color.name}</span>
                  <span>Score: {totalScore(team)} / 100</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {teams.length < 8 && (
          <motion.button
            layout
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={add}
            className="rounded-3xl border-2 border-dashed border-white/25 hover:border-cyan-400 hover:bg-cyan-400/10 min-h-48 flex flex-col items-center justify-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-5xl">➕</span>
            <span className="font-display font-bold text-xl">Add a Team</span>
          </motion.button>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 pt-4">
        <GlowButton
          size="xl"
          variant="lime"
          disabled={teams.length < 2 || teams.some((t) => !t.name.trim())}
          sound="unlock"
          onClick={onContinue}
          className={teams.length >= 2 ? "animate-pulse-glow" : ""}
        >
          ✅ Teams Ready – Go to Missions!
        </GlowButton>
        {teams.length < 2 && <p className="text-white/50 text-sm">You need at least 2 teams to compete.</p>}
      </div>
    </div>
  );
};
