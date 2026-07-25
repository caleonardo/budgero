import { describe, expect, it } from 'vitest';
import { decidePayeeCategoryMemory, type PayeeCategoryMemoryInput } from './payee-category-memory';

const base: PayeeCategoryMemoryInput = {
  enabled: true,
  payee: 'corner cafe',
  memoryCategoryId: 7,
  memoryCategoryExists: true,
  ruleFilledCategory: false,
  appliedForPayee: null,
  currentCategory: '',
  overwritableValues: ['', 'Groceries'],
};

describe('decidePayeeCategoryMemory', () => {
  it('applies the remembered category in the ordinary case', () => {
    expect(decidePayeeCategoryMemory(base)).toEqual({ apply: true, reason: null });
  });

  it('does nothing when the setting is off or the entry is a transfer/split', () => {
    expect(decidePayeeCategoryMemory({ ...base, enabled: false })).toEqual({
      apply: false,
      reason: 'disabled',
    });
  });

  it('falls back to an empty field when the payee has no history', () => {
    expect(decidePayeeCategoryMemory({ ...base, memoryCategoryId: null })).toEqual({
      apply: false,
      reason: 'no-memory',
    });
    expect(decidePayeeCategoryMemory({ ...base, memoryCategoryId: undefined })).toEqual({
      apply: false,
      reason: 'no-memory',
    });
  });

  it('stays quiet when the remembered category has since been deleted', () => {
    expect(decidePayeeCategoryMemory({ ...base, memoryCategoryExists: false })).toEqual({
      apply: false,
      reason: 'category-deleted',
    });
  });

  it('yields to an explicit autofill rule', () => {
    // The headline precedence rule: a rule that matches the payee always wins.
    expect(decidePayeeCategoryMemory({ ...base, ruleFilledCategory: true })).toEqual({
      apply: false,
      reason: 'rule-wins',
    });
  });

  it('runs once per payee — no re-apply for the payee it already filled', () => {
    expect(decidePayeeCategoryMemory({ ...base, appliedForPayee: 'corner cafe' })).toEqual({
      apply: false,
      reason: 'already-applied',
    });
  });

  it('DOES apply again when the payee changed since the last fill', () => {
    // "Once per payee": a fill for the previous payee doesn't block this one.
    expect(decidePayeeCategoryMemory({ ...base, appliedForPayee: 'starbucks' })).toEqual({
      apply: true,
      reason: null,
    });
  });

  it('never overwrites a category the user picked themselves', () => {
    expect(decidePayeeCategoryMemory({ ...base, currentCategory: 'Fuel' })).toEqual({
      apply: false,
      reason: 'user-picked',
    });
  });

  it('may overwrite empty, remember-last, and its own earlier fill', () => {
    // overwritableValues is the allowlist: '' and the remember-last prefill.
    expect(decidePayeeCategoryMemory({ ...base, currentCategory: '' }).apply).toBe(true);
    expect(decidePayeeCategoryMemory({ ...base, currentCategory: 'Groceries' }).apply).toBe(true);
  });

  it('ranks rule above already-applied above user-picked', () => {
    // Order matters only for the reported reason, but pinning it keeps the
    // precedence readable when this grows another source.
    const all = {
      ...base,
      ruleFilledCategory: true,
      appliedForPayee: base.payee,
      currentCategory: 'Fuel',
    };
    expect(decidePayeeCategoryMemory(all).reason).toBe('rule-wins');
    expect(decidePayeeCategoryMemory({ ...all, ruleFilledCategory: false }).reason).toBe(
      'already-applied'
    );
  });
});
