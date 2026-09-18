'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Field, Input, PasswordInput } from '@/components/ui/Field';
import { getErrorMessage } from '@/lib/api-error';
import { useLogin } from '../hooks';
import { loginSchema, type LoginFormValues } from '../validation';

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit((values) => login.mutate(values))} className="flex flex-col gap-4">
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

      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          invalid={Boolean(errors.password)}
          {...register('password')}
        />
      </Field>

      {login.isError ? (
        <p role="alert" className="rounded-md border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-ink">
          {getErrorMessage(login.error)}
        </p>
      ) : null}

      <Button type="submit" loading={login.isPending}>
        Log in
      </Button>

      <p className="text-center text-sm text-ink-muted">
        New here?{' '}
        <Link href="/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
