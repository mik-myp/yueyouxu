import { theme } from '../theme';

describe('theme', () => {
  it('keeps actual and predicted period states visually distinct', () => {
    expect(theme.colors.periodActual).not.toBe(theme.colors.periodPredicted);
  });

  it('keeps Soft Companion tokens separate from the existing app theme', () => {
    expect(theme.colors.companionCanvas).not.toBe(theme.colors.background);
    expect(theme.colors.companionBerry).not.toBe(theme.colors.periodActual);
  });
});
