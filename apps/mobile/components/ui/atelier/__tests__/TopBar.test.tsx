import { fireEvent, render } from '@testing-library/react-native';

jest.mock('expo-blur', () => ({
  BlurView: ({ children, style, ...p }: any) => {
    const { View } = require('react-native');
    return <View style={style} {...p}>{children}</View>;
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

import { TopBar } from '../TopBar';

describe('TopBar', () => {
  it('shows bike name', () => {
    const { getByText } = render(<TopBar bike="CB650R" unread={0} />);
    expect(getByText('CB650R')).toBeTruthy();
  });

  it('renders unread dot when unread > 0', () => {
    const { queryByTestId } = render(<TopBar bike="X" unread={3} />);
    expect(queryByTestId('unread-dot')).toBeTruthy();
  });

  it('hides unread dot when unread === 0', () => {
    const { queryByTestId } = render(<TopBar bike="X" unread={0} />);
    expect(queryByTestId('unread-dot')).toBeNull();
  });

  it('fires onBellPress', () => {
    const onBell = jest.fn();
    const { getByTestId } = render(
      <TopBar bike="X" unread={0} onBellPress={onBell} />
    );
    fireEvent.press(getByTestId('topbar-bell'));
    expect(onBell).toHaveBeenCalled();
  });
});
