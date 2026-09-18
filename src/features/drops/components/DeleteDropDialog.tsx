'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { useDeleteDrop } from '../hooks';
import type { Drop } from '@/types/domain';

export function DeleteDropDialog({ drop, onClose }: { drop: Drop | null; onClose: () => void }) {
  const deleteDrop = useDeleteDrop();
  const { notify } = useToast();

  return (
    <Modal
      open={drop !== null}
      onClose={onClose}
      title="Delete this drop?"
      description="It stops counting toward your portfolio value straight away."
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-dim">
          {drop ? `${drop.quantity} × ${drop.item.name}` : ''}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={deleteDrop.isPending}>
            Keep it
          </Button>
          <Button
            variant="danger"
            loading={deleteDrop.isPending}
            onClick={() => {
              if (!drop) return;
              deleteDrop.mutate(drop.id, {
                onSuccess: () => {
                  notify('Drop deleted.');
                  onClose();
                },
                onError: (error) => notify(getErrorMessage(error), 'error'),
              });
            }}
          >
            Delete drop
          </Button>
        </div>
      </div>
    </Modal>
  );
}
