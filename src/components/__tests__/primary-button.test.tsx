import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrimaryButton } from '@/components/primary-button';
import { theme } from '@/theme';

describe('PrimaryButton', () => {
  it('runs its command when pressed', async () => {
    const onPress = jest.fn();
    await render(
      <ThemeProvider theme={theme}>
        <PrimaryButton label="记录今天" onPress={onPress} />
      </ThemeProvider>,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not run its command while disabled', async () => {
    const onPress = jest.fn();
    await render(
      <ThemeProvider theme={theme}>
        <PrimaryButton disabled label="正在检查…" onPress={onPress} />
      </ThemeProvider>,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.getByRole('button').props.accessibilityState).toEqual({
      disabled: true,
    });
    expect(onPress).not.toHaveBeenCalled();
  });
});
