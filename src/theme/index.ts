import { createBox, createText } from '@shopify/restyle';

import { theme, type AppTheme } from './theme';

export const Box = createBox<AppTheme>();
export const Text = createText<AppTheme>();

export { theme };
