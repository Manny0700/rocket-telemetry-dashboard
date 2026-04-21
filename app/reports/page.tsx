"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { store, clearFlightLog } from "../../lib/telemetryStore";

// ── Unit helpers ──────────────────────────────────────────────
const mToFt   = (m: number)  => m  * 3.28084;
const msToFts = (ms: number) => ms * 3.28084;

// ── Animated stat number ──────────────────────────────────────
function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useState(() => {
    let step = 0;
    const steps = 40;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) { setDisplay(value); clearInterval(timer); }
      else setDisplay(parseFloat(((value / steps) * step).toFixed(decimals)));
    }, 25);
  });
  return <span>{display.toFixed(decimals)}</span>;
}

// ── Build reports ─────────────────────────────────────────────
const buildReports = [
  { id: 2, title: "M2", href: "/reports/M2.pdf" },
  { id: 3, title: "M3", href: "/reports/M3.pdf" },
  { id: 4, title: "M4", href: "/reports/M4.pdf" },
  { id: 5, title: "M5", href: "/reports/M5.pdf" },
  { id: 6, title: "M6", href: "/reports/M6.pdf" },
];

// ── CSV parser for Blue Raven LR file ─────────────────────────
function parseBlueRavenLR(text: string) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const idx = (name: string) => headers.indexOf(name);
  const iTime    = idx("Flight_Time_(s)");
  const iAltAGL  = idx("Baro_Altitude_AGL_(feet)");
  const iAltASL  = idx("Baro_Altitude_ASL_(feet)");
  const iVelUp   = idx("Velocity_Up");
  const iTemp    = idx("Temperature_(F)");
  const iBatt    = idx("Batt_Volts");
  const iLiftoff = idx("Liftoff");
  const iApogee  = idx("Apogee");
  const iApoFire = idx("Apo_fired");
  const iMainFire= idx("Main_fired");
  const i3rdFire = idx("3rd_fired");
  const iTilt    = idx("Tilt_Angle_(deg)");

  const rows = lines.slice(1).map((l) => l.split(","));

  let maxAltAGL   = -Infinity;
  let maxVelUp    = -Infinity;
  let maxTilt     = -Infinity;
  let minBatt     = Infinity;
  let flightTime  = 0;
  let liftoffTime: number | null = null;
  let apogeeTime: number | null  = null;
  let apoFireTime: number | null = null;
  let mainFireTime: number | null = null;
  let thirdFireTime: number | null = null;
  let launchTemp: number | null = null;

  for (const r of rows) {
    const t       = parseFloat(r[iTime]);
    const altAGL  = parseFloat(r[iAltAGL]);
    const velUp   = parseFloat(r[iVelUp]);
    const tilt    = parseFloat(r[iTilt]);
    const batt    = parseFloat(r[iBatt]);
    const temp    = parseFloat(r[iTemp]);

    if (!isNaN(altAGL) && altAGL > maxAltAGL) maxAltAGL = altAGL;
    if (!isNaN(velUp)  && velUp  > maxVelUp)  maxVelUp  = velUp;
    if (!isNaN(tilt)   && tilt   > maxTilt)   maxTilt   = tilt;
    if (!isNaN(batt)   && batt   < minBatt)   minBatt   = batt;
    if (!isNaN(t)) flightTime = t;

    if (liftoffTime === null  && r[iLiftoff]  === "1") liftoffTime  = t;
    if (apogeeTime === null   && r[iApogee]   === "1") apogeeTime   = t;
    if (apoFireTime === null  && r[iApoFire]  === "1") apoFireTime  = t;
    if (mainFireTime === null && r[iMainFire] === "1") mainFireTime = t;
    if (thirdFireTime === null && i3rdFire >= 0 && r[i3rdFire] === "1") thirdFireTime = t;
    if (launchTemp === null && liftoffTime !== null && !isNaN(temp)) launchTemp = temp;
  }

  return {
    maxAltAGL:    maxAltAGL === -Infinity ? 0 : maxAltAGL,
    maxVelUp:     maxVelUp  === -Infinity ? 0 : maxVelUp,
    maxTilt:      maxTilt   === -Infinity ? 0 : maxTilt,
    minBatt:      minBatt   === Infinity  ? 0 : minBatt,
    flightTime:   flightTime.toFixed(2),
    liftoffTime:  liftoffTime?.toFixed(2) ?? "N/A",
    apogeeTime:   apogeeTime?.toFixed(2)  ?? "N/A",
    apoFireTime:  apoFireTime?.toFixed(2) ?? "N/A",
    mainFireTime: mainFireTime?.toFixed(2) ?? "N/A",
    thirdFireTime:thirdFireTime?.toFixed(2) ?? "N/A",
    launchTemp:   launchTemp?.toFixed(1) ?? "N/A",
  };
}

// ── CSV parser for Blue Raven HR file ─────────────────────────
function parseBlueRavenHR(text: string) {
  const lines   = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const idx = (name: string) => headers.indexOf(name);
  const iAX = idx("Accel_X");
  const iAY = idx("Accel_Y");
  const iAZ = idx("Accel_Z");

  let peakAccel = 0;
  for (const line of lines.slice(1)) {
    const r  = line.split(",");
    const ax = parseFloat(r[iAX]);
    const ay = parseFloat(r[iAY]);
    const az = parseFloat(r[iAZ]);
    if (!isNaN(ax) && !isNaN(ay) && !isNaN(az)) {
      const mag = Math.sqrt(ax ** 2 + ay ** 2 + az ** 2);
      if (mag > peakAccel) peakAccel = mag;
    }
  }
  return { peakAccel };
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px", padding: "16px 20px",
    }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ color: "#00d9ff", fontSize: "1.3rem", fontWeight: "bold" }}>
        {typeof value === "number"
          ? <><AnimatedNumber value={value} />{unit && <span style={{ fontSize: "0.85rem", marginLeft: 4 }}>{unit}</span>}</>
          : <>{value}{unit && <span style={{ fontSize: "0.85rem", marginLeft: 4 }}>{unit}</span>}</>
        }
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const [liveReport, setLiveReport]   = useState<any>(null);
  const [brReport, setBrReport]       = useState<any>(null);
  const [brError, setBrError]         = useState<string | null>(null);
  const [openReports, setOpenReports] = useState<Set<number>>(new Set());
  const lrRef  = useRef<HTMLInputElement>(null);
  const hrRef  = useRef<HTMLInputElement>(null);
  const [lrFile, setLrFile] = useState<string | null>(null);
  const [hrFile, setHrFile] = useState<string | null>(null);

  // Toggle collapsible report
  function toggleReport(id: number) {
    setOpenReports((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Generate live ESP32 report ──
  function generateLiveReport() {
    const log = store.flightLog;
    if (log.length === 0) {
      alert("No flight data yet. Connect the ESP32 and let it transmit on the Telemetry page first.");
      return;
    }
    const maxAltFt   = mToFt(Math.max(...log.map((d) => d.alt)));
    const maxVelFts  = msToFts(Math.max(...log.map((d) => d.vel)));
    const peakAccel  = Math.max(...log.map((d) => Math.sqrt(d.ax**2 + d.ay**2 + d.az**2)));
    const avgRssi    = Math.round(log.filter((d) => d.rssi).reduce((a, b) => a + b.rssi, 0) / log.filter((d) => d.rssi).length);
    const flightTime = log[log.length - 1].time.toFixed(1);
    const totalPkts  = log.length;
    const apogee     = log.reduce((a, b) => a.alt > b.alt ? a : b);
    const servoEvt   = log.find((d) => d.servo === 1);
    const fix3d      = Math.round((log.filter((d) => d.fix === 3).length / totalPkts) * 100);
    setLiveReport({ maxAltFt, maxVelFts, peakAccel, avgRssi, flightTime, totalPkts, fix3d,
      servoTime: servoEvt?.time.toFixed(1) ?? null,
      crossings: log[log.length-1].crossings,
      apogee: { altFt: mToFt(apogee.alt), time: apogee.time.toFixed(1), lat: apogee.lat, lon: apogee.lon },
    });
  }

  // ── Parse Blue Raven CSV ──
  function handleBrGenerate() {
    setBrError(null);
    if (!lrFile) { setBrError("Please upload the Blue Raven LR (Low Rate) CSV file."); return; }

    try {
      const lr  = parseBlueRavenLR(lrFile);
      const hr  = hrFile ? parseBlueRavenHR(hrFile) : null;
      setBrReport({ ...lr, peakAccel: hr?.peakAccel ?? null });
    } catch (e: any) {
      setBrError("Failed to parse CSV: " + e.message);
    }
  }

  function readFile(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = () => rej(r.error);
      r.readAsText(file);
    });
  }

  const inputStyle: React.CSSProperties = {
    display: "none",
  };

  const uploadBtnStyle: React.CSSProperties = {
    background: "rgba(0,217,255,0.08)", border: "1px solid rgba(0,217,255,0.25)",
    color: "#00d9ff", padding: "8px 16px", borderRadius: "6px",
    cursor: "pointer", fontSize: "0.8rem", letterSpacing: "0.06em",
    whiteSpace: "nowrap" as const,
  };

  return (
    <div style={{ padding: "40px", maxWidth: "960px", margin: "0 auto" }}>

      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        PLEIADES Post-Flight Analysis
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        style={{ color: "var(--muted)", marginTop: 6 }}>
        Generate flight reports from live ESP32 telemetry or Blue Raven CSV exports.
      </motion.p>

      {/* ── Build Reports (collapsible) ── */}
      <motion.h2 style={{ marginTop: "40px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        Build Reports
      </motion.h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {buildReports.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i + 0.2 }}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden" }}>

            {/* Header row */}
            <div onClick={() => toggleReport(r.id)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", cursor: "pointer",
              background: openReports.has(r.id) ? "rgba(0,217,255,0.05)" : "transparent",
              transition: "background 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "1.1rem" }}>📄</span>
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{r.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "3px 10px", borderRadius: "20px",
                  background: "rgba(0,255,159,0.12)", color: "#00ff9f",
                  border: "1px solid rgba(0,255,159,0.25)",
                }}>
                  ● COMPLETE
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", transition: "transform 0.2s",
                  transform: openReports.has(r.id) ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>
                  ▼
                </span>
              </div>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
              {openReports.has(r.id) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ padding: "16px 20px", display: "flex", gap: 12, alignItems: "center" }}>
                    <a href={r.href} target="_blank" rel="noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "rgba(0,217,255,0.1)", border: "1px solid rgba(0,217,255,0.3)",
                      color: "#00d9ff", padding: "8px 18px", borderRadius: "6px",
                      textDecoration: "none", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.05em",
                    }}>
                      ↓ Download PDF
                    </a>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem" }}>
                      Click to open {r.title} in a new tab
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 1 — Live ESP32 Report
      ════════════════════════════════════════════════ */}
      <motion.div style={{ marginTop: "48px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2>⚡ Live ESP32 Flight Report</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
          Generated from real-time telemetry received on the Telemetry page.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button onClick={generateLiveReport} style={{
            background: "rgba(0,217,255,0.12)", border: "1px solid rgba(0,217,255,0.4)",
            color: "#00d9ff", padding: "10px 22px", borderRadius: "8px",
            cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.06em",
          }}>
            ⚡ Generate Report
          </button>
          {liveReport && (
            <>
              <button onClick={() => window.print()} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", padding: "10px 22px", borderRadius: "8px",
                cursor: "pointer", fontSize: "0.85rem",
              }}>
                🖨️ Export PDF
              </button>
              <button onClick={() => { clearFlightLog(); setLiveReport(null); }} style={{
                background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.25)",
                color: "#ff4d4d", padding: "10px 22px", borderRadius: "8px",
                cursor: "pointer", fontSize: "0.85rem",
              }}>
                🗑️ Clear Log
              </button>
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {liveReport && (
          <motion.div className="report-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ marginTop: 24 }}>
            <div className="report-header">
              <div>
                <h2>PLEIADES — ESP32 Mission Report</h2>
                <p className="report-date">Generated: {new Date().toLocaleString()}</p>
                <p className="report-date">{liveReport.totalPkts} packets · GPS 3D lock {liveReport.fix3d}%</p>
              </div>
              <span className="status-badge badge-deployed"><span className="status-dot dot-green" /> COMPLETE</span>
            </div>
            <div className="report-stats-grid">
              <div className="report-stat-card"><p className="stat-label">Max Altitude</p>
                <h2 className="stat-value"><AnimatedNumber value={liveReport.maxAltFt} /> ft</h2></div>
              <div className="report-stat-card"><p className="stat-label">Max Velocity</p>
                <h2 className="stat-value"><AnimatedNumber value={liveReport.maxVelFts} /> ft/s</h2></div>
              <div className="report-stat-card"><p className="stat-label">Flight Time</p>
                <h2 className="stat-value">{liveReport.flightTime} <span style={{fontSize:16}}>sec</span></h2></div>
            </div>
            <div className="report-stats-grid" style={{ marginTop: 16 }}>
              <div className="report-stat-card"><p className="stat-label">Peak Accel</p>
                <h2 className="stat-value"><AnimatedNumber value={liveReport.peakAccel} /> g</h2></div>
              <div className="report-stat-card"><p className="stat-label">Avg RSSI</p>
                <h2 className="stat-value">{liveReport.avgRssi} <span style={{fontSize:16}}>dBm</span></h2></div>
              <div className="report-stat-card"><p className="stat-label">Zero Crossings</p>
                <h2 className="stat-value">{liveReport.crossings}</h2></div>
            </div>
            <h3 style={{ marginTop: 28 }}>Apogee</h3>
            <table className="report-table"><thead><tr><th>Parameter</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Altitude</td><td>{liveReport.apogee.altFt.toFixed(1)} ft</td></tr>
                <tr><td>Time</td><td>T+{liveReport.apogee.time}s</td></tr>
                <tr><td>Latitude</td><td>{liveReport.apogee.lat.toFixed(6)}°</td></tr>
                <tr><td>Longitude</td><td>{liveReport.apogee.lon.toFixed(6)}°</td></tr>
              </tbody>
            </table>
            <h3 style={{ marginTop: 28 }}>Payload Deployment</h3>
            <table className="report-table"><thead><tr><th>Event</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                <tr>
                  <td>Servo Activation</td>
                  <td>{liveReport.servoTime ? `T+${liveReport.servoTime}s` : "—"}</td>
                  <td><span className={`status-badge ${liveReport.servoTime ? "badge-deployed" : "badge-armed"}`}>
                    <span className={`status-dot ${liveReport.servoTime ? "dot-green" : "dot-yellow"}`} />
                    {liveReport.servoTime ? "DEPLOYED" : "NOT TRIGGERED"}
                  </span></td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          SECTION 2 — Blue Raven CSV Report
      ════════════════════════════════════════════════ */}
      <motion.div style={{ marginTop: "56px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2>📊 Blue Raven Flight Report</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>
          Upload your Blue Raven CSV exports to generate a full post-flight analysis.
        </p>

        <div style={{
          marginTop: 20, padding: "24px", borderRadius: "12px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {/* LR file */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", marginBottom: 8 }}>
              LR CSV (Low Rate) — required
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input ref={lrRef} type="file" accept=".csv" style={inputStyle}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setLrFile(await readFile(f));
                }}
              />
              <button onClick={() => lrRef.current?.click()} style={uploadBtnStyle}>
                📂 Choose LR File
              </button>
              <span style={{ fontSize: "0.8rem", color: lrFile ? "#00ff9f" : "rgba(255,255,255,0.3)" }}>
                {lrFile ? "✓ LR file loaded" : "No file selected"}
              </span>
            </div>
          </div>

          {/* HR file */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", marginBottom: 8 }}>
              HR CSV (High Rate) — optional, adds peak acceleration
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input ref={hrRef} type="file" accept=".csv" style={inputStyle}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setHrFile(await readFile(f));
                }}
              />
              <button onClick={() => hrRef.current?.click()} style={uploadBtnStyle}>
                📂 Choose HR File
              </button>
              <span style={{ fontSize: "0.8rem", color: hrFile ? "#00ff9f" : "rgba(255,255,255,0.3)" }}>
                {hrFile ? "✓ HR file loaded" : "No file selected"}
              </span>
            </div>
          </div>

          {brError && <p style={{ color: "#ff4d4d", fontSize: "0.82rem", marginBottom: 12 }}>{brError}</p>}

          <button onClick={handleBrGenerate} style={{
            background: "rgba(0,217,255,0.12)", border: "1px solid rgba(0,217,255,0.4)",
            color: "#00d9ff", padding: "10px 24px", borderRadius: "8px",
            cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.06em",
          }}>
            📊 Generate Blue Raven Report
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {brReport && (
          <motion.div className="report-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ marginTop: 24 }}>
            <div className="report-header">
              <div>
                <h2>PLEIADES — Blue Raven Mission Report</h2>
                <p className="report-date">Generated: {new Date().toLocaleString()}</p>
                <p className="report-date">Source: Blue Raven SN1811 Export</p>
              </div>
              <span className="status-badge badge-deployed"><span className="status-dot dot-green" /> COMPLETE</span>
            </div>

            {/* Primary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
              <StatCard label="MAX ALTITUDE AGL" value={brReport.maxAltAGL} unit="ft" />
              <StatCard label="MAX VELOCITY UP"  value={brReport.maxVelUp}  unit="ft/s" />
              <StatCard label="FLIGHT TIME"      value={brReport.flightTime} unit="s" />
              {brReport.peakAccel !== null && (
                <StatCard label="PEAK ACCEL" value={brReport.peakAccel} unit="g" />
              )}
              <StatCard label="LAUNCH TEMP"  value={brReport.launchTemp} unit="°F" />
              <StatCard label="MIN BATTERY"  value={brReport.minBatt}    unit="V" />
              <StatCard label="MAX TILT"     value={brReport.maxTilt}    unit="°" />
            </div>

            {/* Flight events */}
            <h3 style={{ marginTop: 28 }}>Flight Events</h3>
            <table className="report-table">
              <thead><tr><th>Event</th><th>Flight Time</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  { label: "Liftoff",          time: brReport.liftoffTime,  fired: brReport.liftoffTime  !== "N/A" },
                  { label: "Apogee",           time: brReport.apogeeTime,   fired: brReport.apogeeTime   !== "N/A" },
                  { label: "Apogee Charge",    time: brReport.apoFireTime,  fired: brReport.apoFireTime  !== "N/A" },
                  { label: "Main Charge",      time: brReport.mainFireTime, fired: brReport.mainFireTime !== "N/A" },
                  { label: "3rd Event",        time: brReport.thirdFireTime,fired: brReport.thirdFireTime!== "N/A" },
                ].map((ev) => (
                  <tr key={ev.label}>
                    <td>{ev.label}</td>
                    <td>{ev.time !== "N/A" ? `T+${ev.time}s` : "—"}</td>
                    <td>
                      <span className={`status-badge ${ev.fired ? "badge-deployed" : "badge-armed"}`}>
                        <span className={`status-dot ${ev.fired ? "dot-green" : "dot-yellow"}`} />
                        {ev.fired ? "FIRED" : "NOT FIRED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}