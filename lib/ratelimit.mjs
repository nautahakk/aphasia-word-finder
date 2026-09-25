// Small in-memory limiter so a public demo can't run up the API bill.
// (Per server instance - good enough for a demo, not for production.)
export function createLimiter({ perMinute = 30, perDay = 20000, now = () => Date.now() } = {}) {
  const hits = new Map(); // ip -> timestamps in the last minute
  let day = Math.floor(now() / 86_400_000);
  let today = 0;
  return {
    check(ip = "unknown") {
      const t = now();
      const d = Math.floor(t / 86_400_000);
      if (d !== day) { day = d; today = 0; }
      if (today >= perDay) return false;
      const recent = (hits.get(ip) ?? []).filter((x) => t - x < 60_000);
      if (recent.length >= perMinute) { hits.set(ip, recent); return false; }
      recent.push(t);
      hits.set(ip, recent);
      today++;
      return true;
    },
  };
}
