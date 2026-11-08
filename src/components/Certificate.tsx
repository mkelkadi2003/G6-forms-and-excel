import React from "react";
import { motion } from "framer-motion";
import type { Team } from "../types";
import { totalScore } from "../data";
import { GlowButton } from "./ui";
import { SchoolEmblem } from "./Brand";

interface Props {
  team: Team;
  place: number; // 0,1,2
  onClose: () => void;
}

const TITLES = ["Digital Champions", "Data Detectives", "Tech Stars"];
const MEDALS = ["🥇", "🥈", "🥉"];
const PLACE_TEXT = ["First Place", "Second Place", "Third Place"];
const BORDER = ["#d4a017", "#8f9bb3", "#b87333"];

export const Certificate: React.FC<Props> = ({ team, place, onClose }) => {
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex justify-between items-center no-print">
          <h3 className="font-display font-extrabold text-2xl">🖨️ Printable Certificate</h3>
          <div className="flex gap-2">
            <GlowButton variant="lime" onClick={() => window.print()}>
              🖨️ Print / Save as PDF
            </GlowButton>
            <GlowButton variant="ghost" onClick={onClose}>
              ✕ Close
            </GlowButton>
          </div>
        </div>

        <div className="print-area">
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white text-slate-800 rounded-2xl shadow-2xl w-full aspect-[1.414/1] relative overflow-hidden"
            style={{ border: `14px double ${BORDER[place]}` }}
          >
            {/* decorative corners */}
            <div className="absolute inset-3 border-2 rounded-lg pointer-events-none" style={{ borderColor: BORDER[place] }} />
            <div className="absolute top-6 left-6 text-4xl">⭐</div>
            <div className="absolute top-6 right-6 text-4xl">⭐</div>
            <div className="absolute bottom-6 left-6 text-4xl">💻</div>
            <div className="absolute bottom-6 right-6 text-4xl">🤖</div>
            <div className="absolute inset-0 opacity-[0.04] text-[20rem] flex items-center justify-center font-display font-extrabold select-none">{MEDALS[place]}</div>

            <div className="relative h-full flex flex-col items-center justify-center text-center px-10 py-8">
              <div className="flex items-center justify-center gap-3 mb-1">
                <SchoolEmblem className="h-11 w-11 md:h-14 md:w-14" />
                <div className="text-center">
                  <div className="font-display font-extrabold text-lg md:text-xl text-[#191650] leading-tight">Al-Bassam Schools · مدارس البسام</div>
                  <div className="text-[9px] md:text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">School Science &amp; Technology Fair</div>
                </div>
              </div>
              <div className="font-display font-extrabold text-3xl md:text-5xl mt-1" style={{ color: BORDER[place] }}>
                Certificate of Achievement
              </div>
              <div className="text-6xl md:text-7xl my-3">{MEDALS[place]}</div>
              <div className="text-slate-500 font-bold text-sm md:text-base">This certificate is proudly presented to</div>
              <div className="font-display font-extrabold text-4xl md:text-6xl my-2 text-slate-900">
                {team.emoji} {team.name}
              </div>
              <div className="text-slate-600 font-bold text-base md:text-lg">
                {PLACE_TEXT[place]} · <span style={{ color: BORDER[place] }}>{TITLES[place]}</span>
              </div>
              <div className="text-slate-500 text-sm md:text-base max-w-xl mt-2">
                For outstanding skill in Microsoft Forms and Microsoft Excel, brilliant teamwork and problem solving in the mission{" "}
                <span className="font-extrabold text-slate-700">“Save the School Tech Fair!”</span>
              </div>
              <div className="font-display font-extrabold text-xl md:text-2xl mt-3 text-slate-800">Final Score: {totalScore(team)} / 100</div>
              <div className="flex justify-between w-full max-w-lg mt-5 text-xs md:text-sm text-slate-500 font-bold">
                <div className="text-center">
                  <div className="border-t border-slate-400 pt-1 px-6">ICT Teacher</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-400 pt-1 px-6">{date}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
