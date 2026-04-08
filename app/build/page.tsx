"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const buildVideos = [
  {
    id: 1,
    title: "Airframe Assembly",
    src: "/videos/build_airframe.mp4",
    description: "Full assembly of the main airframe tube, fins, and motor mount.",
    date: "2024-09-10",
    phase: "ASSEMBLY",
  },
  {
    id: 2,
    title: "Avionics Bay Integration",
    src: "/videos/build_avionics.mp4",
    description: "Wiring and integration of flight computers, altimeters, and recovery electronics.",
    date: "2024-10-04",
    phase: "AVIONICS",
  },
  {
    id: 3,
    title: "Recovery System Testing",
    src: "/videos/build_recovery.mp4",
    description: "Ejection charge tests and parachute deployment validation.",
    date: "2024-11-18",
    phase: "TESTING",
  },
  {
    id: 4,
    title: "Static Fire Test",
    src: "/videos/build_staticfire.mp4",
    description: "Motor static fire test on the ground support structure.",
    date: "2024-12-05",
    phase: "TESTING",
  },
];

const buildReports = [
  { id: 1, title: "Preliminary Design Review (PDR)", href: "/reports/PDR.pdf", date: "2024-08-20", status: "COMPLETE" },
  { id: 2, title: "Critical Design Review (CDR)", href: "/reports/CDR.pdf", date: "2024-10-15", status: "COMPLETE" },
  { id: 3, title: "Propulsion & Motor Selection Report", href: "/reports/propulsion.pdf", date: "2024-11-01", status: "COMPLETE" },
  { id: 4, title: "Structural Analysis Report", href: "/reports/structural.pdf", date: "2024-11-22", status: "COMPLETE" },
  { id: 5, title: "Avionics & Recovery Systems Report", href: "/reports/avionics.pdf", date: "2024-12-10", status: "COMPLETE" },
  { id: 6, title: "Pre-Flight Readiness Review (FRR)", href: "/reports/FRR.pdf", date: "2025-01-08", status: "COMPLETE" },
];

const buildPhases = [
  { phase: "PHASE 1", label: "Concept & Design", detail: "Initial concept, CAD modelling, and PDR submission." },
  { phase: "PHASE 2", label: "Procurement", detail: "Component sourcing, motor selection, and materials ordering." },
  { phase: "PHASE 3", label: "Assembly", detail: "Airframe construction, fin alignment, and nose cone integration." },
  { phase: "PHASE 4", label: "Avionics", detail: "Flight computer wiring, altimeter calibration, and bay integration." },
  { phase: "PHASE 5", label: "Ground Testing", detail: "Ejection charge tests, static fire, and continuity checks." },
  { phase: "PHASE 6", label: "Flight Ready", detail: "FRR sign-off, transport, and pad preparation." },
];

const phaseBadgeColor: Record<string, string> = {
  ASSEMBLY: "#2563eb",
  AVIONICS: "#7c3aed",
  TESTING: "#b45309",
};

export default function BuildPage() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  return (
    <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>

      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Build Process
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ color: "var(--muted)", maxWidth: 600, marginTop: 8 }}
      >
        Documentation of every phase in the design, construction, and testing of PLEIADES — from
        initial concept through pre-flight readiness.
      </motion.p>

      <motion.h2
        style={{ marginTop: "48px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Build Phases
      </motion.h2>

      <div className="timeline">
        {buildPhases.map((item, i) => (
          <motion.div
            key={i}
            className="timeline-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.07 * i + 0.2 }}
          >
            <div className="timeline-dot" />
            <div className="timeline-content">
              <span className="timeline-phase">{item.phase}</span>
              <span className="timeline-label">{item.label}</span>
              <p className="timeline-detail">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.h2
        style={{ marginTop: "56px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Build Videos
      </motion.h2>

      <div className="video-grid">
        {buildVideos.map((v, i) => (
          <motion.div
            key={v.id}
            className="video-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * i + 0.3 }}
          >
            <div
              className="video-thumb"
              onClick={() => setActiveVideo(activeVideo === v.id ? null : v.id)}
            >
              {activeVideo === v.id ? (
                <video width="100%" controls autoPlay style={{ display: "block" }}>
                  <source src={v.src} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="video-thumb-inner">
                  <div className="play-btn">▶</div>
                </div>
              )}
            </div>
            <div className="video-info">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: phaseBadgeColor[v.phase] ?? "#334155",
                    color: "#fff",
                  }}
                >
                  {v.phase}
                </span>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>{v.date}</span>
              </div>
              <h3>{v.title}</h3>
              <p>{v.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.h2
        style={{ marginTop: "56px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Build Reports
      </motion.h2>

      <div className="report-cards">
        {buildReports.map((r, i) => (
          <motion.a
            key={r.id}
            href={r.href}
            target="_blank"
            className="report-card-link"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.4 }}
          >
            <div className="report-icon">📄</div>
            <div className="report-link-info">
              <h3>{r.title}</h3>
              <p>{r.date}</p>
            </div>
            <span className="status-badge badge-deployed">
              <span className="status-dot dot-green" />
              {r.status}
            </span>
            <span className="report-download-arrow">↓</span>
          </motion.a>
        ))}
      </div>

    </div>
  );
}