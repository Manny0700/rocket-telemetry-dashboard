"use client";

import { useState } from "react";
import { getFlightLog } from "../../lib/flightLogger";

export default function ReportsPage() {

  const [report, setReport] = useState<any>(null);

  function generateReport() {

    const log = getFlightLog();

    if (log.length === 0) {
      alert("No flight data recorded yet.");
      return;
    }

    const maxAltitude = Math.max(...log.map(d => d.altitude));
    const maxVelocity = Math.max(...log.map(d => d.velocity));
    const flightTime = log[log.length - 1].time;

    const payload1 = log.find(d => d.payload1)?.time ?? "N/A";
    const payload2 = log.find(d => d.payload2)?.time ?? "N/A";
    const payload3 = log.find(d => d.payload3)?.time ?? "N/A";

    setReport({
      maxAltitude,
      maxVelocity,
      flightTime,
      payload1,
      payload2,
      payload3
    });
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>PLEIADES Post-Flight Analysis</h1>

      <button
        onClick={generateReport}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          background: "#00E5FF",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Generate Flight Report
      </button>

      {report && (

        <div
          style={{
            marginTop: "40px",
            background: "#0b1a2a",
            padding: "25px",
            borderRadius: "10px",
            color: "white"
          }}
        >

          <h2>Flight Summary</h2>

          <p><strong>Maximum Altitude:</strong> {report.maxAltitude.toFixed(2)} m</p>

          <p><strong>Maximum Velocity:</strong> {report.maxVelocity.toFixed(2)} m/s</p>

          <p><strong>Total Flight Time:</strong> {report.flightTime} seconds</p>

          <h3>Payload Deployment</h3>

          <p>Payload 1 deployed at T+{report.payload1}</p>

          <p>Payload 2 deployed at T+{report.payload2}</p>

          <p>Payload 3 deployed at T+{report.payload3}</p>

        </div>

      )}

    </div>
  );
}