import { fireEvent, render } from '@testing-library/react-native';
import { Row } from '../Row';

describe('Row', () => {
  it('renders title and sub', () => {
    const { getByText } = render(
      <Row icon="oil" title="Engine oil change" sub="4 days ago · 12,400 km" />
    );
    expect(getByText('Engine oil change')).toBeTruthy();
    expect(getByText('4 days ago · 12,400 km')).toBeTruthy();
  });

  it('renders trail text', () => {
    const { getByText } = render(
      <Row icon="oil" title="Oil" sub="" trail="S$85" />
    );
    expect(getByText('S$85')).toBeTruthy();
  });

  it('fires onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Row icon="oil" title="Oil" sub="" onPress={onPress} testID="row" />
    );
    fireEvent.press(getByTestId('row'));
    expect(onPress).toHaveBeenCalled();
  });
});
