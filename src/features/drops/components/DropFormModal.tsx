'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { ItemPicker } from '@/features/items/components/ItemPicker';
import { ItemThumb } from '@/components/ui/ItemThumb';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { toDateInputValue } from '@/utils/format';
import { useCreateDrop, useUpdateDrop } from '../hooks';
import type { Drop, Item } from '@/types/domain';

const today = () => toDateInputValue(new Date());

/**
 * One modal for both add and edit. On edit the item is fixed: `PATCH /drops/{id}` accepts only
 * `quantity`, `acquisitionDate` and `acquisitionValueUsd` (§5), so offering an item picker
 * would promise something the API will not do.
 *
 * The inner form is keyed and only mounted while the modal is open, so its fields initialise
 * straight from props. That is why there is no effect syncing props into state here — that
 * pattern causes a cascading render on every open and React's lint rules reject it.
 */
export function DropFormModal({
  open,
  drop,
  onClose,
}: {
  open: boolean;
  drop?: Drop;
  onClose: () => void;
}) {
  const isEdit = Boolean(drop);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit drop' : 'Add a drop'}
      description={
        isEdit
          ? 'The item itself is fixed — delete and re-add if you logged the wrong one.'
          : 'Log something you picked up. Dropfolio prices it from the Steam Market.'
      }
    >
      {open ? <DropForm key={drop?.id ?? 'new'} drop={drop} onClose={onClose} /> : null}
    </Modal>
  );
}

function DropForm({ drop, onClose }: { drop?: Drop; onClose: () => void }) {
  const isEdit = Boolean(drop);
  const createDrop = useCreateDrop();
  const updateDrop = useUpdateDrop();
  const { notify } = useToast();

  const [item, setItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(drop ? String(drop.quantity) : '1');
  const [acquisitionDate, setAcquisitionDate] = useState(drop ? drop.acquisitionDate : today());
  const [acquisitionValue, setAcquisitionValue] = useState(
    drop?.acquisitionValueUsd != null ? String(drop.acquisitionValueUsd) : '',
  );
  const [formError, setFormError] = useState<string | null>(null);

  const pending = createDrop.isPending || updateDrop.isPending;

  const submit = () => {
    setFormError(null);

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      setFormError('Quantity has to be a whole number of 1 or more.');
      return;
    }
    if (acquisitionDate > today()) {
      setFormError("An acquisition date can't be in the future.");
      return;
    }

    // Optional field: an empty box means "not recorded", which the API models as omitting the
    // key entirely — sending 0 would fail the backend's @Positive check.
    const parsedValue = acquisitionValue.trim() === '' ? undefined : Number(acquisitionValue);
    if (parsedValue !== undefined && (!Number.isFinite(parsedValue) || parsedValue <= 0)) {
      setFormError('Acquisition value has to be greater than 0, or left blank.');
      return;
    }

    const valuePart = parsedValue !== undefined ? { acquisitionValueUsd: parsedValue } : {};

    if (isEdit && drop) {
      updateDrop.mutate(
        { id: drop.id, payload: { quantity: parsedQuantity, acquisitionDate, ...valuePart } },
        {
          onSuccess: () => {
            notify('Drop updated.');
            onClose();
          },
          onError: (error) => setFormError(getErrorMessage(error)),
        },
      );
      return;
    }

    if (!item) {
      setFormError('Pick the item you got first.');
      return;
    }

    createDrop.mutate(
      { itemId: item.id, quantity: parsedQuantity, acquisitionDate, ...valuePart },
      {
        onSuccess: () => {
          notify('Drop added.');
          onClose();
        },
        onError: (error) => setFormError(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {isEdit && drop ? (
        <div className="flex items-center gap-3 rounded-md border border-line bg-raised px-3 py-2">
          <ItemThumb name={drop.item.name} type={drop.item.type} iconUrl={drop.item.iconUrl} />
          <span className="text-sm text-ink">{drop.item.name}</span>
        </div>
      ) : (
        <Field label="Item" htmlFor="item-picker">
          <ItemPicker value={item} onChange={setItem} />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quantity" htmlFor="quantity">
          <Input
            id="quantity"
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </Field>

        <Field label="Acquired on" htmlFor="acquisitionDate">
          <Input
            id="acquisitionDate"
            type="date"
            max={today()}
            value={acquisitionDate}
            onChange={(event) => setAcquisitionDate(event.target.value)}
          />
        </Field>
      </div>

      <Field
        label="What it was worth then"
        htmlFor="acquisitionValue"
        hint="Optional. Leave blank if you didn't check the price at the time."
      >
        <Input
          id="acquisitionValue"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.48"
          value={acquisitionValue}
          onChange={(event) => setAcquisitionValue(event.target.value)}
        />
      </Field>

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
          {isEdit ? 'Save changes' : 'Add drop'}
        </Button>
      </div>
    </div>
  );
}
