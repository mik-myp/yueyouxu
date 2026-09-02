# 架构草案

更新日期：2026-09-01

## 已确认决策

- 客户端采用 Expo + React Native + TypeScript。
- UI 设计系统采用 `@shopify/restyle`，不直接套用完整视觉组件库。
- 数据存储本地优先，核心记录和预测离线可用。
- 本地确定性算法是预测和趋势的事实来源。

## v0.1 实施边界

v0.1 只交付本地离线基础闭环：首次设置、经期开始和结束、流量与痛经等基础每日记录、日历、本地确定性预测、基础历史趋势、本地存储以及清除本地数据。

以下能力不进入 v0.1：备孕模式、易孕期或排卵预测、暗色模式、AI 分析与提供商配置、账户和同步、通知提醒、数据导入/导出、桌面小组件及健康平台接入。相关架构可以预留清晰边界，但不提前实现界面、数据表或适配器。

## 技术栈

批次 0 已基于 Expo SDK 57 完成核心依赖的安装、类型检查和三平台打包验证。具体版本由 `package-lock.json` 锁定，验证详情参见 [批次 0 工程基线结果](./batch-0-result.md)。

| 领域               | 候选实现                                  |
| ------------------ | ----------------------------------------- |
| 路由               | Expo Router                               |
| 设计令牌和组件变体 | `@shopify/restyle`                        |
| 本地数据库         | `expo-sqlite`                             |
| SQL 与迁移         | Drizzle ORM + Repository                  |
| 月历               | `react-native-calendars` + 自定义日期单元 |
| 周期弧与简单图表   | `react-native-svg`                        |
| 动画               | `react-native-reanimated`                 |
| 手势               | `react-native-gesture-handler`            |
| 记录面板           | `@gorhom/bottom-sheet`                    |
| 长列表             | `@shopify/flash-list`                     |
| 通知               | `expo-notifications`                      |
| 生物识别锁         | `expo-local-authentication`               |

表中的通知、生物识别和长列表方案仍属于后续版本候选项，未在 v0.1 批次 0 安装。

## 模块边界

```text
UI / Screens
    |
Application use cases
    |-- Record observation
    |-- Close or correct a period
    |-- Recalculate local analysis
    |
Domain
    |-- Cycle and observation rules
    |-- Deterministic prediction engine
    |-- Analysis summaries
    |
Repositories
    |-- SQLite records
    |-- Export/import (post-v0.1)
    |
External adapters
    |-- Notifications (post-v0.1)
    |-- Optional future sync
```

Domain 层不得依赖页面、Restyle、网络服务或具体数据库实现。这样预测算法可以使用固定样本独立测试，也可以在未来替换存储层。

## 本地数据模型

建议使用明确的领域表，而不是把全部内容塞进一个任意 JSON 字段。

### 核心事实

- `periods`：经期开始日、结束日、确认状态和修订时间。
- `daily_records`：本地日期、流量、痛感和创建/更新时间。
- `daily_symptoms`：每日记录与症状代码之间的关联。
- `app_settings`：单例设置，保存初始化完成状态、是否自动计算、初始周期/经期参考值、记录时区和更新时间。

### 派生结果

- `analysis_snapshots`：算法版本、生成时间、输入摘要哈希和计算指标。
- `prediction_windows`：最早日期、中心日期、最晚日期和置信等级。

实际记录是事实，预测结果是可删除、可重算的派生数据。修改历史记录后，应使相关分析快照失效并重新计算。

### 日期原则

- 经期与每日记录以用户的本地日历日期为主，不用 UTC 时间戳代替“哪一天”。
- 同时保存 `createdAt`、`updatedAt` 和记录时区，便于处理旅行和同步。
- 周期边界以用户确认的开始日为准，算法不能悄悄改写事实记录。
- 本地日期统一使用经过校验的 `YYYY-MM-DD` 字符串；创建和修改时间统一使用 ISO 8601 时间戳。
- 首次初始化在同一事务中写入 `app_settings` 与最近一次经期开始事实，任一写入失败时整体回滚。

## 本地分析流水线

```text
记录变化
  -> 数据校验
  -> 重建完整周期
  -> 计算周期/经期长度
  -> 异常值处理
  -> 生成预测范围
  -> 保存带版本的分析快照
  -> 更新 UI
```

第一版采用可解释的稳健统计方法，完整计算口径参见 [v0.1 周期分析口径](./analysis-method.md)：

- 最近最多 12 个 10～90 天的有效周期间隔作为主要样本。
- 使用中位数，避免一次异常周期主导结果。
- 使用 MAD 描述个人波动，但不删除或改写原始记录。
- 输出日期范围和置信等级，不承诺单日精确预测。
- 样本不足、周期波动较大或记录中断时，明确降低置信等级。
- 所有算法用固定数据集覆盖规则、短周期、长周期、跨月、修改和缺失记录。

## 本地优先与隐私

- v0.1 在无账户、无网络时可完成记录、日历、预测和趋势；后续加入的提醒和导出也不得破坏离线可用性。
- SQLite 位于应用沙箱内，但不能把“沙箱”表述为数据库已做应用级加密。
- 是否引入字段级加密或 SQLCipher 需要单独做威胁模型和 Expo Development Build 验证。
- v0.1 应支持完整删除；本地导出、通知隐私文案和应用生物识别锁在后续版本评估。
- 未来同步应是独立适配器，不能让 UI 和领域层依赖云端 ID。

## 建议实施顺序

1. 本地数据库、领域模型、记录流程和迁移测试。
2. 日历、首页周期弧和快速记录。
3. 确定性预测、趋势与固定样本测试。
4. 隐私设置和完整删除，完成 v0.1。
5. 后续版本再评估通知、导入/导出、生物识别锁和数据预览。
6. 更后续评估可选同步、桌面小组件和健康平台集成。

## 待决问题

- MVP 是否要求 Expo Go，还是从一开始使用 Development Build。
- 数据库是否要求应用级加密。
- v0.1 趋势指标的定义和计算口径。
- 后续提醒类型和数据导入/导出格式。
