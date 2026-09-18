import Image from 'next/image';
import clsx from 'clsx';
import type { ItemType } from '@/types/domain';

const GRADE_BORDER: Record<ItemType, string> = {
  CASE: 'border-grade-case/50',
  SKIN: 'border-grade-skin/50',
  GRAFFITI: 'border-grade-graffiti/50',
};

/**
 * `iconUrl` is nullable in the catalog, so the fallback is the item's initial on a grade-tinted
 * tile rather than a broken-image box.
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
  return (
    <span
      style={{ width: size, height: size }}
      className={clsx(
        'flex shrink-0 items-center justify-center overflow-hidden rounded border bg-raised',
        GRADE_BORDER[type],
      )}
    >
      {iconUrl ? (
        <Image src={iconUrl} alt="" width={size} height={size} className="object-contain" />
      ) : (
        <span className="text-xs font-semibold text-ink-muted">{name.slice(0, 1)}</span>
      )}
    </span>
  );
}
