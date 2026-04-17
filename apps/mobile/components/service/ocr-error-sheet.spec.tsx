import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OcrErrorSheet } from './ocr-error-sheet';

describe('OcrErrorSheet', () => {
  it('renders the message', () => {
    const { getByText } = render(
      <OcrErrorSheet visible message="low_confidence" onRetry={() => {}} onManual={() => {}} />,
    );
    expect(getByText(/couldn't read this receipt/i)).toBeTruthy();
  });

  it('fires onRetry when Retry scan is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <OcrErrorSheet visible message="err" onRetry={onRetry} onManual={() => {}} />,
    );
    fireEvent.press(getByText('Retry scan'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('fires onManual when Enter manually is pressed', () => {
    const onManual = jest.fn();
    const { getByText } = render(
      <OcrErrorSheet visible message="err" onRetry={() => {}} onManual={onManual} />,
    );
    fireEvent.press(getByText('Enter manually'));
    expect(onManual).toHaveBeenCalled();
  });

  it('returns null when not visible', () => {
    const { queryByText } = render(
      <OcrErrorSheet visible={false} message="err" onRetry={() => {}} onManual={() => {}} />,
    );
    expect(queryByText('Retry scan')).toBeNull();
  });
});
