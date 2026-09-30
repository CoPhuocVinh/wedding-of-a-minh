// Vector pieces of the envelope card: paper textures, twine and a dried
// baby's-breath sprig. All CSS/SVG so they stay sharp at any size.

const noise = (freq: number, alpha: number, size: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .32 0 0 0 0 .22 0 0 0 ${alpha} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )}")`;

/** Beige linen: fine warp/weft lines over grain. */
export const LINEN = {
  backgroundColor: "#e9e0d0",
  backgroundImage: [
    "repeating-linear-gradient(0deg, rgba(120,95,60,.04) 0 1px, transparent 1px 3px)",
    "repeating-linear-gradient(90deg, rgba(120,95,60,.035) 0 1px, transparent 1px 3px)",
    noise(0.9, 0.1, 200),
    "linear-gradient(170deg, rgba(255,255,255,.25), rgba(0,0,0,.03))",
  ].join(","),
};

/** Bright cotton paper. */
export const PAPER = {
  backgroundColor: "#f7f5f1",
  backgroundImage: [noise(0.75, 0.05, 200), "linear-gradient(180deg, #fbfaf7, #f2efe9)"].join(","),
};

/** Two parallel twisted cotton cords. */
export function Twine({ className }: { className?: string }) {
  return (
    <svg className={className} height="15" width="100%" aria-hidden>
      <defs>
        <pattern id="card-twist" width="5" height="15" patternUnits="userSpaceOnUse">
          {[3, 11.5].map((y) => (
            <g key={y}>
              <ellipse cx="2.5" cy={y} rx="3.4" ry="1.55" transform={`rotate(-42 2.5 ${y})`} fill="#e9e3d8" stroke="#a89c88" strokeWidth=".45" />
              <path d={`M.8 ${y + 0.9} Q2.5 ${y - 0.2} 4.2 ${y - 0.9}`} stroke="#fff" strokeWidth=".55" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="15" fill="url(#card-twist)" />
    </svg>
  );
}

/** Deterministic PRNG so server and client render identical shapes. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (v: number) => v.toFixed(2);

type Floret = { x: number; y: number; r: number; rot: number; bud: boolean };

function buildSprig() {
  const rand = rng(11);
  const stems: { d: string; w: number }[] = [];
  const florets: Floret[] = [];

  const cluster = (x: number, y: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const dist = i === 0 ? 0 : 2.8 + rand() * 4.2;
      florets.push({
        x: x + Math.cos(a) * dist,
        y: y + Math.sin(a) * dist * 0.85,
        r: 2.4 + rand() * 1.5,
        rot: rand() * 360,
        bud: rand() < 0.12,
      });
    }
  };

  const branch = (x: number, y: number, angle: number, len: number, depth: number) => {
    const bend = (rand() - 0.5) * 0.35;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    const mx = x + Math.cos(angle + bend) * len * 0.5;
    const my = y + Math.sin(angle + bend) * len * 0.5;
    stems.push({ d: `M${f(x)} ${f(y)} Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`, w: [1.25, 0.8, 0.55][depth] });
    cluster(ex, ey, depth === 0 ? 5 : 3 + Math.floor(rand() * 3));

    if (depth < 2) {
      const forks = depth === 0 ? 2 : 1 + Math.round(rand());
      for (let i = 0; i < forks; i++) {
        const t = 0.5 + rand() * 0.35;
        const px = (1 - t) ** 2 * x + 2 * (1 - t) * t * mx + t * t * ex;
        const py = (1 - t) ** 2 * y + 2 * (1 - t) * t * my + t * t * ey;
        const dir = angle + (i % 2 ? 1 : -1) * (0.45 + rand() * 0.35);
        branch(px, py, dir, len * (0.32 + rand() * 0.18), depth + 1);
      }
    }
  };

  // Gathered at the base, fanning up and leaning slightly right.
  [-2.02, -1.82, -1.62, -1.44, -1.26, -1.08].forEach((a, i) =>
    branch(78 + (rand() - 0.5) * 4, 196, a + (rand() - 0.5) * 0.08, 132 + rand() * 42 - (i === 0 || i === 5 ? 28 : 0), 0),
  );
  return { stems, florets };
}

const SPRIG = buildSprig();

export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 200" className={className} aria-hidden>
      <defs>
        <radialGradient id="card-petal" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fffefb" />
          <stop offset=".65" stopColor="#f6efe0" />
          <stop offset="1" stopColor="#e2d3b3" />
        </radialGradient>
        <linearGradient id="card-stem" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6f6040" />
          <stop offset="1" stopColor="#9a8a62" />
        </linearGradient>
      </defs>
      <g stroke="url(#card-stem)" fill="none" strokeLinecap="round">
        {SPRIG.stems.map((s, i) => (
          <path key={i} d={s.d} strokeWidth={s.w} />
        ))}
      </g>
      {SPRIG.florets.map((fl, i) =>
        fl.bud ? (
          <ellipse key={i} cx={f(fl.x)} cy={f(fl.y)} rx={f(fl.r * 0.55)} ry={f(fl.r * 0.8)} fill="#d9c9a4" stroke="#b7a57c" strokeWidth=".3" transform={`rotate(${f(fl.rot)} ${f(fl.x)} ${f(fl.y)})`} />
        ) : (
          <g key={i} transform={`translate(${f(fl.x)} ${f(fl.y)}) rotate(${f(fl.rot)})`}>
            {[0, 51, 103, 154, 206, 257, 309].map((deg) => (
              <ellipse key={deg} cx="0" cy={f(-fl.r * 0.48)} rx={f(fl.r * 0.36)} ry={f(fl.r * 0.52)} transform={`rotate(${deg})`} fill="url(#card-petal)" stroke="#d6c6a2" strokeWidth=".22" />
            ))}
            <circle r={f(fl.r * 0.22)} fill="#e6d4a6" />
          </g>
        ),
      )}
    </svg>
  );
}
