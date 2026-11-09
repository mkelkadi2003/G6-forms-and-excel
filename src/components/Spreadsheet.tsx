import React, { Fragment, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CategoryId, SheetState, Team } from "../types";
import { BUDGET_ITEMS, createEmptySheet } from "../data";
import { useGate } from "../GateContext";
import { playSound } from "../sound";
import { SHEET_COLS, SHEET_ROWS, checkSheet, displayValue, evaluateCell, moveRef } from "../sheet";
import { Badge, GlowButton, ProgressBar } from "./ui";

interface Props {
  teams: Team[];
  sheets: Record<string, SheetState>;
  onSheetChange: (teamId: string, sheet: SheetState) => void;
  onScore: (teamId: string, cat: CategoryId, value: number) => void;
  budgetEmergency: boolean;
}

const FILLS = ["#fff2a8", "#c9f7d0", "#cde9ff", "#ffd4ea", "#e4d9ff", "#ffffff"];
const CHART_COLORS = ["#22b8cf", "#f062b5", "#79b52c", "#e5a72b"];

const toggleIn = (arr: string[], ref: string) => (arr.includes(ref) ? arr.filter((x) => x !== ref) : [...arr, ref]);

export const Spreadsheet: React.FC<Props> = ({ teams, sheets, onSheetChange, onScore, budgetEmergency }) => {
  const { requestStep } = useGate();
  const [activeId, setActiveId] = useState(teams[0]?.id ?? "");
  const [selected, setSelected] = useState("A1");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [showChecks, setShowChecks] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const skipCommitRef = useRef(false);

  useEffect(() => {
    if (!teams.some((t) => t.id === activeId)) setActiveId(teams[0]?.id ?? "");
  }, [teams, activeId]);

  const activeTeam = teams.find((t) => t.id === activeId) ?? teams[0];
  const sheet = sheets[activeId] ?? createEmptySheet();
  const update = (patch: Partial<SheetState>) => onSheetChange(activeId, { ...sheet, ...patch });
  const setCell = (ref: string, value: string) => update({ cells: { ...sheet.cells, [ref]: value } });
  const raw = sheet.cells[selected] ?? "";

  const fillStarter = () =>
    requestStep(`Fill starter budget data for ${activeTeam?.name ?? "this team"}`, () => {
      const starter: Record<string, string> = {
        ...sheet.cells,
        A1: "Item",
        B1: "Quantity",
        C1: "Unit Price",
        D1: "Total",
      };
      BUDGET_ITEMS.forEach((b, i) => {
        const r = i + 2;
        starter[`A${r}`] = b.item;
        starter[`B${r}`] = String(b.qty);
        starter[`C${r}`] = String(b.price);
      });
      update({ cells: starter });
      playSound("points");
    });

  const startEdit = (initial: string) => {
    skipCommitRef.current = false;
    setDraft(initial);
    setEditing(true);
  };

  const commit = (value = draft, move: [number, number] = [0, 0]) => {
    skipCommitRef.current = true; // the input's blur must not commit a second time
    setCell(selected, value);
    setEditing(false);
    if (move[0] || move[1]) setSelected(moveRef(selected, move[0], move[1]));
    window.setTimeout(() => gridRef.current?.focus(), 0);
  };

  const cancelEdit = () => {
    skipCommitRef.current = true;
    setEditing(false);
    gridRef.current?.focus();
  };

  const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editing) return;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [dr, dc] = moves[e.key];
      setSelected((s) => moveRef(s, dr, dc));
    } else if (e.key === "Tab") {
      e.preventDefault();
      setSelected((s) => moveRef(s, 0, e.shiftKey ? -1 : 1));
    } else if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      startEdit(raw);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      setCell(selected, "");
      playSound("click");
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      startEdit(e.key);
    }
  };

  const chartData = [2, 3, 4, 5].map((r, i) => ({
    label: String(evaluateCell(`A${r}`, sheet.cells) || `Item ${i + 1}`),
    value: (() => {
      const v = evaluateCell(`D${r}`, sheet.cells);
      return typeof v === "number" ? v : 0;
    })(),
    color: CHART_COLORS[i],
  }));
  const chartTotal = chartData.reduce((s, d) => s + Math.max(0, d.value), 0);
  const checks = checkSheet(sheet, budgetEmergency);
  const passed = checks.filter((c) => c.ok).length;
  const formulaChecks = checks.filter((c) => /formula|SUM|cut|budget/i.test(c.label));
  const formulasOk = formulaChecks.length > 0 && formulaChecks.every((c) => c.ok);
  const chartOk = checks.some((c) => c.label.includes("chart") && c.ok);

  if (!activeTeam) return null;

  return (
    <div className="rounded-3xl overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_40px_rgba(52,211,153,0.25)]">
      {/* Excel-like title bar */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-white font-display font-extrabold">
          <span className="text-2xl">📗</span>
          <span>Tech Fair Budget.xlsx</span>
          <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-bold">Practice Spreadsheet</span>
        </div>
        <Badge color="#ffffff">⌨️ Click a cell and start typing!</Badge>
      </div>

      {/* Team tabs */}
      <div className="bg-slate-100 px-3 pt-2 flex gap-1 overflow-x-auto border-b border-slate-300">
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              playSound("click");
              setActiveId(t.id);
              setSelected("A1");
              setEditing(false);
              setShowChecks(false);
            }}
            className={`px-3 py-2 rounded-t-xl font-display font-bold text-sm whitespace-nowrap cursor-pointer transition-all ${
              t.id === activeId ? "bg-white text-slate-800 shadow" : "bg-slate-200 text-slate-500 hover:bg-slate-300"
            }`}
            style={t.id === activeId ? { borderTop: `3px solid ${t.color.hex}` } : undefined}
          >
            {t.emoji} {t.name}
          </button>
        ))}
        <div className="ml-auto self-center pr-2 text-xs font-bold text-slate-400 hidden sm:block">One saved sheet per team</div>
      </div>

      {/* Ribbon / toolbar */}
      <div className="bg-white px-3 py-2 flex flex-wrap items-center gap-2 border-b border-slate-200 text-slate-700">
        <span className="text-xs uppercase tracking-widest font-extrabold text-slate-400 mr-1">Toolbar</span>
        <button
          onClick={() => {
            playSound("click");
            update({ bold: toggleIn(sheet.bold, selected) });
          }}
          className={`px-3 py-1.5 rounded-lg border font-extrabold text-sm cursor-pointer ${sheet.bold.includes(selected) ? "bg-emerald-100 border-emerald-500" : "bg-slate-50 border-slate-300"}`}
          title="Bold selected cell"
        >
          <b>B</b>
        </button>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-300">
          <span className="text-xs font-bold">🎨</span>
          {FILLS.map((c) => (
            <button
              key={c}
              onClick={() => {
                playSound("click");
                update({ fills: { ...sheet.fills, [selected]: c } });
              }}
              className="h-6 w-6 rounded-md border border-slate-400 hover:scale-110 transition-transform cursor-pointer"
              style={{ background: c }}
              title="Fill selected cell"
            />
          ))}
        </div>
        <button
          onClick={() => {
            playSound("click");
            update({ currency: toggleIn(sheet.currency, selected) });
          }}
          className={`px-3 py-1.5 rounded-lg border font-extrabold text-sm cursor-pointer ${sheet.currency.includes(selected) ? "bg-emerald-100 border-emerald-500" : "bg-slate-50 border-slate-300"}`}
          title="Currency format for selected cell"
        >
          $
        </button>
        <button
          onClick={() => {
            playSound("click");
            update({ borders: !sheet.borders });
          }}
          className={`px-3 py-1.5 rounded-lg border font-extrabold text-sm cursor-pointer ${sheet.borders ? "bg-emerald-100 border-emerald-500" : "bg-slate-50 border-slate-300"}`}
          title="Toggle thick borders"
        >
          ▦ Borders
        </button>
        <div className="h-6 w-px bg-slate-300 mx-1" />
        <span className="text-xs font-bold">📊 Chart:</span>
        {(["none", "column", "pie"] as const).map((c) => (
          <button
            key={c}
            onClick={() => {
              playSound("click");
              update({ chart: c });
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-extrabold capitalize cursor-pointer ${
              sheet.chart === c ? "bg-emerald-600 text-white border-emerald-700" : "bg-slate-50 border-slate-300"
            }`}
          >
            {c === "none" ? "Off" : c}
          </button>
        ))}
        <div className="h-6 w-px bg-slate-300 mx-1" />
        <button
          onClick={fillStarter}
          className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-300 text-sky-800 text-xs font-extrabold cursor-pointer"
          title="Teacher helper: fill the item names, quantities and prices (no totals)"
        >
          📋 Fill starter data
        </button>
        <button
          disabled={!budgetEmergency}
          onClick={() => {
            playSound("points");
            update({ cells: { ...sheet.cells, A7: "20% CUT", A8: "NEW BUDGET" } });
          }}
          className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-300 text-red-700 text-xs font-extrabold cursor-pointer disabled:opacity-40"
          title={budgetEmergency ? "Add labels for the budget emergency rows" : "Available after the Budget Emergency"}
        >
          🚨 Add cut rows
        </button>
        <button
          onClick={() =>
            requestStep(`Clear ${activeTeam.name}'s practice sheet`, () => {
              onSheetChange(activeId, createEmptySheet());
              setShowChecks(false);
            })
          }
          className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-extrabold cursor-pointer"
        >
          ↺ Clear sheet
        </button>
      </div>

      {/* Formula bar */}
      <div className="bg-white px-3 py-2 flex items-center gap-2 border-b border-slate-200 text-slate-800">
        <div className="w-16 rounded-md border border-slate-300 px-2 py-1 font-mono font-bold text-center text-sm">{selected}</div>
        <span className="font-display font-extrabold text-emerald-700 italic">fx</span>
        <input
          value={editing ? draft : raw}
          onChange={(e) => {
            if (editing) setDraft(e.target.value);
            setCell(selected, e.target.value);
          }}
          placeholder="Type a value or a formula, e.g. =B2*C2  or  =SUM(D2:D5)"
          className="flex-1 min-w-0 rounded-md border border-slate-300 px-3 py-1.5 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          aria-label="Formula bar"
        />
      </div>

      {/* Grid */}
      <div className="bg-white overflow-x-auto">
        <div
          ref={gridRef}
          tabIndex={0}
          onKeyDown={onGridKeyDown}
          className="grid min-w-[760px] outline-none select-none"
          style={{ gridTemplateColumns: `44px repeat(${SHEET_COLS.length}, minmax(110px, 1fr))` }}
        >
          <div className="grid contents">
            <div className="bg-slate-200 border border-slate-300" />
            {SHEET_COLS.map((c) => (
              <div key={c} className="bg-slate-200 border border-slate-300 text-center text-xs font-extrabold text-slate-600 py-1">
                {c}
              </div>
            ))}
            {Array.from({ length: SHEET_ROWS }, (_, i) => i + 1).map((r) => (
              <Fragment key={r}>
                <div className="bg-slate-200 border border-slate-300 text-center text-xs font-extrabold text-slate-600 flex items-center justify-center">
                  {r}
                </div>
                {SHEET_COLS.map((c) => {
                  const ref = `${c}${r}`;
                  const value = evaluateCell(ref, sheet.cells);
                  const isError = typeof value === "string" && value.startsWith("#");
                  const isSelected = selected === ref;
                  return (
                    <div
                      key={ref}
                      onClick={() => {
                        if (editing && selected !== ref) commit(draft);
                        setSelected(ref);
                        setEditing(false);
                        gridRef.current?.focus();
                      }}
                      onDoubleClick={() => {
                        setSelected(ref);
                        startEdit(sheet.cells[ref] ?? "");
                      }}
                      className={`relative min-h-[38px] flex items-center px-2 text-sm cursor-cell transition-colors ${
                        sheet.borders ? "border-2 border-emerald-600/60" : "border border-slate-200"
                      } ${isSelected ? "ring-2 ring-emerald-600 z-10" : ""} ${sheet.bold.includes(ref) ? "font-extrabold" : ""}`}
                      style={{ background: sheet.fills[ref] ?? (r === 1 ? "#eef7f0" : "#ffffff") }}
                    >
                      {editing && isSelected ? (
                        <input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commit(draft, [1, 0]);
                            } else if (e.key === "Tab") {
                              e.preventDefault();
                              commit(draft, [0, 1]);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                          onBlur={() => {
                            if (skipCommitRef.current) {
                              skipCommitRef.current = false;
                              return;
                            }
                            if (editing) commit(draft);
                          }}
                          className="absolute inset-0 w-full h-full px-2 bg-white outline-none font-mono text-sm ring-2 ring-emerald-600"
                          aria-label={`Edit cell ${ref}`}
                        />
                      ) : (
                        <span className={`truncate font-mono ${isError ? "text-red-600 font-bold" : typeof value === "number" ? "text-slate-800 text-right w-full" : "text-slate-700"}`}>
                          {displayValue(value, sheet.currency.includes(ref))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Sheet tab strip */}
      <div className="bg-slate-100 border-t border-slate-300 px-3 py-1 flex items-center gap-3 text-xs font-bold text-slate-600">
        <span className="bg-white px-3 py-1 rounded-t-md border-t-2 border-emerald-600">Budget</span>
        <span>➕</span>
        <span className="ml-auto text-slate-400">Keys: type to edit · Enter ↓ · Tab → · arrows to move · Delete to clear</span>
      </div>

      {/* Chart + checker area */}
      <div className="bg-slate-50 p-4 grid lg:grid-cols-2 gap-4">
        {/* Chart */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="font-display font-extrabold text-slate-800 text-lg">📊 Embedded Chart</h4>
            <input
              value={sheet.chartTitle}
              onChange={(e) => update({ chartTitle: e.target.value })}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
              aria-label="Chart title"
            />
          </div>
          {sheet.chart === "none" ? (
            <div className="h-52 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 font-bold text-center gap-2">
              <span className="text-5xl">📈</span>
              <span>Press a Chart button in the toolbar after you enter your totals.</span>
            </div>
          ) : sheet.chart === "column" ? (
            <div className="h-52 flex items-end justify-around gap-3 border-b-2 border-l-2 border-slate-300 px-3 pb-1 pt-4">
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full flex-1 gap-1">
                  <span className="text-[10px] font-extrabold text-slate-600">${d.value.toFixed(0)}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${chartTotal ? Math.max(3, (Math.max(0, d.value) / Math.max(...chartData.map((x) => Math.max(0, x.value)), 1)) * 100) : 3}%` }}
                    transition={{ type: "spring", stiffness: 90 }}
                    className="w-full max-w-16 rounded-t-md"
                    style={{ background: d.color, minHeight: 4 }}
                  />
                  <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">{d.label.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center gap-5">
              <div
                className="h-36 w-36 rounded-full shadow-inner border-4 border-white"
                style={{
                  background:
                    chartTotal > 0
                      ? `conic-gradient(${chartData
                          .reduce<{ acc: number; parts: string[] }>(
                            (o, d) => {
                              const start = o.acc;
                              const pct = (Math.max(0, d.value) / chartTotal) * 100;
                              o.parts.push(`${d.color} ${start}% ${start + pct}%`);
                              o.acc += pct;
                              return o;
                            },
                            { acc: 0, parts: [] }
                          )
                          .parts.join(", ")})`
                      : "#e2e8f0",
                }}
              />
              <div className="space-y-1 text-xs font-bold text-slate-600">
                {chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
                    <span className="truncate max-w-28">{d.label}</span>
                    <span>${d.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 font-bold text-center">{sheet.chartTitle || "Tech Fair Budget"} · data from A2:A5 and D2:D5</p>
        </div>

        {/* Checker */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="font-display font-extrabold text-slate-800 text-lg">✅ Check My Work</h4>
            <GlowButton size="sm" variant="lime" onClick={() => setShowChecks((s) => !s)}>
              {showChecks ? "Hide results" : "🔍 Check my work"}
            </GlowButton>
          </div>
          {showChecks ? (
            <>
              <ProgressBar value={passed} max={checks.length} color="#16a34a" showLabel={false} />
              <div className="text-sm font-extrabold text-slate-600">
                {passed} / {checks.length} checks passed {passed === checks.length ? "🎉 Perfect workbook!" : "— keep going!"}
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {checks.map((c, i) => (
                  <div key={i} className={`rounded-lg px-2 py-1.5 text-xs font-bold flex items-start gap-2 ${c.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                    <span>{c.ok ? "✅" : "⬜"}</span>
                    <span className="flex-1">
                      {c.label}
                      {!c.ok && <span className="block font-normal text-[11px] opacity-70">Hint: {c.hint}</span>}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  disabled={!formulasOk}
                  onClick={() =>
                    requestStep(`Award 20 Excel formula points to ${activeTeam.name}`, () => {
                      onScore(activeId, "excelFormulas", 20);
                      playSound("success");
                    })
                  }
                  className="px-3 py-2 rounded-xl bg-yellow-300 text-space-950 text-xs font-extrabold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ⭐ Award 20 pts · Formulas
                </button>
                <button
                  disabled={!chartOk}
                  onClick={() =>
                    requestStep(`Award 10 chart points to ${activeTeam.name}`, () => {
                      onScore(activeId, "bestChart", 10);
                      playSound("points");
                    })
                  }
                  className="px-3 py-2 rounded-xl bg-cyan-300 text-space-950 text-xs font-extrabold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ⭐ Award 10 pts · Chart
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-bold">Award buttons are teacher-only (password required).</p>
            </>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 font-bold text-center gap-2">
              <span className="text-5xl">🧮</span>
              <span>Type the data, formulas and formatting, then press “Check my work”.</span>
            </div>
          )}
        </div>
      </div>

      {/* Emergency banner */}
      {budgetEmergency && (
        <div className="bg-red-600 text-white px-4 py-3 text-center font-display font-extrabold text-lg animate-alarm">
          🚨 BUDGET EMERGENCY! Add formulas in D7 (=D6*20%) and D8 (=D6-D7) — press “Add cut rows” for the labels.
        </div>
      )}

      <div className="bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 text-center border-t border-emerald-200">
        ℹ️ This practice grid works just like Excel. Your teacher still wants the real workbook built in Microsoft Excel too!
      </div>
    </div>
  );
};
