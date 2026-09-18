'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, PasswordInput, Toggle } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { formatDate } from '@/utils/format';
import {
  useChangePassword,
  useCurrentUser,
  useDeleteAccount,
  useLogoutAll,
  useUpdateProfile,
} from '@/features/users/hooks';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/features/notifications/hooks';

export default function SettingsPage() {
  const user = useCurrentUser();

  if (user.isPending) return <LoadingState />;
  if (user.isError) return <ErrorState error={user.error} onRetry={() => void user.refetch()} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Settings" description="Your account, how you're notified, and the exits." />
      {/* Keyed on the server values: after a save the card remounts with the fresh data,
          which is why its fields can initialise from props instead of syncing in an effect. */}
      <ProfileCard
        key={`${user.data.displayName}|${user.data.email}`}
        email={user.data.email}
        displayName={user.data.displayName}
        createdAt={user.data.createdAt}
        roles={user.data.roles}
      />
      <NotificationPreferencesCard />
      <PasswordCard />
      <DangerZone />
    </div>
  );
}

function ProfileCard({
  email,
  displayName,
  createdAt,
  roles,
}: {
  email: string;
  displayName: string;
  createdAt: string;
  roles: string[];
}) {
  const updateProfile = useUpdateProfile();
  const { notify } = useToast();
  const [name, setName] = useState(displayName);
  const [nextEmail, setNextEmail] = useState(email);

  const dirty = name !== displayName || nextEmail !== email;

  return (
    <Card>
      <CardHeader
        title="Profile"
        description={`Member since ${formatDate(createdAt)}.`}
        action={roles.includes('ADMIN') ? <Badge tone="accent">Admin</Badge> : undefined}
      />
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name" htmlFor="displayName">
            <Input
              id="displayName"
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor="profile-email">
            <Input
              id="profile-email"
              type="email"
              value={nextEmail}
              onChange={(event) => setNextEmail(event.target.value)}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button
            disabled={!dirty}
            loading={updateProfile.isPending}
            onClick={() =>
              // Only changed keys are sent: PATCH is a partial update, and resending an
              // unchanged email would still hit the uniqueness check.
              updateProfile.mutate(
                {
                  ...(name !== displayName ? { displayName: name } : {}),
                  ...(nextEmail !== email ? { email: nextEmail } : {}),
                },
                {
                  onSuccess: () => notify('Profile saved.'),
                  onError: (error) => notify(getErrorMessage(error), 'error'),
                },
              )
            }
          >
            Save changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function NotificationPreferencesCard() {
  const preferences = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const { notify } = useToast();

  return (
    <Card>
      <CardHeader
        title="Notifications"
        description="These are account-wide switches. An alert only reaches you if both this and the alert's own setting allow it."
      />
      <div className="px-5 py-4">
        {preferences.isPending ? (
          <LoadingState label="Loading preferences" />
        ) : preferences.isError ? (
          <ErrorState error={preferences.error} onRetry={() => void preferences.refetch()} />
        ) : (
          <div className="flex flex-col gap-1">
            <Toggle
              checked={preferences.data.inAppEnabled}
              disabled={update.isPending}
              label="In-app notifications"
              description="Shown in your notification centre."
              onChange={(next) =>
                update.mutate(
                  { inAppEnabled: next },
                  { onError: (error) => notify(getErrorMessage(error), 'error') },
                )
              }
            />
            <Toggle
              checked={preferences.data.emailEnabled}
              disabled={update.isPending}
              label="Email notifications"
              description="Sent to your account email."
              onChange={(next) =>
                update.mutate(
                  { emailEnabled: next },
                  { onError: (error) => notify(getErrorMessage(error), 'error') },
                )
              }
            />
          </div>
        )}
      </div>
    </Card>
  );
}

function PasswordCard() {
  const changePassword = useChangePassword();
  const logoutAll = useLogoutAll();
  const { notify } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  return (
    <Card>
      <CardHeader
        title="Password"
        description="Changing it signs you out of every other device."
      />
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password" htmlFor="currentPassword">
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
          </Field>
          <Field
            label="New password"
            htmlFor="newPassword"
            hint="At least 8 characters, with a letter and a number."
          >
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
            />
          </Field>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            loading={logoutAll.isPending}
            onClick={() => logoutAll.mutate()}
          >
            Sign out everywhere
          </Button>
          <Button
            disabled={next.length === 0}
            loading={changePassword.isPending}
            onClick={() =>
              changePassword.mutate(
                { currentPassword: current || undefined, newPassword: next },
                {
                  onSuccess: () => {
                    notify('Password changed. Other devices have been signed out.');
                    setCurrent('');
                    setNext('');
                  },
                  onError: (error) => notify(getErrorMessage(error), 'error'),
                },
              )
            }
          >
            Change password
          </Button>
        </div>
      </div>
    </Card>
  );
}

function DangerZone() {
  const deleteAccount = useDeleteAccount();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  return (
    <Card className="border-danger/30">
      <CardHeader
        title="Delete account"
        description="Your drops, alerts and notifications are kept as history, but the account is closed and you cannot sign back in."
      />
      <div className="flex justify-end px-5 py-4">
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your account?"
        description="This cannot be undone."
      >
        <div className="flex flex-col gap-4">
          {/* §2 requires the literal string DELETE as an explicit confirmation. */}
          <Field label="Type DELETE to confirm" htmlFor="confirmation">
            <Input
              id="confirmation"
              value={confirmation}
              placeholder="DELETE"
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={confirmation !== 'DELETE'}
              loading={deleteAccount.isPending}
              onClick={() =>
                deleteAccount.mutate(undefined, {
                  onError: (error) => notify(getErrorMessage(error), 'error'),
                })
              }
            >
              Delete account
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
