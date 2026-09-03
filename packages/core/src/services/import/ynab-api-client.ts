import type {
  YNABApiMoneyMovement,
  YNABApiPlan,
  YNABApiPlanSnapshot,
  YNABApiPlanSummary,
} from './types.js';

const DEFAULT_YNAB_API_BASE_URL = 'https://api.ynab.com/v1';

interface YNABApiErrorDetail {
  id?: string;
  name?: string;
  detail?: string;
}

interface YNABApiEnvelope<T> {
  data?: T;
  error?: YNABApiErrorDetail;
}

export type YNABFetch = typeof fetch;

const defaultFetch: YNABFetch = (input, init) => globalThis.fetch(input, init);

export class YNABApiClient {
  private readonly accessToken: string;

  constructor(
    accessToken: string,
    private readonly fetchImpl: YNABFetch = defaultFetch,
    private readonly baseUrl = DEFAULT_YNAB_API_BASE_URL
  ) {
    this.accessToken = accessToken.trim();
    if (!this.accessToken) throw new Error('A YNAB personal access token is required');
  }

  private async get<T>(path: string): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });

    let payload: YNABApiEnvelope<T> | null = null;
    try {
      payload = (await response.json()) as YNABApiEnvelope<T>;
    } catch {
      // Preserve the useful HTTP status below when the response is not JSON.
    }

    if (!response.ok || !payload?.data) {
      const detail = payload?.error?.detail || payload?.error?.name;
      throw new Error(detail || `YNAB API request failed (${response.status})`);
    }

    return payload.data;
  }

  async listPlans(): Promise<YNABApiPlanSummary[]> {
    const data = await this.get<{ plans: YNABApiPlanSummary[] }>('/plans');
    return data.plans;
  }

  async getPlan(planId: string): Promise<YNABApiPlanSnapshot> {
    const encodedPlanId = encodeURIComponent(planId.trim());
    if (!encodedPlanId) throw new Error('A YNAB plan is required');

    // These are separate YNAB endpoints. Retry if the plan changes between
    // reads so normalization never combines two different source revisions.
    for (let attempt = 0; attempt < 3; attempt++) {
      const [data, movementData] = await Promise.all([
        this.get<{ plan: YNABApiPlan; server_knowledge: number }>(`/plans/${encodedPlanId}`),
        this.get<{ money_movements: YNABApiMoneyMovement[]; server_knowledge: number }>(
          `/plans/${encodedPlanId}/money_movements`
        ),
      ]);
      if (data.server_knowledge === movementData.server_knowledge) {
        return {
          plan: data.plan,
          serverKnowledge: data.server_knowledge,
          moneyMovements: movementData.money_movements,
        };
      }
    }

    throw new Error(
      'The YNAB plan changed while Budgero was reading it. Wait a moment, then reconnect and try again.'
    );
  }
}
