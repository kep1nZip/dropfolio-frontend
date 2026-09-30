import clsx from 'clsx';
import type { ReactNode } from 'react';

/** Steam app id of Counter-Strike 2 — the Community Market namespace all Dropfolio items live in. */
const STEAM_APP_ID_CS2 = 730;

interface Marketplace {
  id: string;
  name: string;
  /** Builds the outbound URL from the item's Steam market hash name. */
  url: (marketHashName: string) => string;
  icon: ReactNode;
  /** Hover/focus colours. Kept as complete literal class strings so Tailwind can see them. */
  theme: string;
  /** How the icon moves on hover/focus. */
  iconMotion: string;
}

const enc = encodeURIComponent;

/** Steam glyph (Simple Icons path, 24×24 viewBox), drawn in `currentColor`. */
function SteamLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}

function Lettermark({ text }: { text: string }) {
  return <span className="text-[11px] font-bold leading-none tracking-tight">{text}</span>;
}

/**
 * Add a marketplace by adding one entry here. The CSFloat / Skinport URLs are search pages that
 * take the item name as a query parameter, so they land on a results page, not one exact listing.
 */
const MARKETPLACES: Marketplace[] = [
  {
    id: 'steam',
    name: 'Steam Market',
    url: (name) => `https://steamcommunity.com/market/listings/${STEAM_APP_ID_CS2}/${enc(name)}`,
    icon: <SteamLogo />,
    theme:
      'hover:border-[#66c0f4]/60 hover:bg-[#1b2838] hover:text-[#66c0f4] hover:shadow-[0_0_0_4px_rgba(102,192,244,0.12),0_6px_20px_-6px_rgba(102,192,244,0.55)] focus-visible:border-[#66c0f4]/60 focus-visible:bg-[#1b2838] focus-visible:text-[#66c0f4] focus-visible:shadow-[0_0_0_4px_rgba(102,192,244,0.12),0_6px_20px_-6px_rgba(102,192,244,0.55)]',
    iconMotion:
      'group-hover:rotate-[360deg] group-hover:scale-110 group-focus-visible:rotate-[360deg] group-focus-visible:scale-110',
  },
  {
    id: 'csfloat',
    name: 'CSFloat',
    url: (name) => `https://csfloat.com/search?market_hash_name=${enc(name)}`,
    icon: <Lettermark text="CF" />,
    theme:
      'hover:border-[#34d399]/60 hover:bg-[#0f2a22] hover:text-[#34d399] hover:shadow-[0_0_0_4px_rgba(52,211,153,0.12),0_6px_20px_-6px_rgba(52,211,153,0.55)] focus-visible:border-[#34d399]/60 focus-visible:bg-[#0f2a22] focus-visible:text-[#34d399] focus-visible:shadow-[0_0_0_4px_rgba(52,211,153,0.12),0_6px_20px_-6px_rgba(52,211,153,0.55)]',
    iconMotion: 'group-hover:-rotate-6 group-hover:scale-125 group-focus-visible:-rotate-6 group-focus-visible:scale-125',
  },
  {
    id: 'skinport',
    name: 'Skinport',
    url: (name) => `https://skinport.com/market?search=${enc(name)}`,
    icon: <Lettermark text="SP" />,
    theme:
      'hover:border-[#fb923c]/60 hover:bg-[#2b1a0e] hover:text-[#fb923c] hover:shadow-[0_0_0_4px_rgba(251,146,60,0.12),0_6px_20px_-6px_rgba(251,146,60,0.55)] focus-visible:border-[#fb923c]/60 focus-visible:bg-[#2b1a0e] focus-visible:text-[#fb923c] focus-visible:shadow-[0_0_0_4px_rgba(251,146,60,0.12),0_6px_20px_-6px_rgba(251,146,60,0.55)]',
    iconMotion: 'group-hover:-rotate-6 group-hover:scale-125 group-focus-visible:-rotate-6 group-focus-visible:scale-125',
  },
];

/**
 * Round outbound buttons to the item's page on Steam Community Market, CSFloat and Skinport
 * (each opens in a new tab). These are plain links the user opens — the app never requests
 * anything from these sites in the browser; prices still come only from the Dropfolio API.
 *
 * Hover / keyboard focus: the icon animates, a light sheen sweeps across, the button takes the
 * marketplace's colour with a soft glow, and a name tooltip fades in below. The tooltip is
 * absolutely positioned, so nothing shifts when it appears. Motion is dropped under
 * `prefers-reduced-motion`.
 */
export function MarketplaceLinks({
  marketHashName,
  itemName,
}: {
  marketHashName: string;
  itemName: string;
}) {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">
      {MARKETPLACES.map((marketplace) => (
        <a
          key={marketplace.id}
          href={marketplace.url(marketHashName)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${itemName} on ${marketplace.name} (opens in a new tab)`}
          className={clsx(
            'group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-ink-dim',
            'transition-all duration-300 ease-out motion-reduce:transition-none',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
            marketplace.theme,
          )}
        >
          {/* sheen sweep (clipped to the circle) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full motion-reduce:hidden"
          >
            <span
              className="absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full group-focus-visible:translate-x-full"
              style={{
                background:
                  'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
              }}
            />
          </span>

          <span
            className={clsx(
              'relative flex h-5 w-5 items-center justify-center transition-transform duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none',
              marketplace.iconMotion,
            )}
          >
            {marketplace.icon}
          </span>

          {/* name tooltip */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-full z-20 mt-2 translate-y-1 whitespace-nowrap rounded-md border border-line-strong bg-raised px-2 py-1 text-xs font-medium text-ink opacity-0 shadow-lg transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
          >
            View on {marketplace.name}
          </span>
        </a>
      ))}
    </div>
  );
}