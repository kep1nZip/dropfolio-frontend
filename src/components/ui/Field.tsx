import clsx from 'clsx';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

const CONTROL =
  'h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted ' +
  'transition-colors focus:border-accent focus:outline-none disabled:opacity-60';

export function Field({
  label,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-ink-dim">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      className={clsx(CONTROL, invalid && 'border-danger focus:border-danger', className)}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={clsx(CONTROL, 'cursor-pointer pr-8', className)}>
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-raised disabled:opacity-60"
    >
      <span
        className={clsx(
          'mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors',
          checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface',
        )}
      >
        <span
          className={clsx(
            'h-3.5 w-3.5 rounded-full bg-white transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
          )}
        />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-ink">{label}</span>
        {description ? <span className="text-xs text-ink-muted">{description}</span> : null}
      </span>
    </button>
  );
}
