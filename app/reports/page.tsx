"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  reportStore, notifyReportListeners,
  getSavedReports, saveReport, deleteReport,
  type SavedReport,
} from "../../lib/reportStore";

// ── Blue Raven LR CSV parser ──────────────────────────────────
function parseBlueRavenLR(text: string) {
  const lines   = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const idx     = (name: string) => headers.indexOf(name);

  const iTime     = idx("Flight_Time_(s)");
  const iAltAGL   = idx("Baro_Altitude_AGL_(feet)");
  const iVelUp    = idx("Velocity_Up");
  const iTemp     = idx("Temperature_(F)");
  const iBatt     = idx("Batt_Volts");
  const iTilt     = idx("Tilt_Angle_(deg)");
  const iLiftoff  = idx("Liftoff");
  const iApogee   = idx("Apogee");
  const iApoFire  = idx("Apo_fired");
  const iMainFire = idx("Main_fired");
  const i3rdFire  = idx("3rd_fired");
  const i4thFire  = idx("4th_fired");

  let maxAltAGL     = -Infinity, maxVelUp = -Infinity;
  let maxTilt       = -Infinity, minBatt  = Infinity;
  let flightEnd     = 0;
  let liftoffTime: number | null   = null;
  let apogeeTime: number | null    = null;
  let apoFireTime: number | null   = null;
  let mainFireTime: number | null  = null;
  let thirdFireTime: number | null = null;
  let fourthFireTime: number | null= null;
  let launchTemp: number | null    = null;
  const altChart: { t: number; alt: number }[] = [];
  let sampleCount = 0;

  for (const line of lines.slice(1)) {
    const r    = line.split(",");
    const t    = parseFloat(r[iTime]);
    const alt  = parseFloat(r[iAltAGL]);
    const vel  = parseFloat(r[iVelUp]);
    const tilt = parseFloat(r[iTilt]);
    const batt = parseFloat(r[iBatt]);
    const temp = parseFloat(r[iTemp]);

    if (!isNaN(alt)  && alt  > maxAltAGL) maxAltAGL = alt;
    if (!isNaN(vel)  && vel  > maxVelUp)  maxVelUp  = vel;
    if (!isNaN(tilt) && tilt > maxTilt)   maxTilt   = tilt;
    if (!isNaN(batt) && batt < minBatt)   minBatt   = batt;
    if (!isNaN(t))                        flightEnd = t;

    if (liftoffTime    === null && r[iLiftoff]  === "1") liftoffTime   = t;
    if (apogeeTime     === null && r[iApogee]   === "1") apogeeTime    = t;
    if (apoFireTime    === null && r[iApoFire]  === "1") apoFireTime   = t;
    if (mainFireTime   === null && r[iMainFire] === "1") mainFireTime  = t;
    if (thirdFireTime  === null && i3rdFire >= 0 && r[i3rdFire] === "1") thirdFireTime  = t;
    if (fourthFireTime === null && i4thFire >= 0 && r[i4thFire] === "1") fourthFireTime = t;
    if (launchTemp     === null && liftoffTime !== null && !isNaN(temp)) launchTemp = temp;

    if (sampleCount++ % 5 === 0 && !isNaN(t) && !isNaN(alt) && t >= 0)
      altChart.push({ t: parseFloat(t.toFixed(2)), alt: parseFloat(alt.toFixed(1)) });
  }

  return {
    maxAltAGL:     maxAltAGL === -Infinity ? 0 : parseFloat(maxAltAGL.toFixed(1)),
    maxVelUp:      maxVelUp  === -Infinity ? 0 : parseFloat(maxVelUp.toFixed(1)),
    maxTilt:       maxTilt   === -Infinity ? 0 : parseFloat(maxTilt.toFixed(1)),
    minBatt:       minBatt   === Infinity  ? 0 : parseFloat(minBatt.toFixed(3)),
    flightTime:    flightEnd.toFixed(2),
    liftoffTime:   liftoffTime?.toFixed(2)   ?? null,
    apogeeTime:    apogeeTime?.toFixed(2)    ?? null,
    apoFireTime:   apoFireTime?.toFixed(2)   ?? null,
    mainFireTime:  mainFireTime?.toFixed(2)  ?? null,
    thirdFireTime: thirdFireTime?.toFixed(2) ?? null,
    fourthFireTime:fourthFireTime?.toFixed(2)?? null,
    launchTemp:    launchTemp?.toFixed(1)    ?? null,
    altChart:      altChart.filter((p) => p.t >= 0),
  };
}

function parseBlueRavenHR(text: string) {
  const lines   = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const iAX = headers.indexOf("Accel_X");
  const iAY = headers.indexOf("Accel_Y");
  const iAZ = headers.indexOf("Accel_Z");
  let peak = 0;
  for (const line of lines.slice(1)) {
    const r = line.split(",");
    const ax = parseFloat(r[iAX]), ay = parseFloat(r[iAY]), az = parseFloat(r[iAZ]);
    if (!isNaN(ax) && !isNaN(ay) && !isNaN(az)) {
      const mag = Math.sqrt(ax**2 + ay**2 + az**2);
      if (mag > peak) peak = mag;
    }
  }
  return { peakAccel: parseFloat(peak.toFixed(2)) };
}

// ── Altitude SVG chart ────────────────────────────────────────
function AltChart({ data }: { data: { t: number; alt: number }[] }) {
  if (!data.length) return null;
  const W = 800, H = 160, PAD = 20;
  const maxT   = Math.max(...data.map((d) => d.t));
  const maxAlt = Math.max(...data.map((d) => d.alt));
  const scaleX = (t: number) => PAD + (t / maxT) * (W - PAD * 2);
  const scaleY = (a: number) => H - PAD - (a / maxAlt) * (H - PAD * 2);
  const pts  = data.map((d) => `${scaleX(d.t)},${scaleY(d.alt)}`).join(" ");
  const area = `M${scaleX(data[0].t)},${scaleY(0)} ` +
    data.map((d) => `L${scaleX(d.t)},${scaleY(d.alt)}`).join(" ") +
    ` L${scaleX(data[data.length - 1].t)},${scaleY(0)} Z`;
  const peak = data.reduce((a, b) => a.alt > b.alt ? a : b);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00d9ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#altGrad)" />
      <polyline points={pts} fill="none" stroke="#00d9ff" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={scaleX(peak.t)} cy={scaleY(peak.alt)} r="5"
        fill="#00d9ff" stroke="#0b0f1a" strokeWidth="2">
        <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ── Animated counter ──────────────────────────────────────────
function Counter({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let s = 0;
    const steps = 50;
    const id = setInterval(() => {
      s++;
      if (s >= steps) { setN(value); clearInterval(id); }
      else setN(parseFloat(((value / steps) * s).toFixed(decimals)));
    }, 20);
    return () => clearInterval(id);
  }, [value]);
  return <>{n.toFixed(decimals)}</>;
}

// ── Drag & drop upload zone ───────────────────────────────────
function UploadZone({ label, hint, loaded, onFile }: {
  label: string; hint: string; loaded: boolean; onFile: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      style={{
        border: `2px dashed ${loaded ? "rgba(0,255,159,0.5)" : dragging ? "rgba(0,217,255,0.7)" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "12px", padding: "24px 20px", textAlign: "center",
        cursor: "pointer", transition: "all 0.2s",
        background: loaded ? "rgba(0,255,159,0.04)" : dragging ? "rgba(0,217,255,0.06)" : "rgba(255,255,255,0.02)",
      }}
    >
      <input ref={ref} type="file" accept=".csv" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{loaded ? "✅" : "📂"}</div>
      <div style={{ fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em",
        color: loaded ? "#00ff9f" : "rgba(255,255,255,0.8)" }}>
        {loaded ? `${label} loaded` : label}
      </div>
      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
        {loaded ? "Click to replace" : hint}
      </div>
    </div>
  );
}

// ── Report display ────────────────────────────────────────────
function ReportView({ report, lrName }: { report: any; lrName: string }) {
  const events = [
    { label: "Liftoff",       icon: "🚀", time: report.liftoffTime,    fired: !!report.liftoffTime },
    { label: "Apogee",        icon: "⬆️", time: report.apogeeTime,     fired: !!report.apogeeTime },
    { label: "Apogee Charge", icon: "💥", time: report.apoFireTime,    fired: !!report.apoFireTime },
    { label: "Main Charge",   icon: "🪂", time: report.mainFireTime,   fired: !!report.mainFireTime },
    { label: "3rd Event",     icon: "⚡", time: report.thirdFireTime,  fired: !!report.thirdFireTime },
    { label: "4th Event",     icon: "⚡", time: report.fourthFireTime, fired: !!report.fourthFireTime },
  ].filter((e) => e.fired || ["Liftoff","Apogee","Apogee Charge","Main Charge"].includes(e.label));

  return (
    <div id="report-print">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        flexWrap: "wrap", gap: 16, marginBottom: 28,
        paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", padding: "3px 10px",
              borderRadius: "20px", background: "rgba(0,217,255,0.1)",
              border: "1px solid rgba(0,217,255,0.25)", color: "#00d9ff" }}>
              BLUE RAVEN SN1811
            </span>
            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
              {lrName}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>PLEIADES Mission Report</h2>
        </div>
        <span className="status-badge badge-deployed" style={{ fontSize: "0.75rem", padding: "6px 14px" }}>
          <span className="status-dot dot-green" /> FLIGHT COMPLETE
        </span>
      </div>

      {/* Primary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        {[
          { label: "MAX ALTITUDE AGL", value: report.maxAltAGL, unit: "ft",  color: "#00d9ff" },
          { label: "MAX VELOCITY UP",  value: report.maxVelUp,  unit: "ft/s", color: "#00ff9f" },
          { label: "FLIGHT TIME",      value: parseFloat(report.flightTime), unit: "sec", color: "#ffaa00" },
        ].map(({ label, value, unit, color }) => (
          <div key={label} style={{
            background: "rgba(11,15,26,0.9)", border: `1px solid ${color}22`,
            borderRadius: "14px", padding: "22px", textAlign: "center",
            boxShadow: `0 0 20px ${color}08`,
          }}>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: "2.2rem", fontWeight: 800, color, lineHeight: 1,
              textShadow: `0 0 20px ${color}80` }}>
              <Counter value={value} decimals={1} />
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          ...(report.peakAccel != null ? [{ label: "PEAK ACCEL",  value: report.peakAccel,               unit: "g"  }] : []),
          { label: "MAX TILT",    value: report.maxTilt,                  unit: "°"  },
          { label: "MIN BATTERY", value: report.minBatt,                  unit: "V"  },
          ...(report.launchTemp   ? [{ label: "LAUNCH TEMP", value: parseFloat(report.launchTemp), unit: "°F" }] : []),
        ].map(({ label, value, unit }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "16px", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#00d9ff" }}>
              <Counter value={value} decimals={label === "MIN BATTERY" ? 2 : 1} />
              <span style={{ fontSize: "0.8rem", marginLeft: 3, color: "rgba(255,255,255,0.4)" }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Altitude chart */}
      {report.altChart?.length > 0 && (
        <div style={{ background: "rgba(11,15,26,0.9)", border: "1px solid rgba(0,217,255,0.1)",
          borderRadius: "14px", padding: "24px 24px 16px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)" }}>
                ALTITUDE PROFILE
              </div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                Baro altitude AGL over flight time
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>APOGEE</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#00d9ff" }}>
                {report.maxAltAGL.toFixed(0)} ft
              </div>
            </div>
          </div>
          <AltChart data={report.altChart} />
        </div>
      )}

      {/* Events timeline */}
      <div style={{ background: "rgba(11,15,26,0.9)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px", padding: "24px", marginBottom: 24 }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>FLIGHT EVENTS</div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 19, top: 12, bottom: 12,
            width: 2, background: "rgba(0,217,255,0.15)" }} />
          {events.map((ev, i) => (
            <motion.div key={ev.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "11px 0" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                background: ev.fired ? "rgba(0,217,255,0.12)" : "rgba(255,255,255,0.04)",
                border: `2px solid ${ev.fired ? "rgba(0,217,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
                boxShadow: ev.fired ? "0 0 12px rgba(0,217,255,0.25)" : "none",
              }}>{ev.icon}</div>
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{ev.label}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    {ev.time ? `T + ${ev.time} seconds` : "Event not recorded"}
                  </div>
                </div>
                <span className={`status-badge ${ev.fired ? "badge-deployed" : "badge-armed"}`}
                  style={{ fontSize: "0.7rem" }}>
                  <span className={`status-dot ${ev.fired ? "dot-green" : "dot-yellow"}`} />
                  {ev.fired ? "FIRED" : "NOT FIRED"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 18px", background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px",
        fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
        <span>⬡ PLEIADES Mission Control</span>
        <span>Blue Raven SN1811 · {lrName}</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const [, forceUpdate] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [saveName, setSaveName]   = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [activeView, setActiveView] = useState<"saved" | string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Subscribe to store
  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    reportStore.listeners.add(listener);
    setSavedReports(getSavedReports());
    return () => { reportStore.listeners.delete(listener); };
  }, []);

  function readFile(f: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res(r.result as string);
      r.onerror = () => rej(r.error);
      r.readAsText(f);
    });
  }

  async function handleLR(f: File) {
    reportStore.lrText = await readFile(f);
    reportStore.lrName = f.name;
    reportStore.currentReport = null;
    notifyReportListeners();
  }

  async function handleHR(f: File) {
    reportStore.hrText = await readFile(f);
    reportStore.hrName = f.name;
    notifyReportListeners();
  }

  function generate() {
    if (!reportStore.lrText) { setError("Please upload the Blue Raven LR CSV file first."); return; }
    setError(null);
    setLoading(true);
    setShowSaveInput(false);
    setActiveView(null);
    setTimeout(() => {
      try {
        const lr = parseBlueRavenLR(reportStore.lrText!);
        const hr = reportStore.hrText ? parseBlueRavenHR(reportStore.hrText) : null;
        reportStore.currentReport = { ...lr, peakAccel: hr?.peakAccel ?? null };
        notifyReportListeners();
      } catch (e: any) {
        setError("Failed to parse: " + e.message);
      }
      setLoading(false);
    }, 600);
  }

  function handleSave() {
    if (!reportStore.currentReport) return;
    const name = saveName.trim() || `Flight ${new Date().toLocaleDateString()}`;
    const entry: SavedReport = {
      id:      Date.now().toString(),
      name,
      savedAt: new Date().toLocaleString(),
      lrName:  reportStore.lrName ?? "Unknown",
      data:    reportStore.currentReport,
    };
    saveReport(entry);
    setSavedReports(getSavedReports());
    setSaveName("");
    setShowSaveInput(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  function handleDelete(id: string) {
    deleteReport(id);
    setSavedReports(getSavedReports());
    if (activeView === id) setActiveView(null);
  }

  const { lrText, lrName, hrText, hrName, currentReport } = reportStore;
  const viewingReport = activeView === "current"
    ? currentReport
    : savedReports.find((r) => r.id === activeView)?.data ?? null;
  const viewingLrName = activeView === "current"
    ? (lrName ?? "")
    : savedReports.find((r) => r.id === activeView)?.lrName ?? "";

  return (
    <div style={{ padding: "40px 40px 80px", maxWidth: "960px", margin: "0 auto" }}>

      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(0,217,255,0.2), rgba(0,217,255,0.05))",
            border: "1px solid rgba(0,217,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
          }}>📊</div>
          <h1 style={{ margin: 0 }}>Post-Flight Analysis</h1>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 4, fontSize: "0.9rem" }}>
          Upload Blue Raven CSV exports to generate, save, and review flight reports.
        </p>
      </motion.div>

      {/* ── Upload + Generate ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ marginTop: 32, background: "rgba(11,15,26,0.8)",
          border: "1px solid rgba(0,217,255,0.12)", borderRadius: "16px", padding: "28px",
          boxShadow: "0 0 40px rgba(0,217,255,0.04)" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d9ff",
            boxShadow: "0 0 8px #00d9ff", display: "inline-block" }} />
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)" }}>
            BLUE RAVEN CSV IMPORT
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
              LR FILE — REQUIRED
            </div>
            <UploadZone label="Low Rate CSV" hint="Drag & drop or click to browse" loaded={!!lrText} onFile={handleLR} />
            {lrName && <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.28)", marginTop: 5, textAlign: "center" }}>{lrName}</div>}
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
              HR FILE — OPTIONAL (peak accel)
            </div>
            <UploadZone label="High Rate CSV" hint="Drag & drop or click to browse" loaded={!!hrText} onFile={handleHR} />
            {hrName && <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.28)", marginTop: 5, textAlign: "center" }}>{hrName}</div>}
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: "8px",
            background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.25)",
            color: "#ff4d4d", fontSize: "0.82rem" }}>⚠️ {error}</div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <motion.button onClick={generate} disabled={!lrText || loading}
            whileHover={{ scale: lrText ? 1.02 : 1 }} whileTap={{ scale: lrText ? 0.98 : 1 }}
            style={{ padding: "12px 32px",
              background: lrText ? "#00d9ff" : "rgba(255,255,255,0.08)",
              color: lrText ? "#000" : "rgba(255,255,255,0.3)",
              fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.08em",
              border: "none", borderRadius: "10px", cursor: lrText ? "pointer" : "not-allowed",
              boxShadow: lrText ? "0 0 24px rgba(0,217,255,0.4)" : "none", transition: "all 0.2s",
            }}>
            {loading ? "⚙️  PROCESSING..." : "⚡  GENERATE REPORT"}
          </motion.button>

          {currentReport && (
            <>
              <motion.button onClick={() => { setActiveView("current"); setShowSaveInput(false); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                style={{ padding: "12px 20px", background: "transparent",
                  color: activeView === "current" ? "#00d9ff" : "rgba(255,255,255,0.6)",
                  fontWeight: 600, fontSize: "0.82rem",
                  border: `1px solid ${activeView === "current" ? "rgba(0,217,255,0.5)" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: "10px", cursor: "pointer" }}>
                👁 View Report
              </motion.button>

              <motion.button
                onClick={() => { setShowSaveInput((p) => !p); setActiveView(null); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                style={{ padding: "12px 20px", background: "rgba(0,255,159,0.08)",
                  color: "#00ff9f", fontWeight: 700, fontSize: "0.82rem",
                  border: "1px solid rgba(0,255,159,0.3)", borderRadius: "10px", cursor: "pointer" }}>
                💾 Save Report
              </motion.button>

              <motion.button onClick={() => window.print()}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                style={{ padding: "12px 20px", background: "transparent",
                  color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: "0.82rem",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", cursor: "pointer" }}>
                🖨️ Print
              </motion.button>
            </>
          )}
        </div>

        {/* Save name input */}
        <AnimatePresence>
          {showSaveInput && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center",
                padding: "16px", borderRadius: "10px",
                background: "rgba(0,255,159,0.04)", border: "1px solid rgba(0,255,159,0.15)" }}>
                <input
                  type="text"
                  placeholder={`Flight ${new Date().toLocaleDateString()}`}
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px",
                    padding: "10px 14px", color: "#fff", fontSize: "0.85rem", outline: "none" }}
                />
                <button onClick={handleSave}
                  style={{ padding: "10px 20px", background: "#00ff9f", color: "#000",
                    fontWeight: 800, fontSize: "0.82rem", border: "none", borderRadius: "8px",
                    cursor: "pointer", whiteSpace: "nowrap" }}>
                  Save
                </button>
                <button onClick={() => setShowSaveInput(false)}
                  style={{ padding: "10px 14px", background: "transparent",
                    color: "rgba(255,255,255,0.4)", fontSize: "0.82rem",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {justSaved && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 12, fontSize: "0.8rem", color: "#00ff9f" }}>
              ✓ Report saved successfully
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Saved Reports ── */}
      {savedReports.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2 style={{ margin: 0 }}>Saved Reports</h2>
              <span style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: "20px",
                background: "rgba(0,217,255,0.1)", border: "1px solid rgba(0,217,255,0.2)",
                color: "#00d9ff" }}>{savedReports.length}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {savedReports.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: activeView === r.id ? "rgba(0,217,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeView === r.id ? "rgba(0,217,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: "12px", overflow: "hidden", transition: "all 0.2s" }}>

                {/* Row */}
                <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
                    background: "rgba(0,217,255,0.1)", border: "1px solid rgba(0,217,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                    📊
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>{r.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>
                      {r.savedAt} · {r.lrName}
                    </div>
                  </div>
                  {/* Key stats preview */}
                  <div style={{ display: "flex", gap: 16, marginRight: 8 }}>
                    {[
                      { label: "ALT", value: `${r.data.maxAltAGL?.toFixed(0)} ft` },
                      { label: "VEL", value: `${r.data.maxVelUp?.toFixed(0)} ft/s` },
                      { label: "TIME", value: `${r.data.flightTime}s` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: "center", display: "none" }}
                        className="report-preview-stat">
                        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{label}</div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#00d9ff" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => setActiveView(activeView === r.id ? null : r.id)}
                      style={{ padding: "7px 16px", borderRadius: "7px", fontSize: "0.78rem",
                        fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                        background: activeView === r.id ? "rgba(0,217,255,0.15)" : "rgba(0,217,255,0.08)",
                        color: "#00d9ff", border: "1px solid rgba(0,217,255,0.25)" }}>
                      {activeView === r.id ? "Collapse" : "View"}
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      style={{ padding: "7px 12px", borderRadius: "7px", fontSize: "0.78rem",
                        cursor: "pointer", background: "rgba(255,77,77,0.08)",
                        color: "#ff4d4d", border: "1px solid rgba(255,77,77,0.2)" }}>
                      🗑
                    </button>
                  </div>
                </div>

                {/* Expanded report */}
                <AnimatePresence>
                  {activeView === r.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ padding: "24px" }}>
                        <ReportView report={r.data} lrName={r.lrName} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Current report view ── */}
      <AnimatePresence>
        {activeView === "current" && currentReport && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            style={{ marginTop: 32, background: "rgba(11,15,26,0.9)",
              border: "1px solid rgba(0,217,255,0.15)", borderRadius: "16px",
              padding: "28px", boxShadow: "0 0 40px rgba(0,217,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22,
              paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", padding: "3px 10px",
                borderRadius: "20px", background: "rgba(255,170,0,0.1)",
                border: "1px solid rgba(255,170,0,0.25)", color: "#ffaa00" }}>
                UNSAVED
              </span>
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                Save this report to keep it permanently
              </span>
            </div>
            <ReportView report={currentReport} lrName={lrName ?? ""} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}