const nf = new Intl.NumberFormat("en-US");

export const fmtInt = (n: number) => nf.format(Math.round(n));

export const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const fmtSol = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export const shortAddr = (a: string, head = 4, tail = 4) => `${a.slice(0, head)}…${a.slice(-tail)}`;

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const fmtMmSs = (sec: number) => `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;

/** UTC so server and client render identical strings. */
export const fmtUtc = (iso: string | number, withDate = true) => {
  const d = new Date(iso);
  const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  if (!withDate) return time;
  const mon = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${mon} ${d.getUTCDate()}, ${time}`;
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
