import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Category, PayeeCategoryMemory } from '@budgero/core/browser';
import { useAutofillIntegration } from './useAutofillIntegration';

/**
 * Wiring tests for the payee category memory: once-per-payee behavior and
 * precedence against autofill rules and the user, which is where this feature
 * can do damage if it gets it wrong. The decision table itself lives in
 * `lib/payee-category-memory.test.ts`.
 */

// 'Groceries' is what "remember last" prefills, 'Dining'/'Fuel' are payee
// memories, 'Travel' is what the user picks by hand. Keeping the roles on
// separate values is what makes the precedence assertions mean anything.
const CATEGORIES = [
  { ID: 5, Name: 'Groceries' },
  { ID: 9, Name: 'Dining' },
  { ID: 12, Name: 'Fuel' },
  { ID: 15, Name: 'Travel' },
] as unknown as Category[];

const CAFE_MEMORY: PayeeCategoryMemory = {
  CategoryID: 9,
  CategoryName: 'Dining',
  Date: '2026-03-02',
};

const SHELL_MEMORY: PayeeCategoryMemory = {
  CategoryID: 12,
  CategoryName: 'Fuel',
  Date: '2026-02-11',
};

let ruleAppliedFields = new Set<string>();
let memoryByPayee: Record<string, PayeeCategoryMemory> = {};
let settingEnabled = true;

vi.mock('@features/rules/api/useAutofillRules', () => ({
  useAutofillRules: vi.fn(() => ({
    suggestions: [],
    rejectField: vi.fn(),
    resetSession: vi.fn(),
    applySuggestion: vi.fn(),
    appliedFields: ruleAppliedFields,
    appliedSuggestions: [],
    clearAppliedField: vi.fn(),
    hasRunThisSession: false,
  })),
}));

vi.mock('@entities/payee/api/usePayeeCategoryMemory', () => ({
  // Payee-aware, like the real lookup: the hook passes the debounced,
  // normalized payee.
  usePayeeCategoryMemory: vi.fn((_budgetId: number, payee: string) => ({
    data: memoryByPayee[payee] ?? null,
  })),
}));

vi.mock('@shared/hooks/useUserPreferences', () => ({
  useSuggestCategoryFromPayee: vi.fn(() => ({ data: settingEnabled })),
}));

vi.mock('@shared/runtime/runtime-provider', () => ({
  useRuntime: vi.fn(() => ({ mutationsRouter: () => ({ execute: vi.fn() }) })),
}));

/** Minimal stand-in for the add-transaction form, with live state. */
function createForm(initialCategory = '') {
  const state = { selectedCategory: initialCategory, payee: 'Corner Cafe', isTransfer: false };
  const form = {
    memo: '',
    amount: null,
    selectedFromAccount: '',
    rememberLast: true,
    transactionType: 'expense',
    lastUsed: { expense: { category: 'Groceries' } },
    setPayee: vi.fn(),
    setMemo: vi.fn(),
    setAmount: vi.fn(),
    setFromAccount: vi.fn(),
    setCategory: vi.fn((name: string) => {
      state.selectedCategory = name;
    }),
    get payee() {
      return state.payee;
    },
    get isTransfer() {
      return state.isTransfer;
    },
    get selectedCategory() {
      return state.selectedCategory;
    },
  };
  return { form, state };
}

function renderIntegration(isSplit = false, initialCategory = '') {
  const { form, state } = createForm(initialCategory);
  const view = renderHook(() =>
    useAutofillIntegration({
      form: form as never,
      categories: CATEGORIES,
      budgetId: 1,
      selectedBudget: { ID: 1 } as never,
      isSplit,
    })
  );
  return { ...view, form, state };
}

/** Change the payee and let the 300ms lookup debounce elapse. */
function switchPayee(state: { payee: string }, rerender: () => void, payee: string) {
  act(() => {
    state.payee = payee;
    rerender();
  });
  act(() => {
    vi.advanceTimersByTime(350);
  });
  act(() => rerender());
}

describe('useAutofillIntegration — payee category memory', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    ruleAppliedFields = new Set();
    memoryByPayee = { 'corner cafe': CAFE_MEMORY, shell: SHELL_MEMORY };
    settingEnabled = true;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fills the category from the payee's last transaction", () => {
    const { result, form, state } = renderIntegration();

    expect(form.setCategory).toHaveBeenCalledWith('Dining');
    expect(state.selectedCategory).toBe('Dining');
    expect(result.current.payeeCategoryApplied).toBe(true);
    expect(result.current.payeeCategorySource).toEqual(CAFE_MEMORY);
  });

  it('leaves the field empty when the payee has no history', () => {
    memoryByPayee = {};
    const { result, form } = renderIntegration();

    expect(form.setCategory).not.toHaveBeenCalled();
    expect(result.current.payeeCategoryApplied).toBe(false);
    expect(result.current.payeeCategorySource).toBeNull();
  });

  it('does nothing when the setting is off', () => {
    settingEnabled = false;
    const { result, form } = renderIntegration();

    expect(form.setCategory).not.toHaveBeenCalled();
    expect(result.current.payeeCategoryApplied).toBe(false);
  });

  it('stands aside when an autofill rule already filled the category', () => {
    ruleAppliedFields = new Set(['category']);
    const { result, form } = renderIntegration();

    expect(form.setCategory).not.toHaveBeenCalled();
    expect(result.current.payeeCategoryApplied).toBe(false);
  });

  it('drops its indicator when a rule takes the field over afterwards', () => {
    const { result, rerender } = renderIntegration();
    expect(result.current.payeeCategoryApplied).toBe(true);

    // A rule resolves after the memory did (it debounces 300ms).
    ruleAppliedFields = new Set(['category']);
    act(() => rerender());

    expect(result.current.payeeCategoryApplied).toBe(false);
  });

  it('never overwrites a category the user picked themselves', () => {
    const { result, form, state, rerender } = renderIntegration();
    expect(form.setCategory).toHaveBeenCalledTimes(1);

    // The user overrides the suggestion by hand.
    act(() => {
      state.selectedCategory = 'Travel';
      rerender();
    });

    expect(result.current.payeeCategoryApplied).toBe(false);
    // …and memory does not write over them on a later render.
    act(() => rerender());
    expect(form.setCategory).toHaveBeenCalledTimes(1);
    expect(state.selectedCategory).toBe('Travel');
  });

  it('overrides the category "remember last" prefilled for a different payee', () => {
    // "remember last" prefills the category with whatever was used for ANY
    // payee, and it lands on mount — before the memory lookup resolves. A
    // payee-specific memory is better information, so it wins, exactly as
    // autofill rules overwrite that prefill via `ignoreCurrentValues`.
    const { result, form, state } = renderIntegration(false, 'Groceries');

    expect(result.current.payeeCategoryApplied).toBe(true);
    expect(form.setCategory).toHaveBeenLastCalledWith('Dining');
    expect(state.selectedCategory).toBe('Dining');
  });

  it('re-runs for the new payee when the payee changes', () => {
    // The once-per-payee contract: switching payees swaps the fill.
    const { result, state, rerender } = renderIntegration();
    expect(state.selectedCategory).toBe('Dining');

    switchPayee(state, rerender, 'Shell');

    expect(state.selectedCategory).toBe('Fuel');
    expect(result.current.payeeCategoryApplied).toBe(true);
    expect(result.current.payeeCategorySource).toEqual(SHELL_MEMORY);
  });

  it("walks the old payee's fill back when the new payee has no history", () => {
    // The previous payee's category must not linger under the new payee's
    // name — it falls back to the remember-last prefill.
    const { result, state, rerender } = renderIntegration();
    expect(state.selectedCategory).toBe('Dining');

    switchPayee(state, rerender, 'Brand New Shop');

    expect(state.selectedCategory).toBe('Groceries');
    expect(result.current.payeeCategoryApplied).toBe(false);
    expect(result.current.payeeCategorySource).toBeNull();
  });

  it('keeps a user-picked category across payee switches', () => {
    const { result, state, rerender } = renderIntegration();

    act(() => {
      state.selectedCategory = 'Travel'; // user's own pick
      rerender();
    });
    switchPayee(state, rerender, 'Shell');

    expect(state.selectedCategory).toBe('Travel');
    expect(result.current.payeeCategoryApplied).toBe(false);
  });

  it('does not fill for splits', () => {
    const { result, form } = renderIntegration(true);

    expect(form.setCategory).not.toHaveBeenCalled();
    expect(result.current.payeeCategoryApplied).toBe(false);
  });

  it('suggests again for the same payee after a session reset', () => {
    const { result, form, state, rerender } = renderIntegration();

    act(() => {
      state.selectedCategory = 'Travel';
      rerender();
    });
    expect(result.current.payeeCategoryApplied).toBe(false);

    act(() => {
      state.selectedCategory = '';
      result.current.resetAutofillSession();
    });
    act(() => rerender());

    expect(form.setCategory).toHaveBeenLastCalledWith('Dining');
    expect(result.current.payeeCategoryApplied).toBe(true);
  });
});
