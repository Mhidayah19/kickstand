import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../../lib/colors';
import { clamp01 } from '../../lib/math';

interface PaceGraphProps {
  actualProgress: number;
  idealProgress: number;
}

export function PaceGraph({ actualProgress, idealProgress }: PaceGraphProps) {
  const W = 480;
  const H = 120;

  const actualEndX = clamp01(idealProgress) * W;
  const actualEndY = 100 - clamp01(actualProgress) * 80;

  const dueX = 455;

  return (
    <View className="w-full">
      <Svg width="100%" height={96} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Line x1="0" y1="40" x2={W} y2="40" stroke={colors.white} strokeOpacity="0.05" strokeWidth="1" />
        <Line x1="0" y1="80" x2={W} y2="80" stroke={colors.white} strokeOpacity="0.05" strokeWidth="1" />
        <Line x1="0" y1="100" x2={W} y2="20" stroke={colors.yellow} strokeWidth="2" strokeDasharray="4,5" />
        <Path
          d={`M 0 100 L ${actualEndX} ${actualEndY}`}
          fill="none"
          stroke={colors.white}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Circle cx={actualEndX} cy={actualEndY} r="10" fill={colors.yellow} fillOpacity="0.18" />
        <Circle cx={actualEndX} cy={actualEndY} r="5" fill={colors.yellow} />
        <Line x1={dueX} y1="0" x2={dueX} y2={H} stroke={colors.yellow} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2,3" />
        <SvgText x={dueX + 5} y="14" fill={colors.yellow} fontSize="8" fontWeight="700" letterSpacing="0.8">DUE</SvgText>
      </Svg>
    </View>
  );
}
