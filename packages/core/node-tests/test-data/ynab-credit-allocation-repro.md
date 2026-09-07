# YNAB credit funding observations

Captured from the disposable `ynab repro` plan through YNAB's API on September 7–8, 2026. Expected assigned/activity/available and Ready to Assign values are YNAB responses, not values calculated by Budgero. Identifiers were replaced while preserving their lexical ordering. Shared entity definitions plus per-observation overrides keep the JSON compact; money-movement history and unused categories were omitted.

## Smallest reproduction (capture 01)

1. Create a checking account with $1,000 and two credit cards with zero balances.
2. Assign $100 to Purchases in September.
3. Enter an $80 purchase on Card A dated September 1, categorized as Purchases.
4. Enter an $80 purchase on Card B dated September 2, in the same category.
5. YNAB reserves $80 for A and $20 for B. Purchases has −$60 available.
6. Reverse the dates: YNAB reserves $20 for A and $80 for B (capture 02).

Budgero previously apportioned the $100 equally between the cards. Monthly mode now funds purchases in chronological order, after accounting for cash spending and refunds.

## Additional captured cases

- 03–04, 09, 13: same-date purchases, unequal amounts, and a newly created transaction. Larger outflows precede smaller ones. Equal-date/equal-amount observations are consistent with ascending source-ID order; these samples do not establish YNAB's undocumented tie behavior for every possible transaction. CSV imports lack source IDs and retain register order.
- 05: a later $50 cash purchase takes priority, leaving only $50 for card purchases.
- 06, 10–11, 14–15: refunds on either card, refunds larger than that card's spending, and purchases interleaved across cards. Refunds cancel that card's earliest purchases before funding is reallocated.
- 07–08: assigning money after entering the purchases recalculates that month's funding.
- 12, 16: a checking split contains $100 of income and a $20 category refund. Only the income part increases RTA.
- 17: a refund draws on prior-month card funding and current-month funding from another category.
- 18: $80 reserved for A minus a $20 payment produces $60 payment-category Activity. A $10 credit reward reduces debt without adding cash income.
- 19: overpay a separate card by $20 in August, then buy $40 in September with $40 assigned. Only $20 becomes credit spending and funds the payment category; the other $20 spends the card's positive cash balance. August RTA includes the positive balance, and the payment-category overspend rolls forward normally.

The regression imports each snapshot using the actual API importer, asserts monthly RTA mode, and compares every included non-internal category's assigned, activity, and available amounts in every month, along with RTA and account balances. The production verifier also includes non-internal categories inside groups marked internal by YNAB (including Credit Card Payments).

## Run

From the repository root:

```sh
pnpm --dir packages/core exec vitest run node-tests/ynab-credit-allocation.node.spec.ts
```

To additionally fetch and import the current test plan using a PAT stored in a file (read-only; no plan edits):

```sh
YNAB_ACCESS_TOKEN_FILE=/absolute/path/to/token-file \
YNAB_REPRO_PLAN_ID=your-test-plan-id \
pnpm --dir packages/core exec vitest run node-tests/ynab-credit-allocation.node.spec.ts
```

The live import runs in a temporary in-memory database and does not create a budget in the user's running Budgero app. Cumulative RTA behavior remains covered by the existing core tests.
