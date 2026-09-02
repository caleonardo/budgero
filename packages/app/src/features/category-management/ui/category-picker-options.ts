export function isCategoryVisibleInPicker(name: string, includeTransfers = false): boolean {
  return includeTransfers || name.trim().toLowerCase() !== 'transfers';
}
