"use client";

import { motion } from "framer-motion";

const buildVideos = [
  {
    id: 1,
    title: "Assembly",
    embedUrl: "https://drive.google.com/file/d/1QrJV04zylriLKeTsfrqGVLkdRgvUx6mN/preview",
    phase: "ASSEMBLY",
  },
  {
    id: 2,
    title: "Setup 1",
    embedUrl: "https://drive.google.com/file/d/1N99V79krbwlzx4wBBGxJNVxMVuSC4OlM/preview",
    phase: "ASSEMBLY",
  },
  {
    id: 3,
    title: "Setup 2",
    embedUrl: "https://drive.google.com/file/d/1ddJo0reE5NVEiVFUXFGzN-2F3T98YZWb/preview",
    phase: "ASSEMBLY",
  },
  {
    id: 4,
    title: "Ground Deployment Test",
    embedUrl: "https://drive.google.com/file/d/1lRs23j1rRoYpUS9wC9Z467SavLzqtyAP/preview",
    phase: "TESTING",
  },
  {
    id: 5,
    title: "Nosecone Deployment 1",
    embedUrl: "https://drive.google.com/file/d/1NzQHgSxzCucxVJRNDDTZTcBAQmKLufRJ/preview",
    phase: "TESTING",
  },
  {
    id: 6,
    title: "Ejection Charge Test",
    embedUrl: "https://drive.google.com/file/d/1HpWJpU8t6YGw3N1A3tQZyD0Qs_-StCcR/preview",
    phase: "TESTING",
  },
  {
    id: 7,
    title: "Nosecone Deployment 2",
    embedUrl: "https://drive.google.com/file/d/1ri-K1kwFMqEshjrvJ79dk19-M4iK6JzQ/preview",
    phase: "TESTING",
  },
];

const buildReports = [
  { id: 2, title: "M2", href: "/reports/M2.pdf", status: "COMPLETE" },
  { id: 3, title: "M3", href: "/reports/M3.pdf", status: "COMPLETE" },
  { id: 4, title: "M4", href: "/reports/M4.pdf", status: "COMPLETE" },
  { id: 5, title: "M5", href: "/reports/M5.pdf", status: "COMPLETE" },
  { id: 6, title: "M6", href: "/reports/M6.pdf", status: "COMPLETE" },
];

const buildPhases = [
  { phase: "PHASE 1", label: "Concept & Design",  detail: "Initial concept, CAD modelling, and PDR submission." },
  { phase: "PHASE 2", label: "Procurement",        detail: "Component sourcing, motor selection, and materials ordering." },
  { phase: "PHASE 3", label: "Assembly",           detail: "Airframe construction, fin alignment, and nose cone integration." },
  { phase: "PHASE 4", label: "Avionics",           detail: "Flight computer wiring, altimeter calibration, and bay integration." },
  { phase: "PHASE 5", label: "Ground Testing",     detail: "Ejection charge tests, static fire, and continuity checks." },
  { phase: "PHASE 6", label: "Flight Ready",       detail: "FRR sign-off, transport, and pad preparation." },
];

const phaseBadgeColor: Record<string, string> = {
  ASSEMBLY: "#2563eb",
  AVIONICS: "#7c3aed",
  TESTING:  "#b45309",
};

export default function BuildPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>

      {/* ── Header ── */}
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

      {/* ── Build Reports (TOP) ── */}
      <motion.h2
        style={{ marginTop: "40px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.1 * i + 0.2 }}
          >
            <div className="report-icon">📄</div>
            <div className="report-link-info">
              <h3>{r.title}</h3>
            </div>
            <span className="status-badge badge-deployed">
              <span className="status-dot dot-green" />
              {r.status}
            </span>
            <span className="report-download-arrow">↓</span>
          </motion.a>
        ))}
      </div>

      {/* ── Build Phases ── */}
      <motion.h2
        style={{ marginTop: "48px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
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
            transition={{ delay: 0.07 * i + 0.25 }}
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

      {/* ── Build Process Videos ── */}
      <motion.h2
        style={{ marginTop: "56px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Build Process Videos
      </motion.h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "16px" }}>
        {buildVideos.map((v, i) => (
          <motion.div
            key={v.id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}
          >
            <div style={{
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#000",
            }}>
              <iframe
                src={v.embedUrl}
                width="100%"
                height="480"
                allow="autoplay"
                style={{ border: 0, display: "block" }}
              />
            </div>
            <div style={{ padding: "14px 4px 4px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                padding: "2px 8px", borderRadius: 4,
                background: phaseBadgeColor[v.phase] ?? "#334155",
                color: "#fff",
              }}>
                {v.phase}
              </span>
              <h3 style={{ margin: 0 }}>{v.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}