import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { playSound } from "../sound";
import { GlowButton } from "./ui";

interface Props {
  mission: 1 | 2;
  onContinue: () => void;
}

export const SuccessScreen: React.FC<Props> = ({ mission, onContinue }) => {
  useEffect(() => {
    playSound("success");
    const end = Date.now() + 1800;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: ["#22e5ff", "#ff4fd8", "#a3ff3c", "#ffd54a"] });
      confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: ["#22e5ff", "#ff4fd8", "#a3ff3c", "#ffd54a"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    if (mission === 1) setTimeout(() => playSound("unlock"), 1600);
  }, [mission]);

  const badges = mission === 1 ? ["📝 Form Builder", "🎨 Theme Designer", "🔀 Logic Master", "🕵️ Secret Tester"] : ["🧮 Formula Wizard", "📊 Chart Champion", "💵 Money Master", "💡 Problem Solver"];

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="relative mx-auto w-48 h-48"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 blur-2xl opacity-60 animate-pulse" />
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 flex items-center justify-center text-8xl shadow-[0_0_60px_rgba(255,213,74,0.8)] border-4 border-white/50">
            {mission === 1 ? "🏅" : "🏆"}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="text-neon-lime font-extrabold uppercase tracking-[0.4em] text-sm md:text-base mb-2">Mission {mission} Complete</div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold shimmer-text leading-tight">SUCCESS!</h1>
          <p className="text-xl md:text-2xl text-white/85 font-bold mt-4">
            {mission === 1
              ? "The registration system is back online! Visitors can sign up for the Tech Fair again. 🎉"
              : "The budget is rebuilt and the money is safe! You have officially SAVED THE SCHOOL TECH FAIR! 🎉"}
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((b, i) => (
            <motion.div
              key={b}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.15, type: "spring", stiffness: 200 }}
              className="glass rounded-2xl px-5 py-3 font-display font-bold text-lg border border-yellow-300/40 shadow-[0_0_20px_rgba(255,213,74,0.3)]"
            >
              {b}
            </motion.div>
          ))}
        </div>

        {mission === 1 ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, type: "spring" }} className="space-y-4">
            <div className="glass rounded-3xl p-6 inline-flex items-center gap-4 border-2 border-yellow-300/60 shadow-[0_0_40px_rgba(255,213,74,0.4)]">
              <motion.span animate={{ rotate: [0, -20, 20, 0], scale: [1, 1.3, 1] }} transition={{ delay: 1.6, duration: 0.8 }} className="text-6xl">
                🔓
              </motion.span>
              <div className="text-left">
                <div className="text-xs uppercase tracking-widest text-yellow-300 font-extrabold">New mission unlocked!</div>
                <div className="font-display font-extrabold text-2xl md:text-3xl">Mission 2: Operation Money Master</div>
              </div>
            </div>
            <div>
              <GlowButton size="xl" variant="gold" className="animate-pulse-glow" sound="whoosh" onClick={onContinue}>
                📊 Start Mission 2 →
              </GlowButton>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, type: "spring" }}>
            <GlowButton size="xl" variant="gold" className="animate-pulse-glow" sound="whoosh" onClick={onContinue}>
              🏆 See the Final Leaderboard →
            </GlowButton>
          </motion.div>
        )}
      </div>
    </div>
  );
};
