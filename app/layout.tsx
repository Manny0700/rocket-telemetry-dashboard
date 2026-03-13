import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLEIADES Rocket Telemetry Dashboard",
  description: "Rocket telemetry monitoring system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>

        <nav
          style={{
            background: "#020c1b",
            padding: "20px",
            display: "flex",
            gap: "40px",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          <a href="/" style={{ color: "#00E5FF", textDecoration: "none" }}>
            Home
          </a>

          <a
            href="/dashboard"
            style={{ color: "#00E5FF", textDecoration: "none" }}
          >
            Telemetry
          </a>

          <a
            href="/videos"
            style={{ color: "#00E5FF", textDecoration: "none" }}
          >
            Demonstrations
          </a>

          <a
            href="/reports"
            style={{ color: "#00E5FF", textDecoration: "none" }}
          >
            Reports
          </a>
        </nav>

        <main>{children}</main>

      </body>
    </html>
  );
}