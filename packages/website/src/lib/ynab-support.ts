export type JsonRecord = Record<string, unknown>;

export interface YnabPlanSummary extends JsonRecord {
  id: string;
  name: string;
  last_modified_on?: string;
  first_month?: string;
  last_month?: string;
}

export interface YnabApiSnapshot {
  plan: JsonRecord;
  serverKnowledge: number;
  moneyMovements: JsonRecord[];
}

export interface YnabSupportBundle extends YnabApiSnapshot {
  _support: {
    schema: 'budgero-ynab-diagnostic-v1';
    generatedAt: string;
    notice: string;
    anonymization: {
      namesReplaced: boolean;
      identifiersReplaced: boolean;
      freeTextRemoved: boolean;
      amountsPreserved: boolean;
      amountsUniformlyScaled: boolean;
      datesPreserved: boolean;
    };
    verification: ReturnType<typeof createVerification>;
  };
}

interface YnabApiErrorDetail {
  name?: string;
  detail?: string;
}

interface YnabApiEnvelope<T> {
  data?: T;
  error?: YnabApiErrorDetail;
}

type FetchLike = typeof fetch;

const YNAB_API_BASE_URL = 'https://api.ynab.com/v1';

export class YnabSupportClient {
  private readonly token: string;
  private readonly fetchImpl: FetchLike;
  private readonly baseUrl: string;

  constructor(
    token: string,
    fetchImpl: FetchLike = globalThis.fetch.bind(globalThis),
    baseUrl = YNAB_API_BASE_URL
  ) {
    this.token = token.trim();
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl;
    if (!this.token) throw new Error('Enter a YNAB personal access token.');
  }

  private async get<T>(path: string): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    let payload: YnabApiEnvelope<T> | null = null;
    try {
      payload = (await response.json()) as YnabApiEnvelope<T>;
    } catch {
      // The status below is still useful when YNAB does not return JSON.
    }

    if (!response.ok || !payload?.data) {
      const detail = payload?.error?.detail || payload?.error?.name;
      throw new Error(detail || `YNAB API request failed (${response.status}).`);
    }

    return payload.data;
  }

  async listPlans(): Promise<YnabPlanSummary[]> {
    const data = await this.get<{ plans: YnabPlanSummary[] }>('/plans');
    return Array.isArray(data.plans) ? data.plans : [];
  }

  async getPlan(planId: string): Promise<YnabApiSnapshot> {
    const encodedPlanId = encodeURIComponent(planId.trim());
    if (!encodedPlanId) throw new Error('Choose a YNAB plan.');

    // Budgero uses the same two reads and server-knowledge check. This keeps
    // the exported snapshot from mixing revisions if the plan changes mid-read.
    for (let attempt = 0; attempt < 3; attempt++) {
      const [planData, movementData] = await Promise.all([
        this.get<{ plan: JsonRecord; server_knowledge: number }>(`/plans/${encodedPlanId}`),
        this.get<{ money_movements: JsonRecord[]; server_knowledge: number }>(
          `/plans/${encodedPlanId}/money_movements`
        ),
      ]);

      if (planData.server_knowledge === movementData.server_knowledge) {
        return {
          plan: planData.plan,
          serverKnowledge: planData.server_knowledge,
          moneyMovements: Array.isArray(movementData.money_movements)
            ? movementData.money_movements
            : [],
        };
      }
    }

    throw new Error(
      'Your YNAB plan changed while it was being read. Wait a moment, then try again.'
    );
  }
}

type EntityKind =
  | 'plan'
  | 'account'
  | 'categoryGroup'
  | 'category'
  | 'payee'
  | 'transaction'
  | 'subtransaction'
  | 'moneyMovement'
  | 'flag'
  | 'generic';

const ENTITY_LABELS: Record<EntityKind, string> = {
  plan: 'Plan',
  account: 'Account',
  categoryGroup: 'Group',
  category: 'Category',
  payee: 'Payee',
  transaction: 'Transaction',
  subtransaction: 'Split',
  moneyMovement: 'Movement',
  flag: 'Flag',
  generic: 'Record',
};

const COLLECTION_KINDS: Record<string, EntityKind> = {
  accounts: 'account',
  category_groups: 'categoryGroup',
  categories: 'category',
  payees: 'payee',
  transactions: 'transaction',
  scheduled_transactions: 'transaction',
  subtransactions: 'subtransaction',
  scheduled_subtransactions: 'subtransaction',
  moneyMovements: 'moneyMovement',
  money_movements: 'moneyMovement',
  flags: 'flag',
};

const RELATION_KINDS: Record<string, EntityKind> = {
  plan_id: 'plan',
  budget_id: 'plan',
  account_id: 'account',
  transfer_account_id: 'account',
  category_group_id: 'categoryGroup',
  category_id: 'category',
  from_category_id: 'category',
  to_category_id: 'category',
  payee_id: 'payee',
  transfer_payee_id: 'payee',
  transaction_id: 'transaction',
  transfer_transaction_id: 'transaction',
  matched_transaction_id: 'transaction',
  original_transaction_id: 'transaction',
  parent_transaction_id: 'transaction',
  scheduled_transaction_id: 'transaction',
  subtransaction_id: 'subtransaction',
  money_movement_id: 'moneyMovement',
  flag_id: 'flag',
};

const FREE_TEXT_KEY =
  /^(memo|note|import_id|import_payee_name|import_payee_name_original|original_payee|payee_name|account_name|category_name|category_group_name|flag_name|description)$/i;

const MILLIUNIT_KEYS = new Set([
  'amount',
  'balance',
  'cleared_balance',
  'uncleared_balance',
  'budgeted',
  'activity',
  'income',
  'to_be_budgeted',
  'debt_original_balance',
  'goal_target',
  'goal_under_funded',
  'goal_overall_funded',
  'goal_overall_left',
]);

const PERIODIC_MILLIUNIT_KEYS = new Set(['debt_minimum_payments', 'debt_escrow_amounts']);

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function booleanValue(value: unknown): boolean {
  return value === true;
}

function defaultIdFactory(): string {
  return globalThis.crypto.randomUUID();
}

interface AnonymizeOptions {
  idFactory?: (kind: EntityKind, index: number) => string;
  amountScaleFactor?: number;
}

const MIN_RANDOM_SCALE_FACTOR = 2;
const MAX_RANDOM_SCALE_FACTOR = 9;

function randomAmountScaleFactor(): number {
  const randomValue = new Uint32Array(1);
  globalThis.crypto.getRandomValues(randomValue);
  return (
    MIN_RANDOM_SCALE_FACTOR +
    (randomValue[0] % (MAX_RANDOM_SCALE_FACTOR - MIN_RANDOM_SCALE_FACTOR + 1))
  );
}

function validateAmountScaleFactor(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error('The amount scale factor must be a positive safe integer.');
  }
  return value;
}

function formatScaledMilliunits(
  milliunits: number,
  currencyFormat: JsonRecord | undefined
): string {
  const requestedDigits = numberValue(currencyFormat?.decimal_digits);
  const decimalDigits = Math.max(0, Math.min(3, Math.trunc(requestedDigits)));
  const increment = 10 ** (3 - decimalDigits);
  const rounded = Math.round(Math.abs(milliunits) / increment) * increment;
  const whole = Math.floor(rounded / 1000);
  const fraction = Math.floor((rounded % 1000) / increment);
  const groupSeparator = stringValue(currencyFormat?.group_separator) || ',';
  const decimalSeparator = stringValue(currencyFormat?.decimal_separator) || '.';
  const groupedWhole = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  const numeric =
    decimalDigits > 0
      ? `${groupedWhole}${decimalSeparator}${String(fraction).padStart(decimalDigits, '0')}`
      : groupedWhole;
  const currencySymbol = stringValue(currencyFormat?.currency_symbol);
  const displaySymbol = booleanValue(currencyFormat?.display_symbol) && currencySymbol;
  const withSymbol = displaySymbol
    ? booleanValue(currencyFormat?.symbol_first)
      ? `${currencySymbol}${numeric}`
      : `${numeric}${currencySymbol}`
    : numeric;
  return milliunits < 0 ? `-${withSymbol}` : withSymbol;
}

/**
 * Replaces human-entered text and every identifier while preserving the
 * relationships and numeric/date fields the Budgero importer needs.
 */
export function anonymizeYnabSnapshot(
  snapshot: YnabApiSnapshot,
  options: AnonymizeOptions = {}
): YnabApiSnapshot {
  const idFactory = options.idFactory || defaultIdFactory;
  const amountScaleFactor = validateAmountScaleFactor(options.amountScaleFactor ?? 1);
  const currencyFormat = isRecord(snapshot.plan.currency_format)
    ? snapshot.plan.currency_format
    : undefined;
  const idMaps = new Map<EntityKind, Map<string, string>>();
  const aliasMaps = new Map<EntityKind, Map<string, string>>();
  const anonymousObjectKeys = new WeakMap<object, string>();
  let anonymousObjectIndex = 0;

  const mapFor = (kind: EntityKind) => {
    let map = idMaps.get(kind);
    if (!map) {
      map = new Map();
      idMaps.set(kind, map);
    }
    return map;
  };

  const mappedId = (kind: EntityKind, original: unknown): unknown => {
    if (original === null || original === undefined || original === '') return original;
    const source = String(original);
    const map = mapFor(kind);
    let replacement = map.get(source);
    if (!replacement) {
      replacement = idFactory(kind, map.size + 1);
      map.set(source, replacement);
    }
    return replacement;
  };

  const objectKey = (value: JsonRecord) => {
    if (typeof value.id === 'string' && value.id) return value.id;
    let key = anonymousObjectKeys.get(value);
    if (!key) {
      key = `anonymous-${++anonymousObjectIndex}`;
      anonymousObjectKeys.set(value, key);
    }
    return key;
  };

  const aliasFor = (kind: EntityKind, value: JsonRecord) => {
    let map = aliasMaps.get(kind);
    if (!map) {
      map = new Map();
      aliasMaps.set(kind, map);
    }
    const key = objectKey(value);
    let alias = map.get(key);
    if (!alias) {
      alias = `${ENTITY_LABELS[kind]} ${String(map.size + 1).padStart(3, '0')}`;
      map.set(key, alias);
    }
    return alias;
  };

  const scaleMilliunits = (value: unknown, key: string): unknown => {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
      throw new Error(`YNAB returned an invalid milliunit value for ${key}.`);
    }
    const scaled = value * amountScaleFactor;
    if (!Number.isSafeInteger(scaled)) {
      throw new Error(`YNAB amount ${key} is too large to scale safely.`);
    }
    return scaled;
  };

  const scalePeriodicMilliunits = (value: unknown, key: string): unknown => {
    if (value === null || value === undefined) return value;
    if (!isRecord(value)) {
      throw new Error(`YNAB returned an invalid periodic amount map for ${key}.`);
    }
    return Object.fromEntries(
      Object.entries(value).map(([period, amount]) => [
        period,
        scaleMilliunits(amount, `${key}.${period}`),
      ])
    );
  };

  const relationKind = (key: string): EntityKind | undefined => {
    if (RELATION_KINDS[key]) return RELATION_KINDS[key];
    if (!key.endsWith('_id')) return undefined;
    if (key.includes('account')) return 'account';
    if (key.includes('category_group')) return 'categoryGroup';
    if (key.includes('category')) return 'category';
    if (key.includes('payee')) return 'payee';
    if (key.includes('subtransaction')) return 'subtransaction';
    if (key.includes('transaction')) return 'transaction';
    if (key.includes('flag')) return 'flag';
    return 'generic';
  };

  const rewrite = (value: unknown, context?: EntityKind, parentKey?: string): unknown => {
    if (Array.isArray(value)) {
      const childContext = parentKey ? COLLECTION_KINDS[parentKey] : context;
      return value.map((item) => rewrite(item, childContext));
    }
    if (!isRecord(value)) return value;

    const result: JsonRecord = {};
    for (const [key, child] of Object.entries(value)) {
      if (FREE_TEXT_KEY.test(key)) {
        result[key] = null;
        continue;
      }
      if (key === 'name' && context) {
        result[key] = aliasFor(context, value);
        continue;
      }
      if (key === 'id') {
        result[key] = mappedId(context || 'generic', child);
        continue;
      }
      if (MILLIUNIT_KEYS.has(key)) {
        result[key] = scaleMilliunits(child, key);
        continue;
      }
      if (PERIODIC_MILLIUNIT_KEYS.has(key)) {
        result[key] = scalePeriodicMilliunits(child, key);
        continue;
      }
      if (key.endsWith('_formatted')) {
        const sourceKey = key.slice(0, -'_formatted'.length);
        const rawAmount = value[sourceKey];
        result[key] =
          typeof rawAmount === 'number'
            ? formatScaledMilliunits(
                scaleMilliunits(rawAmount, sourceKey) as number,
                currencyFormat
              )
            : null;
        continue;
      }
      if (key.endsWith('_currency')) {
        const sourceKey = key.slice(0, -'_currency'.length);
        const rawAmount = value[sourceKey];
        result[key] =
          typeof rawAmount === 'number'
            ? (scaleMilliunits(rawAmount, sourceKey) as number) / 1000
            : typeof child === 'number' && Number.isFinite(child)
              ? child * amountScaleFactor
              : child;
        continue;
      }
      const relatedKind = relationKind(key);
      if (relatedKind) {
        result[key] = mappedId(relatedKind, child);
        continue;
      }
      result[key] = rewrite(child, COLLECTION_KINDS[key], key);
    }
    return result;
  };

  return {
    plan: rewrite(snapshot.plan, 'plan') as JsonRecord,
    serverKnowledge: snapshot.serverKnowledge,
    moneyMovements: rewrite(
      snapshot.moneyMovements,
      'moneyMovement',
      'moneyMovements'
    ) as JsonRecord[],
  };
}

function createVerification(snapshot: YnabApiSnapshot) {
  const { plan, moneyMovements } = snapshot;
  const accounts = records(plan.accounts);
  const groups = records(plan.category_groups);
  const categories = records(plan.categories);
  const months = records(plan.months);
  const transactions = records(plan.transactions);
  const subtransactions = records(plan.subtransactions);
  const groupById = new Map(groups.map((group) => [stringValue(group.id), group]));

  const transactionNetByAccount = new Map<string, number>();
  for (const transaction of transactions) {
    if (booleanValue(transaction.deleted)) continue;
    const accountId = stringValue(transaction.account_id);
    transactionNetByAccount.set(
      accountId,
      (transactionNetByAccount.get(accountId) || 0) + numberValue(transaction.amount)
    );
  }

  const accountBalances = accounts
    .filter((account) => !booleanValue(account.deleted))
    .map((account) => {
      const accountId = stringValue(account.id);
      const sourceBalance = numberValue(account.balance);
      const transactionNet = transactionNetByAccount.get(accountId) || 0;
      return {
        account_id: accountId,
        account: stringValue(account.name),
        type: stringValue(account.type),
        on_budget: booleanValue(account.on_budget),
        closed: booleanValue(account.closed),
        source_balance: sourceBalance,
        transaction_net: transactionNet,
        difference: sourceBalance - transactionNet,
      };
    });

  const readyToAssignByMonth = months
    .filter((month) => !booleanValue(month.deleted))
    .map((month) => ({
      month: stringValue(month.month).slice(0, 7),
      ready_to_assign: numberValue(month.to_be_budgeted),
      assigned: numberValue(month.budgeted),
      activity: numberValue(month.activity),
      income: numberValue(month.income),
    }));

  const categoryValuesByMonth = months.flatMap((month) =>
    records(month.categories)
      .filter((category) => !booleanValue(category.deleted))
      .map((category) => {
        const group = groupById.get(stringValue(category.category_group_id));
        return {
          month: stringValue(month.month).slice(0, 7),
          category_group_id: stringValue(category.category_group_id),
          category_group: stringValue(group?.name),
          category_id: stringValue(category.id),
          category: stringValue(category.name),
          assigned: numberValue(category.budgeted),
          activity: numberValue(category.activity),
          available: numberValue(category.balance),
        };
      })
  );

  const movementNet = new Map<string, number>();
  for (const movement of moneyMovements) {
    if (booleanValue(movement.deleted)) continue;
    const month = stringValue(movement.month).slice(0, 7);
    const amount = numberValue(movement.amount);
    const fromCategoryId = stringValue(movement.from_category_id);
    const toCategoryId = stringValue(movement.to_category_id);
    if (fromCategoryId) {
      const key = `${month}::${fromCategoryId}`;
      movementNet.set(key, (movementNet.get(key) || 0) - amount);
    }
    if (toCategoryId) {
      const key = `${month}::${toCategoryId}`;
      movementNet.set(key, (movementNet.get(key) || 0) + amount);
    }
  }

  const movementChecks = months.flatMap((month) =>
    records(month.categories)
      .filter((category) => {
        const group = groupById.get(stringValue(category.category_group_id));
        return (
          !booleanValue(category.deleted) &&
          !booleanValue(category.internal) &&
          !booleanValue(group?.internal)
        );
      })
      .map((category) => {
        const group = groupById.get(stringValue(category.category_group_id));
        const monthValue = stringValue(month.month).slice(0, 7);
        const categoryId = stringValue(category.id);
        const assigned = numberValue(category.budgeted);
        const net = movementNet.get(`${monthValue}::${categoryId}`) || 0;
        return {
          month: monthValue,
          category_group_id: stringValue(category.category_group_id),
          category_group: stringValue(group?.name),
          category_id: categoryId,
          category: stringValue(category.name),
          assigned,
          money_movement_net: net,
          matches: assigned === net,
        };
      })
  );

  const movementMismatches = movementChecks.filter((check) => !check.matches);

  return {
    counts: {
      accounts: accounts.length,
      category_groups: groups.length,
      categories: categories.length,
      months: months.length,
      transactions: transactions.length,
      subtransactions: subtransactions.length,
      money_movements: moneyMovements.length,
    },
    accountBalances,
    readyToAssignByMonth,
    categoryValuesByMonth,
    moneyMovementAssignments: {
      checked: movementChecks.length,
      matched: movementChecks.length - movementMismatches.length,
      mismatches: movementMismatches,
    },
  };
}

export function createYnabSupportBundle(
  snapshot: YnabApiSnapshot,
  options: AnonymizeOptions & { now?: Date } = {}
): YnabSupportBundle {
  const amountScaleFactor = validateAmountScaleFactor(
    options.amountScaleFactor ?? randomAmountScaleFactor()
  );
  const anonymized = anonymizeYnabSnapshot(snapshot, { ...options, amountScaleFactor });
  return {
    ...anonymized,
    _support: {
      schema: 'budgero-ynab-diagnostic-v1',
      generatedAt: (options.now || new Date()).toISOString(),
      notice:
        'Names, free text, and identifiers were replaced. Amounts were uniformly scaled for import verification; dates remain unchanged.',
      anonymization: {
        namesReplaced: true,
        identifiersReplaced: true,
        freeTextRemoved: true,
        amountsPreserved: false,
        amountsUniformlyScaled: true,
        datesPreserved: true,
      },
      verification: createVerification(anonymized),
    },
  };
}
