'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { formatDateTime, formatUsd } from '@/utils/format';
import type { PriceHistoryPoint } from '@/types/domain';

const HEIGHT = 260;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 60 };
const Y_TICKS = 4;
const HOUR_MS = 3_600_000;

const dayFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' });
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

interface Plotted {
  x: number;
  y: number;
  point: PriceHistoryPoint;
}

/**
 * A dependency-free SVG line chart. Expects at least two real snapshots — the caller shows the
 * "not enough data" state otherwise. Nothing is interpolated: the line joins stored snapshots
 * only, and the y-axis is scaled to the data (not forced through $0) so small moves stay visible.
 * Width follows its container (ResizeObserver); hover, touch and arrow keys all drive the tooltip.
 */
export function PriceHistoryChart({ points }: { points: PriceHistoryPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => {
    if (width <= 0 || points.length < 2) return null;

    const times = points.map((point) => new Date(point.fetchedAt).getTime());
    const prices = points.map((point) => point.priceUsd);
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const tSpan = tMax - tMin || 1;
    const pMin = Math.min(...prices);
    const pMax = Math.max(...prices);
    const pad = (pMax - pMin) * 0.12 || pMax * 0.05 || 1;
    const yMin = Math.max(0, pMin - pad);
    const yMax = pMax + pad;

    const innerW = Math.max(width - MARGIN.left - MARGIN.right, 1);
    const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;
    const xOf = (t: number) => MARGIN.left + ((t - tMin) / tSpan) * innerW;
    const yOf = (p: number) => MARGIN.top + (1 - (p - yMin) / (yMax - yMin)) * innerH;

    const plotted: Plotted[] = points.map((point, index) => ({
      x: xOf(times[index] ?? tMin),
      y: yOf(point.priceUsd),
      point,
    }));

    const line = plotted.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const baseline = MARGIN.top + innerH;
    const first = plotted[0];
    const last = plotted[plotted.length - 1];
    const area =
      first && last ? `${line} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z` : '';

    const yTicks = Array.from({ length: Y_TICKS }, (_, i) => {
      const value = yMin + ((yMax - yMin) * i) / (Y_TICKS - 1);
      return { value, y: yOf(value) };
    });

    const showTime = tSpan < 36 * HOUR_MS;
    const format = (t: number) => (showTime ? timeFormatter : dayFormatter).format(new Date(t));
    const xTicks = [
      { x: xOf(tMin), label: format(tMin), anchor: 'start' as const },
      { x: xOf(tMin + tSpan / 2), label: format(tMin + tSpan / 2), anchor: 'middle' as const },
      { x: xOf(tMax), label: format(tMax), anchor: 'end' as const },
    ];

    return { plotted, line, area, yTicks, xTicks, baseline, innerRight: MARGIN.left + innerW };
  }, [points, width]);

  const active = geometry && activeIndex !== null ? geometry.plotted[activeIndex] : undefined;

  const handlePointer = (event: PointerEvent<SVGSVGElement>) => {
    if (!geometry) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    geometry.plotted.forEach((p, index) => {
      const distance = Math.abs(p.x - px);
      if (distance < bestDistance) {
        best = index;
        bestDistance = distance;
      }
    });
    setActiveIndex(best);
  };

  const handleKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!geometry) return;
    const lastIndex = geometry.plotted.length - 1;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, (current ?? lastIndex + 1) - 1));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(lastIndex, (current ?? -1) + 1));
    } else if (event.key === 'Escape') {
      setActiveIndex(null);
    }
  };

  const prices = points.map((point) => point.priceUsd);
  const summary = `Price history, ${points.length} snapshots, low ${formatUsd(Math.min(...prices))}, high ${formatUsd(Math.max(...prices))}. Use left and right arrow keys to inspect points.`;

  return (
    <div ref={containerRef} className="relative w-full select-none" style={{ height: HEIGHT }}>
      {geometry ? (
        <>
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={summary}
            tabIndex={0}
            className="block touch-pan-y rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent-text"
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onPointerLeave={() => setActiveIndex(null)}
            onBlur={() => setActiveIndex(null)}
            onKeyDown={handleKey}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {geometry.yTicks.map((tick) => (
              <g key={tick.value}>
                <line
                  x1={MARGIN.left}
                  x2={geometry.innerRight}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="var(--color-line)"
                  strokeDasharray="3 4"
                />
                <text
                  x={MARGIN.left - 8}
                  y={tick.y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="11"
                  fill="var(--color-ink-muted)"
                >
                  {formatUsd(tick.value)}
                </text>
              </g>
            ))}

            {geometry.xTicks.map((tick, index) => (
              <text
                key={index}
                x={tick.x}
                y={geometry.baseline + 18}
                textAnchor={tick.anchor}
                fontSize="11"
                fill="var(--color-ink-muted)"
              >
                {tick.label}
              </text>
            ))}

            <path d={geometry.area} fill={`url(#${gradientId})`} />
            <path
              d={geometry.line}
              fill="none"
              stroke="var(--color-accent-text)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {active ? (
              <g pointerEvents="none">
                <line
                  x1={active.x}
                  x2={active.x}
                  y1={MARGIN.top}
                  y2={geometry.baseline}
                  stroke="var(--color-line-strong)"
                />
                <circle
                  cx={active.x}
                  cy={active.y}
                  r="4.5"
                  fill="var(--color-accent-text)"
                  stroke="var(--color-surface)"
                  strokeWidth="2"
                />
              </g>
            ) : null}
          </svg>

          {active ? (
            <div
              role="status"
              className="pointer-events-none absolute z-10 rounded-md border border-line-strong bg-raised px-3 py-2 shadow-lg"
              style={{
                left: Math.min(Math.max(active.x, 84), Math.max(width - 84, 84)),
                top: Math.max(active.y - 66, 0),
                transform: 'translateX(-50%)',
              }}
            >
              <p className="numeric text-sm font-semibold text-ink">{formatUsd(active.point.priceUsd)}</p>
              <p className="whitespace-nowrap text-xs text-ink-muted">
                {formatDateTime(active.point.fetchedAt)}
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
