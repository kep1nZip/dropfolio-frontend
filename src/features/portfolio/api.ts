import { apiClient, getOne, getPage } from '@/lib/api-client';
import { cleanParams } from '@/utils/query-params';
import type { Page } from '@/types/api';
import type { BreakdownParams, PortfolioBreakdownItem, PortfolioSummary } from '@/types/domain';

/** API_CONTRACT.md §7. */

export function getPortfolioSummary(): Promise<PortfolioSummary> {
  return getOne<PortfolioSummary>('/portfolio/summary');
}

export function getPortfolioBreakdown(
  params: BreakdownParams,
): Promise<Page<PortfolioBreakdownItem>> {
  return getPage<PortfolioBreakdownItem>('/portfolio/breakdown', { params: cleanParams(params) });
}

/**
 * The export endpoint answers `text/csv`, not the JSON envelope, so it bypasses the envelope
 * helpers. A `204` means "nothing to export" and is surfaced as `null` rather than handing the
 * user an empty file.
 *
 * `Content-Disposition` is not in the backend's CORS exposed-headers list, so the filename is
 * reconstructed here to match what the backend sends.
 */
export async function exportPortfolioCsv(): Promise<Blob | null> {
  const response = await apiClient.get('/portfolio/export', { responseType: 'blob' });
  if (response.status === 204) return null;
  return response.data as Blob;
}
