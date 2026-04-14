export interface TelemetryPoint {
  time: number;
  alt: number;
  vel: number;
  ax: number;
  ay: number;
  az: number;
  lat: number;
  lon: number;
  fix: number;
  crossings: number;
  servo: number;
  rssi: number;
}

export const store = {
  altitudeData:   [] as number[],
  velocityData:   [] as number[],
  labels:         [] as number[],
  currentAlt:     0,
  currentVel:     0,
  lat:            null as number | null,
  lon:            null as number | null,
  rssi:           null as number | null,
  connected:      false,
  rawPacket:      null as any,
  payloads:       [
    { id: 1, status: "ARMED" },
    { id: 2, status: "ARMED" },
    { id: 3, status: "ARMED" },
  ],
  gsLat:          null as number | null,
  gsLon:          null as number | null,
  gsAccuracy:     null as number | null,
  flightLog:      [] as TelemetryPoint[],
  startTime:      null as number | null,
  ws:             null as any,
  tickRef:        0,
  listeners:      new Set<() => void>(),

  // Persistent timer — survives navigation
  elapsed:        0,
  metInterval:    null as any,
  mapInitialized: false,
};

export function startMetTimer() {
  if (store.metInterval) return; // already running
  store.metInterval = setInterval(() => {
    store.elapsed += 1;
    notifyListeners();
  }, 1000);
}

export function logTelemetry(data: TelemetryPoint) {
  if (store.startTime === null) store.startTime = Date.now();
  store.flightLog.push({ ...data, time: (Date.now() - store.startTime) / 1000 });
}

export function getFlightLog()  { return store.flightLog; }
export function clearFlightLog() { store.flightLog = []; store.startTime = null; }

export function notifyListeners() {
  store.listeners.forEach((fn) => fn());
}

export function ensureWebSocket() {
  if (typeof window === "undefined") return;
  if (store.ws && (store.ws.readyState === 0 || store.ws.readyState === 1)) return;

  function connect() {
    const ws = new window.WebSocket("ws://localhost:8765");
    store.ws = ws;

    ws.onopen = () => {
      store.connected = true;
      notifyListeners();
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const d = JSON.parse(event.data);
        const t = store.tickRef++;
        const mToFt   = (m: number) => m * 3.28084;
        const msToFts = (ms: number) => ms * 3.28084;

        const point: TelemetryPoint = {
          time:      t,
          alt:       d.alt       ?? 0,
          vel:       d.vel       ?? 0,
          ax:        d.ax        ?? 0,
          ay:        d.ay        ?? 0,
          az:        d.az        ?? 0,
          lat:       d.lat       ?? 0,
          lon:       d.lon       ?? 0,
          fix:       d.fix       ?? 0,
          crossings: d.crossings ?? 0,
          servo:     d.servo     ?? 0,
          rssi:      d.rssi      ?? 0,
        };

        logTelemetry(point);

        store.currentAlt   = point.alt;
        store.currentVel   = point.vel;
        store.altitudeData = [...store.altitudeData.slice(-49), mToFt(point.alt)];
        store.velocityData = [...store.velocityData.slice(-49), msToFts(point.vel)];
        store.labels       = [...store.labels.slice(-49), t];

        if (d.lat && d.lon) { store.lat = d.lat; store.lon = d.lon; }
        if (d.rssi)         { store.rssi = d.rssi; }
        if (d.servo === 1) {
          store.payloads = store.payloads.map((x) =>
            x.id === 1 ? { ...x, status: "DEPLOYED" } : x
          );
        }

        store.rawPacket = { pkt: t, ...point };
        notifyListeners();
      } catch { /* skip bad packets */ }
    };

    ws.onclose = () => {
      store.connected = false;
      store.ws = null;
      notifyListeners();
      setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }

  connect();
}