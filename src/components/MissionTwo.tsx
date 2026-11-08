import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import excelImg from "../assets/mission-excel.png";
import type { CategoryId, Team } from "../types";
import { BUDGET_ITEMS, CATEGORIES, MISSION2_TASKS } from "../data";
import { playSound } from "../sound";
import { Badge, Card, GlowButton } from "./ui";
import { TaskTracker } from "./TaskTracker";
import { ScorePanel } from "./ScorePanel";

interface Props {
  teams: Team[];
  budgetEmergency: boolean;
  onToggleTask: (teamId: string, index: number) => void;
  onScore: (teamId: string, cat: CategoryId, value: number) => void;
  onTriggerEmergency: () => void;
  onComplete: () => void;
  isComplete: boolean;
}

const M2_CATEGORIES = CATEGORIES.filter((c) => c.mission === 2 || c.mission === "both");
const COLOR = "#ffd54a";
const grandTotal = BUDGET_ITEMS.reduce((s, b) => s + b.qty * b.price, 0);

export const MissionTwo: React.FC<Props> = ({ teams, budgetEmergency, onToggleTask, onScore, onTriggerEmergency, onComplete, isComplete }) => {
  const [openTask, setOpenTask] = useState<number | null>(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const allDone = teams.every((t) => t.m2Tasks.every(Boolean));

  const triggerEmergency = () => {
    playSound("alarm");
    setShowAlertModal(true);
    onTriggerEmergency();
  };

  const col = ["A", "B", "C", "D"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="glass rounded-3xl overflow-hidden grid md:grid-cols-[1fr_1.6fr]">
        <img src={excelImg} alt="Microsoft Excel mission" className="h-64 md:h-full w-full object-cover" />
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge color={COLOR}>Mission 2</Badge>
            <Badge color="#ffffff">Software: Microsoft Excel</Badge>
            {isComplete && <Badge color="#a3ff3c">✅ Completed</Badge>}
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white text-glow-gold">Operation Money Master</h2>
          <p className="text-lg text-white/80 font-bold">
            📖 <span className="text-neon-gold">Story:</span> Great work, agents! The registration system is ready… but the event's financial records
            have disappeared! Nobody knows how much the Fair will cost. Rebuild the budget in Microsoft Excel before it's too late!
          </p>
          <div className="flex flex-wrap gap-2 text-sm font-bold text-white/70">
            <span className="bg-white/10 rounded-full px-3 py-1">🎯 5 Tasks</span>
            <span className="bg-white/10 rounded-full px-3 py-1">🚨 Surprise Challenge</span>
            <span className="bg-white/10 rounded-full px-3 py-1">⭐ Up to 60 points</span>
          </div>
        </div>
      </div>

      {/* Budget table */}
      <Card glow={COLOR} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-3xl font-display font-extrabold">💰 The Tech Fair Budget</h3>
            <p className="text-white/70 font-bold">Type this data into Excel exactly like this. Then calculate the totals!</p>
          </div>
          <GlowButton variant={showAnswers ? "ghost" : "gold"} size="sm" onClick={() => setShowAnswers((s) => !s)}>
            {showAnswers ? "🙈 Hide Answer Key" : "🔑 Teacher: Show Answer Key"}
          </GlowButton>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full rounded-2xl overflow-hidden border border-white/15 bg-white text-slate-800 font-mono text-base md:text-lg shadow-2xl">
            {/* column letters */}
            <div className="grid grid-cols-[48px_repeat(4,minmax(130px,1fr))] bg-slate-200 text-slate-600 text-sm font-bold">
              <div className="p-2 text-center border-r border-slate-300" />
              {col.map((c) => (
                <div key={c} className="p-2 text-center border-r border-slate-300">
                  {c}
                </div>
              ))}
            </div>
            {/* header row */}
            <div className="grid grid-cols-[48px_repeat(4,minmax(130px,1fr))]">
              <div className="p-2 text-center bg-slate-200 text-slate-600 text-sm font-bold border-r border-b border-slate-300">1</div>
              {["Item", "Quantity", "Unit Price", "Total"].map((h) => (
                <div key={h} className="p-2 font-extrabold bg-emerald-600 text-white border-r border-b border-emerald-700">
                  {h}
                </div>
              ))}
            </div>
            {BUDGET_ITEMS.map((b, i) => (
              <div key={b.item} className="grid grid-cols-[48px_repeat(4,minmax(130px,1fr))]">
                <div className="p-2 text-center bg-slate-200 text-slate-600 text-sm font-bold border-r border-b border-slate-300">{i + 2}</div>
                <div className="p-2 border-r border-b border-slate-200">
                  {b.emoji} {b.item}
                </div>
                <div className="p-2 text-right border-r border-b border-slate-200">{b.qty}</div>
                <div className="p-2 text-right border-r border-b border-slate-200">${b.price.toFixed(2)}</div>
                <div className={`p-2 text-right border-r border-b border-slate-200 ${showAnswers ? "bg-yellow-100" : "bg-yellow-50"}`}>
                  <AnimatePresence mode="wait">
                    {showAnswers ? (
                      <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-700 font-bold">
                        ${(b.qty * b.price).toFixed(2)} <span className="text-xs text-slate-400">=B{i + 2}*C{i + 2}</span>
                      </motion.span>
                    ) : (
                      <motion.span key="q" className="text-slate-400">
                        = ? × ?
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[48px_repeat(4,minmax(130px,1fr))]">
              <div className="p-2 text-center bg-slate-200 text-slate-600 text-sm font-bold border-r border-slate-300">6</div>
              <div className="p-2 font-extrabold col-span-3 border-r border-slate-200 bg-slate-50 text-right">GRAND TOTAL</div>
              <div className={`p-2 text-right font-extrabold ${showAnswers ? "bg-emerald-100" : "bg-yellow-50"}`}>
                {showAnswers ? (
                  <span className="text-emerald-700">
                    ${grandTotal.toFixed(2)} <span className="text-xs text-slate-400">=SUM(D2:D5)</span>
                  </span>
                ) : (
                  <span className="text-slate-400">=SUM(?)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-sm font-bold">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-2xl">✖️</div>
            <div className="text-neon-gold">Multiply</div>
            <div className="text-white/70">
              Total = Quantity × Unit Price. In Excel type <code className="bg-black/40 px-1 rounded">=B2*C2</code>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-2xl">➕</div>
            <div className="text-neon-gold">SUM</div>
            <div className="text-white/70">
              Add all totals: <code className="bg-black/40 px-1 rounded">=SUM(D2:D5)</code>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-2xl">💵</div>
            <div className="text-neon-gold">Currency</div>
            <div className="text-white/70">Select the money cells → Home → Number → Currency ($)</div>
          </div>
        </div>
      </Card>

      {/* Task list */}
      <section className="space-y-4">
        <h3 className="text-3xl font-display font-extrabold text-center">🎯 Your Tasks</h3>
        <div className="grid gap-3">
          {MISSION2_TASKS.map((task, i) => {
            const open = openTask === i;
            const finishedBy = teams.filter((t) => t.m2Tasks[i]).length;
            return (
              <motion.div key={i} layout className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => {
                    playSound("click");
                    setOpenTask(open ? null : i);
                  }}
                  className="w-full flex items-center gap-4 p-4 text-left cursor-pointer hover:bg-white/5"
                >
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: `${COLOR}22`, border: `2px solid ${COLOR}` }}>
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
                      <div className="px-4 pb-5 pl-[5.5rem] text-lg text-white/85 font-bold">{task.detail}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Budget emergency */}
      <Card
        className={`space-y-4 overflow-hidden border-2 ${budgetEmergency ? "animate-alarm" : ""}`}
        style={{ borderColor: budgetEmergency ? "#ff5c5c" : "rgba(255,255,255,0.12)" }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <Badge color="#ff5c5c">Special Surprise</Badge>
            <h3 className="text-3xl md:text-4xl font-display font-extrabold mt-2 text-red-300 text-glow-red">🚨 THE BUDGET EMERGENCY!</h3>
            <p className="text-white/80 font-bold text-lg max-w-2xl mt-1">
              {budgetEmergency
                ? "The alert has been sent! Teams must update their workbook and present a money-saving plan."
                : "Teacher: when most teams have finished their charts, press the big red button to launch the surprise…"}
            </p>
          </div>
          <GlowButton variant="red" size="lg" sound={null} onClick={triggerEmergency} className={budgetEmergency ? "" : "animate-pulse"}>
            {budgetEmergency ? "🔁 Show Alert Again" : "🚨 LAUNCH EMERGENCY"}
          </GlowButton>
        </div>

        {budgetEmergency && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-3">
            <div className="bg-black/30 rounded-2xl p-4">
              <div className="text-xs uppercase tracking-widest text-white/50 font-bold">Old budget</div>
              <div className="font-display font-extrabold text-4xl text-white">${grandTotal}</div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4">
              <div className="text-xs uppercase tracking-widest text-white/50 font-bold">Cut by 20%</div>
              <div className="font-display font-extrabold text-4xl text-red-300">−${grandTotal * 0.2}</div>
              <div className="text-xs text-white/50 font-bold">Hint: =D6*0.2 or =D6*20%</div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4">
              <div className="text-xs uppercase tracking-widest text-white/50 font-bold">New budget</div>
              <div className="font-display font-extrabold text-4xl text-lime-300">${grandTotal * 0.8}</div>
              <div className="text-xs text-white/50 font-bold">Hint: =D6*0.8 or =D6-D7</div>
            </div>
            <div className="md:col-span-3 bg-white/5 rounded-2xl p-4 text-white/80 font-bold">
              💡 <span className="text-neon-gold">Problem-solving ideas:</span> Buy fewer snacks? Make decorations yourselves? Borrow science books from the
              library? Find cheaper robotics kits? Change the numbers in Excel and watch the formulas update automatically! Then explain your plan to the
              class.
            </div>
          </motion.div>
        )}
      </Card>

      <TaskTracker teams={teams} tasks={MISSION2_TASKS} field="m2Tasks" onToggle={onToggleTask} color={COLOR} />

      <ScorePanel teams={teams} categories={M2_CATEGORIES} onScore={onScore} title="⭐ Award Mission 2 Points" />

      <div className="text-center space-y-3 pb-8">
        {!allDone && <p className="text-white/60 font-bold">Tick every task for every team when they finish.</p>}
        <GlowButton size="xl" variant={allDone ? "lime" : "gold"} className={allDone ? "animate-pulse-glow" : ""} sound="success" onClick={onComplete}>
          {isComplete ? "🔁 Replay Success Screen" : "🏁 Complete Mission 2"}
        </GlowButton>
      </div>

      {/* Fullscreen alert modal */}
      <AnimatePresence>
        {showAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowAlertModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="max-w-4xl w-full rounded-3xl border-4 border-red-400 animate-alarm p-10 md:p-16 text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div animate={{ rotate: [0, -15, 15, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="text-9xl">
                🚨
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-display font-extrabold text-white text-glow-red leading-tight">ALERT!</h2>
              <p className="text-2xl md:text-4xl font-display font-extrabold text-red-100">
                The school has reduced your budget by <span className="text-yellow-300 text-glow-gold">20%</span>!
              </p>
              <p className="text-xl md:text-2xl text-white/90 font-bold">Your team must update its budget and find a way to save money!</p>
              <GlowButton size="lg" variant="gold" onClick={() => setShowAlertModal(false)}>
                💪 Challenge Accepted!
              </GlowButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
