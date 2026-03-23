"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StarBackground from "@/components/StarBackground";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/telemetry", label: "Telemetry" },
    { href: "/videos", label: "Demonstrations" },
    { href: "/reports", label: "Reports" },
  ];

  return (
    <html lang="en">
      <body>
        <StarBackground />

        {/* 🚀 LOADING SPLASH */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="splash-screen"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="splash-logo"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="splash-orb" />
                <h1>PLEIADES</h1>
                <p className="splash-sub">Initializing Mission Control...</p>
                <div className="splash-bar">
                  <motion.div
                    className="splash-bar-fill"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🧭 NAVBAR */}
        <nav>
          <div className="nav-inner">
            <span className="nav-brand">⬡ PLEIADES</span>
            <div className="nav-links">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={pathname === href ? "nav-link active" : "nav-link"}
                >
                  {label}
                  {pathname === href && (
                    <motion.div
                      className="nav-active-bar"
                      layoutId="activeBar"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* 🌐 PAGE TRANSITIONS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            className="main-content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </body>
    </html>
  );
}