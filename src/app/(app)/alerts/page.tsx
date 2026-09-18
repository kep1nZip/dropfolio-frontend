'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAlerts, useDeleteAlert, useUpdateAlert } from '@/features/alerts/hooks';
import { useListControls } from '@/hooks/useListControls';
import { AlertFormModal } from '@/features/alerts/components/AlertFormModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Td, Th, Tr } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { AlertStatusBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api-error';
import { formatDate, formatUsd } from '@/utils/format';
import type { Alert, AlertStatus } from '@/types/domain';

const STATUS_OPTIONS = [
  { value: '', label: 'All alerts' },
  { value: 'ACTIVE', label: 'Watching' },
  { value: 'TRIGGERED', label: 'Target hit' },
  { value: 'DISABLED', label: 'Paused' },
] as const;

export default function AlertsPage() {
  const controls = useListControls<{ status: AlertStatus | undefined }>(
    { status: undefined },
    'createdAt,desc',
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Alert | undefined>(undefined);
  const [deleting, setDeleting] = useState<Alert | null>(null);

  const query = useAlerts({
    status: controls.filters.status,
    page: controls.page,
    size: 20,
    sort: controls.sort,
  });
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();
  const { notify } = useToast();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Price alerts"
        description="Tell Dropfolio what you're waiting for and it watches the market for you."
        action={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus size={16} />
            Watch an item
          </Button>
        }
      />

      <div className="w-full sm:w-48">
        <Select
          aria-label="Filter alerts by status"
          value={controls.filters.status ?? ''}
          onChange={(event) =>
            controls.setFilter('status', (event.target.value || undefined) as AlertStatus | undefined)
          }
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            title="No alerts set"
            description="Pick an item and a price, and Dropfolio tells you the moment it gets there."
            action={
              <Button
                onClick={() => {
                  setEditing(undefined);
                  setFormOpen(true);
                }}
              >
                Watch an item
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th numeric>Target</Th>
                  <Th>Channels</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((alert) => (
                  <Tr key={alert.id}>
                    <Td>{alert.item.name}</Td>
                    <Td numeric>{formatUsd(alert.targetPriceUsd)}</Td>
                    <Td className="text-xs text-ink-muted">
                      {[alert.notifyInApp ? 'In-app' : null, alert.notifyEmail ? 'Email' : null]
                        .filter(Boolean)
                        .join(', ') || 'None'}
                    </Td>
                    <Td>
                      <AlertStatusBadge status={alert.status} />
                    </Td>
                    <Td className="text-xs text-ink-muted">{formatDate(alert.createdAt)}</Td>
                    <Td>
                      <span className="flex justify-end gap-1">
                        {/*
                          §9 + ERD Open Decision #2: there is no auto re-arm. A TRIGGERED alert
                          can only be moved back to ACTIVE by hand, so that is offered plainly.
                        */}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updateAlert.isPending}
                          onClick={() =>
                            updateAlert.mutate(
                              {
                                id: alert.id,
                                payload: {
                                  status: alert.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED',
                                },
                              },
                              {
                                onSuccess: () =>
                                  notify(
                                    alert.status === 'DISABLED' ? 'Alert resumed.' : 'Alert paused.',
                                  ),
                                onError: (error) => notify(getErrorMessage(error), 'error'),
                              },
                            )
                          }
                        >
                          {alert.status === 'DISABLED' ? 'Resume' : 'Pause'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit alert for ${alert.item.name}`}
                          onClick={() => {
                            setEditing(alert);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete alert for ${alert.item.name}`}
                          onClick={() => setDeleting(alert)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination meta={query.data.meta} onPageChange={controls.setPage} />
          </>
        )}
      </Card>

      <AlertFormModal open={formOpen} alert={editing} onClose={() => setFormOpen(false)} />

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete this alert?"
        description="Deleting it is permanent. Pause it instead if you might want it back."
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-dim">{deleting?.item.name}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              loading={deleteAlert.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteAlert.mutate(deleting.id, {
                  onSuccess: () => {
                    notify('Alert deleted.');
                    setDeleting(null);
                  },
                  onError: (error) => notify(getErrorMessage(error), 'error'),
                });
              }}
            >
              Delete alert
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
