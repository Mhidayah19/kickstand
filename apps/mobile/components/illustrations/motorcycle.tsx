import React from 'react';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

interface MotorcycleIllustrationProps {
  width?: number;
  height?: number;
}

export function MotorcycleIllustration({ width = 320, height = 200 }: MotorcycleIllustrationProps) {
  const D = '#1c1917';
  const A = '#d97706';
  const M = '#78716c';

  return (
    <Svg width={width} height={height} viewBox="0 0 320 200" fill="none">
      {/* Ground shadow */}
      <Ellipse cx={160} cy={178} rx={110} ry={6} fill="rgba(28,25,23,0.06)" />

      {/* Rear wheel */}
      <Circle cx={72} cy={142} r={34} stroke={D} strokeWidth={5} />
      <Circle cx={72} cy={142} r={16} stroke={D} strokeWidth={2.5} />
      <Circle cx={72} cy={142} r={6} fill={A} />
      <Circle cx={72} cy={142} r={34} stroke={D} strokeWidth={9} opacity={0.06} />

      {/* Front wheel */}
      <Circle cx={248} cy={142} r={30} stroke={D} strokeWidth={5} />
      <Circle cx={248} cy={142} r={14} stroke={D} strokeWidth={2.5} />
      <Circle cx={248} cy={142} r={5} fill={A} />
      <Circle cx={248} cy={142} r={30} stroke={D} strokeWidth={8} opacity={0.06} />

      {/* Body / fairing */}
      <Path
        d="M92 115 L105 68 L135 48 L195 38 L220 45 L232 60 L225 85 L195 105 L155 112 L125 112 Z"
        fill={D} opacity={0.07} stroke={D} strokeWidth={3.5} strokeLinejoin="round"
      />
      {/* Fairing contour */}
      <Path d="M125 112 L155 112 L195 105 L225 85" stroke={D} strokeWidth={2} opacity={0.3} />
      {/* Fairing vent slashes */}
      <Line x1={160} y1={88} x2={185} y2={78} stroke={D} strokeWidth={2} opacity={0.15} />
      <Line x1={158} y1={95} x2={183} y2={85} stroke={D} strokeWidth={2} opacity={0.15} />
      <Line x1={156} y1={102} x2={181} y2={92} stroke={D} strokeWidth={2} opacity={0.15} />

      {/* Swingarm */}
      <Path d="M72 142 L130 108" stroke={D} strokeWidth={5} strokeLinecap="round" />

      {/* Tank */}
      <Path d="M108 65 Q145 32 200 42" stroke={D} strokeWidth={6} strokeLinecap="round" />
      <Path d="M108 65 Q145 32 200 42 L195 50 Q145 42 112 70 Z" fill={D} opacity={0.05} />
      {/* Tank accent stripe */}
      <Path d="M118 58 Q150 36 192 44" stroke={A} strokeWidth={6} strokeLinecap="round" opacity={0.8} />

      {/* Seat */}
      <Path d="M105 68 L85 74 Q72 68 65 78" stroke={D} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M105 68 L85 74" stroke={D} strokeWidth={8} strokeLinecap="round" opacity={0.06} />

      {/* Tail section */}
      <Path d="M85 74 L78 60 L72 54" stroke={D} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M85 74 L78 60 L82 58 L90 72" fill={D} opacity={0.04} />
      {/* Taillight */}
      <Path d="M70 54 L76 54" stroke={A} strokeWidth={4} strokeLinecap="round" opacity={0.9} />

      {/* Rear fender */}
      <Path d="M65 78 Q55 92 50 110" stroke={D} strokeWidth={3} strokeLinecap="round" />

      {/* Engine block */}
      <Path d="M128 95 L134 78 L168 74 L174 95 Z" fill={D} opacity={0.1} stroke={D} strokeWidth={2.5} strokeLinejoin="round" />
      <Line x1={140} y1={80} x2={140} y2={95} stroke={D} strokeWidth={1.5} opacity={0.25} />
      <Line x1={148} y1={78} x2={148} y2={95} stroke={D} strokeWidth={1.5} opacity={0.25} />
      <Line x1={156} y1={76} x2={156} y2={95} stroke={D} strokeWidth={1.5} opacity={0.25} />
      <Line x1={164} y1={75} x2={164} y2={95} stroke={D} strokeWidth={1.5} opacity={0.25} />

      {/* Exhaust */}
      <Path d="M155 112 L125 128 L95 138 L78 142" stroke={M} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M95 138 L78 142" stroke={M} strokeWidth={8} strokeLinecap="round" opacity={0.5} />
      <Circle cx={78} cy={143} r={4.5} stroke={M} strokeWidth={2} />

      {/* Front fork */}
      <Path d="M225 52 L238 90 L248 142" stroke={D} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M227 56 L240 94 L248 140" stroke={D} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
      <Circle cx={226} cy={52} r={3} fill={D} opacity={0.3} />

      {/* Windscreen */}
      <Path d="M220 45 L230 24 L236 28 L230 48" stroke={D} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
      <Path d="M220 45 L230 24 L236 28 L230 48" fill={D} opacity={0.03} />

      {/* Clip-on handlebars */}
      <Path d="M222 50 L236 42" stroke={D} strokeWidth={3.5} strokeLinecap="round" />
      <Path d="M222 50 L230 40" stroke={D} strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx={236} cy={42} r={3} fill={D} />
      <Circle cx={230} cy={40} r={3} fill={D} />

      {/* Headlight */}
      <Ellipse cx={232} cy={64} rx={10} ry={8} fill={D} opacity={0.06} stroke={D} strokeWidth={3} />
      <Ellipse cx={232} cy={64} rx={5} ry={4} fill={A} />
      <Line x1={243} y1={60} x2={258} y2={55} stroke={A} strokeWidth={2.2} opacity={0.4} strokeLinecap="round" />
      <Line x1={243} y1={65} x2={260} y2={65} stroke={A} strokeWidth={2.2} opacity={0.4} strokeLinecap="round" />
      <Line x1={243} y1={70} x2={258} y2={75} stroke={A} strokeWidth={2.2} opacity={0.4} strokeLinecap="round" />

      {/* Front fender */}
      <Path d="M238 118 Q252 112 260 118" stroke={D} strokeWidth={3} strokeLinecap="round" />

      {/* Chain hint */}
      <Circle cx={72} cy={142} r={9} stroke={D} strokeWidth={1.2} opacity={0.12} />
      <Circle cx={130} cy={108} r={6} stroke={D} strokeWidth={1.2} opacity={0.12} />
      <Line x1={78} y1={134} x2={125} y2={104} stroke={D} strokeWidth={1} opacity={0.08} />
      <Line x1={78} y1={150} x2={125} y2={112} stroke={D} strokeWidth={1} opacity={0.08} />

      {/* Road dashes */}
      <Line x1={25} y1={182} x2={50} y2={182} stroke={D} strokeWidth={1.5} opacity={0.05} strokeLinecap="round" />
      <Line x1={70} y1={182} x2={95} y2={182} stroke={D} strokeWidth={1.5} opacity={0.05} strokeLinecap="round" />
      <Line x1={115} y1={182} x2={140} y2={182} stroke={D} strokeWidth={1.5} opacity={0.05} strokeLinecap="round" />
      <Line x1={160} y1={182} x2={185} y2={182} stroke={D} strokeWidth={1.5} opacity={0.05} strokeLinecap="round" />
      <Line x1={205} y1={182} x2={230} y2={182} stroke={D} strokeWidth={1.5} opacity={0.05} strokeLinecap="round" />
      <Line x1={250} y1={182} x2={275} y2={182} stroke={D} strokeWidth={1.5} opacity={0.05} strokeLinecap="round" />
    </Svg>
  );
}
