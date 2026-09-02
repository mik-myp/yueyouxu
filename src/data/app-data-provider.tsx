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
import {
  createRecordPeriod,
  type RecordPeriodCommand,
} from '@/application/record-period';
import {
  createSaveDailyRecord,
  type SaveDailyRecordCommand,
} from '@/application/save-daily-record';
import { calculatePrediction } from '@/domain/prediction';
import { analyzeTrackingData } from '@/domain/cycle-analysis';
import type { AppRepositories } from '@/data/repositories';
import type {
  AppSettings,
  DailyRecord,
  Period,
  PredictionSettings,
} from '@/domain/models';

import { createAppRepositories } from './repository-factory';

type AppDataContextValue = {
  clearAllData(): Promise<void>;
  completeOnboarding(command: CompleteOnboardingCommand): Promise<void>;
  error: string | null;
  loading: boolean;
  refresh(): Promise<void>;
  savePredictionSettings(settings: PredictionSettings): Promise<void>;
  recordPeriod(command: RecordPeriodCommand): Promise<Period>;
  removePeriod(periodId: string): Promise<void>;
  saveDailyRecord(command: SaveDailyRecordCommand): Promise<DailyRecord>;
  dailyRecords: DailyRecord[];
  analysis: ReturnType<typeof analyzeTrackingData>;
  prediction: ReturnType<typeof calculatePrediction>;
  undoPeriod(periodId: string, wasStart: boolean): Promise<void>;
  periods: Period[];
  settings: AppSettings | null;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const [repositories, setRepositories] = useState<AppRepositories | null>(
    null,
  );
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const analysis = analyzeTrackingData(periods, dailyRecords);
  const prediction = settings ? calculatePrediction(periods, settings) : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(
    async (nextRepositories: AppRepositories) => {
      setSettings(await nextRepositories.settings.get());
      setPeriods(await nextRepositories.periods.list());
      setDailyRecords(await nextRepositories.dailyRecords.list());
    },
    [],
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const nextRepositories = await createAppRepositories();
        const nextSettings = await nextRepositories.settings.get();
        const nextPeriods = await nextRepositories.periods.list();
        if (!active) return;
        setRepositories(nextRepositories);
        setSettings(nextSettings);
        setPeriods(nextPeriods);
        setDailyRecords(await nextRepositories.dailyRecords.list());
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
    setPeriods([]);
    setDailyRecords([]);
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

  const recordPeriod = useCallback(
    async (command: RecordPeriodCommand) => {
      const currentRepositories = requireRepositories();
      const period = await createRecordPeriod(currentRepositories.periods)(
        command,
      );
      setPeriods(await currentRepositories.periods.list());
      return period;
    },
    [requireRepositories],
  );

  const undoPeriod = useCallback(
    async (periodId: string, wasStart: boolean) => {
      const currentRepositories = requireRepositories();
      if (wasStart) {
        await currentRepositories.periods.remove(periodId);
      } else {
        const period = await currentRepositories.periods.get(periodId);
        if (!period) return;
        await currentRepositories.periods.save(
          periodId,
          {
            endDate: null,
            startDate: period.startDate,
            timeZone: period.timeZone,
          },
          new Date().toISOString(),
        );
      }
      setPeriods(await currentRepositories.periods.list());
    },
    [requireRepositories],
  );

  const removePeriod = useCallback(
    async (periodId: string) => {
      const currentRepositories = requireRepositories();
      await currentRepositories.periods.remove(periodId);
      setPeriods(await currentRepositories.periods.list());
    },
    [requireRepositories],
  );

  const saveDailyRecord = useCallback(
    async (command: SaveDailyRecordCommand) => {
      const currentRepositories = requireRepositories();
      const record = await createSaveDailyRecord(
        currentRepositories.dailyRecords,
      )(command);
      setDailyRecords(await currentRepositories.dailyRecords.list());
      return record;
    },
    [requireRepositories],
  );

  return (
    <AppDataContext.Provider
      value={{
        analysis,
        clearAllData,
        completeOnboarding,
        error,
        loading,
        refresh,
        savePredictionSettings,
        recordPeriod,
        removePeriod,
        undoPeriod,
        saveDailyRecord,
        dailyRecords,
        prediction,
        periods,
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
