import { S, type OpCodeEntry } from '../shared';

export const userPreferenceOps = {
  'userPreferences.setWeekStartsOn': {
    execute: async (args) => {
      const services = S() as { userMeta?: { setWeekStartsOn(value: 0 | 1): void } };
      if (!services.userMeta) throw new Error('userMeta service not available');
      if (args.value !== 0 && args.value !== 1) {
        throw new Error('Week start must be Sunday or Monday');
      }
      services.userMeta.setWeekStartsOn(args.value);
      return { success: true };
    },
    invalidates: [['weekStartsOn'], ['userPreferences']],
  },
  'userPreferences.setAllowOverAssignment': {
    execute: async (args) => {
      const services = S() as { userMeta?: { setAllowOverAssignment(value: boolean): void } };
      if (!services.userMeta) {
        throw new Error('userMeta service not available');
      }
      services.userMeta.setAllowOverAssignment(args.value as boolean);
      return { success: true };
    },
    invalidates: [['allowOverAssignment'], ['userPreferences']],
  },
  'userPreferences.setSuggestCategoryFromPayee': {
    execute: async (args) => {
      const services = S() as {
        userMeta?: { setSuggestCategoryFromPayee(value: boolean): void };
      };
      if (!services.userMeta) {
        throw new Error('userMeta service not available');
      }
      services.userMeta.setSuggestCategoryFromPayee(args.value as boolean);
      return { success: true };
    },
    invalidates: [['suggestCategoryFromPayee'], ['userPreferences']],
  },
  'userPreferences.setShowGroupPercent': {
    execute: async (args) => {
      const services = S() as { userMeta?: { setShowGroupPercent(value: boolean): void } };
      if (!services.userMeta) {
        throw new Error('userMeta service not available');
      }
      services.userMeta.setShowGroupPercent(args.value as boolean);
      return { success: true };
    },
    invalidates: [['showGroupPercent'], ['userPreferences']],
  },
  'userPreferences.setPlanningNumberAnimations': {
    execute: async (args) => {
      const services = S() as {
        userMeta?: { setPlanningNumberAnimations(value: boolean): void };
      };
      if (!services.userMeta) {
        throw new Error('userMeta service not available');
      }
      services.userMeta.setPlanningNumberAnimations(args.value as boolean);
      return { success: true };
    },
    invalidates: [['planningNumberAnimations'], ['userPreferences']],
  },
  'userPreferences.setDialogBackgroundBlur': {
    execute: async (args) => {
      const services = S() as {
        userMeta?: { setDialogBackgroundBlur(value: boolean): void };
      };
      if (!services.userMeta) {
        throw new Error('userMeta service not available');
      }
      services.userMeta.setDialogBackgroundBlur(args.value as boolean);
      return { success: true };
    },
    invalidates: [['dialogBackgroundBlur'], ['userPreferences']],
  },
} satisfies Record<string, OpCodeEntry>;
