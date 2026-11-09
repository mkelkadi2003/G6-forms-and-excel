import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import formsImg from "../assets/mission-forms.png";
import type { CategoryId, Team, VisitorId } from "../types";
import { CATEGORIES, MISSION1_TASKS, VISITORS } from "../data";
import { useGate } from "../GateContext";
import { playSound } from "../sound";
import { Badge, Card, GlowButton } from "./ui";
import { TaskTracker } from "./TaskTracker";
import { ScorePanel } from "./ScorePanel";

interface Props {
  teams: Team[];
  onToggleTask: (teamId: string, index: number) => void;
  onScore: (teamId: string, cat: CategoryId, value: number) => void;
  onAssignVisitors: (map: Record<string, VisitorId>) => void;
  onComplete: () => void;
  isComplete: boolean;
}

const M1_CATEGORIES = CATEGORIES.filter((c) => c.mission === 1 || c.mission === "both");
const COLOR = "#a3ff3c";

export const MissionOne: React.FC<Props> = ({ teams, onToggleTask, onScore, onAssignVisitors, onComplete, isComplete }) => {
  const [openTask, setOpenTask] = useState<number | null>(0);
  const [spinning, setSpinning] = useState(false);
  const [spinFace, setSpinFace] = useState(0);
  const { requestStep } = useGate();
  const allDone = teams.every((t) => t.m1Tasks.every(Boolean));

  const runSpin = () => {
    if (spinning) return;
    setSpinning(true);
    playSound("whoosh");
    let n = 0;
    const iv = setInterval(() => {
      setSpinFace((f) => (f + 1) % VISITORS.length);
      playSound("tick");
      n++;
      if (n > 14) {
        clearInterval(iv);
        const map: Record<string, VisitorId> = {};
        teams.forEach((t, i) => {
          // spread identities evenly, then shuffle
          map[t.id] = VISITORS[i % VISITORS.length].id;
        });
        const ids = Object.keys(map);
        for (let i = ids.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [map[ids[i]], map[ids[j]]] = [map[ids[j]], map[ids[i]]];
        }
        onAssignVisitors(map);
        setSpinning(false);
        playSound("unlock");
      }
    }, 110);
  };

  const spinVisitors = () => requestStep("Reveal the Secret Visitor identities", runSpin);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="glass rounded-3xl overflow-hidden grid md:grid-cols-[1fr_1.6fr]">
        <img src={formsImg} alt="Microsoft Forms mission" className="h-64 md:h-full w-full object-cover" />
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge color={COLOR}>Mission 1</Badge>
            <Badge color="#ffffff">Software: Microsoft Forms</Badge>
            {isComplete && <Badge color="#ffd54a">✅ Completed</Badge>}
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white" style={{ textShadow: `0 0 20px ${COLOR}88` }}>
            Operation Perfect Registration
          </h2>
          <p className="text-lg text-white/80 font-bold">
            📖 <span className="text-neon-lime">Story:</span> The school needs a professional registration and feedback system for the Science & Technology
            Fair. Visitors must be able to sign up, choose what they love, and tell us how excited they are. Your team must build it in Microsoft Forms!
          </p>
          <div className="flex flex-wrap gap-2 text-sm font-bold text-white/70">
            <span className="bg-white/10 rounded-full px-3 py-1">🎯 5 Tasks</span>
            <span className="bg-white/10 rounded-full px-3 py-1">🕵️ Secret Visitor Challenge</span>
            <span className="bg-white/10 rounded-full px-3 py-1">⭐ Up to 50 points</span>
          </div>
        </div>
      </div>

      {/* Task cards */}
      <section className="space-y-4">
        <h3 className="text-3xl font-display font-extrabold text-center">🎯 Your Tasks</h3>
        <div className="grid gap-3">
          {MISSION1_TASKS.map((task, i) => {
            const open = openTask === i;
            const finishedBy = teams.filter((t) => t.m1Tasks[i]).length;
            return (
              <motion.div key={i} layout className="glass rounded-2xl overflow-hidden" style={{ borderColor: open ? COLOR : undefined }}>
                <button
                  onClick={() => {
                    playSound("click");
                    setOpenTask(open ? null : i);
                  }}
                  className="w-full flex items-center gap-4 p-4 text-left cursor-pointer hover:bg-white/5"
                >
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                    style={{ background: `${COLOR}22`, border: `2px solid ${COLOR}` }}
                  >
                    {task.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-widest text-white/50 font-bold">Task {i + 1}</div>
                    <div className="text-2xl font-display font-extrabold">{task.title}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-white/50 font-bold">finished by</div>
                    <div className="font-display font-extrabold text-xl" style={{ color: COLOR }}>
                      {finishedBy}/{teams.length} teams
                    </div>
                  </div>
                  <span className={`text-2xl transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-5 pl-[5.5rem] text-lg text-white/85 font-bold space-y-3">
                        <p>{task.detail}</p>
                        {i === 1 && (
                          <div className="grid sm:grid-cols-4 gap-2 text-sm">
                            {[
                              ["🔘", "Choice", "Robotics / Science Experiments / Tech Workshops"],
                              ["✏️", "Text", "What is your name?"],
                              ["⭐", "Rating", "How excited are you? (1–5 stars)"],
                              ["📅", "Date", "Which day will you visit?"],
                            ].map(([e, t, d]) => (
                              <div key={t} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <div className="text-2xl">{e}</div>
                                <div className="font-extrabold" style={{ color: COLOR }}>
                                  {t}
                                </div>
                                <div className="text-white/60 text-xs">{d}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {i === 3 && (
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="bg-white/10 rounded-xl px-3 py-2">🔘 Which area do you like?</span>
                            <span>→</span>
                            <span className="rounded-xl px-3 py-2 bg-cyan-400/20 border border-cyan-400">🤖 Robotics → Robotics questions</span>
                            <span className="rounded-xl px-3 py-2 bg-pink-400/20 border border-pink-400">🧪 Science Experiments → Experiment questions</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Secret visitor */}
      <section>
        <Card glow="#ff4fd8" className="space-y-5 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="flex items-start justify-between flex-wrap gap-3 relative">
            <div>
              <Badge color="#ff4fd8">Special Challenge</Badge>
              <h3 className="text-3xl md:text-4xl font-display font-extrabold mt-2 text-glow-pink">🕵️ The Secret Visitor</h3>
              <p className="text-white/80 font-bold text-lg max-w-2xl mt-1">
                Each team gets a secret identity. Use it to test ANOTHER team's form. Does the form work for your visitor? Report back!
              </p>
            </div>
            <GlowButton variant="pink" size="lg" onClick={spinVisitors} disabled={spinning} sound={null}>
              {spinning ? "🎰 Spinning…" : teams.some((t) => t.visitor) ? "🎲 Shuffle Identities" : "🎲 Reveal Secret Identities"}
            </GlowButton>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 relative">
            {VISITORS.map((v, i) => (
              <div
                key={v.id}
                className="rounded-2xl p-4 border transition-all"
                style={{
                  borderColor: spinning && spinFace === i ? v.color : "rgba(255,255,255,0.12)",
                  background: spinning && spinFace === i ? `${v.color}22` : "rgba(255,255,255,0.04)",
                  transform: spinning && spinFace === i ? "scale(1.04)" : undefined,
                }}
              >
                <div className="text-4xl">{v.emoji}</div>
                <div className="font-display font-extrabold text-lg mt-1" style={{ color: v.color }}>
                  {v.title}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {!spinning && teams.some((t) => t.visitor) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-3 relative">
                {teams.map((t, idx) => {
                  const v = VISITORS.find((x) => x.id === t.visitor);
                  if (!v) return null;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.15, type: "spring" }}
                      className="rounded-2xl p-4 flex gap-4 items-start"
                      style={{ background: `${v.color}12`, border: `2px solid ${v.color}88` }}
                    >
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${t.color.from} ${t.color.to} flex items-center justify-center text-3xl shrink-0`}>
                        {t.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="font-display font-extrabold text-xl" style={{ color: t.color.hex }}>
                          {t.name}
                        </div>
                        <div className="font-extrabold text-lg" style={{ color: v.color }}>
                          {v.emoji} You are a {v.title}
                        </div>
                        <p className="text-white/75 text-sm font-bold mt-1">{v.description}</p>
                        <ul className="mt-2 grid sm:grid-cols-2 gap-1 text-xs text-white/70 font-bold">
                          {v.checks.map((c) => (
                            <li key={c} className="bg-white/5 rounded-lg px-2 py-1">
                              ☐ {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      <TaskTracker teams={teams} tasks={MISSION1_TASKS} field="m1Tasks" onToggle={onToggleTask} color={COLOR} />

      <ScorePanel teams={teams} categories={M1_CATEGORIES} onScore={onScore} title="⭐ Award Mission 1 Points" />

      <div className="text-center space-y-3 pb-8">
        {!allDone && <p className="text-white/60 font-bold">Tick every task for every team, or finish early if you're the teacher boss 😉</p>}
        <GlowButton size="xl" variant={allDone ? "lime" : "gold"} className={allDone ? "animate-pulse-glow" : ""} sound="click" onClick={onComplete}>
          {isComplete ? "🔁 Replay Success Screen" : "🏁 Complete Mission 1"}
        </GlowButton>
      </div>
    </div>
  );
};
