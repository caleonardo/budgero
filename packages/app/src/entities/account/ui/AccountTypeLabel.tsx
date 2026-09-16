import { useLingui } from '@lingui/react/macro';
import { getAccountTypeDefinition } from '../model/accountTypes';

/** Translate display labels while keeping persisted account type IDs stable. */
export function AccountTypeLabel({ type }: { type: string | null | undefined }) {
  const { t } = useLingui();
  const definition = type ? getAccountTypeDefinition(type) : null;
  return <>{definition ? t(definition.name) : type}</>;
}
