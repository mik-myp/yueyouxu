import Svg, { Circle, Path } from 'react-native-svg';

import { Box, Text, theme } from '@/theme';

const CENTER_X = 160;
const CENTER_Y = 156;
const RADIUS = 118;
const START_ANGLE = 200;
const END_ANGLE = 340;

function pointOnArc(angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER_X + RADIUS * Math.cos(radians),
    y: CENTER_Y + RADIUS * Math.sin(radians),
  };
}

function arcPath(startAngle: number, endAngle: number) {
  const start = pointOnArc(startAngle);
  const end = pointOnArc(endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function dayAngle(day: number) {
  return START_ANGLE + ((day - 1) / 29) * (END_ANGLE - START_ANGLE);
}

export function CycleArc() {
  const today = pointOnArc(dayAngle(1));

  return (
    <Box height={222} justifyContent="center">
      <Svg height="190" width="100%" viewBox="0 0 320 190">
        <Path
          d={arcPath(START_ANGLE, END_ANGLE)}
          fill="none"
          stroke={theme.colors.border}
          strokeLinecap="round"
          strokeWidth={14}
        />
        <Path
          d={arcPath(dayAngle(1), dayAngle(5))}
          fill="none"
          stroke={theme.colors.periodActual}
          strokeLinecap="round"
          strokeWidth={14}
        />
        <Path
          d={arcPath(dayAngle(27), dayAngle(30))}
          fill="none"
          stroke={theme.colors.periodPredicted}
          strokeDasharray="4 5"
          strokeLinecap="round"
          strokeWidth={14}
        />
        <Circle
          cx={today.x}
          cy={today.y}
          fill={theme.colors.surface}
          r={8}
          stroke={theme.colors.textPrimary}
          strokeWidth={3}
        />
      </Svg>
      <Box alignItems="center" left={0} position="absolute" right={0} top={72}>
        <Text variant="caption">本次经期</Text>
        <Box flexDirection="row" alignItems="baseline" gap="xs">
          <Text variant="heroNumber">1</Text>
          <Text variant="label">天</Text>
        </Box>
        <Text variant="body">通常持续 5～6 天</Text>
      </Box>
    </Box>
  );
}
