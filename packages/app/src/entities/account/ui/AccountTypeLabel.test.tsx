import { act, cleanup, render, screen } from '@testing-library/react';
import { activateLocale } from '@shared/i18n';
import { AccountTypeEnum } from '../model/accountTypes';
import { AccountTypeLabel } from './AccountTypeLabel';

afterEach(async () => {
  cleanup();
  await activateLocale('en', false);
});

it('translates persisted account type IDs and updates labels when switching languages', async () => {
  await activateLocale('de', false);
  render(<AccountTypeLabel type={AccountTypeEnum.CHECKING} />);
  expect(screen.getByText('Girokonto')).toBeInTheDocument();
  await act(() => activateLocale('en', false));
  expect(screen.getByText('Checking')).toBeInTheDocument();
});

it('preserves unknown extension types and tolerates an unset type', () => {
  const view = render(<AccountTypeLabel type="Custom account type" />);
  expect(screen.getByText('Custom account type')).toBeInTheDocument();
  view.rerender(<AccountTypeLabel type={undefined} />);
  expect(view.container).toBeEmptyDOMElement();
});
