import React from "react";
import rawLogo from "../../branding/al-bassam-schools.svg?raw";
import rawEmblem from "../../branding/al-bassam-emblem.svg?raw";
import { cn } from "../utils/cn";

const svgAttr = /width="[^"]*"\s+height="[^"]*"/;

const LOGO = rawLogo.replace(svgAttr, 'width="100%" height="auto"');
const EMBLEM = rawEmblem.replace(svgAttr, 'width="100%" height="100%"');

/** Full Al-Bassam Schools lockup (English + emblem + Arabic) on a white plate. */
export const SchoolLogo: React.FC<{ className?: string; title?: string }> = ({ className, title = "Al-Bassam Schools – مدارس البسام" }) => (
  <span
    className={cn("inline-block overflow-hidden rounded-2xl bg-white shadow-lg", className)}
    role="img"
    aria-label={title}
    dangerouslySetInnerHTML={{ __html: LOGO }}
  />
);

/** Compact round emblem, ideal for the game header and certificates. */
export const SchoolEmblem: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn("inline-block shrink-0 rounded-full overflow-hidden", className)}
    role="img"
    aria-label="Al-Bassam Schools"
    dangerouslySetInnerHTML={{ __html: EMBLEM }}
  />
);

/** Small "presented by" badge for the opening screen. */
export const BrandBadge: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("inline-flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-2 shadow-[0_0_24px_rgba(255,255,255,0.25)]", className)}>
    <SchoolEmblem className="h-10 w-10" />
    <div className="text-left leading-tight">
      <div className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-slate-500">Presented by</div>
      <div className="font-display font-extrabold text-lg text-[#191650]">Al-Bassam Schools</div>
    </div>
  </div>
);

/** Global footer shown on every screen (hidden when printing certificates). */
export const BrandFooter: React.FC = () => (
  <footer className="no-print pb-8 pt-4">
    <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-3 text-center">
      <SchoolLogo className="w-56 md:w-72" />
      <p className="text-xs md:text-sm font-bold text-white/45">
        © {new Date().getFullYear()} Al-Bassam Schools · ICT Department · Made for the Science &amp; Technology Fair
      </p>
      <p className="text-[11px] text-white/30">Students build their real work in Microsoft Forms and Microsoft Excel — this game guides and rewards them.</p>
    </div>
  </footer>
);
