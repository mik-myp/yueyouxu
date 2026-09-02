import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  createCompleteOnboarding,
  type CompleteOnboardingCommand,
} from '@/application/complete-onboarding';
import { createSavePredictionSettings } from '@/application/save-prediction-settings';
import type { AppRepositories } from '@/data/repositories';
import type { AppSettings, PredictionSettings } from '@/domain/models';

import { createAppRepositories } from './repository-factory';

type AppDataContextValue = {
  clearAllData(): Promise<void>;
  completeOnboarding(command: CompleteOnboardingCommand): Promise<void>;
  error: string | null;
  loading: boolean;
  refresh(): Promise<void>;
  savePredictionSettings(settings: PredictionSettings): Promise<void>;
  settings: AppSettings | null;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const [repositories, setRepositories] = useState<AppRepositories | null>(
    null,
  );
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(
    async (nextRepositories: AppRepositories) => {
      setSettings(await nextRepositories.settings.get());
    },
    [],
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const nextRepositories = await createAppRepositories();
        const nextSettings = await nextRepositories.settings.get();
        if (!active) return;
        setRepositories(nextRepositories);
        setSettings(nextSettings);
      } catch (bootstrapError) {
        if (!active) return;
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : '本地数据初始化失败',
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const requireRepositories = useCallback(() => {
    if (!repositories) throw new Error('本地数据尚未准备完成');
    return repositories;
  }, [repositories]);

  const refresh = useCallback(async () => {
    const currentRepositories = requireRepositories();
    await loadSettings(currentRepositories);
  }, [loadSettings, requireRepositories]);

  const completeOnboarding = useCallback(
    async (command: CompleteOnboardingCommand) => {
      const currentRepositories = requireRepositories();
      await createCompleteOnboarding(currentRepositories.onboarding)(command);
      await loadSettings(currentRepositories);
    },
    [loadSettings, requireRepositories],
  );

  const clearAllData = useCallback(async () => {
    const currentRepositories = requireRepositories();
    await currentRepositories.dataManagement.clearAll();
    setSettings(null);
  }, [requireRepositories]);

  const savePredictionSettings = useCallback(
    async (nextSettings: PredictionSettings) => {
      const currentRepositories = requireRepositories();
      await createSavePredictionSettings(currentRepositories.settings)(
        nextSettings,
      );
      await loadSettings(currentRepositories);
    },
    [loadSettings, requireRepositories],
  );

  return (
    <AppDataContext.Provider
      value={{
        clearAllData,
        completeOnboarding,
        error,
        loading,
        refresh,
        savePredictionSettings,
        settings,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData 必须在 AppDataProvider 中使用');
  return context;
}
