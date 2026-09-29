import { ExternalLink } from 'lucide-react';

/** Steam app id of Counter-Strike 2 — the Community Market namespace all Dropfolio items live in. */
const STEAM_APP_ID_CS2 = 730;

/**
 * Public Community Market listing page of an item. This is a plain outbound link the user opens
 * themselves — the app never fetches anything from Steam in the browser (prices still come only
 * from the Dropfolio API).
 */
export function steamMarketListingUrl(marketHashName: string): string {
  return `https://steamcommunity.com/market/listings/${STEAM_APP_ID_CS2}/${encodeURIComponent(marketHashName)}`;
}

/** Steam glyph (Simple Icons path, 24×24 viewBox), drawn in `currentColor`. */
function SteamLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}

/**
 * Round Steam button that opens the item's Community Market listing in a new tab.
 * Hover / keyboard focus: the logo spins a full turn and grows, a light sheen sweeps across, the
 * pill takes Steam's dark-blue fill with a soft blue glow, and a "View on Steam" label slides out.
 * All motion is dropped under `prefers-reduced-motion`.
 */
export function SteamMarketLink({
  marketHashName,
  itemName,
}: {
  marketHashName: string;
  itemName: string;
}) {
  return (
    <a
      href={steamMarketListingUrl(marketHashName)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${itemName} on the Steam Community Market (opens in a new tab)`}
      title="View on Steam Community Market"
      className="group relative ml-auto inline-flex h-10 shrink-0 items-center overflow-hidden rounded-full border border-line bg-raised px-2.5 text-ink-dim transition-all duration-300 ease-out hover:border-[#66c0f4]/60 hover:bg-[#1b2838] hover:text-[#66c0f4] hover:shadow-[0_0_0_4px_rgba(102,192,244,0.12),0_6px_20px_-6px_rgba(102,192,244,0.55)] focus-visible:border-[#66c0f4]/60 focus-visible:bg-[#1b2838] focus-visible:text-[#66c0f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text motion-reduce:transition-none"
    >
      {/* sheen sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full group-focus-visible:translate-x-full motion-reduce:hidden"
        style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)' }}
      />
      <SteamLogo className="relative h-5 w-5 shrink-0 transition-transform duration-500 ease-out group-hover:rotate-[360deg] group-hover:scale-110 group-focus-visible:rotate-[360deg] group-focus-visible:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />
      <span className="relative flex max-w-0 items-center gap-1 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-[10rem] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[10rem] group-focus-visible:opacity-100 motion-reduce:transition-none">
        View on Steam
        <ExternalLink size={12} aria-hidden="true" />
      </span>
    </a>
  );
}