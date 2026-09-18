'use client';

import Link from 'next/link';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { getErrorMessage } from '@/lib/api-error';
import { useRegister } from '../hooks';
import { registerSchema, type RegisterFormValues } from '../validation';

export function RegisterForm() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const registerUser = useRegister(setRegisteredEmail);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  // `POST /auth/register` issues no token by design (§1), so the flow ends at a prompt to log
  // in rather than silently signing the user in with a second request.
  if (registeredEmail) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-ink">Account created for {registeredEmail}.</p>
        <p className="text-sm text-ink-muted">Log in to start tracking your drops.</p>
        <Link href="/login">
          <Button className="w-full">Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => registerUser.mutate(values))}
      className="flex flex-col gap-4"
    >
      <Field label="Display name" htmlFor="displayName" error={errors.displayName?.message}>
        <Input
          id="displayName"
          autoComplete="nickname"
          placeholder="How you want to be shown"
          invalid={Boolean(errors.displayName)}
          {...register('displayName')}
        />
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
        hint="At least 8 characters, with a letter and a number."
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(errors.password)}
          {...register('password')}
        />
      </Field>

      {registerUser.isError ? (
        <p role="alert" className="rounded-md border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-ink">
          {getErrorMessage(registerUser.error)}
        </p>
      ) : null}

      <Button type="submit" loading={registerUser.isPending}>
        Create account
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
