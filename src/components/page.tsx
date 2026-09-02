import type { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/theme';

export function Page({ children }: PropsWithChildren) {
  return (
    <Box flex={1} backgroundColor="companionCanvas">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Box
          alignSelf="center"
          flex={1}
          maxWidth={520}
          role="main"
          width="100%"
        >
          {children}
        </Box>
      </SafeAreaView>
    </Box>
  );
}
