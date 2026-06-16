// Shared epic tagging used across the task views (calendar, kanban, list) and
// dashboard so an epic always reads the same way: a stable accent colour plus a
// short, human label derived from the epic's title.

// Stable per-epic accent so the prefix/chip is colour-coded and scannable.
const EPIC_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#ef4444'];

export const epicColor = (id) => {
  const s = String(id || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return EPIC_COLORS[h % EPIC_COLORS.length];
};

// Drop a leading task key ("SLT-50 ") and the "— 5-Month Plan …" boilerplate so
// "SLT-50 PropVantage — 5-Month Plan (Jun–Oct 2026)" → "PropVantage".
export const epicShortName = (title) =>
  String(title || '')
    .replace(/^[A-Z]+-\d+\s*/, '')
    .replace(/\s*[—-]\s*5-Month Plan.*$/i, '')
    .trim();

// First 3 letters of the epic's clean name, uppercased (e.g. "PRO", "SCA").
// Accepts either a task (uses task.parentTask) or a parentTask object directly.
export const epicPrefix = (taskOrParent) => {
  const parent = taskOrParent?.parentTask || taskOrParent;
  if (!parent || (!parent.title && !parent.taskKey)) return null;
  const letters = epicShortName(parent.title || parent.taskKey).replace(/[^A-Za-z0-9]/g, '');
  return letters ? letters.slice(0, 3).toUpperCase() : null;
};
