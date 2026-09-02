import Svg, { Circle, Line, Path } from 'react-native-svg';

import { theme } from '@/theme';

export function TrendLine({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => ({
    x: 24 + (index / Math.max(1, values.length - 1)) * 272,
    y: 104 - ((value - min) / range) * 62,
  }));
  const path = points
    .map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`)
    .join(' ');

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
        d={path}
        fill="none"
        stroke={theme.colors.companionBerrySoft}
        strokeLinecap="round"
        strokeWidth="9"
      />
      <Path
        d={path}
        fill="none"
        stroke={theme.colors.companionBerry}
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      {points.map(({ x, y }, index) => (
        <Circle
          cx={x}
          cy={y}
          fill={theme.colors.companionSurface}
          key={`${index}-${x}-${y}`}
          r="5"
          stroke={theme.colors.companionBerry}
          strokeWidth="2.5"
        />
      ))}
    </Svg>
  );
}
