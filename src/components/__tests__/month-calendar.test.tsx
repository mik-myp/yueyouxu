import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { MonthCalendar } from '@/components/month-calendar';
import { prototypeToday } from '@/features/prototype/mock-data';
import { theme } from '@/theme';

jest.mock('lucide-react-native', () => ({
  ChevronLeft: 'ChevronLeft',
  ChevronRight: 'ChevronRight',
}));

describe('MonthCalendar', () => {
  it('reports the selected local date', async () => {
    const onSelectDate = jest.fn();
    await render(
      <ThemeProvider theme={theme}>
        <MonthCalendar
          onSelectDate={onSelectDate}
          selectedDate={prototypeToday}
        />
      </ThemeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: '9月10日' }));

    expect(onSelectDate).toHaveBeenCalledWith('2026-09-10');
  });
});
