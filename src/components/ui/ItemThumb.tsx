'use client';

import Image from 'next/image';
import clsx from 'clsx';
import { useState } from 'react';
import { isOptimizableHost, isRenderableImageUrl } from '@/lib/image-hosts';
import type { ItemType } from '@/types/domain';

const GRADE_BORDER: Record<ItemType, string> = {
  CASE: 'border-grade-case/50',
  SKIN: 'border-grade-skin/50',
  GRAFFITI: 'border-grade-graffiti/50',
};

/**
 * An item icon that cannot take the page down with it.
 *
 * `items.icon_url` is free text an admin types in, so its hostname is unknowable at build
 * time. `next/image` throws a *render-time* error for any host missing from
 * `next.config.ts` — and because that throw happens during render, it kills the whole React
 * tree, not just the thumbnail. That is how one bad row in the catalog made the drops list,
 * the dashboard, the alert form and the admin catalog all unusable at once.
 *
 * So the src is classified before it is handed to any renderer:
 *
 *   1. A Steam CDN host  → `next/image`, optimized as intended.
 *   2. Any other http(s) → a plain `<img>`, which accepts any host and simply fails quietly.
 *   3. Anything else, or a load failure → the grade-tinted initial tile.
 *
 * The result degrades to case 3 no matter what ends up in the database.
 */
export function ItemThumb({
  name,
  type,
  iconUrl,
  size = 36,
}: {
  name: string;
  type: ItemType;
  iconUrl: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  const renderable = !failed && isRenderableImageUrl(iconUrl);
  const optimizable = renderable && isOptimizableHost(iconUrl);

  return (
    <span
      style={{ width: size, height: size }}
      className={clsx(
        'flex shrink-0 items-center justify-center overflow-hidden rounded border bg-raised',
        GRADE_BORDER[type],
      )}
    >
      {renderable && optimizable ? (
        <Image
          src={iconUrl}
          alt=""
          width={size}
          height={size}
          className="object-contain"
          onError={() => setFailed(true)}
        />
      ) : renderable ? (
        // Arbitrary admin-entered host: next/image throws at render time and takes the page
        // with it. The icon is 36px, so the optimizer buys almost nothing here anyway.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconUrl}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xs font-semibold text-ink-muted" aria-hidden>
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  );
}
