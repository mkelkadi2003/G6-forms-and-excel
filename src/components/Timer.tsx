import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playSound } from "../sound";
import { GlowButton } from "./ui";

const PRESETS = [1, 5, 10, 15, 20, 30];

export const Timer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(10 * 60);
  const [left, setLeft] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          playSound("alarm");
          return 0;
        }
        if (l <= 11) playSound("tick");
        return l - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = total ? (left / total) * 100 : 0;
  const danger = left <= 60 && left > 0;
  const done = left === 0;

  return (
    <div className="relative">
      <button
        onClick={() => {
          playSound("click");
          setOpen((o) => !o);
        }}
        className={`font-mono font-extrabold text-lg px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
          done
            ? "bg-red-500/40 border-red-400 text-white animate-pulse"
            : danger
            ? "bg-red-500/20 border-red-400 text-red-200"
            : running
            ? "bg-lime-400/20 border-lime-400 text-lime-200"
            : "bg-white/10 border-white/20 text-white"
        }`}
        title="Mission Timer"
      >
        ⏱ {mm}:{ss}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 glass rounded-2xl p-4 z-50 shadow-2xl"
          >
            <div className="text-center font-display font-extrabold text-5xl text-white text-glow-cyan mb-2 font-mono">
              {mm}:{ss}
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
              <div
                className="h-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: danger ? "#ff5c5c" : "#22e5ff" }}
              />
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    playSound("click");
                    setTotal(m * 60);
                    setLeft(m * 60);
                    setRunning(false);
                  }}
                  className={`text-xs font-bold rounded-lg py-1.5 border cursor-pointer ${
                    total === m * 60 ? "bg-cyan-400 text-space-950 border-cyan-300" : "bg-white/5 border-white/15 text-white hover:bg-white/15"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <GlowButton size="sm" variant={running ? "gold" : "lime"} className="flex-1" onClick={() => setRunning((r) => !r)}>
                {running ? "⏸ Pause" : "▶ Start"}
              </GlowButton>
              <GlowButton
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRunning(false);
                  setLeft(total);
                }}
              >
                ↺ Reset
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
