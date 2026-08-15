import React from 'react';
import { toDecimal } from '@shared/lib/currency/milli';
import { roundMilli } from '@shared/lib/currency/round-amount';
import { formatDate } from '@shared/lib/date-format';
import { parseISO } from 'date-fns';

interface GoalMessageFormatterProps {
  message: string;
  /**
   * Placeholder values from core goal calculations: numbers are integer
   * milliunits formatted with the localizer; strings pass through (ISO dates
   * are rendered with the locale date formatter).
   */
  values?: Record<string, number | string>;
  formatter: Intl.NumberFormat;
  className?: string;
}

/**
 * GoalMessageFormatter - Formats goal status messages and recommendations
 *
 * Takes a message template with {{placeholders}} and replaces them with
 * properly formatted currency values using the provided Intl.NumberFormat.
 * Values arrive as milliunits and are converted to decimals for display.
 *
 * Example:
 *   message: "Need {{amount}} more"
 *   values: { amount: 150500 }
 *   output: "Need $150.50 more" (formatted according to locale)
 */
export function GoalMessageFormatter({
  message,
  values,
  formatter,
  className,
}: GoalMessageFormatterProps) {
  if (!values || Object.keys(values).length === 0) {
    return <span className={className}>{message}</span>;
  }

  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;

  const placeholderRegex = /\{\{(\w+)\}\}/g;
  let match;

  while ((match = placeholderRegex.exec(message)) !== null) {
    const [fullMatch, key] = match;
    const value = values[key];

    if (value !== undefined) {
      if (match.index > lastIndex) {
        parts.push(message.substring(lastIndex, match.index));
      }

      if (typeof value === 'number') {
        parts.push(
          <span key={match.index} className="font-mono">
            {formatter.format(toDecimal(roundMilli(value)))}
          </span>
        );
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        parts.push(
          <span key={match.index}>{formatDate(parseISO(value), 'MMM d, yyyy')}</span>
        );
      } else {
        parts.push(<span key={match.index}>{value}</span>);
      }

      lastIndex = match.index + fullMatch.length;
    }
  }

  if (lastIndex < message.length) {
    parts.push(message.substring(lastIndex));
  }

  if (parts.length === 0) {
    return <span className={className}>{message}</span>;
  }

  return <span className={className}>{parts}</span>;
}
