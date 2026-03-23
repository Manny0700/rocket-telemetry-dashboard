"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFlightLog } from "../../lib/flightLogger";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let current = 0;
    const steps = 40;
    const increment = value / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(parseFloat(current.toFixed(2)));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{display.toFixed(2)}</span>;
}

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);

  function generateReport() {
    const log = getFlightLog();
    if (log.length === 0) {
      alert("No flight data recorded yet.");
      return;
    }
    const maxAltitude = Math.max(...log.map((d) => d.altitude));
    const maxVelocity = Math.max(...log.map((d) => d.velocity));
    const flightTime = log[log.length - 1].time;
    const payload1 = log.find((d) => d.payload1)?.time ?? "N/A";
    const payload2 = log.find((d) => d.payload2)?.time ?? "N/A";
    const payload3 = log.find((d) => d.payload3)?.time ?? "N/A";
    setReport({ maxAltitude, maxVelocity, flightTime, payload1, payload2, payload3 });
  }

  function printReport() {
    window.print();
  }

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>

      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        PLEIADES Post-Flight Analysis
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Generate a complete summary of recorded flight telemetry data.
      </motion.p>

      <div style={{ display: "flex", gap: "16px", marginTop: "30px", flexWrap: "wrap" }}>
        <motion.button
          onClick={generateReport}
          className="report-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          ⚡ Generate Flight Report
        </motion.button>

        {report && (
          <motion.button
            onClick={printReport}
            className="report-btn-outline"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            🖨️ Export PDF
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {report && (
          <motion.div
            id="report-print"
            className="report-summary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="report-header">
              <div>
                <h2>PLEIADES Mission Report</h2>
                <p className="report-date">Generated: {new Date().toLocaleString()}</p>
              </div>
              <span className="status-badge badge-deployed">
                <span className="status-dot dot-green" /> COMPLETE
              </span>
            </div>

            <div className="report-stats-grid">
              <div className="report-stat-card">
                <p className="stat-label">Max Altitude</p>
                <h2 className="stat-value">
                  <AnimatedNumber value={report.maxAltitude} /> m
                </h2>
              </div>
              <div className="report-stat-card">
                <p className="stat-label">Max Velocity</p>
                <h2 className="stat-value">
                  <AnimatedNumber value={report.maxVelocity} /> m/s
                </h2>
              </div>
              <div className="report-stat-card">
                <p className="stat-label">Flight Time</p>
                <h2 className="stat-value">
                  {report.flightTime}{" "}
                  <span style={{ fontSize: "16px" }}>sec</span>
                </h2>
              </div>
            </div>

            <h3 style={{ marginTop: "30px" }}>Payload Deployment Events</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Payload</th>
                  <th>Deployment Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[report.payload1, report.payload2, report.payload3].map((time, i) => (
                  <tr key={i}>
                    <td>Payload {i + 1}</td>
                    <td>{time !== "N/A" ? `T+${time}s` : "—"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          time !== "N/A" ? "badge-deployed" : "badge-armed"
                        }`}
                      >
                        <span
                          className={`status-dot ${
                            time !== "N/A" ? "dot-green" : "dot-yellow"
                          }`}
                        />
                        {time !== "N/A" ? "DEPLOYED" : "NOT DEPLOYED"}
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