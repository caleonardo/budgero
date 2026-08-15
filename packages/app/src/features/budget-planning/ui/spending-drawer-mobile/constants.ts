import { msg } from '@lingui/core/macro';

export const ROWS_PER_PAGE = 15;

export const CHART_CONFIG = {
  cumulative: {
    label: msg`Cumulative Spending`,
    color: 'var(--color-chart-1)',
  },
  budgetPace: {
    label: msg`Budget Pace`,
    color: 'var(--color-chart-3)',
  },
} as const;
