import { render, screen } from '@testing-library/react';
import { YnabExportGuide } from './YnabExportGuide';

describe('YnabExportGuide', () => {
  it('keeps both help sections collapsed by default', () => {
    render(<YnabExportGuide />);

    expect(screen.getByRole('button', { name: 'How to export from YNAB' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Import limitations' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
