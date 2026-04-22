import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders children in uppercase', () => {
    const { getByText } = render(<Badge tone="accent">on pace</Badge>);
    expect(getByText('on pace')).toBeTruthy();
  });

  it('renders with danger tone class', () => {
    const { getByTestId } = render(<Badge tone="danger" testID="badge">1 URGENT</Badge>);
    const badge = getByTestId('badge');
    expect(badge.props.className).toContain('text-danger');
  });

  it('renders with accent tone class', () => {
    const { getByTestId } = render(<Badge tone="accent" testID="badge">ACTIVE</Badge>);
    const badge = getByTestId('badge');
    expect(badge.props.className).toContain('text-yellow');
  });

  it('renders with ink tone class', () => {
    const { getByTestId } = render(<Badge tone="ink" testID="badge">INK</Badge>);
    const badge = getByTestId('badge');
    expect(badge.props.className).toContain('bg-ink');
  });
});
