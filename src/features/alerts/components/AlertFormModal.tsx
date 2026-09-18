'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Toggle } from '@/components/ui/Field';
import { ItemPicker } from '@/features/items/components/ItemPicker';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { useCreateAlert, useUpdateAlert } from '../hooks';
import type { Alert, Item } from '@/types/domain';

/**
 * The item is only selectable on create — `PATCH /alerts/{id}` accepts price, channels and
 * status, never `itemId` (§9). To watch a different item you create a different alert.
 *
 * Same keyed-remount pattern as the drop form: fields initialise from props, no prop→state effect.
 */
export function AlertFormModal({
  open,
  alert,
  onClose,
}: {
  open: boolean;
  alert?: Alert;
  onClose: () => void;
}) {
  const isEdit = Boolean(alert);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit alert' : 'Watch an item'}
      description={
        isEdit
          ? 'Change the target price or how you get told.'
          : "Dropfolio tells you when the market price reaches what you're waiting for."
      }
    >
      {open ? <AlertForm key={alert?.id ?? 'new'} alert={alert} onClose={onClose} /> : null}
    </Modal>
  );
}

function AlertForm({ alert, onClose }: { alert?: Alert; onClose: () => void }) {
  const isEdit = Boolean(alert);
  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();
  const { notify } = useToast();

  const [item, setItem] = useState<Item | null>(null);
  const [targetPrice, setTargetPrice] = useState(alert ? String(alert.targetPriceUsd) : '');
  const [notifyEmail, setNotifyEmail] = useState(alert ? alert.notifyEmail : true);
  const [notifyInApp, setNotifyInApp] = useState(alert ? alert.notifyInApp : true);
  const [formError, setFormError] = useState<string | null>(null);

  const pending = createAlert.isPending || updateAlert.isPending;

  const submit = () => {
    setFormError(null);

    const price = Number(targetPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Set a target price greater than 0.');
      return;
    }
    // §9: an alert with no channel can never reach anyone, so the backend rejects it. Saying so
    // here is friendlier than a 422.
    if (!notifyEmail && !notifyInApp) {
      setFormError('Pick at least one way to be told — email or in-app.');
      return;
    }

    if (isEdit && alert) {
      updateAlert.mutate(
        { id: alert.id, payload: { targetPriceUsd: price, notifyEmail, notifyInApp } },
        {
          onSuccess: () => {
            notify('Alert updated.');
            onClose();
          },
          onError: (error) => setFormError(getErrorMessage(error)),
        },
      );
      return;
    }

    if (!item) {
      setFormError('Pick the item you want to watch.');
      return;
    }

    createAlert.mutate(
      { itemId: item.id, targetPriceUsd: price, notifyEmail, notifyInApp },
      {
        onSuccess: () => {
          notify('Alert created.');
          onClose();
        },
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {isEdit && alert ? (
        <div className="rounded-md border border-line bg-raised px-3 py-2 text-sm text-ink">
          {alert.item.name}
        </div>
      ) : (
        <Field label="Item" htmlFor="alert-item">
          <ItemPicker value={item} onChange={setItem} />
        </Field>
      )}

      <Field label="Target price (USD)" htmlFor="targetPrice">
        <Input
          id="targetPrice"
          type="number"
          min={0}
          step="0.01"
          placeholder="5.00"
          value={targetPrice}
          onChange={(event) => setTargetPrice(event.target.value)}
        />
      </Field>

      <div className="flex flex-col gap-1">
        <Toggle
          checked={notifyInApp}
          onChange={setNotifyInApp}
          label="Tell me in Dropfolio"
          description="Shows up in your notification centre."
        />
        <Toggle
          checked={notifyEmail}
          onChange={setNotifyEmail}
          label="Email me"
          description="Your account-wide email setting still applies on top of this."
        />
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-ink"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={submit} loading={pending}>
          {isEdit ? 'Save changes' : 'Create alert'}
        </Button>
      </div>
    </div>
  );
}
