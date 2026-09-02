interface SplitMemoTextProps {
  memo: string;
}

/** Read-only split memo that cannot widen the fixed split-details table. */
export function SplitMemoText({ memo }: SplitMemoTextProps) {
  return (
    <span className="block min-w-0 whitespace-normal break-words [overflow-wrap:anywhere]">
      {memo || '-'}
    </span>
  );
}
