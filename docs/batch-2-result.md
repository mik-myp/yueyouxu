# 批次 2：数据基础与首次初始化

开始日期：2026-09-02

状态：进行中

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
- `npm test`：5 个测试套件、11 个测试通过。

## 待完成

- 初始化页面及最小字段交互。
- 启动时读取初始化状态并恢复正确路由。
- 预测设置接入 Repository，并验证 App 重启后的恢复。
- 原生 SQLite 初始化与清除的集成验证。
