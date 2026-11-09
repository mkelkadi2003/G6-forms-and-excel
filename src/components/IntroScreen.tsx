import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import heroRobot from "../assets/hero-robot.png";
import { playSound } from "../sound";
import { BrandBadge } from "./Brand";
import { GlowButton } from "./ui";

interface Props {
  onStart: () => void;
  muted: boolean;
  toggleMute: () => void;
}

type Phase = "boot" | "countdown" | "alert" | "story";

const STORY = [
  { emoji: "🏫", text: "Our school is getting ready for the biggest Science & Technology Fair ever!" },
  { emoji: "💥", text: "But disaster struck! A computer crash deleted the registration system AND the budget records!" },
  { emoji: "😱", text: "Without them, no visitors can sign up and nobody knows how much money we have. The Fair might be CANCELLED!" },
  { emoji: "🦸", text: "That's why YOU have been recruited as a Digital Rescue Team. Complete TWO missions to save the Fair!" },
];

export const IntroScreen: React.FC<Props> = ({ onStart, muted, toggleMute }) => {
  const [phase, setPhase] = useState<Phase>("boot");
  const [count, setCount] = useState(3);
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (count > 0) {
      playSound("tick");
      const t = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    playSound("go");
    const t = setTimeout(() => {
      setPhase("alert");
      playSound("alarm");
    }, 1100);
    return () => clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== "alert") return;
    const t = setTimeout(() => setPhase("story"), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "story") return;
    if (storyIndex < STORY.length - 1) {
      const t = setTimeout(() => setStoryIndex((i) => i + 1), 2600);
      return () => clearTimeout(t);
    }
  }, [phase, storyIndex]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 z-20">
        <BrandBadge />
      </div>
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 h-11 w-11 rounded-xl bg-white/10 border border-white/20 text-xl hover:bg-white/20 cursor-pointer z-20"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-8 max-w-4xl"
          >
            <motion.img
              src={heroRobot}
              alt="Tech Fair Robot"
              className="w-72 h-72 md:w-96 md:h-96 object-cover rounded-full mx-auto border-4 border-cyan-400/60 shadow-[0_0_60px_rgba(34,229,255,0.5)] animate-float"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            />
            <div>
              <div className="text-neon-cyan font-extrabold uppercase tracking-[0.4em] text-sm md:text-base mb-2">School Science & Technology Fair</div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight">
                <span className="shimmer-text">SAVE THE SCHOOL</span>
                <br />
                <span className="text-white text-glow-cyan">TECH FAIR!</span>
              </h1>
              <p className="text-white/70 text-xl mt-3 font-bold">The Ultimate Digital Mission</p>
            </div>
            <GlowButton
              size="xl"
              variant="cyan"
              className="animate-pulse-glow"
              sound="whoosh"
              onClick={() => {
                setCount(3);
                setPhase("countdown");
              }}
            >
              ⚡ POWER ON
            </GlowButton>
            <p className="text-yellow-200/80 text-sm font-bold">🔒 Teacher password required to move to each next step</p>
            <p className="text-white/40 text-sm">Teacher tip: press F11 for full screen on the projector</p>
          </motion.div>
        )}

        {phase === "countdown" && (
          <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <div className="text-white/60 font-bold uppercase tracking-[0.4em] mb-6">Mission launching in</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={count}
                initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className={`font-display font-extrabold ${count === 0 ? "text-[9rem] md:text-[12rem] text-neon-lime" : "text-[12rem] md:text-[16rem] text-white text-glow-cyan"}`}
                style={count === 0 ? { textShadow: "0 0 40px rgba(163,255,60,0.9)" } : undefined}
              >
                {count === 0 ? "GO!" : count}
              </motion.div>
            </AnimatePresence>
            <div className="relative w-64 h-64 mx-auto -mt-10 opacity-30">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-cyan-400 animate-spin-slow" />
            </div>
          </motion.div>
        )}

        {phase === "alert" && (
          <motion.div
            key="alert"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="text-center space-y-6 max-w-4xl w-full"
          >
            <div className="rounded-3xl border-4 animate-alarm p-8 md:p-14">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-8xl md:text-9xl mb-4"
              >
                🚨
              </motion.div>
              <h1 className="text-4xl md:text-7xl font-display font-extrabold text-red-300 text-glow-red leading-tight">
                EMERGENCY!
                <br />
                <span className="text-white">The School Tech Fair Is in Danger!</span>
              </h1>
            </div>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "story" && (
          <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl w-full grid md:grid-cols-[1fr_1.4fr] gap-8 items-center">
            <motion.img
              src={heroRobot}
              alt="Robot"
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full max-w-sm mx-auto rounded-3xl border-2 border-cyan-400/40 shadow-[0_0_50px_rgba(34,229,255,0.35)] animate-float"
            />
            <div className="space-y-4">
              <div className="text-neon-pink font-extrabold uppercase tracking-[0.3em] text-sm">📡 Incoming transmission</div>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">Mission Briefing</h2>
              <div className="space-y-3">
                {STORY.slice(0, storyIndex + 1).map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-2xl p-4 flex gap-4 items-start text-lg md:text-xl font-bold text-white/90"
                  >
                    <span className="text-3xl">{s.emoji}</span>
                    <span>{s.text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {storyIndex < STORY.length - 1 ? (
                  <GlowButton variant="ghost" onClick={() => setStoryIndex(STORY.length - 1)}>
                    Skip ⏭
                  </GlowButton>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                    <GlowButton size="xl" variant="lime" className="animate-pulse-glow" sound="click" onClick={onStart}>
                      🚀 START MISSION
                    </GlowButton>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
