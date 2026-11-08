import React from "react";
import { motion } from "framer-motion";
import type { Team } from "../types";
import { playSound } from "../sound";
import { Card, ProgressBar } from "./ui";

interface Task {
  title: string;
  emoji: string;
  detail: string;
  xp: number;
}

interface Props {
  teams: Team[];
  tasks: Task[];
  field: "m1Tasks" | "m2Tasks";
  onToggle: (teamId: string, index: number) => void;
  color: string;
}

export const TaskTracker: React.FC<Props> = ({ teams, tasks, field, onToggle, color }) => (
  <Card className="space-y-4">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h3 className="text-2xl font-display font-extrabold">📋 Team Progress Tracker</h3>
      <span className="text-sm text-white/60 font-bold">Click a box when a team finishes a task</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-white/60">
            <th className="px-3 text-left">Team</th>
            {tasks.map((t, i) => (
              <th key={i} className="px-2 text-center">
                <div className="text-xl">{t.emoji}</div>
                <div className="font-bold">Task {i + 1}</div>
              </th>
            ))}
            <th className="px-3 text-left w-40">Progress</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const done = team[field].filter(Boolean).length;
            const all = done === tasks.length;
            return (
              <tr key={team.id} className="bg-white/5">
                <td className="px-3 py-2 rounded-l-2xl">
                  <div className="flex items-center gap-2">
                    <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${team.color.from} ${team.color.to} flex items-center justify-center text-lg`}>{team.emoji}</div>
                    <span className="font-display font-bold whitespace-nowrap" style={{ color: team.color.hex }}>
                      {team.name}
                    </span>
                    {all && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl">
                        🏅
                      </motion.span>
                    )}
                  </div>
                </td>
                {tasks.map((_, i) => {
                  const checked = team[field][i];
                  return (
                    <td key={i} className="px-2 py-2 text-center">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => {
                          playSound(checked ? "minus" : "points");
                          onToggle(team.id, i);
                        }}
                        className="h-11 w-11 rounded-xl border-2 text-2xl font-extrabold cursor-pointer transition-all"
                        style={{
                          borderColor: checked ? color : "rgba(255,255,255,0.2)",
                          background: checked ? color : "rgba(255,255,255,0.05)",
                          color: checked ? "#060a1f" : "transparent",
                          boxShadow: checked ? `0 0 14px ${color}` : undefined,
                        }}
                      >
                        ✓
                      </motion.button>
                    </td>
                  );
                })}
                <td className="px-3 py-2 rounded-r-2xl">
                  <ProgressBar value={done} max={tasks.length} color={team.color.hex} showLabel={false} />
                  <div className="text-xs text-white/60 font-bold mt-1">
                    {done}/{tasks.length} tasks
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
);
