import React from 'react';
import { render, screen } from '@testing-library/react';
import { GroupShareBadge } from './GroupShareBadge';

describe('GroupShareBadge', () => {
  it('renders a rounded percentage', () => {
    render(<GroupShareBadge share={0.4975} />);
    expect(screen.getByTestId('group-share-badge')).toHaveTextContent('50%');
  });

  it('renders nothing without a share', () => {
    const { container } = render(<GroupShareBadge share={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
