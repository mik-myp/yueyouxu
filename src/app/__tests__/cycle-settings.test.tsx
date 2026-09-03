import { render, screen } from '@testing-library/react-native';

import CycleSettingsScreen from '@/app/cycle-settings';
import type { AppSettings } from '@/domain/models';
import { ThemeProvider } from '@shopify/restyle';
import { theme } from '@/theme';

const mockUseAppData = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: 'Redirect',
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/components/soft-icons', () => ({
  CaretLeft: 'CaretLeft',
  Minus: 'Minus',
  Plus: 'Plus',
}));

jest.mock('@/data/app-data-provider', () => ({
  useAppData: () => mockUseAppData(),
}));

async function renderScreen() {
  return render(
    <ThemeProvider theme={theme}>
      <CycleSettingsScreen />
    </ThemeProvider>,
  );
}

describe('CycleSettingsScreen', () => {
  it('restores persisted values when settings finish loading', async () => {
    const savePredictionSettings = jest.fn();
    mockUseAppData.mockReturnValue({
      error: null,
      loading: true,
      savePredictionSettings,
      settings: null,
    });
    const view = await renderScreen();

    expect(screen.getByText('正在读取周期设置…')).toBeTruthy();

    const settings: AppSettings = {
      automaticCalculation: false,
      onboardingCompleted: true,
      referenceCycleLength: 31,
      referencePeriodLength: 6,
      timeZone: 'Asia/Shanghai',
      updatedAt: '2026-09-02T00:00:00.000Z',
    };
    mockUseAppData.mockReturnValue({
      error: null,
      loading: false,
      savePredictionSettings,
      settings,
    });
    await view.rerender(
      <ThemeProvider theme={theme}>
        <CycleSettingsScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText('31 天')).toBeTruthy();
    expect(screen.getByText('6 天')).toBeTruthy();
    expect(screen.getByText('固定预测值')).toBeTruthy();
  });

  it('shows calculated bases when automatic analysis has enough samples', async () => {
    const savePredictionSettings = jest.fn();
    mockUseAppData.mockReturnValue({
      analysis: {
        cycle: {
          cycleSamples: [
            {
              fromStartDate: '2026-01-01',
              length: 30,
              toStartDate: '2026-01-31',
            },
          ],
          periodLengths: [5, 6],
          typicalCycleLength: 30,
          typicalPeriodLength: 6,
        },
      },
      error: null,
      loading: false,
      savePredictionSettings,
      settings: {
        automaticCalculation: true,
        onboardingCompleted: true,
        referenceCycleLength: 28,
        referencePeriodLength: 5,
        timeZone: 'Asia/Shanghai',
        updatedAt: '2026-09-02T00:00:00.000Z',
      },
    });

    await renderScreen();

    expect(screen.getByText('30 天')).toBeTruthy();
    expect(screen.getByText('6 天')).toBeTruthy();
    expect(screen.getByText('最近 1 个有效间隔的中位数')).toBeTruthy();
    expect(screen.getByText('最近 2 条完整经期记录的中位数')).toBeTruthy();
  });
});
