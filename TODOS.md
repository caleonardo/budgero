1) [DONE] Transfers should hide the category until second (target account) is selected in the add transaction from as this is confusing.
On-budget accounts to on-budget is always logged as "Transfer", ie category field is hidden
   -> was a bug: `!toAcc?.OnBudget` is true when no target is selected, so the
      field appeared early. Now requires a chosen target AND target off-budget.

2) [DONE] New Budget form is to high in non english languages, it's cut off vertically
   -> the form's scroll cap only applied on mobile (`sm:max-h-none`); it now
      caps and scrolls at every breakpoint, in every dialog that hosts it.

3) [DONE] Prebuilt report tabs overflow in some languages
   -> tab cells get min-w-0 and truncate label + question instead of forcing
      the 7-column strip wider than the page.
