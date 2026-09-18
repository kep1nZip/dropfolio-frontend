'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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

/**
 * A password field with a reveal toggle.
 *
 * Typing a password you cannot see is the main reason people fail a login they actually know
 * the credentials for, so the toggle is offered everywhere a password is entered. It stays
 * a plain `<Input>` underneath — validation, autocomplete and `register()` wiring are
 * untouched, and `ref` is passed straight through so react-hook-form still owns the field.
 *
 * The button is `tabIndex={-1}`: Tab should move from the password to the submit button, not
 * detour through a visual control. It is reachable by click and announced to screen readers.
 */
export function PasswordInput({
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative">
      <Input
        {...rest}
        type={revealed ? 'text' : 'password'}
        invalid={invalid}
        className={clsx('pr-10', className)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setRevealed((value) => !value)}
        aria-label={revealed ? 'Hide password' : 'Show password'}
        aria-pressed={revealed}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-2 text-ink-muted transition-colors hover:text-ink"
      >
        {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
