import { theme } from '../theme';

describe('theme', () => {
  it('keeps actual and predicted period states visually distinct', () => {
    expect(theme.colors.periodActual).not.toBe(theme.colors.periodPredicted);
  });
});
