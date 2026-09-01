import { theme } from '../theme';

describe('theme', () => {
  it('keeps actual and predicted period states visually distinct', () => {
    expect(theme.colors.periodActual).not.toBe(theme.colors.periodPredicted);
  });

  it('promotes Soft Companion tokens to the app theme', () => {
    expect(theme.colors.companionCanvas).toBe(theme.colors.background);
    expect(theme.colors.companionBerry).toBe(theme.colors.periodActual);
  });
});
