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
});
