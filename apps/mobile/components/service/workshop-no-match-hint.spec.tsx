import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WorkshopNoMatchHint } from './workshop-no-match-hint';

describe('WorkshopNoMatchHint', () => {
  it('renders the workshop name and prompt', () => {
    const { getByText } = render(
      <WorkshopNoMatchHint workshopName="Mah Pte Ltd" onPress={() => {}} />,
    );
    expect(getByText('Mah Pte Ltd')).toBeTruthy();
    expect(getByText(/No match in your workshops/i)).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <WorkshopNoMatchHint workshopName="X" onPress={onPress} />,
    );
    fireEvent.press(getByText(/No match/i));
    expect(onPress).toHaveBeenCalled();
  });
});
