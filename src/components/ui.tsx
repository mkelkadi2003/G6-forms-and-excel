import React from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { playSound, type SoundName } from "../sound";

type Variant = "cyan" | "pink" | "lime" | "gold" | "purple" | "red" | "ghost";

const variantClasses: Record<Variant, string> = {
  cyan: "bg-gradient-to-r from-cyan-400 to-sky-500 text-space-950 shadow-[0_0_24px_rgba(34,229,255,0.55)] hover:shadow-[0_0_40px_rgba(34,229,255,0.9)]",
  pink: "bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-[0_0_24px_rgba(255,79,216,0.55)] hover:shadow-[0_0_40px_rgba(255,79,216,0.9)]",
  lime: "bg-gradient-to-r from-lime-300 to-green-500 text-space-950 shadow-[0_0_24px_rgba(163,255,60,0.55)] hover:shadow-[0_0_40px_rgba(163,255,60,0.9)]",
  gold: "bg-gradient-to-r from-yellow-300 to-orange-400 text-space-950 shadow-[0_0_24px_rgba(255,213,74,0.55)] hover:shadow-[0_0_40px_rgba(255,213,74,0.9)]",
  purple: "bg-gradient-to-r from-violet-500 to-purple-700 text-white shadow-[0_0_24px_rgba(166,107,255,0.55)] hover:shadow-[0_0_40px_rgba(166,107,255,0.9)]",
  red: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_24px_rgba(255,80,80,0.55)] hover:shadow-[0_0_40px_rgba(255,80,80,0.9)]",
  ghost: "bg-white/10 text-white border border-white/20 hover:bg-white/20",
};

interface GlowButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  variant?: Variant;
  size?: "sm" | "md" | "lg" | "xl";
  sound?: SoundName | null;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  variant = "cyan",
  size = "md",
  sound = "click",
  className,
  children,
  onClick,
  disabled,
  ...rest
}) => {
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-5 py-2.5 text-base rounded-2xl",
    lg: "px-8 py-4 text-xl rounded-2xl",
    xl: "px-12 py-6 text-3xl rounded-3xl",
  };
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={cn(
        "font-display font-bold tracking-wide transition-shadow duration-300 inline-flex items-center justify-center gap-2 cursor-pointer select-none",
        variantClasses[variant],
        sizes[size],
        disabled && "opacity-40 cursor-not-allowed grayscale",
        className
      )}
      disabled={disabled}
      onClick={(e) => {
        if (sound) playSound(sound);
        onClick?.(e);
      }}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { glow?: string }> = ({ className, children, glow, style, ...rest }) => (
  <div
    className={cn("glass rounded-3xl p-5 relative", className)}
    style={{ boxShadow: glow ? `0 0 30px ${glow}33, inset 0 0 0 1px ${glow}55` : undefined, ...style }}
    {...rest}
  >
    {children}
  </div>
);

export const ProgressBar: React.FC<{ value: number; max: number; color?: string; className?: string; showLabel?: boolean }> = ({
  value,
  max,
  color = "#22e5ff",
  className,
  showLabel = true,
}) => {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden border border-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, white)`, boxShadow: `0 0 14px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </div>
      {showLabel && <div className="text-xs mt-1 text-white/70 font-bold text-right">{pct}%</div>}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = "#22e5ff", className }) => (
  <span
    className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider", className)}
    style={{ background: `${color}22`, color, border: `1px solid ${color}66` }}
  >
    {children}
  </span>
);

export const SectionTitle: React.FC<{ kicker?: string; title: React.ReactNode; subtitle?: React.ReactNode; className?: string }> = ({
  kicker,
  title,
  subtitle,
  className,
}) => (
  <div className={cn("text-center space-y-2", className)}>
    {kicker && <div className="text-neon-cyan font-extrabold uppercase tracking-[0.3em] text-sm">{kicker}</div>}
    <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white text-glow-cyan">{title}</h2>
    {subtitle && <p className="text-white/70 text-lg max-w-3xl mx-auto">{subtitle}</p>}
  </div>
);

/* Animated starfield + grid background */
export const Background: React.FC = () => {
  const stars = React.useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 1 + Math.random() * 3,
        d: Math.random() * 3,
      })),
    []
  );
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-space-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(166,107,255,0.25),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(34,229,255,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(255,79,216,0.15),transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 cyber-grid [mask-image:linear-gradient(to_top,rgba(0,0,0,0.9),transparent)]" />
      {stars.map((st) => (
        <div
          key={st.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }}
        />
      ))}
    </div>
  );
};

export const Stars: React.FC<{ count: number; max?: number; size?: string }> = ({ count, max = 5, size = "text-xl" }) => (
  <span className={cn("inline-flex", size)}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} className={i < count ? "text-yellow-300 drop-shadow-[0_0_6px_rgba(255,213,74,0.9)]" : "text-white/20"}>
        ★
      </span>
    ))}
  </span>
);

export const TeamChip: React.FC<{ name: string; emoji: string; hex: string; className?: string }> = ({ name, emoji, hex, className }) => (
  <span
    className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 font-display font-bold", className)}
    style={{ background: `${hex}22`, border: `1px solid ${hex}88`, color: hex }}
  >
    <span>{emoji}</span>
    {name}
  </span>
);
