import type { ChartConfiguration, UnifiedReport } from '@budgero/core/browser';

type GenerateId = () => string;

export interface CreateReportData {
  name: string;
  description?: string;
  query: string;
  charts?: Omit<ChartConfiguration, 'id'>[];
  tags?: string[];
  isFavorite?: boolean;
}

export interface CreateReportMutationPayload
  extends Omit<CreateReportData, 'charts'>,
    Record<string, unknown> {
  id: string;
  charts: ChartConfiguration[];
}

export interface AddReportChartData {
  reportId: string;
  chart: Omit<ChartConfiguration, 'id'>;
}

export interface AddReportChartMutationPayload extends Record<string, unknown> {
  reportId: string;
  chart: ChartConfiguration;
}

export interface DuplicateReportData {
  id: string;
  newName: string;
}

export interface DuplicateReportMutationPayload extends Record<string, unknown> {
  sourceId: string;
  newReport: CreateReportMutationPayload;
}

const randomId: GenerateId = () => globalThis.crypto.randomUUID();

export function prepareCreateReportMutation(
  data: CreateReportData,
  generateId: GenerateId = randomId
): CreateReportMutationPayload {
  return {
    ...data,
    id: generateId(),
    charts: (data.charts ?? []).map((chart) => ({
      ...chart,
      id: generateId(),
    })),
  };
}

export function prepareAddReportChartMutation(
  data: AddReportChartData,
  generateId: GenerateId = randomId
): AddReportChartMutationPayload {
  return {
    reportId: data.reportId,
    chart: {
      ...data.chart,
      id: generateId(),
    },
  };
}

export function prepareDuplicateReportMutation(
  data: DuplicateReportData,
  source: UnifiedReport,
  generateId: GenerateId = randomId
): DuplicateReportMutationPayload {
  return {
    sourceId: data.id,
    newReport: {
      id: generateId(),
      name: data.newName,
      description: source.description,
      query: source.query,
      charts: source.charts.map((chart) => ({
        ...chart,
        id: generateId(),
      })),
      tags: source.tags,
      isFavorite: false,
    },
  };
}
