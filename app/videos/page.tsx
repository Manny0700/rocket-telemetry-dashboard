"use client";

export default function DemonstrationsPage() {
  return (
    <div style={{ padding: "40px" }}>

      <h1>Mission Demonstrations</h1>

      {/* VIDEO SECTION */}

      <h2 style={{ marginTop: "30px" }}>Launch Videos</h2>

      <h3>Rocket Launch Test</h3>
      <video width="700" controls>
        <source src="/videos/launch1.mp4" type="video/mp4" />
      </video>

      <br /><br />

      <h3>Payload Deployment Demonstration</h3>
      <video width="700" controls>
        <source src="/videos/payload.mp4" type="video/mp4" />
      </video>

      {/* REPORTS SECTION */}

      <h2 style={{ marginTop: "50px" }}>Flight Reports</h2>

      <ul style={{ fontSize: "18px" }}>

        <li>
          <a href="/reports/flight1.pdf" target="_blank">
            Flight Test Report 1
          </a>
        </li>

        <li>
          <a href="/reports/flight2.pdf" target="_blank">
            Flight Test Report 2
          </a>
        </li>

      </ul>

    </div>
  );
}