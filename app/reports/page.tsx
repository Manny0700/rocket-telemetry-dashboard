"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  let maxAltAGL    = -Infinity;
  let maxVelUp     = -Infinity;
  let maxTilt      = -Infinity;
  let minBatt      = Infinity;
  let flightEnd    = 0;
  let liftoffTime: number | null  = null;
  let apogeeTime: number | null   = null;
  let apoFireTime: number | null  = null;
  let mainFireTime: number | null = null;
  let thirdFireTime: number | null = null;
  let fourthFireTime: number | null = null;
  let launchTemp: number | null   = null;

  // For altitude chart (sampled)
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

    if (liftoffTime   === null && r[iLiftoff]  === "1") liftoffTime   = t;
    if (apogeeTime    === null && r[iApogee]   === "1") apogeeTime    = t;
    if (apoFireTime   === null && r[iApoFire]  === "1") apoFireTime   = t;
    if (mainFireTime  === null && r[iMainFire] === "1") mainFireTime  = t;
    if (thirdFireTime === null && i3rdFire >= 0 && r[i3rdFire] === "1") thirdFireTime = t;
    if (fourthFireTime=== null && i4thFire >= 0 && r[i4thFire] === "1") fourthFireTime= t;
    if (launchTemp    === null && liftoffTime  !== null && !isNaN(temp)) launchTemp = temp;

    // Sample every ~5 rows for chart
    if (sampleCount++ % 5 === 0 && !isNaN(t) && !isNaN(alt) && t >= 0) {
      altChart.push({ t: parseFloat(t.toFixed(2)), alt: parseFloat(alt.toFixed(1)) });
    }
  }

  return {
    maxAltAGL:     maxAltAGL === -Infinity ? 0 : parseFloat(maxAltAGL.toFixed(1)),
    maxVelUp:      maxVelUp  === -Infinity ? 0 : parseFloat(maxVelUp.toFixed(1)),
    maxTilt:       maxTilt   === -Infinity ? 0 : parseFloat(maxTilt.toFixed(1)),
    minBatt:       minBatt   === Infinity  ? 0 : parseFloat(minBatt.toFixed(3)),
    flightTime:    flightEnd.toFixed(2),
    liftoffTime:   liftoffTime?.toFixed(2)  ?? null,
    apogeeTime:    apogeeTime?.toFixed(2)   ?? null,
    apoFireTime:   apoFireTime?.toFixed(2)  ?? null,
    mainFireTime:  mainFireTime?.toFixed(2) ?? null,
    thirdFireTime: thirdFireTime?.toFixed(2)?? null,
    fourthFireTime:fourthFireTime?.toFixed(2)??null,
    launchTemp:    launchTemp?.toFixed(1)   ?? null,
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

// ── Mini SVG altitude chart ───────────────────────────────────
function AltChart({ data }: { data: { t: number; alt: number }[] }) {
  if (!data.length) return null;
  const W = 800, H = 160, PAD = 20;
  const maxT   = Math.max(...data.map((d) => d.t));
  const maxAlt = Math.max(...data.map((d) => d.alt));
  const scaleX = (t: number) => PAD + (t / maxT) * (W - PAD * 2);
  const scaleY = (a: number) => H - PAD - (a / maxAlt) * (H - PAD * 2);
  const pts = data.map((d) => `${scaleX(d.t)},${scaleY(d.alt)}`).join(" ");
  const area = `M${scaleX(data[0].t)},${scaleY(0)} ` +
    data.map((d) => `L${scaleX(d.t)},${scaleY(d.alt)}`).join(" ") +
    ` L${scaleX(data[data.length-1].t)},${scaleY(0)} Z`;

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
      {/* Peak dot */}
      {(() => {
        const peak = data.reduce((a, b) => a.alt > b.alt ? a : b);
        return (
          <circle cx={scaleX(peak.t)} cy={scaleY(peak.alt)} r="5"
            fill="#00d9ff" stroke="#0b0f1a" strokeWidth="2">
            <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
          </circle>
        );
      })()}
    </svg>
  );
}

// ── Animated counter ─────────────────────────────────────────
function Counter({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [n, setN] = useState(0);
  useState(() => {
    let s = 0;
    const steps = 50;
    const id = setInterval(() => {
      s++;
      if (s >= steps) { setN(value); clearInterval(id); }
      else setN(parseFloat(((value / steps) * s).toFixed(decimals)));
    }, 20);
  });
  return <>{n.toFixed(decimals)}</>;
}

// ── Upload zone component ─────────────────────────────────────
function UploadZone({
  label, hint, loaded, onFile,
}: { label: string; hint: string; loaded: boolean; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      style={{
        border: `2px dashed ${loaded ? "rgba(0,255,159,0.5)" : dragging ? "rgba(0,217,255,0.7)" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "12px",
        padding: "24px 20px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        background: loaded
          ? "rgba(0,255,159,0.04)"
          : dragging
          ? "rgba(0,217,255,0.06)"
          : "rgba(255,255,255,0.02)",
      }}
    >
      <input ref={ref} type="file" accept=".csv" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>
        {loaded ? "✅" : "📂"}
      </div>
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

// ── Main page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const [lrText, setLrText] = useState<string | null>(null);
  const [hrText, setHrText] = useState<string | null>(null);
  const [lrName, setLrName] = useState<string | null>(null);
  const [hrName, setHrName] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function readFile(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res(r.result as string);
      r.onerror = () => rej(r.error);
      r.readAsText(file);
    });
  }

  async function handleLR(f: File) {
    const text = await readFile(f);
    setLrText(text);
    setLrName(f.name);
    setReport(null);
  }

  async function handleHR(f: File) {
    const text = await readFile(f);
    setHrText(text);
    setHrName(f.name);
    setReport(null);
  }

  function generate() {
    if (!lrText) { setError("Please upload the Blue Raven LR CSV file first."); return; }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      try {
        const lr = parseBlueRavenLR(lrText);
        const hr = hrText ? parseBlueRavenHR(hrText) : null;
        setReport({ ...lr, peakAccel: hr?.peakAccel ?? null });
      } catch (e: any) {
        setError("Failed to parse: " + e.message);
      }
      setLoading(false);
    }, 600);
  }

  const events = report ? [
    { label: "Liftoff",         icon: "🚀", time: report.liftoffTime,   fired: !!report.liftoffTime },
    { label: "Apogee",          icon: "⬆️", time: report.apogeeTime,    fired: !!report.apogeeTime },
    { label: "Apogee Charge",   icon: "💥", time: report.apoFireTime,   fired: !!report.apoFireTime },
    { label: "Main Charge",     icon: "🪂", time: report.mainFireTime,  fired: !!report.mainFireTime },
    { label: "3rd Event",       icon: "⚡", time: report.thirdFireTime, fired: !!report.thirdFireTime },
    { label: "4th Event",       icon: "⚡", time: report.fourthFireTime,fired: !!report.fourthFireTime },
  ].filter((e) => e.fired || ["Liftoff", "Apogee", "Apogee Charge", "Main Charge"].includes(e.label)) : [];

  return (
    <div style={{ padding: "40px 40px 80px", maxWidth: "960px", margin: "0 auto" }}>

      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}>
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
          Upload your Blue Raven export files to generate a complete flight report.
        </p>
      </motion.div>

      {/* ── Upload Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{
          marginTop: 36,
          background: "rgba(11,15,26,0.8)",
          border: "1px solid rgba(0,217,255,0.12)",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 0 40px rgba(0,217,255,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#00d9ff",
            boxShadow: "0 0 8px #00d9ff", display: "inline-block",
          }} />
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)" }}>
            BLUE RAVEN CSV IMPORT
          </span>
        </div>
        <h3 style={{ margin: "0 0 20px", fontSize: "1rem" }}>Select Flight Data Files</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
              LR FILE — REQUIRED
            </div>
            <UploadZone
              label="Low Rate CSV"
              hint="Drag & drop or click to browse"
              loaded={!!lrText}
              onFile={handleLR}
            />
            {lrName && (
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: 6, textAlign: "center" }}>
                {lrName}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
              HR FILE — OPTIONAL (adds peak accel)
            </div>
            <UploadZone
              label="High Rate CSV"
              hint="Drag & drop or click to browse"
              loaded={!!hrText}
              onFile={handleHR}
            />
            {hrName && (
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: 6, textAlign: "center" }}>
                {hrName}
              </div>
            )}
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              marginTop: 16, padding: "10px 16px", borderRadius: "8px",
              background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.25)",
              color: "#ff4d4d", fontSize: "0.82rem",
            }}>
            ⚠️ {error}
          </motion.div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
          <motion.button
            onClick={generate}
            disabled={!lrText || loading}
            whileHover={{ scale: lrText ? 1.02 : 1 }}
            whileTap={{ scale: lrText ? 0.98 : 1 }}
            style={{
              padding: "12px 32px",
              background: lrText ? "#00d9ff" : "rgba(255,255,255,0.08)",
              color: lrText ? "#000" : "rgba(255,255,255,0.3)",
              fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.08em",
              border: "none", borderRadius: "10px", cursor: lrText ? "pointer" : "not-allowed",
              boxShadow: lrText ? "0 0 24px rgba(0,217,255,0.4)" : "none",
              transition: "all 0.2s",
            }}
          >
            {loading ? "⚙️  PROCESSING..." : "⚡  GENERATE REPORT"}
          </motion.button>
          {report && (
            <motion.button
              onClick={() => window.print()}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                padding: "12px 24px", background: "transparent",
                color: "#00d9ff", fontWeight: 700, fontSize: "0.85rem",
                border: "1px solid rgba(0,217,255,0.4)", borderRadius: "10px",
                cursor: "pointer", letterSpacing: "0.06em",
              }}
            >
              🖨️  EXPORT PDF
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Report Output ── */}
      <AnimatePresence>
        {report && (
          <motion.div
            id="report-print"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ marginTop: 40 }}
          >

            {/* Report header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              flexWrap: "wrap", gap: 16, marginBottom: 32,
              paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontSize: "0.65rem", letterSpacing: "0.15em", padding: "3px 10px",
                    borderRadius: "20px", background: "rgba(0,217,255,0.1)",
                    border: "1px solid rgba(0,217,255,0.25)", color: "#00d9ff",
                  }}>
                    BLUE RAVEN SN1811
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
                    {new Date().toLocaleString()}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>PLEIADES Mission Report</h2>
              </div>
              <span className="status-badge badge-deployed" style={{ fontSize: "0.75rem", padding: "6px 14px" }}>
                <span className="status-dot dot-green" /> FLIGHT COMPLETE
              </span>
            </div>

            {/* Primary stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
              {[
                { label: "MAX ALTITUDE AGL", value: report.maxAltAGL, unit: "ft",  color: "#00d9ff" },
                { label: "MAX VELOCITY UP",  value: report.maxVelUp,  unit: "ft/s", color: "#00ff9f" },
                { label: "FLIGHT TIME",      value: parseFloat(report.flightTime), unit: "sec", color: "#ffaa00" },
              ].map(({ label, value, unit, color }) => (
                <div key={label} style={{
                  background: "rgba(11,15,26,0.9)",
                  border: `1px solid ${color}22`,
                  borderRadius: "14px", padding: "22px",
                  textAlign: "center",
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

            {/* Secondary stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
              {[
                ...(report.peakAccel !== null ? [{ label: "PEAK ACCEL", value: report.peakAccel, unit: "g" }] : []),
                { label: "MAX TILT", value: report.maxTilt, unit: "°" },
                { label: "MIN BATTERY", value: report.minBatt, unit: "V" },
                ...(report.launchTemp ? [{ label: "LAUNCH TEMP", value: parseFloat(report.launchTemp), unit: "°F" }] : []),
              ].map(({ label, value, unit }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
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
            {report.altChart.length > 0 && (
              <div style={{
                background: "rgba(11,15,26,0.9)",
                border: "1px solid rgba(0,217,255,0.1)",
                borderRadius: "14px", padding: "24px 24px 16px",
                marginBottom: 28,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)" }}>
                      ALTITUDE PROFILE
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
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

            {/* Flight events timeline */}
            <div style={{
              background: "rgba(11,15,26,0.9)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "24px",
              marginBottom: 28,
            }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>FLIGHT EVENTS</div>

              <div style={{ position: "relative" }}>
                {/* Timeline line */}
                <div style={{
                  position: "absolute", left: 19, top: 12, bottom: 12,
                  width: 2, background: "rgba(0,217,255,0.15)",
                }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {events.map((ev, i) => (
                    <motion.div
                      key={ev.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "12px 0",
                      }}
                    >
                      {/* Dot */}
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                        background: ev.fired ? "rgba(0,217,255,0.12)" : "rgba(255,255,255,0.04)",
                        border: `2px solid ${ev.fired ? "rgba(0,217,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", zIndex: 1,
                        boxShadow: ev.fired ? "0 0 12px rgba(0,217,255,0.25)" : "none",
                      }}>
                        {ev.icon}
                      </div>

                      {/* Content */}
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
            </div>

            {/* Footer */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 20px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              fontSize: "0.72rem", color: "rgba(255,255,255,0.25)",
            }}>
              <span>⬡ PLEIADES Mission Control</span>
              <span>Blue Raven SN1811 · {lrName}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}