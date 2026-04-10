import Svg, { Path } from 'react-native-svg';

interface SparkLineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function SparkLine({
  values,
  width = 48,
  height = 16,
  color = '#C7B299',
}: SparkLineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 2) - 1,
  }));

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
