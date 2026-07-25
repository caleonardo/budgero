import { S, type OpCodeEntry } from '../shared';

export const userPreferenceOps = {
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
} satisfies Record<string, OpCodeEntry>;
