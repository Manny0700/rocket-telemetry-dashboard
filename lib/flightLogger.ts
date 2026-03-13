let flightLog: any[] = [
  { time: 1, altitude: 50, velocity: 20 },
  { time: 2, altitude: 120, velocity: 40 },
  { time: 3, altitude: 300, velocity: 80, payload1: true },
  { time: 4, altitude: 600, velocity: 110 },
  { time: 5, altitude: 950, velocity: 150, payload2: true },
  { time: 6, altitude: 1300, velocity: 170 },
  { time: 7, altitude: 1450, velocity: 180, payload3: true },
  { time: 8, altitude: 1300, velocity: 160 },
  { time: 9, altitude: 900, velocity: 120 },
  { time: 10, altitude: 400, velocity: 60 }
];

export function logTelemetry(data: any) {
  flightLog.push(data);
}

export function getFlightLog() {
  return flightLog;
}

export function clearFlightLog() {
  flightLog = [];
}