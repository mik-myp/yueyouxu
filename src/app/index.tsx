import { SafeAreaView } from 'react-native-safe-area-context';

import { Box, Text } from '@/theme';

export default function IndexScreen() {
  return (
    <Box flex={1} backgroundColor="background">
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} alignItems="center" justifyContent="center">
          <Text variant="title">Yueyouxu</Text>
        </Box>
      </SafeAreaView>
    </Box>
  );
}
