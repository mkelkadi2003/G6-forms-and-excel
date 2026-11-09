import type { Category, CategoryId, SheetState, Team, TeamColor, Visitor } from "./types";

export const CATEGORIES: Category[] = [
  { id: "bestForm", label: "Best Microsoft Form", max: 20, emoji: "📝", mission: 1, hint: "Does the form work well and have all 4 question types?" },
  { id: "creativeDesign", label: "Creative Design", max: 10, emoji: "🎨", mission: 1, hint: "Is the theme colourful, neat and attractive?" },
  { id: "branching", label: "Branching Logic", max: 10, emoji: "🔀", mission: 1, hint: "Do Robotics and Science visitors see different questions?" },
  { id: "excelFormulas", label: "Accurate Excel Formulas", max: 20, emoji: "🧮", mission: 2, hint: "Are the multiplication and SUM formulas correct?" },
  { id: "bestChart", label: "Best Chart", max: 10, emoji: "📊", mission: 2, hint: "Is the chart clear, labelled and colourful?" },
  { id: "teamwork", label: "Teamwork", max: 10, emoji: "🤝", mission: "both", hint: "Did everyone help, share and listen?" },
  { id: "problemSolving", label: "Problem Solving", max: 20, emoji: "💡", mission: 2, hint: "Did the team solve the 20% budget cut cleverly?" },
];

export const MAX_SCORE = CATEGORIES.reduce((s, c) => s + c.max, 0);

export const TEAM_COLORS: TeamColor[] = [
  { name: "Cyber Cyan", hex: "#22e5ff", from: "from-cyan-400", to: "to-sky-600", ring: "ring-cyan-400" },
  { name: "Pixel Pink", hex: "#ff4fd8", from: "from-pink-400", to: "to-fuchsia-600", ring: "ring-pink-400" },
  { name: "Laser Lime", hex: "#a3ff3c", from: "from-lime-300", to: "to-green-600", ring: "ring-lime-400" },
  { name: "Solar Gold", hex: "#ffd54a", from: "from-yellow-300", to: "to-orange-500", ring: "ring-yellow-400" },
  { name: "Galaxy Purple", hex: "#a66bff", from: "from-violet-400", to: "to-purple-700", ring: "ring-violet-400" },
  { name: "Rocket Red", hex: "#ff5c5c", from: "from-red-400", to: "to-rose-600", ring: "ring-red-400" },
  { name: "Ocean Blue", hex: "#4f7cff", from: "from-blue-400", to: "to-indigo-600", ring: "ring-blue-400" },
  { name: "Mint Fresh", hex: "#3cf0c5", from: "from-emerald-300", to: "to-teal-600", ring: "ring-emerald-400" },
];

export const TEAM_EMOJIS = ["🤖", "🚀", "⚡", "🦾", "🛸", "🧠", "💾", "🔮", "🦊", "🐉", "🦄", "🐯"];

export const DEFAULT_TEAM_NAMES = ["Robo Rangers", "Pixel Pirates", "Data Dragons", "Code Comets"];

export const VISITORS: Visitor[] = [
  {
    id: "robotStudent",
    title: "Student who loves ROBOTICS",
    emoji: "🧑‍🎓🤖",
    description: "You are a Grade 5 student. You can't wait to see the robots! Choose Robotics in the form.",
    checks: ["Did you see Robotics questions?", "Could you type your name?", "Could you pick a date?", "Could you give a star rating?"],
    color: "#22e5ff",
  },
  {
    id: "scienceParent",
    title: "Parent who loves SCIENCE EXPERIMENTS",
    emoji: "👩‍👧🧪",
    description: "You are a parent bringing your child. You want to watch the exciting science experiments!",
    checks: ["Did you see Science Experiment questions?", "Was the form easy to read?", "Could you pick a date?", "Could you give a star rating?"],
    color: "#a3ff3c",
  },
  {
    id: "techTeacher",
    title: "Teacher who loves TECHNOLOGY WORKSHOPS",
    emoji: "👨‍🏫💻",
    description: "You are a teacher from another school. You want to join the technology workshops.",
    checks: ["Was there a choice for you?", "Did the theme look professional?", "Could you type a comment?", "Did the form say thank you at the end?"],
    color: "#ff4fd8",
  },
];

export const MISSION1_TASKS = [
  { title: "Create a Registration Form", emoji: "🆕", detail: "Open Microsoft Forms → New Form. Give it the title: Science & Technology Fair Registration.", xp: 10 },
  { title: "Add 4 Question Types", emoji: "❓", detail: "Add a Choice question (which area do you like?), a Text question (your name), a Rating question (how excited are you? ⭐), and a Date question (which day will you visit?).", xp: 20 },
  { title: "Customize the Theme", emoji: "🎨", detail: "Click Style / Theme. Pick colours and a picture that match a Tech Fair. Make it look amazing!", xp: 10 },
  { title: "Add Branching Logic", emoji: "🔀", detail: "Click ⋯ → Branching. Robotics visitors → go to Robotics questions. Science Experiment visitors → go to Experiment questions.", xp: 20 },
  { title: "Swap & Test Forms", emoji: "🔁", detail: "Share your form link with another team. Test their form using your Secret Visitor identity!", xp: 15 },
];

export const MISSION2_TASKS = [
  { title: "Enter the Budget Data", emoji: "⌨️", detail: "Open Microsoft Excel — or use the practice spreadsheet right here on this page. Type the headings Item, Quantity, Unit Price, Total in row 1, then enter the 4 items.", xp: 10 },
  { title: "Multiply for Each Total", emoji: "✖️", detail: "In the Total column type a formula like =B2*C2 and press Enter. Fill it down for every item.", xp: 20 },
  { title: "Use SUM for the Grand Total", emoji: "➕", detail: "Under the Total column type =SUM(D2:D5) to add everything together.", xp: 15 },
  { title: "Format the Spreadsheet", emoji: "🖌️", detail: "Use the toolbar: turn on Borders, add fill colours to the headings, and press the $ button to format money cells as Currency.", xp: 10 },
  { title: "Create a Chart", emoji: "📊", detail: "In real Excel use Insert → Chart. On this page press the Chart button to make a Column or Pie chart and give it a title!", xp: 15 },
];

export const BUDGET_ITEMS = [
  { item: "Robotics Kits", qty: 5, price: 20, emoji: "🤖" },
  { item: "Science Books", qty: 10, price: 8, emoji: "📚" },
  { item: "Decorations", qty: 4, price: 15, emoji: "🎈" },
  { item: "Snacks", qty: 20, price: 3, emoji: "🍪" },
];

/** Blank worksheet – students type everything themselves. */
export const createEmptySheet = (): SheetState => ({
  cells: {},
  bold: [],
  fills: {},
  currency: [],
  borders: false,
  chart: "none",
  chartTitle: "Tech Fair Budget",
});

export const emptyScores = (): Record<CategoryId, number> => ({
  bestForm: 0,
  creativeDesign: 0,
  branching: 0,
  excelFormulas: 0,
  bestChart: 0,
  teamwork: 0,
  problemSolving: 0,
});

export const makeTeam = (index: number, name?: string): Team => ({
  id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: name ?? DEFAULT_TEAM_NAMES[index % DEFAULT_TEAM_NAMES.length],
  color: TEAM_COLORS[index % TEAM_COLORS.length],
  emoji: TEAM_EMOJIS[index % TEAM_EMOJIS.length],
  scores: emptyScores(),
  visitor: null,
  m1Tasks: MISSION1_TASKS.map(() => false),
  m2Tasks: MISSION2_TASKS.map(() => false),
});

export const totalScore = (t: Team) => Object.values(t.scores).reduce((a, b) => a + b, 0);

export const rankTeams = (teams: Team[]) => [...teams].sort((a, b) => totalScore(b) - totalScore(a));
