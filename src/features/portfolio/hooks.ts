'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { exportPortfolioCsv, getPortfolioBreakdown, getPortfolioSummary } from './api';
import type { BreakdownParams } from '@/types/domain';

export function usePortfolioSummary() {
  return useQuery({
    queryKey: queryKeys.portfolio.summary,
    queryFn: getPortfolioSummary,
  });
}

export function usePortfolioBreakdown(params: BreakdownParams) {
  return useQuery({
    queryKey: queryKeys.portfolio.breakdown(params),
    queryFn: () => getPortfolioBreakdown(params),
  });
}

export function useExportPortfolio() {
  return useMutation<'empty' | 'downloaded', unknown, void>({
    mutationFn: async () => {
      const blob = await exportPortfolioCsv();
      if (!blob) return 'empty';

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'dropfolio-export.csv';
      anchor.click();
      URL.revokeObjectURL(url);
      return 'downloaded';
    },
  });
}
