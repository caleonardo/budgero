import { Trans, useLingui } from '@lingui/react/macro';
import React from 'react';
import { WORKSPACE_SUGGESTIONS } from '../onboarding-data';
import { InputRow, StepHeroImage, Title, type StepProps } from './shared';

export const WorkspaceStep: React.FC<StepProps> = ({ cur, state, set }) => {
  const { t } = useLingui();

  return (
    <div>
      <StepHeroImage
        src="/onboarding-workspace.png"
        alt={t`Coin character with a ledger and a budget nameplate`}
      />
      <Title h={cur.title} sub={cur.subtitle} />
      <InputRow
        big
        value={state.budgetName}
        onChange={(v) => set({ budgetName: v })}
        placeholder={t`e.g. Household 2026`}
      />
      <div style={{ marginTop: 16, fontSize: 11, color: '#393939', marginBottom: 8 }}>
        <Trans>OR PICK ONE:</Trans>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {WORKSPACE_SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => set({ budgetName: t(s) })}
            style={{
              border: '1px dashed rgba(57,57,57,0.5)',
              background: state.budgetName === t(s) ? '#141414' : 'transparent',
              color: state.budgetName === t(s) ? '#fbf7eb' : '#141414',
              padding: '6px 12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
            }}
          >
            {t(s)}
          </button>
        ))}
      </div>
    </div>
  );
};
