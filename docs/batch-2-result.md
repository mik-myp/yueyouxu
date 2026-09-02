# 批次 2：数据基础与首次初始化

开始日期：2026-09-02

状态：开发完成，待用户验收

分支：`batch/2-data-foundation-onboarding`

## 阶段 2A：数据模型与 Repository

已完成：

- 建立与页面无关的本地日期、预测设置、App 设置、经期和初始化领域类型。
- 建立 `app_settings`、`periods`、`daily_records`、`daily_symptoms`、`analysis_snapshots` 和 `prediction_windows` Drizzle Schema。
- 建立显式 SQLite v1 迁移及 `_app_migrations` 版本表；迁移可重复执行。
- 数据库启用外键和 WAL；日期范围、周期范围、经期范围、预测窗口顺序等约束下沉至数据库。
- 定义 `SettingsRepository` 与 `OnboardingRepository`，页面和领域层不直接执行 SQL。
- 初始化用例在同一事务内写入单例设置和最近一次经期事实。

验证：

- `npm run typecheck`：通过。
- `npm run lint`：通过。
- 数据基础检查点已提交并推送：`c21d058 feat: establish local data foundation`。

## 阶段 2B：首次初始化与本地恢复

已完成：

- 新增两步首次初始化页，使用 Soft Companion 视觉：
  1. 选择最近一次经期开始日期，这是唯一必填字段。
  2. 设置自动计算、初始周期长度和初始经期长度，默认分别为开启、28 天和 5 天。
- 初始化在同一事务内保存设置和最近一次经期事实，完成后进入今天页。
- `AppDataProvider` 在启动时读取本地设置；未完成初始化时从 Tabs 自动进入初始化页。
- 预测设置页面接入 Repository，自动计算开关和两个参考值可保存并在重启后恢复。
- 增加 Web 预览 Repository，使用 `localStorage` 保持与原生 Repository 相同的页面接口。
- 隐私与数据页接入清除全部数据；SQLite 在同一事务中清除设置、事实记录和派生结果，Web 清除本地预览状态，完成后重新进入初始化。
- 周期设置页等待异步数据恢复后再挂载表单，避免直接刷新子页面时短暂回退到 28/5 默认值。
- 新增 `SoftToggle`，统一原生和 Web 的开关交互及无障碍名称。

浏览器验收（390×844）：

- 清空存储后访问首页会进入 `/onboarding`。
- 选择 `2026-09-01` 并完成初始化后进入 `/`；刷新后保持已初始化状态。
- 周期参考值从 28 改为 29，保存并刷新 `/cycle-settings` 后仍显示 29。
- 清除全部数据后存储为空，并返回 `/onboarding`。
- 初始化第二步 WCAG A/AA 自动审计为 0 违规。
- 初始化第一步的禁用日期颜色对比问题已修复；仍有 3 条 Web ARIA 违规来自 `react-native-calendars` 月份头内部实现，原生端不受影响，本批次不改写第三方日历。

构建与自动化验证：

- `npm run typecheck`：通过。
- `npm run lint`：通过。
- `npm test -- --runInBand`：8 个测试套件、14 个测试通过。
- `npx expo export --platform all`：Android、iOS、Web 全部导出成功。
- `npx expo-doctor`：20/21 检查通过；仅提示 `expo`、`expo-constants`、`expo-linking`、`expo-router` 各落后一个 SDK 57 补丁版本，本批次不升级依赖。

截图：

- `docs/screenshots/batch-2/onboarding-date-390x844.png`
- `docs/screenshots/batch-2/onboarding-reference-390x844.png`

## 验收边界

- 当前分支：`batch/2-data-foundation-onboarding`。
- 批次 2 分支提交并推送后等待用户验收，不提前合并 `master`。
- 记录闭环、预测算法和趋势统计仍属于后续批次，不在本批次实现。
