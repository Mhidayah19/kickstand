import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'bike' | 'clipboard' | 'profile' | 'plus' | 'bell'
  | 'chevron' | 'chevronDown' | 'chevronUp' | 'search' | 'filter' | 'close'
  | 'oil' | 'chain' | 'tire' | 'brake' | 'wrench' | 'shield'
  | 'calendar' | 'doc' | 'sparkle' | 'arrowUp' | 'arrowDown' | 'arrowRight'
  | 'gauge' | 'zap' | 'tune' | 'dots' | 'dotsV' | 'camera' | 'receipt' | 'settings'
  | 'chart';

export interface IconProps {
  name: IconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  testID?: string;
}

const commonProps = {
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9v12h14V9" />
      <Path d="M10 21v-6h4v6" />
    </>
  ),
  bike: (
    <>
      <Circle cx={5.5} cy={17.5} r={3.5} />
      <Circle cx={18.5} cy={17.5} r={3.5} />
      <Path d="M5.5 17.5 10 9h4l4.5 8.5" />
      <Path d="M10 9h-2M14 9l2-3h3" />
    </>
  ),
  clipboard: (
    <>
      <Rect x={6} y={4} width={12} height={17} rx={2} />
      <Rect x={9} y={2} width={6} height={4} rx={1} />
      <Path d="M9 11h6M9 15h4" />
    </>
  ),
  profile: (
    <>
      <Circle cx={12} cy={9} r={3.5} />
      <Path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  bell: (
    <>
      <Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" />
      <Path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  chevron: <Path d="m9 6 6 6-6 6" />,
  chevronDown: <Path d="m6 9 6 6 6-6" />,
  chevronUp: <Path d="m6 15 6-6 6 6" />,
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="m20 20-3.5-3.5" />
    </>
  ),
  filter: <Path d="M4 6h16M7 12h10M10 18h4" />,
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  oil: (
    <>
      <Path d="M12 3 8 10a4 4 0 1 0 8 0l-4-7Z" />
      <Path d="M10 11a2 2 0 0 0 2 2" />
    </>
  ),
  chain: (
    <>
      <Rect x={3} y={9} width={8} height={6} rx={3} />
      <Rect x={13} y={9} width={8} height={6} rx={3} />
      <Path d="M11 12h2" />
    </>
  ),
  tire: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),
  brake: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </>
  ),
  wrench: (
    <>
      <Path d="M14 6a4 4 0 0 1 5 5l-9.5 9.5a2 2 0 0 1-3-3L16 8" />
      <Circle cx={17} cy={7} r={1} fill="currentColor" />
    </>
  ),
  shield: <Path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />,
  calendar: (
    <>
      <Rect x={4} y={6} width={16} height={15} rx={2} />
      <Path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  doc: (
    <>
      <Path d="M7 3h7l4 4v14H7z" />
      <Path d="M14 3v4h4" />
    </>
  ),
  sparkle: <Path d="M12 3v6M12 15v6M3 12h6M15 12h6" />,
  arrowUp: <Path d="M12 19V5M5 12l7-7 7 7" />,
  arrowDown: <Path d="M12 5v14M5 12l7 7 7-7" />,
  arrowRight: <Path d="M5 12h14M12 5l7 7-7 7" />,
  gauge: (
    <>
      <Path d="M4 15a8 8 0 0 1 16 0" />
      <Path d="m12 15 4-5" />
      <Circle cx={12} cy={15} r={1.5} fill="currentColor" />
    </>
  ),
  zap: <Path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" />,
  tune: (
    <>
      <Path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M18 18h2" />
      <Circle cx={16} cy={6} r={2} />
      <Circle cx={8} cy={12} r={2} />
      <Circle cx={16} cy={18} r={2} />
    </>
  ),
  dots: (
    <>
      <Circle cx={5} cy={12} r={1.5} fill="currentColor" />
      <Circle cx={12} cy={12} r={1.5} fill="currentColor" />
      <Circle cx={19} cy={12} r={1.5} fill="currentColor" />
    </>
  ),
  dotsV: (
    <>
      <Circle cx={12} cy={5} r={1.5} fill="currentColor" />
      <Circle cx={12} cy={12} r={1.5} fill="currentColor" />
      <Circle cx={12} cy={19} r={1.5} fill="currentColor" />
    </>
  ),
  camera: (
    <>
      <Rect x={3} y={7} width={18} height={13} rx={2} />
      <Circle cx={12} cy={13} r={4} />
      <Path d="M8 7l2-3h4l2 3" />
    </>
  ),
  receipt: (
    <>
      <Path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3Z" />
      <Path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  settings: (
    <>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  chart: (
    <>
      <Path d="M3 3v18h18" />
      <Path d="M7 16l4-4 4 4 4-6" />
    </>
  ),
};

export function Icon({ name, size = 20, stroke = 'currentColor', strokeWidth = 1.5, testID }: IconProps) {
  const body = paths[name] ?? paths.dots;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      testID={testID}
      stroke={stroke}
      strokeWidth={strokeWidth}
      {...commonProps}
    >
      {body}
    </Svg>
  );
}
