import React from "react";
import { motion } from "framer-motion";
import formsImg from "../assets/mission-forms.png";
import excelImg from "../assets/mission-excel.png";
import type { GameState, Screen } from "../types";
import { rankTeams, totalScore } from "../data";
import { playSound } from "../sound";
import { Badge, GlowButton, ProgressBar, SectionTitle } from "./ui";

interface Props {
  state: GameState;
  go: (s: Screen) => void;
}

interface MissionCardProps {
  number: number;
  title: string;
  subtitle: string;
  software: string;
  img: string;
  color: string;
  locked: boolean;
  complete: boolean;
  progress: number;
  onOpen: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({ number, title, subtitle, software, img, color, locked, complete, progress, onOpen }) => (
  <motion.div
    whileHover={locked ? undefined : { y: -8, scale: 1.02 }}
    className={`relative rounded-3xl overflow-hidden glass transition-all ${locked ? "grayscale opacity-70" : ""}`}
    style={{ boxShadow: locked ? undefined : `0 0 40px ${color}44, inset 0 0 0 2px ${color}66` }}
  >
    <div className="relative h-56 overflow-hidden">
      <img src={img} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/30 to-transparent" />
      <div className="absolute top-3 left-3 flex gap-2">
        <Badge color={color}>Mission {number}</Badge>
        <Badge color="#ffffff">{software}</Badge>
      </div>
      {complete && (
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: -12 }}
          className="absolute top-3 right-3 bg-lime-400 text-space-950 font-display font-extrabold px-4 py-1.5 rounded-xl shadow-[0_0_20px_rgba(163,255,60,0.8)]"
        >
          ✅ COMPLETE
        </motion.div>
      )}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-8xl drop-shadow-2xl">
            🔒
          </motion.div>
        </div>
      )}
    </div>
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-3xl font-display font-extrabold text-white">{title}</h3>
        <p className="text-white/70 font-bold">{subtitle}</p>
      </div>
      <div>
        <div className="flex justify-between text-xs font-bold text-white/60 mb-1">
          <span>Class progress</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <ProgressBar value={progress} max={1} color={color} showLabel={false} />
      </div>
      <GlowButton
        variant={locked ? "ghost" : number === 1 ? "lime" : "gold"}
        size="lg"
        className="w-full"
        disabled={locked}
        sound="whoosh"
        onClick={onOpen}
      >
        {locked ? "🔒 Complete Mission 1 to unlock" : complete ? "🔁 Open Mission" : "▶ Start Mission"}
      </GlowButton>
    </div>
  </motion.div>
);

export const MissionHub: React.FC<Props> = ({ state, go }) => {
  const { teams } = state;
  const m1Progress = teams.length ? teams.reduce((s, t) => s + t.m1Tasks.filter(Boolean).length / t.m1Tasks.length, 0) / teams.length : 0;
  const m2Progress = teams.length ? teams.reduce((s, t) => s + t.m2Tasks.filter(Boolean).length / t.m2Tasks.length, 0) / teams.length : 0;
  const ranked = rankTeams(teams);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <SectionTitle kicker="Mission Control" title="🗺️ Choose Your Mission" subtitle="Complete both missions to save the Tech Fair. Mission 2 unlocks after Mission 1!" />

      <div className="grid md:grid-cols-2 gap-6">
        <MissionCard
          number={1}
          title="Operation Perfect Registration"
          subtitle="Build the Fair's registration form with Microsoft Forms"
          software="Microsoft Forms"
          img={formsImg}
          color="#a3ff3c"
          locked={false}
          complete={state.mission1Complete}
          progress={m1Progress}
          onOpen={() => go("mission1")}
        />
        <MissionCard
          number={2}
          title="Operation Money Master"
          subtitle="Rebuild the Fair's budget with Microsoft Excel"
          software="Microsoft Excel"
          img={excelImg}
          color="#ffd54a"
          locked={!state.mission1Complete}
          complete={state.mission2Complete}
          progress={m2Progress}
          onOpen={() => go("mission2")}
        />
      </div>

      {/* Mini scoreboard */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-2xl font-display font-extrabold">🏆 Live Scores</h3>
          <div className="flex gap-2">
            <GlowButton size="sm" variant="ghost" onClick={() => go("leaderboard")}>
              Full Leaderboard →
            </GlowButton>
            <GlowButton size="sm" variant="ghost" onClick={() => go("teams")}>
              Edit Teams
            </GlowButton>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ranked.map((t, i) => (
            <div key={t.id} className="rounded-2xl p-3 flex items-center gap-3 bg-white/5" style={{ border: `1px solid ${t.color.hex}55` }}>
              <div className="text-2xl font-display font-extrabold text-white/40 w-6">{i + 1}</div>
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${t.color.from} ${t.color.to} flex items-center justify-center text-xl`}>{t.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold truncate" style={{ color: t.color.hex }}>
                  {t.name}
                </div>
                <div className="text-xs text-white/60 font-bold">{totalScore(t)} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {state.mission1Complete && state.mission2Complete && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <GlowButton
            size="xl"
            variant="gold"
            className="animate-pulse-glow"
            sound="fanfare"
            onClick={() => {
              playSound("fanfare");
              go("awards");
            }}
          >
            🎉 Go to the Award Ceremony!
          </GlowButton>
        </motion.div>
      )}
    </div>
  );
};
