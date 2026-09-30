'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bell, TrendingDown, TrendingUp } from 'lucide-react';

/**
 * Put the PNGs in `public/images/` (Next serves that folder from `/images/...`) and point these
 * paths at them. A missing or broken file falls back to the drawn artwork, so the page never
 * shows a broken-image icon.
 */
const SKIN_IMAGE = '/images/ak-47-redline.png';
/** Scale-up for the rifle PNG. Skin icons carry transparent padding, so they look small when fitted as-is. */
const SKIN_SCALE = 1.25;

interface CaseCard {
  name: string;
  image: string;
  price: string;
  change: string;
  up: boolean;
  color: string;
  angle: number;
  motif: 'circle' | 'bolt' | 'moon';
}

/** Illustrative figures only. Angles are 120° apart on the ring. */
const CASES: CaseCard[] = [
  {
    name: 'CS:GO Weapon Case',
    image: '/images/cs-go-weapon-case.png',
    price: '$24.50',
    change: '+3.12%',
    up: true,
    color: '#b0c3d9',
    angle: 0,
    motif: 'circle',
  },
  {
    name: 'Operation Breakout Weapon Case',
    image: '/images/operation-breakout-weapon-case.png',
    price: '$1.90',
    change: '-1.24%',
    up: false,
    color: '#f59e42',
    angle: 120,
    motif: 'bolt',
  },
  {
    name: 'Dreams & Nightmares Case',
    image: '/images/dreams-and-nightmares-case.png',
    price: '$0.85',
    change: '+0.62%',
    up: true,
    color: '#b36bff',
    angle: 240,
    motif: 'moon',
  },
];

/** Drawn stand-in for a case, used when its PNG is missing. */
function CrateFallback({ color, motif }: { color: string; motif: CaseCard['motif'] }) {
  return (
    <svg viewBox="0 0 80 60" className="h-full w-full px-4">
      <rect x="8" y="18" width="64" height="38" rx="4" fill="#232a36" stroke={color} strokeOpacity="0.5" />
      <rect x="4" y="10" width="72" height="12" rx="3" fill={color} fillOpacity="0.9" />
      <rect x="34" y="10" width="12" height="46" fill={color} fillOpacity="0.3" />
      <path d="M8 26 H72" stroke="#fff" strokeOpacity="0.08" />
      {motif === 'circle' && <circle cx="40" cy="38" r="6" fill={color} />}
      {motif === 'bolt' && <path d="M42 29 L34 40 H40 L38 49 L47 37 H41 Z" fill={color} />}
      {motif === 'moon' && <path d="M44 30 a8 8 0 1 0 0 16 a6.5 6.5 0 1 1 0 -16 Z" fill={color} />}
    </svg>
  );
}

function CaseArt({ item }: { item: CaseCard }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <CrateFallback color={item.color} motif={item.motif} />;
  return (
    <Image
      src={item.image}
      alt=""
      width={160}
      height={120}
      loading="eager"
      draggable={false}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain"
    />
  );
}

/** Drawn stand-in for the AK-47 | Redline, used when its PNG is missing. */
function RifleFallback() {
  return (
    <svg viewBox="0 0 600 210" className="h-full w-full">
      <defs>
        <pattern id="auth-redline" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
          <rect width="26" height="26" fill="#1b1f27" />
          <rect width="9" height="26" fill="#e0372d" />
          <rect x="9" width="2" height="26" fill="#ff9a8c" opacity="0.45" />
        </pattern>
      </defs>
      <g stroke="rgba(255,255,255,0.14)" strokeWidth="1">
        <rect x="398" y="90" width="152" height="9" rx="3" fill="#2a2f3a" />
        <rect x="548" y="85" width="32" height="19" rx="3" fill="#2a2f3a" />
        <path d="M506 90 L512 70 L522 70 L526 90 Z" fill="#2a2f3a" />
        <rect x="280" y="68" width="122" height="11" rx="5.5" fill="#2a2f3a" />
        <path d="M8 94 L120 86 L124 116 L28 142 Q10 146 8 128 Z" fill="#20242d" />
        <path d="M150 120 L184 120 L170 176 Q168 182 160 182 L142 182 Z" fill="#20242d" />
        <path d="M196 120 L246 120 C248 152 266 174 292 186 L272 206 C226 190 198 158 196 120 Z" fill="#2a2f3a" />
        <path d="M184 120 Q200 142 226 122" fill="none" stroke="#2a2f3a" strokeWidth="4" />
        <path d="M276 84 H398 a8 8 0 0 1 8 8 V110 a8 8 0 0 1 -8 8 H276 Z" fill="url(#auth-redline)" />
        <path d="M126 76 H282 V120 H126 a8 8 0 0 1 -8 -8 V84 a8 8 0 0 1 8 -8 Z" fill="url(#auth-redline)" />
      </g>
      <rect x="200" y="86" width="40" height="6" rx="2" fill="#0c0e12" opacity="0.6" />
      <path d="M130 80 H278" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  );
}

function SkinArt() {
  const [failed, setFailed] = useState(false);
  if (failed) return <RifleFallback />;
  return (
    <Image
      src={SKIN_IMAGE}
      alt=""
      width={640}
      height={480}
      loading="eager"
      draggable={false}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain"
      style={{ transform: `scale(${SKIN_SCALE})` }}
    />
  );
}

/**
 * Decorative hero for the signed-out screens, stacked in three tiers that fit one column:
 *  1. Three CS2 cases orbiting on a slowly turning 3D ring above a soft glow "stage" (each card
 *     counter-rotates so it always faces the viewer). Hover pauses the orbit.
 *  2. The AK-47 | Redline with a price-alert toast floating above its stock.
 *  3. A tidy two-up row: price + trend and float bar.
 * Artwork comes from `public/images/*.png` and falls back to drawn art if a file is missing. The
 * figures are illustrative. No API calls, hidden from assistive tech, and motion is removed under
 * `prefers-reduced-motion`. The ring radius follows the container width (cqw), so it fits whether
 * the parent gives it 500px or 900px.
 */
export function AuthShowcase() {
  return (
    <div
      aria-hidden="true"
      className="mt-8 w-full max-w-xl select-none [container-type:inline-size] 2xl:mt-0 2xl:min-w-0 2xl:flex-1"
    >
      <style>{`
        /* orbit */
        .auth-stage { perspective: 1500px }
        .auth-tilt { position: absolute; inset: 0; transform-style: preserve-3d; transform: rotateX(-7deg) }
        .auth-ring { position: absolute; inset: 0; transform-style: preserve-3d; animation: auth-orbit 24s linear infinite }
        .auth-slot { --r: 170px; position: absolute; left: 50%; top: 50%; width: 10rem; height: 12.5rem;
          margin: -6.25rem 0 0 -5rem; transform-style: preserve-3d; transform: rotateY(var(--a)) translateZ(var(--r)) }
        @supports (width: 1cqw) { .auth-slot { --r: min(200px, 34cqw) } }
        .auth-face { height: 100%; transform-style: preserve-3d; animation: auth-face 24s linear infinite }
        .auth-stage:hover .auth-ring, .auth-stage:hover .auth-face { animation-play-state: paused }
        @keyframes auth-orbit { from { transform: rotateY(0deg) } to { transform: rotateY(360deg) } }
        @keyframes auth-face {
          from { transform: rotateY(calc(var(--a) * -1)) rotateX(7deg) }
          to { transform: rotateY(calc(var(--a) * -1 - 360deg)) rotateX(7deg) }
        }

        /* gentle bob for the floating cards */
        @keyframes auth-float { from { transform: translateY(0) } to { transform: translateY(-6px) } }
        .auth-float { animation: auth-float 6s ease-in-out infinite alternate }

        @media (prefers-reduced-motion: reduce) {
          .auth-ring, .auth-face, .auth-float { animation: none }
          .auth-face { transform: rotateY(calc(var(--a) * -1)) rotateX(7deg) }
        }
      `}</style>

      {/* ───────── 1. orbiting cases ───────── */}
      <div className="auth-stage relative h-72 w-full">
        <div
          className="absolute inset-x-[8%] bottom-0 h-12 rounded-[50%]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(99,102,241,0.38), rgba(224,55,45,0.12) 55%, transparent 74%)',
            filter: 'blur(8px)',
          }}
        />

        <div className="auth-tilt">
          <div className="auth-ring">
            {CASES.map((item) => (
              <div key={item.name} className="auth-slot" style={{ ['--a' as string]: `${item.angle}deg` }}>
                <div className="auth-face">
                  <div
                    className="flex h-full flex-col rounded-xl border p-3 shadow-2xl"
                    style={{
                      background: 'linear-gradient(160deg, #222835, #171b23)',
                      borderColor: `${item.color}66`,
                      boxShadow: `0 18px 40px -12px ${item.color}55, 0 0 0 1px rgba(255,255,255,0.03) inset`,
                    }}
                  >
                    <div
                      className="mx-auto h-20 w-full rounded-lg px-2 py-1"
                      style={{ background: `radial-gradient(circle at 50% 40%, ${item.color}33, transparent 70%)` }}
                    >
                      <CaseArt item={item} />
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-8 text-xs font-medium leading-4 text-ink">{item.name}</p>
                    <span
                      className="mt-1 w-fit rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide"
                      style={{ background: `${item.color}22`, color: item.color }}
                    >
                      CASE
                    </span>
                    <div className="mt-auto flex items-end justify-between">
                      <p className="numeric text-lg font-semibold text-ink">{item.price}</p>
                      <p
                        className={`numeric flex items-center gap-1 text-xs font-medium ${
                          item.up ? 'text-positive' : 'text-danger'
                        }`}
                      >
                        {item.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {item.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────── 2. AK-47 Redline ───────── */}
      <div className="relative mt-12 h-48 w-full">
        <div
          className="absolute inset-x-0 top-1/2 h-40 -translate-y-1/2"
          style={{ background: 'radial-gradient(ellipse at center, rgba(224,55,45,0.18), transparent 68%)' }}
        />

        <div className="absolute inset-x-[8%] inset-y-2 -rotate-6">
          <div
            className="auth-float h-full"
            style={{ animationDuration: '8s', filter: 'drop-shadow(0 20px 32px rgba(224,55,45,0.28))' }}
          >
            <SkinArt />
          </div>
        </div>

        {/* price alert — sits in the empty corner above the stock */}
        <div className="absolute left-0 top-0">
          <div className="auth-float" style={{ animationDuration: '6.5s', animationDelay: '-2s' }}>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-raised/70 py-2.5 pl-2.5 pr-4 shadow-xl backdrop-blur-md">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                <Bell size={14} />
              </span>
              <span>
                <p className="text-xs font-medium text-ink">Price alert hit</p>
                <p className="numeric text-[10px] text-ink-muted">Target $40.00 reached</p>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── 3. two-up row ───────── */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="auth-float" style={{ animationDuration: '5.5s', animationDelay: '-1s' }}>
          <div className="h-full rounded-xl border border-white/10 bg-raised/70 p-3.5 shadow-xl backdrop-blur-md">
            <p className="text-[11px] text-ink-muted">AK-47 | Redline (FT)</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="numeric text-xl font-semibold text-ink">$34.65</p>
              <p className="numeric flex items-center gap-1 text-xs font-medium text-positive">
                <TrendingUp size={13} /> +8.42%
              </p>
            </div>
            <svg viewBox="0 0 100 34" className="mt-2 h-7 w-full" preserveAspectRatio="none">
              <polyline
                points="0,30 14,26 28,28 42,18 56,20 70,10 84,12 100,4"
                fill="none"
                stroke="var(--color-positive)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <p className="mt-1 text-[10px] text-ink-muted">Example data · 7D</p>
          </div>
        </div>

        <div className="auth-float" style={{ animationDuration: '7s', animationDelay: '-3s' }}>
          <div className="flex h-full flex-col justify-center rounded-xl border border-white/10 bg-raised/70 p-3.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-ink-muted">Float</span>
              <span className="numeric font-medium text-ink">0.2214 · Field-Tested</span>
            </div>
            <div className="relative mt-3">
              <div className="flex h-1.5 gap-px overflow-hidden rounded-full">
                <span className="bg-[#2fbf71]" style={{ width: '7%' }} />
                <span className="bg-[#8ac34a]" style={{ width: '8%' }} />
                <span className="bg-[#e0b030]" style={{ width: '23%' }} />
                <span className="bg-[#e08a30]" style={{ width: '7%' }} />
                <span className="bg-[#e0372d]" style={{ width: '55%' }} />
              </div>
              <span className="absolute -top-1 h-3.5 w-0.5 rounded bg-white" style={{ left: '22%' }} />
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-ink-muted">
              <span>FN</span>
              <span>MW</span>
              <span>FT</span>
              <span>WW</span>
              <span>BS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}