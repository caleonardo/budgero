/**
 * Payee category memory — the decision half.
 *
 * The add-transaction form pre-fills the category with whatever the payee was
 * filed under last time. It runs ONCE PER PAYEE: switching payees re-runs it
 * for the new payee. This is deliberately the weakest source of a category —
 * an explicit autofill rule outranks it, and a value the user picked
 * themselves outranks both. Kept pure so the precedence is testable without a
 * form.
 */

export interface PayeeCategoryMemoryDecision {
  /** Whether the remembered category should be written into the form. */
  apply: boolean;
  /** Why not, for debugging and tests. `null` when `apply` is true. */
  reason:
    | null
    | 'disabled'
    | 'no-memory'
    | 'category-deleted'
    | 'rule-wins'
    | 'already-applied'
    | 'user-picked';
}

export interface PayeeCategoryMemoryInput {
  /** Setting is on AND this is a plain, non-transfer, non-split entry. */
  enabled: boolean;
  /** Normalized payee the lookup ran for. */
  payee: string;
  /** Category id remembered for that payee, if any. */
  memoryCategoryId: number | null | undefined;
  /** False when the remembered category has since been deleted. */
  memoryCategoryExists: boolean;
  /** An autofill rule already supplied a category — rules always win. */
  ruleFilledCategory: boolean;
  /** Payee that memory last applied for, enforcing once-per-payee. */
  appliedForPayee: string | null;
  /** What the category field holds right now. */
  currentCategory: string;
  /**
   * Field values memory may overwrite: empty, the "remember last" prefill,
   * and its own earlier fill. Anything else was the user's own pick, and the
   * user always wins.
   */
  overwritableValues: string[];
}

export function decidePayeeCategoryMemory(
  input: PayeeCategoryMemoryInput
): PayeeCategoryMemoryDecision {
  if (!input.enabled) return { apply: false, reason: 'disabled' };
  if (input.memoryCategoryId == null) return { apply: false, reason: 'no-memory' };
  if (!input.memoryCategoryExists) return { apply: false, reason: 'category-deleted' };
  if (input.ruleFilledCategory) return { apply: false, reason: 'rule-wins' };
  if (input.appliedForPayee === input.payee) return { apply: false, reason: 'already-applied' };
  if (!input.overwritableValues.includes(input.currentCategory)) {
    return { apply: false, reason: 'user-picked' };
  }
  return { apply: true, reason: null };
}
