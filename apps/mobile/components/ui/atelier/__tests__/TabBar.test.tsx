import { fireEvent, render } from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

import { TabBar } from '../TabBar';

describe('TabBar', () => {
  it('renders four tab labels', () => {
    const { getByText } = render(
      <TabBar active="home" onChange={() => {}} onAdd={() => {}} />
    );
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Bike')).toBeTruthy();
    expect(getByText('Log')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('calls onChange with tab id', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <TabBar active="home" onChange={onChange} onAdd={() => {}} />
    );
    fireEvent.press(getByTestId('tab-garage'));
    expect(onChange).toHaveBeenCalledWith('garage');
  });

  it('calls onAdd when FAB pressed', () => {
    const onAdd = jest.fn();
    const { getByTestId } = render(
      <TabBar active="home" onChange={() => {}} onAdd={onAdd} />
    );
    fireEvent.press(getByTestId('tab-fab'));
    expect(onAdd).toHaveBeenCalled();
  });
});
