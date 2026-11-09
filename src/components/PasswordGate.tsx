import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TEACHER_PIN } from "../config";
import { playSound } from "../sound";
import { SchoolEmblem } from "./Brand";

interface Props {
  open: boolean;
  label: string;
  onCancel: () => void;
  onSuccess: () => void;
}

/** Teacher-only checkpoint. No forward step is possible until the correct PIN is entered. */
export const PasswordGate: React.FC<Props> = ({ open, label, onCancel, onSuccess }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [granted, setGranted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setPin("");
    setError(false);
    setGranted(false);
    lockedRef.current = false;
    const t = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const submit = (value: string) => {
    if (lockedRef.current) return;
    if (value === TEACHER_PIN) {
      lockedRef.current = true;
      setGranted(true);
      playSound("unlock");
      window.setTimeout(onSuccess, 550);
    } else {
      playSound("alarm");
      setError(true);
      setPin("");
      window.setTimeout(() => {
        setError(false);
        inputRef.current?.focus();
      }, 900);
    }
  };

  const type = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, TEACHER_PIN.length);
    setPin(clean);
    setError(false);
    if (clean.length === TEACHER_PIN.length) window.setTimeout(() => submit(clean), 160);
  };

  const press = (d: string) => {
    if (lockedRef.current) return;
    const next = (pin + d).slice(0, TEACHER_PIN.length);
    setPin(next);
    setError(false);
    inputRef.current?.focus();
    if (next.length === TEACHER_PIN.length) window.setTimeout(() => submit(next), 160);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md no-print"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="w-full max-w-md glass rounded-3xl p-7 text-center space-y-5 relative overflow-hidden"
            style={{ boxShadow: "0 0 60px rgba(34,229,255,0.35), inset 0 0 0 2px rgba(34,229,255,0.5)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-400/20 blur-3xl" />
            <SchoolEmblem className="h-16 w-16 mx-auto relative" />

            <motion.div
              animate={error ? { x: [0, -12, 12, -10, 10, 0], rotate: [0, -8, 8, 0] } : { rotate: [0, -6, 6, 0] }}
              transition={{ duration: error ? 0.45 : 2.5, repeat: error ? 0 : Infinity }}
              className="text-6xl"
            >
              {granted ? "🔓" : "🔒"}
            </motion.div>

            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-extrabold">Teacher Checkpoint</div>
              <h2 className="text-3xl font-display font-extrabold text-white mt-1">{granted ? "Access Granted!" : "Password Required"}</h2>
              <p className="text-white/70 font-bold mt-1">
                {granted ? "Opening the next step…" : "Only the teacher can move the game forward."}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-white/80">
              Next step: <span className="text-neon-gold">{label}</span>
            </div>

            {/* PIN display */}
            <motion.div
              animate={error ? { scale: [1, 1.08, 1] } : {}}
              className={`flex justify-center gap-3 ${error ? "text-red-400" : ""}`}
            >
              {Array.from({ length: TEACHER_PIN.length }).map((_, i) => (
                <div
                  key={i}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${
                    i < pin.length
                      ? error
                        ? "bg-red-400 border-red-300 shadow-[0_0_14px_rgba(255,80,80,0.8)]"
                        : granted
                        ? "bg-lime-300 border-lime-200 shadow-[0_0_14px_rgba(163,255,60,0.8)]"
                        : "bg-cyan-300 border-cyan-200 shadow-[0_0_14px_rgba(34,229,255,0.8)]"
                      : "bg-white/5 border-white/25"
                  }`}
                />
              ))}
            </motion.div>

            <div className="h-5 text-sm font-extrabold">
              {error ? <span className="text-red-300">❌ Wrong password – try again!</span> : granted ? <span className="text-lime-300">✅ Unlocking…</span> : <span className="text-white/40">Enter the 4-digit teacher password</span>}
            </div>

            {/* Hidden input keeps real keyboards / projector keypads working */}
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={TEACHER_PIN.length}
              value={pin}
              onChange={(e) => type(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit(pin);
                if (e.key === "Escape") onCancel();
              }}
              className="absolute opacity-0 w-px h-px pointer-events-none"
              aria-label="Teacher password"
            />

            {/* On-screen keypad for projector / touch screens */}
            <div className="grid grid-cols-3 gap-2">
              {keys.map((k) => (
                <motion.button
                  key={k}
                  whileTap={{ scale: 0.92 }}
                  disabled={granted}
                  onClick={() => {
                    playSound("click");
                    if (k === "⌫") {
                      setPin((p) => p.slice(0, -1));
                      inputRef.current?.focus();
                    } else if (k === "✓") {
                      submit(pin);
                    } else {
                      press(k);
                    }
                  }}
                  className={`h-14 rounded-2xl font-display font-extrabold text-2xl border cursor-pointer transition-colors ${
                    k === "✓"
                      ? "bg-lime-400/20 border-lime-400/60 text-lime-200 hover:bg-lime-400/40"
                      : k === "⌫"
                      ? "bg-white/5 border-white/15 text-white/70 hover:bg-white/15"
                      : "bg-white/10 border-white/15 text-white hover:bg-cyan-400/30"
                  } disabled:opacity-40`}
                >
                  {k}
                </motion.button>
              ))}
            </div>

            <button onClick={onCancel} className="text-sm font-bold text-white/50 hover:text-white underline cursor-pointer">
              Cancel – stay on this step
            </button>
            <p className="text-[11px] text-white/30">Forgot the password? Ask your ICT teacher.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
