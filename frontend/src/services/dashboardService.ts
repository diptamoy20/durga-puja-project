import api, { unwrap } from './api';
import type { DashboardSummary } from '@/types';

export const dashboardService = {
  /** One call; the gateway fans out to the registration, atlas and content services. */
  summary: (): Promise<DashboardSummary> => unwrap(api.get('/dashboard/summary')),
};
