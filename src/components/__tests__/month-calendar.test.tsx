import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { MonthCalendar } from '@/components/month-calendar';
import { parseLocalDate } from '@/domain/local-date';
import { theme } from '@/theme';

const prototypeToday = '2026-09-01';

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: 'AnimatedView' },
  FadeInLeft: { duration: () => undefined },
  FadeInRight: { duration: () => undefined },
  useReducedMotion: () => false,
}));

jest.mock('@/components/soft-icons', () => ({
  CaretLeft: 'CaretLeft',
  CaretRight: 'CaretRight',
  CheckCircle: 'CheckCircle',
  ClipboardText: 'ClipboardText',
  Drop: 'Drop',
  Flag: 'Flag',
  FlagCheckered: 'FlagCheckered',
  Sparkle: 'Sparkle',
}));

describe('MonthCalendar', () => {
  it('reports the selected local date', async () => {
    const onSelectDate = jest.fn();
    await render(
      <ThemeProvider theme={theme}>
        <MonthCalendar
          onSelectDate={onSelectDate}
          selectedDate={prototypeToday}
          today="2026-09-30"
        />
      </ThemeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: '9月10日' }));

    expect(onSelectDate).toHaveBeenCalledWith('2026-09-10');
  });

  it('labels the estimated period before an end date is selected', async () => {
    await render(
      <ThemeProvider theme={theme}>
        <MonthCalendar
          estimatedPeriodRanges={[
            {
              end: '2026-08-05',
              start: '2026-08-02',
            },
            {
              end: '2026-09-05',
              start: '2026-09-02',
            },
          ]}
          onSelectDate={jest.fn()}
          selectedDate={prototypeToday}
          today="2026-09-30"
        />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole('button', { name: '9月3日，预计经期' }),
    ).toBeTruthy();
  });

  it('labels period boundaries and a daily record independently', async () => {
    await render(
      <ThemeProvider theme={theme}>
        <MonthCalendar
          dailyRecords={[
            {
              flow: '中量',
              id: 'daily-2026-09-03',
              pain: null,
              recordDate: parseLocalDate('2026-09-03'),
              symptoms: [],
              timeZone: 'Asia/Shanghai',
            },
          ]}
          onSelectDate={jest.fn()}
          periods={[
            {
              endDate: parseLocalDate('2026-09-03'),
              id: 'period-2026-09-01',
              source: 'manual',
              startDate: parseLocalDate('2026-09-01'),
              timeZone: 'Asia/Shanghai',
            },
          ]}
          selectedDate="2026-09-10"
          today="2026-09-30"
        />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole('button', {
        name: '9月1日，实际经期，月经来了',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', {
        name: '9月3日，实际经期，月经走了，已记录',
      }),
    ).toBeTruthy();
  });
});
