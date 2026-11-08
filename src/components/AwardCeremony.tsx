import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import trophyImg from "../assets/trophy.png";
import type { Team } from "../types";
import { rankTeams, totalScore } from "../data";
import { playSound } from "../sound";
import { Certificate } from "./Certificate";
import { GlowButton } from "./ui";
import { SchoolEmblem } from "./Brand";

interface Props {
  teams: Team[];
  onRestart: () => void;
  onLeaderboard: () => void;
}

const TITLES = ["Digital Champions", "Data Detectives", "Tech Stars"];
const MEDALS = ["🥇", "🥈", "🥉"];
const HEIGHTS = ["h-64 md:h-80", "h-48 md:h-60", "h-36 md:h-44"];
const PODIUM_COLORS = ["from-yellow-300 to-amber-600", "from-slate-200 to-slate-500", "from-orange-300 to-amber-800"];

const fireConfetti = (big = false) => {
  const colors = ["#ffd54a", "#22e5ff", "#ff4fd8", "#a3ff3c", "#ffffff"];
  confetti({ particleCount: big ? 220 : 90, spread: big ? 120 : 80, origin: { y: 0.6 }, colors, scalar: big ? 1.3 : 1 });
  if (big) {
    setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors }), 300);
    setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors }), 500);
  }
};

export const AwardCeremony: React.FC<Props> = ({ teams, onRestart, onLeaderboard }) => {
  const ranked = rankTeams(teams);
  const podium = ranked.slice(0, 3);
  // reveal step: 0 = nothing, 1 = 3rd, 2 = 2nd, 3 = 1st
  const [step, setStep] = useState(0);
  const [cert, setCert] = useState<number | null>(null);
  const rainRef = useRef<number | null>(null);

  const maxStep = podium.length;

  const reveal = () => {
    if (step >= maxStep) return;
    const next = step + 1;
    setStep(next);
    if (next === maxStep) {
      playSound("fanfare");
      fireConfetti(true);
    } else {
      playSound("reveal");
      setTimeout(() => fireConfetti(false), 500);
    }
  };

  // gentle confetti rain once the champion is revealed
  useEffect(() => {
    if (step !== maxStep || maxStep === 0) return;
    const end = Date.now() + 6000;
    const frame = () => {
      confetti({ particleCount: 2, startVelocity: 0, ticks: 200, gravity: 0.6, origin: { x: Math.random(), y: -0.1 }, colors: ["#ffd54a", "#22e5ff", "#ff4fd8", "#a3ff3c"] });
      if (Date.now() < end) rainRef.current = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      if (rainRef.current) cancelAnimationFrame(rainRef.current);
    };
  }, [step, maxStep]);

  // podium display order: 2nd, 1st, 3rd
  const order = [1, 0, 2].filter((i) => i < podium.length);
  const revealedIndex = (placeIdx: number) => step >= maxStep - placeIdx; // 3rd (idx 2) revealed at step 1 when 3 teams

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 relative">
      <div className="text-center space-y-3">
        <div className="text-neon-gold font-extrabold uppercase tracking-[0.4em] text-sm md:text-base">The Grand Finale</div>
        <h1 className="text-5xl md:text-7xl font-display font-extrabold shimmer-text leading-tight">🎉 Award Ceremony 🎉</h1>
        <p className="text-xl text-white/80 font-bold">The Tech Fair is SAVED! Let's celebrate our Digital Rescue Heroes!</p>
      </div>

      {/* Podium */}
      <div className="relative">
        <img
          src={trophyImg}
          alt="Trophy"
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-40 md:w-56 md:h-56 object-cover rounded-full border-4 border-yellow-300/60 shadow-[0_0_60px_rgba(255,213,74,0.6)] animate-float opacity-90 pointer-events-none"
          style={{ zIndex: 0 }}
        />
        <div className="flex items-end justify-center gap-3 md:gap-6 pt-44 md:pt-56 px-2">
          {order.map((placeIdx) => {
            const team = podium[placeIdx];
            const shown = revealedIndex(placeIdx);
            return (
              <div key={team.id} className="flex flex-col items-center w-1/3 max-w-xs">
                <AnimatePresence>
                  {shown && (
                    <motion.div
                      initial={{ opacity: 0, y: 60, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 160, damping: 14 }}
                      className="text-center mb-3 space-y-1"
                    >
                      <motion.div animate={placeIdx === 0 ? { scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] } : undefined} transition={{ repeat: Infinity, duration: 1.6 }} className="text-6xl md:text-7xl">
                        {MEDALS[placeIdx]}
                      </motion.div>
                      <div
                        className={`mx-auto h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br ${team.color.from} ${team.color.to} flex items-center justify-center text-4xl`}
                        style={{ boxShadow: `0 0 30px ${team.color.hex}` }}
                      >
                        {team.emoji}
                      </div>
                      <div className="font-display font-extrabold text-xl md:text-3xl leading-tight" style={{ color: team.color.hex }}>
                        {team.name}
                      </div>
                      <div className="text-xs md:text-sm uppercase tracking-widest font-extrabold text-yellow-300">{TITLES[placeIdx]}</div>
                      <div className="font-display font-extrabold text-2xl md:text-3xl text-white">{totalScore(team)} pts</div>
                      <GlowButton size="sm" variant="ghost" onClick={() => setCert(placeIdx)}>
                        📜 Certificate
                      </GlowButton>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className={`w-full ${HEIGHTS[placeIdx]} rounded-t-3xl bg-gradient-to-b ${PODIUM_COLORS[placeIdx]} flex items-start justify-center pt-4 relative overflow-hidden`}
                  style={{ boxShadow: shown ? `0 0 40px ${team.color.hex}88` : undefined }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
                  <span className="font-display font-extrabold text-6xl md:text-8xl text-space-950/70 relative">{placeIdx + 1}</span>
                  {!shown && <div className="absolute inset-0 flex items-center justify-center text-5xl">❓</div>}
                </motion.div>
              </div>
            );
          })}
        </div>
        <div className="h-4 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent mx-8" />
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {step < maxStep ? (
          <GlowButton size="xl" variant="gold" className="animate-pulse-glow" sound={null} onClick={reveal}>
            {step === 0 ? "🥁 Reveal the Winners!" : step === maxStep - 1 ? "👑 Reveal the CHAMPIONS!" : "🥁 Reveal Next Place"}
          </GlowButton>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="glass rounded-3xl p-6 border-2 border-yellow-300/50">
              <div className="flex items-center justify-center gap-3 mb-2">
                <SchoolEmblem className="h-10 w-10" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-extrabold">Presented by Al-Bassam Schools</div>
                  <div className="text-sm uppercase tracking-[0.3em] text-yellow-300 font-extrabold">Congratulations</div>
                </div>
              </div>
              <div className="font-display font-extrabold text-3xl md:text-5xl text-glow-gold text-white mt-1">
                {podium[0]?.emoji} {podium[0]?.name} are the Digital Champions!
              </div>
              <p className="text-white/70 font-bold mt-2">Every team helped save the Tech Fair. You are ALL digital heroes! 🦸</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <GlowButton variant="gold" size="lg" sound="fanfare" onClick={() => fireConfetti(true)}>
                🎊 More Confetti!
              </GlowButton>
              <GlowButton variant="ghost" size="lg" onClick={onLeaderboard}>
                🏆 View Leaderboard
              </GlowButton>
              <GlowButton variant="red" size="lg" onClick={onRestart}>
                ↺ Play Again
              </GlowButton>
            </div>
          </motion.div>
        )}
      </div>

      {/* Other teams */}
      {ranked.length > 3 && step === maxStep && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-5">
          <h3 className="font-display font-extrabold text-xl mb-3">🌟 Honourable Mentions</h3>
          <div className="flex flex-wrap gap-3">
            {ranked.slice(3).map((t, i) => (
              <div key={t.id} className="rounded-2xl px-4 py-2 flex items-center gap-2 bg-white/5" style={{ border: `1px solid ${t.color.hex}66` }}>
                <span className="text-white/40 font-bold">#{i + 4}</span>
                <span className="text-xl">{t.emoji}</span>
                <span className="font-display font-bold" style={{ color: t.color.hex }}>
                  {t.name}
                </span>
                <span className="text-white/60 text-sm font-bold">{totalScore(t)} pts</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>{cert !== null && podium[cert] && <Certificate team={podium[cert]} place={cert} onClose={() => setCert(null)} />}</AnimatePresence>
    </div>
  );
};
