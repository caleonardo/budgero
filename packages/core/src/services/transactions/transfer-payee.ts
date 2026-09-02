export interface TransferPayeeAccount {
  Name: string;
  OnBudget: boolean | number;
}

export interface TransferPayees {
  sourcePayee: string | null;
  destinationPayee: string | null;
}

export function isAccountOnBudget(account: TransferPayeeAccount): boolean {
  return account.OnBudget !== false && Number(account.OnBudget) !== 0;
}

export function transferInvolvesOffBudgetAccount(
  source: TransferPayeeAccount,
  destination: TransferPayeeAccount
): boolean {
  return !isAccountOnBudget(source) || !isAccountOnBudget(destination);
}

/**
 * On-budget transfers are internal movements and never have a payee. When
 * exactly one side is off-budget, that external account is the natural payee
 * on both linked legs. A user-entered payee remains available for transfers
 * involving off-budget accounts.
 */
export function resolveTransferPayees(
  source: TransferPayeeAccount,
  destination: TransferPayeeAccount,
  requestedPayee?: string | null
): TransferPayees {
  const sourceOnBudget = isAccountOnBudget(source);
  const destinationOnBudget = isAccountOnBudget(destination);

  if (sourceOnBudget && destinationOnBudget) {
    return { sourcePayee: null, destinationPayee: null };
  }

  const requested = requestedPayee?.trim();
  if (requested) {
    return { sourcePayee: requested, destinationPayee: requested };
  }

  if (sourceOnBudget !== destinationOnBudget) {
    const externalName = sourceOnBudget ? destination.Name : source.Name;
    return { sourcePayee: externalName, destinationPayee: externalName };
  }

  return {
    sourcePayee: destination.Name,
    destinationPayee: source.Name,
  };
}
