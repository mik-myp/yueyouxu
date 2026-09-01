import Svg, { Circle, Line, Path } from 'react-native-svg';

import { theme } from '@/theme';

export function TrendLine() {
  return (
    <Svg height="142" width="100%" viewBox="0 0 320 142">
      {[28, 66, 104].map((y) => (
        <Line
          key={y}
          x1="12"
          x2="308"
          y1={y}
          y2={y}
          stroke={theme.colors.border}
          strokeDasharray="3 5"
          strokeWidth="1"
        />
      ))}
      <Path
        d="M 24 78 C 66 72, 76 48, 112 58 S 172 88, 208 70 S 264 44, 296 54"
        fill="none"
        stroke={theme.colors.companionBerrySoft}
        strokeLinecap="round"
        strokeWidth="9"
      />
      <Path
        d="M 24 78 C 66 72, 76 48, 112 58 S 172 88, 208 70 S 264 44, 296 54"
        fill="none"
        stroke={theme.colors.companionBerry}
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      {[
        [24, 78],
        [112, 58],
        [208, 70],
        [296, 54],
      ].map(([cx, cy]) => (
        <Circle
          cx={cx}
          cy={cy}
          fill={theme.colors.companionSurface}
          key={`${cx}-${cy}`}
          r="5"
          stroke={theme.colors.companionBerry}
          strokeWidth="2.5"
        />
      ))}
    </Svg>
  );
}
