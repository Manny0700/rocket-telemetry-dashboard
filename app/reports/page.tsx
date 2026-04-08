"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFlightLog, clearFlightLog } from "../../lib/flightLogger";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useState(() => {
    let step = 0;
    const steps = 40;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) { setDisplay(value); clearInterval(timer); }
      else setDisplay(parseFloat(((value / steps) * step).toFixed(2)));
    }, 25);
  });
  return <span>{display.toFixed(2)}</span>;
}

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);

  function generateReport() {
    const log = getFlightLog();
    if (log.length === 0) {
      alert("No flight data recorded yet. Make sure the ESP32 is connected and transmitting on the Telemetry page first.");
      return;
    }

    const maxAltitude   = Math.max(...log.map((d) => d.alt));
    const maxVelocity   = Math.max(...log.map((d) => d.vel));
    const avgRssi       = Math.round(log.map((d) => d.rssi).filter(Boolean).reduce((a, b) => a + b, 0) / log.filter((d) => d.rssi).length);
    const flightTime    = log[log.length - 1].time.toFixed(1);
    const totalPackets  = log.length;

    // Peak acceleration magnitude
    const peakAccel = Math.max(...log.map((d) => Math.sqrt(d.ax ** 2 + d.ay ** 2 + d.az ** 2)));

    // Apogee point
    const apogeePoint = log.reduce((a, b) => (a.alt > b.alt ? a : b));

    // Zero crossings (last recorded value)
    const crossings = log[log.length - 1].crossings;

    // Servo / payload deployment
    const servoEvent = log.find((d) => d.servo === 1);
    const servoTime  = servoEvent ? servoEvent.time.toFixed(1) : null;

    // GPS lock quality
    const fix3dCount = log.filter((d) => d.fix === 3).length;
    const gpsCoverage = Math.round((fix3dCount / totalPackets) * 100);

    setReport({
      maxAltitude,
      maxVelocity,
      flightTime,
      totalPackets,
      peakAccel,
      avgRssi,
      crossings,
      servoTime,
      gpsCoverage,
      apogee: {
        lat: apogeePoint.lat,
        lon: apogeePoint.lon,
        alt: apogeePoint.alt,
        time: apogeePoint.time.toFixed(1),
      },
    });
  }

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>

      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        PLEIADES Post-Flight Analysis
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        Generates a full report from live ESP32 telemetry recorded during the flight.
      </motion.p>

      <div style={{ display: "flex", gap: "16px", marginTop: "30px", flexWrap: "wrap" }}>
        <motion.button onClick={generateReport} className="report-btn"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          ⚡ Generate Flight Report
        </motion.button>

        {report && (
          <>
            <motion.button onClick={() => window.print()} className="report-btn-outline"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              🖨️ Export PDF
            </motion.button>
            <motion.button onClick={() => { clearFlightLog(); setReport(null); }}
              className="report-btn-outline"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              🗑️ Clear Log
            </motion.button>
          </>
        )}
      </div>

      <AnimatePresence>
        {report && (
          <motion.div id="report-print" className="report-summary"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>

            <div className="report-header">
              <div>
                <h2>PLEIADES Mission Report</h2>
                <p className="report-date">Generated: {new Date().toLocaleString()}</p>
                <p className="report-date">{report.totalPackets} packets recorded</p>
              </div>
              <span className="status-badge badge-deployed">
                <span className="status-dot dot-green" /> COMPLETE
              </span>
            </div>

            {/* ── Primary Stats ── */}
            <div className="report-stats-grid">
              <div className="report-stat-card">
                <p className="stat-label">Max Altitude</p>
                <h2 className="stat-value"><AnimatedNumber value={report.maxAltitude} /> m</h2>
              </div>
              <div className="report-stat-card">
                <p className="stat-label">Max Velocity</p>
                <h2 className="stat-value"><AnimatedNumber value={report.maxVelocity} /> m/s</h2>
              </div>
              <div className="report-stat-card">
                <p className="stat-label">Flight Time</p>
                <h2 className="stat-value">{report.flightTime} <span style={{ fontSize: "16px" }}>sec</span></h2>
              </div>
            </div>

            {/* ── Secondary Stats ── */}
            <div className="report-stats-grid" style={{ marginTop: "16px" }}>
              <div className="report-stat-card">
                <p className="stat-label">Peak Acceleration</p>
                <h2 className="stat-value"><AnimatedNumber value={report.peakAccel} /> g</h2>
              </div>
              <div className="report-stat-card">
                <p className="stat-label">Avg RSSI</p>
                <h2 className="stat-value">{report.avgRssi} <span style={{ fontSize: "16px" }}>dBm</span></h2>
              </div>
              <div className="report-stat-card">
                <p className="stat-label">GPS 3D Lock</p>
                <h2 className="stat-value">{report.gpsCoverage}<span style={{ fontSize: "16px" }}>%</span></h2>
              </div>
            </div>

            {/* ── Apogee ── */}
            <h3 style={{ marginTop: "30px" }}>Apogee Coordinates</h3>
            <table className="report-table">
              <thead>
                <tr><th>Parameter</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr><td>Altitude</td><td>{report.apogee.alt.toFixed(2)} m</td></tr>
                <tr><td>Time</td><td>T+{report.apogee.time}s</td></tr>
                <tr><td>Latitude</td><td>{report.apogee.lat.toFixed(6)}°</td></tr>
                <tr><td>Longitude</td><td>{report.apogee.lon.toFixed(6)}°</td></tr>
              </tbody>
            </table>

            {/* ── Payload / Servo ── */}
            <h3 style={{ marginTop: "30px" }}>Payload Deployment</h3>
            <table className="report-table">
              <thead>
                <tr><th>Event</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>Servo Activation</td>
                  <td>{report.servoTime ? `T+${report.servoTime}s` : "—"}</td>
                  <td>
                    <span className={`status-badge ${report.servoTime ? "badge-deployed" : "badge-armed"}`}>
                      <span className={`status-dot ${report.servoTime ? "dot-green" : "dot-yellow"}`} />
                      {report.servoTime ? "DEPLOYED" : "NOT TRIGGERED"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Zero Crossings</td>
                  <td colSpan={2}>{report.crossings}</td>
                </tr>
              </tbody>
            </table>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}