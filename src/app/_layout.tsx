import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@shopify/restyle';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { AppDataProvider } from '@/data/app-data-provider';
import { theme } from '@/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <AppDataProvider>
          <BottomSheetModalProvider>
            <Head>
              <title>月有序</title>
            </Head>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: theme.colors.background },
                headerShown: false,
              }}
            />
          </BottomSheetModalProvider>
        </AppDataProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
