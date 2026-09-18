import clsx from 'clsx';

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 8)) }}
      className={clsx(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        className,
      )}
    />
  );
}
