import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { MonthCalendar } from '@/components/month-calendar';
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
  Drop: 'Drop',
  NotePencil: 'NotePencil',
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
});
