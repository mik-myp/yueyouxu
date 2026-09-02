import { StyleSheet, View } from 'react-native';
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

function dayAngle(day: number, cycleLength: number) {
  return (
    START_ANGLE +
    ((day - 1) / Math.max(1, cycleLength - 1)) * (END_ANGLE - START_ANGLE)
  );
}

export function CycleArc({
  cycleDay = 1,
  cycleLength = 28,
  periodActive = true,
  periodLength = 5,
  predictionLabel,
}: {
  cycleDay?: number;
  cycleLength?: number;
  periodActive?: boolean;
  periodLength?: number;
  predictionLabel?: string;
}) {
  const normalizedDay = Math.min(cycleLength, Math.max(1, cycleDay));
  const today = pointOnArc(dayAngle(normalizedDay, cycleLength));

  return (
    <Box height={254} justifyContent="center">
      <Svg height="206" width="100%" viewBox="0 0 320 190">
        <Path
          d={arcPath(START_ANGLE, END_ANGLE)}
          fill="none"
          stroke={theme.colors.companionCashmereStrong}
          strokeLinecap="round"
          strokeWidth={18}
        />
        <Path
          d={arcPath(START_ANGLE, END_ANGLE)}
          fill="none"
          stroke={theme.colors.companionSurface}
          strokeLinecap="round"
          strokeWidth={10}
        />
        <Path
          d={arcPath(
            dayAngle(1, cycleLength),
            dayAngle(Math.min(cycleLength, periodLength), cycleLength),
          )}
          fill="none"
          stroke={theme.colors.companionBerrySoft}
          strokeLinecap="round"
          strokeWidth={20}
        />
        <Path
          d={arcPath(
            dayAngle(1, cycleLength),
            dayAngle(Math.min(cycleLength, periodLength), cycleLength),
          )}
          fill="none"
          stroke={theme.colors.companionBerry}
          strokeLinecap="round"
          strokeWidth={13}
        />
        <Path
          d={arcPath(
            dayAngle(Math.max(1, cycleLength - 2), cycleLength),
            dayAngle(cycleLength, cycleLength),
          )}
          fill="none"
          stroke={theme.colors.companionBerrySoft}
          strokeDasharray="3 6"
          strokeLinecap="round"
          strokeWidth={12}
        />
        <Circle
          cx={today.x}
          cy={today.y}
          fill={theme.colors.companionSurface}
          r={9}
          stroke={theme.colors.companionInk}
          strokeWidth={3.5}
        />
      </Svg>
      <Box alignItems="center" left={0} position="absolute" right={0} top={66}>
        <Box style={styles.phasePill}>
          <View style={styles.phaseDot} />
          <Text style={styles.phaseText}>
            {periodActive ? '经期中' : '周期中'}
          </Text>
        </Box>
        <Box alignItems="baseline" flexDirection="row" gap="xs" marginTop="xs">
          <Text style={styles.dayPrefix}>第</Text>
          <Text variant="heroNumber">{normalizedDay}</Text>
          <Text variant="label">天</Text>
        </Box>
        <Text style={styles.duration}>
          {periodActive
            ? `参考经期 ${periodLength} 天`
            : (predictionLabel ?? '持续记录以优化预测')}
        </Text>
      </Box>
      <Box
        alignItems="center"
        bottom={0}
        flexDirection="row"
        gap="l"
        justifyContent="center"
        left={0}
        position="absolute"
        right={0}
      >
        <Legend color={theme.colors.companionBerry} label="本次经期" />
        <Legend color={theme.colors.companionBerrySoft} label="下次预测" />
      </Box>
    </Box>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Box alignItems="center" flexDirection="row" gap="s">
      <View style={[styles.legendLine, { backgroundColor: color }]} />
      <Text variant="caption">{label}</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  dayPrefix: {
    color: theme.colors.companionInk,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
  },
  duration: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  legendLine: {
    borderRadius: 3,
    height: 6,
    width: 22,
  },
  phaseDot: {
    backgroundColor: theme.colors.companionBerry,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  phasePill: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionBerrySoft,
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 28,
    paddingHorizontal: 11,
  },
  phaseText: {
    color: theme.colors.companionBerry,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
