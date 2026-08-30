import React from 'react';
import { Title, type StepProps } from './shared';

interface YnabStepProps extends StepProps {
  onFileSelected: (file: File) => Promise<void> | void;
  isInspecting: boolean;
}

export const YnabImportStep: React.FC<YnabStepProps> = ({
  cur,
  state,
  onFileSelected,
  isInspecting,
}) => {
  const file = state.ynabFile;
  const preview = state.ynabPreview;
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <Title h={cur.title} sub={cur.subtitle} />
      {!file && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            fontSize: 11,
            color: '#393939',
            lineHeight: 1.6,
            border: '1px dashed rgba(57,57,57,0.3)',
          }}
        >
          <span style={{ fontWeight: 700, color: '#141414' }}>Before you export:</span> in YNAB’s{' '}
          <em>Plan Settings</em>, set Date Format to <code>2025-12-30</code>, Number Format to{' '}
          <code>123,456.78</code> and Currency Placement to “Don’t Show”. Skipping this can shift
          dates and break amounts. Details in the{' '}
          <a
            href="https://budgero.app/docs/ynab-import"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#141414', fontWeight: 700 }}
          >
            import guide
          </a>
          .
        </div>
      )}
      {!file && (
        // Presentation wrapper: the click merely widens the hit area of the
        // fully keyboard-accessible "Browse files" button inside.
        <div
          role="presentation"
          aria-busy={isInspecting}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f && !isInspecting) void onFileSelected(f);
          }}
          style={{
            marginTop: 12,
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed rgba(57,57,57,0.55)',
            background: '#fffdf8',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>☁</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
            {isInspecting ? 'Inspecting your YNAB export…' : 'Drop your YNAB export here'}
          </div>
          <div style={{ fontSize: 11, color: '#393939', lineHeight: 1.5 }}>
            In YNAB: <em>File › Export Budget</em>. Drop the .zip here —<br />
            nothing leaves your device until you finish.
          </div>
          <button
            type="button"
            disabled={isInspecting}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            style={{
              marginTop: 14,
              padding: '8px 16px',
              border: '1px solid #141414',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 11,
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            {isInspecting ? 'INSPECTING…' : 'BROWSE FILES'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            disabled={isInspecting}
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFileSelected(f);
            }}
          />
        </div>
      )}
      {file && (
        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          <div
            style={{
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: '1px dashed rgba(57,57,57,0.5)',
              background: '#fbf7eb',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                border: '1.5px solid #141414',
                background: '#141414',
                color: '#fbf7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Y
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{file.name}</div>
              <div style={{ fontSize: 10, color: '#393939' }}>
                {file.size} · ready to import on finish
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2f7d31', letterSpacing: 1 }}>
              ✓ READY
            </div>
          </div>
          {preview && (
            <div
              style={{
                padding: 12,
                display: 'grid',
                gap: 10,
                border: '1px dashed rgba(57,57,57,0.35)',
                background: '#fffdf8',
                fontSize: 11,
                color: '#393939',
                lineHeight: 1.5,
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#141414' }}>Detected in this export:</span>{' '}
                {preview.accountCount.toLocaleString()}{' '}
                {preview.accountCount === 1 ? 'account' : 'accounts'} ·{' '}
                {preview.categoryCount.toLocaleString()}{' '}
                {preview.categoryCount === 1 ? 'category' : 'categories'} ·{' '}
                {preview.registerRowCount.toLocaleString()} register{' '}
                {preview.registerRowCount === 1 ? 'row' : 'rows'}
              </div>

              <div
                style={{
                  padding: 9,
                  border: '1px solid rgba(198, 137, 44, 0.5)',
                  background: 'rgba(255, 240, 190, 0.35)',
                }}
              >
                <span style={{ fontWeight: 700, color: '#141414' }}>
                  Review account types after import.
                </span>{' '}
                YNAB does not reliably export account types. Budgero recognizes credit cards where
                possible and imports other accounts as Checking, so verify every account before
                budgeting.
              </div>

              {preview.missingCategories.length > 0 && (
                <div style={{ padding: 9, border: '1px solid rgba(198,57,44,0.35)' }}>
                  <span style={{ fontWeight: 700, color: '#141414' }}>
                    Categories missing from Plan.csv:
                  </span>{' '}
                  {preview.missingCategories
                    .map((category) => `${category.categoryGroup} › ${category.category}`)
                    .join(', ')}
                  . Budgero will create them and report them when the import finishes.
                </div>
              )}

              {preview.splitTransactions.length > 0 && (
                <div
                  style={{
                    padding: 9,
                    border: '1px solid rgba(57,57,57,0.35)',
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 700, color: '#141414' }}>
                    {preview.splitTransactions.length} split transaction
                    {preview.splitTransactions.length === 1 ? '' : 's'} detected
                  </span>
                  Complete contiguous Split (1/n)…Split (n/n) sequences will be imported as split
                  transactions automatically.
                </div>
              )}
            </div>
          )}
          <div
            style={{
              padding: 10,
              fontSize: 11,
              color: '#393939',
              lineHeight: 1.5,
              border: '1px dashed rgba(57,57,57,0.3)',
            }}
          >
            <span style={{ fontWeight: 700, color: '#141414' }}>Heads up:</span> YNAB’s “Age of
            Money”, scheduled transactions, and goals don’t carry over. Accounts, categories,
            assignments, and transaction history do.
          </div>
        </div>
      )}
    </div>
  );
};
