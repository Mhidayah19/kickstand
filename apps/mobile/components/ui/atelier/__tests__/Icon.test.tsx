import { render } from '@testing-library/react-native';
import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders an SVG for a known name', () => {
    const { UNSAFE_root } = render(<Icon name="oil" testID="icon" />);
    const svg = UNSAFE_root.findByType('RNSVGSvgView' as never);
    expect(svg).toBeTruthy();
  });

  it('falls back to "dots" for an unknown name', () => {
    const { UNSAFE_root } = render(<Icon name={'not-a-name' as never} testID="icon" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies the given size', () => {
    const { UNSAFE_root } = render(<Icon name="home" size={32} testID="icon" />);
    const svg = UNSAFE_root.findByType('RNSVGSvgView' as never);
    expect(svg.props.bbWidth).toBe(32);
  });
});
