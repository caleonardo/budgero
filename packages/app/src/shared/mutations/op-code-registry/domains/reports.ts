import {
  S,
  type NewReportChart,
  type OpCodeEntry,
  type ReportChart,
  type ReportSaveInput,
} from '../shared';

export const reportOps = {
  'reports.create': {
    execute: async (args) => {
      return await S().reports!.saveReport({
        id: args.id as string | undefined,
        name: args.name as string,
        description: args.description as string | undefined,
        query: args.query as string,
        charts: args.charts as ReportChart[] | undefined,
        tags: args.tags as string[] | undefined,
        isFavorite: args.isFavorite as boolean | undefined,
      });
    },
    invalidates: [['reports']],
  },

  // useUpdateReport
  'reports.update': {
    execute: async (args, context) => {
      const updates = {
        name: args.name as string | undefined,
        description: args.description as string | undefined,
        query: args.query as string | undefined,
        charts: args.charts as ReportChart[] | undefined,
        tags: args.tags as string[] | undefined,
        isFavorite: args.isFavorite as boolean | undefined,
      };
      if (context?.isReceiver) {
        return await S().reports!.reconcileAndUpdateReport(args.id as string, updates);
      }
      return await S().reports!.updateReport(args.id as string, updates);
    },
    invalidates: [['reports'], ['report', '*']],
  },

  // useDeleteReport
  'reports.delete': {
    execute: async (args) => {
      await S().reports!.deleteReport(args.id as string);
    },
    invalidates: [['reports'], ['report', '*']],
  },

  // useToggleReportFavorite
  'reports.toggleFavorite': {
    execute: async (args) => {
      return await S().reports!.toggleFavorite(args.id as string);
    },
    invalidates: [['reports'], ['report', '*']],
  },

  // useAddChartToReport
  'reports.addChart': {
    execute: async (args) => {
      return await S().reports!.addChartToReport(
        args.reportId as string,
        args.chart as NewReportChart & { id?: string }
      );
    },
    invalidates: [['reports'], ['report', '*']],
  },

  // useUpdateChartInReport
  'reports.updateChart': {
    execute: async (args) => {
      return await S().reports!.updateChartInReport(
        args.reportId as string,
        args.chartId as string,
        args.updates as Partial<ReportChart>
      );
    },
    invalidates: [['reports'], ['report', '*']],
  },

  // useRemoveChartFromReport
  'reports.removeChart': {
    execute: async (args) => {
      return await S().reports!.removeChartFromReport(
        args.reportId as string,
        args.chartId as string
      );
    },
    invalidates: [['reports'], ['report', '*']],
  },

  // useDuplicateReport
  'reports.duplicate': {
    execute: async (args) => {
      const newReport = args.newReport as ReportSaveInput | undefined;
      if (newReport) {
        return await S().reports!.saveReport(newReport);
      }

      // Compatibility for mutations queued by clients before report IDs were
      // generated at the mutation boundary.
      return await S().reports!.duplicateReport(args.id as string, args.newName as string);
    },
    invalidates: [['reports']],
  },
} satisfies Record<string, OpCodeEntry>;
