// ── Session store — survives tab navigation ───────────────────
export const reportStore = {
  lrText:        null as string | null,
  lrName:        null as string | null,
  hrText:        null as string | null,
  hrName:        null as string | null,
  currentReport: null as any,
  listeners:     new Set<() => void>(),
};

export function notifyReportListeners() {
  reportStore.listeners.forEach((fn) => fn());
}

// ── Saved reports — persists across browser refreshes ─────────
export interface SavedReport {
  id:        string;
  name:      string;
  savedAt:   string;
  lrName:    string;
  data:      any;
}

export function getSavedReports(): SavedReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("pleiades_reports") || "[]");
  } catch { return []; }
}

export function saveReport(report: SavedReport) {
  const existing = getSavedReports();
  existing.unshift(report);
  localStorage.setItem("pleiades_reports", JSON.stringify(existing));
}

export function deleteReport(id: string) {
  const existing = getSavedReports().filter((r) => r.id !== id);
  localStorage.setItem("pleiades_reports", JSON.stringify(existing));
}