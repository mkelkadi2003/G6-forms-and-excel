import type { SheetState } from "./types";
import { BUDGET_ITEMS } from "./data";

export const SHEET_COLS = ["A", "B", "C", "D", "E", "F"];
export const SHEET_ROWS = 10;

export type CellValue = number | string;

export const colToNumber = (col: string) =>
  col.split("").reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);

export const numberToCol = (n: number) => {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

export const rangeRefs = (range: string): string[] => {
  const m = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) return [];
  const c1 = colToNumber(m[1]);
  const c2 = colToNumber(m[3]);
  const r1 = Number(m[2]);
  const r2 = Number(m[4]);
  const out: string[] = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) out.push(`${numberToCol(c)}${r}`);
  }
  return out.slice(0, 400);
};

export const moveRef = (ref: string, dRow: number, dCol: number): string => {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  if (!m) return ref;
  const c = Math.max(1, Math.min(SHEET_COLS.length, colToNumber(m[1]) + dCol));
  const r = Math.max(1, Math.min(SHEET_ROWS, Number(m[2]) + dRow));
  return `${numberToCol(c)}${r}`;
};

/** Tiny safe arithmetic parser (no eval / new Function, so it works under strict CSP). */
const evalArithmetic = (expr: string): number | null => {
  const clean = expr.replace(/\s+/g, "");
  const tokens = clean.match(/\d+\.?\d*|[()+*/-]/g);
  if (!tokens || tokens.join("") !== clean) return null;
  let pos = 0;

  const factor = (): number | null => {
    const t = tokens[pos];
    if (t === undefined) return null;
    if (t === "-") {
      pos++;
      const v = factor();
      return v === null ? null : -v;
    }
    if (t === "+") {
      pos++;
      return factor();
    }
    if (t === "(") {
      pos++;
      const v = expression();
      if (v === null || tokens[pos] !== ")") return null;
      pos++;
      return v;
    }
    if (/^\d/.test(t)) {
      pos++;
      return Number(t);
    }
    return null;
  };

  const term = (): number | null => {
    let v = factor();
    if (v === null) return null;
    while (tokens[pos] === "*" || tokens[pos] === "/") {
      const op = tokens[pos++];
      const r = factor();
      if (r === null) return null;
      v = op === "*" ? v * r : v / r;
      if (!Number.isFinite(v)) return null;
    }
    return v;
  };

  const expression = (): number | null => {
    let v = term();
    if (v === null) return null;
    while (tokens[pos] === "+" || tokens[pos] === "-") {
      const op = tokens[pos++];
      const r = term();
      if (r === null) return null;
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };

  const result = expression();
  return pos === tokens.length && result !== null && Number.isFinite(result) ? result : null;
};

/** Evaluate one cell, following references and SUM ranges recursively. */
export const evaluateCell = (ref: string, cells: Record<string, string>, stack: Set<string> = new Set()): CellValue => {
  if (stack.has(ref)) return "#CYCLE!";
  const raw = (cells[ref] ?? "").trim();
  if (!raw) return "";
  if (!raw.startsWith("=")) {
    if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
    return raw;
  }

  const next = new Set(stack);
  next.add(ref);
  let expr = raw.slice(1).trim();

  // SUM(D2:D5), SUM(D2,D3) etc.
  expr = expr.replace(/SUM\(([^()]*)\)/gi, (_all, args: string) => {
    let sum = 0;
    for (const part of args.split(",")) {
      const token = part.trim().toUpperCase();
      if (!token) continue;
      if (/^[A-Z]+\d+:[A-Z]+\d+$/.test(token)) {
        for (const r of rangeRefs(token)) {
          const v = evaluateCell(r, cells, next);
          if (typeof v === "number") sum += v;
        }
      } else {
        const v = evaluateCell(token, cells, next);
        if (typeof v === "number") sum += v;
      }
    }
    return `(${sum})`;
  });

  // 20% → (20/100)
  expr = expr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

  // Replace cell references with their values and propagate any cell errors.
  let refError: string | null = null;
  expr = expr.replace(/\b([A-Z]{1,2}\d{1,3})\b/gi, (m) => {
    const v = evaluateCell(m.toUpperCase(), cells, next);
    if (typeof v === "number") return `(${v})`;
    if (v === "") return "0";
    refError = refError ?? (typeof v === "string" && v.startsWith("#") ? v : "#VALUE!");
    return "0";
  });

  if (refError) return refError;
  if (expr.includes("#")) return "#REF!";
  if (/[A-Za-z]/.test(expr)) return "#NAME?";
  const value = evalArithmetic(expr);
  return value === null ? "#ERROR!" : Math.round(value * 100) / 100;
};

export const displayValue = (v: CellValue, currency: boolean): string => {
  if (typeof v === "number") return currency ? `$${v.toFixed(2)}` : String(v);
  return v;
};

export interface SheetCheck {
  label: string;
  ok: boolean;
  hint: string;
}

/** Auto-checker used by the "Check my work" button. */
export const checkSheet = (sheet: SheetState, emergency: boolean): SheetCheck[] => {
  const v = (ref: string) => evaluateCell(ref, sheet.cells);
  const raw = (ref: string) => (sheet.cells[ref] ?? "").replace(/\s/g, "").toUpperCase();
  const grandTotal = BUDGET_ITEMS.reduce((sum, b) => sum + b.qty * b.price, 0);
  const cut = Math.round(grandTotal * 0.2 * 100) / 100;
  const newBudget = Math.round(grandTotal * 0.8 * 100) / 100;
  const checks: SheetCheck[] = [];

  checks.push({
    label: "Headings in row 1",
    ok: /item/i.test(String(v("A1"))) && /quantity/i.test(String(v("B1"))) && /price/i.test(String(v("C1"))) && /total/i.test(String(v("D1"))),
    hint: "A1=Item, B1=Quantity, C1=Unit Price, D1=Total",
  });

  BUDGET_ITEMS.forEach((b, i) => {
    const r = i + 2;
    const word = b.item.split(" ")[0].toLowerCase();
    checks.push({
      label: `Row ${r}: ${b.item} data`,
      ok: String(v(`A${r}`)).toLowerCase().includes(word) && Number(v(`B${r}`)) === b.qty && Number(v(`C${r}`)) === b.price,
      hint: `${b.item}, ${b.qty}, ${b.price}`,
    });
    checks.push({
      label: `D${r} formula = $${b.qty * b.price}`,
      ok: raw(`D${r}`).startsWith("=") && Number(v(`D${r}`)) === b.qty * b.price,
      hint: `=B${r}*C${r}`,
    });
  });

  checks.push({
    label: `D6 uses SUM and equals $${grandTotal}`,
    ok: raw("D6").includes("SUM") && Number(v("D6")) === grandTotal,
    hint: "=SUM(D2:D5)",
  });
  checks.push({
    label: "Borders + Currency formatting",
    ok: sheet.borders && sheet.currency.length > 0,
    hint: "Use the Borders and $ buttons in the toolbar",
  });
  checks.push({
    label: "A chart has been inserted",
    ok: sheet.chart !== "none",
    hint: "Press the Chart button and choose Column or Pie",
  });

  if (emergency) {
    checks.push({
      label: `D7 calculates the 20% cut ($${cut})`,
      ok: raw("D7").startsWith("=") && Math.abs(Number(v("D7")) - cut) < 0.01,
      hint: "=D6*20% or =D6*0.2",
    });
    checks.push({
      label: `D8 shows the new budget ($${newBudget})`,
      ok: raw("D8").startsWith("=") && Math.abs(Number(v("D8")) - newBudget) < 0.01,
      hint: "=D6-D7 or =D6*0.8",
    });
  }

  return checks;
};
