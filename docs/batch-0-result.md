# 批次 0：工程基线结果

完成日期：2026-09-01

状态：已完成

## 交付内容

- 使用 Expo SDK 57、React Native 0.86、React 19 和 TypeScript 6 初始化项目。
- 使用 `src/app` 作为 Expo Router 路由根目录。
- 接入 Restyle ThemeProvider、Gesture Handler 根容器和浅色状态栏。
- 建立浅色主题的初始颜色、间距、圆角和文字令牌。
- 配置 ESLint、Prettier、Jest、React Native Testing Library 和 TypeScript 检查。
- 安装并验证 v0.1 候选运行时依赖。
- 配置 SQLite Web 所需的 WASM 资源和 COEP/COOP 响应头。
- 建立根目录开发说明和质量检查命令。

## 已确认版本

| 领域       | 选择                        | 批次 0 版本         |
| ---------- | --------------------------- | ------------------- |
| 应用框架   | Expo                        | `57.0.18`           |
| 移动运行时 | React Native                | `0.86.3`            |
| UI         | React + Restyle             | `19.2.3` / `2.4.5`  |
| 路由       | Expo Router                 | `57.0.17`           |
| 数据库     | Expo SQLite                 | `57.0.2`            |
| SQL 层     | Drizzle ORM + Repository    | `0.45.2`            |
| 日历       | React Native Calendars      | `1.1314.0`          |
| 图形       | React Native SVG            | `15.15.4`           |
| 动画       | Reanimated + Worklets       | `4.5.1` / `0.10.1`  |
| 手势       | Gesture Handler             | `2.32.0`            |
| 底部面板   | Gorhom Bottom Sheet         | `5.2.14`            |
| 测试       | Jest Expo + Testing Library | `57.0.5` / `14.0.1` |

具体补丁版本由 `package-lock.json` 锁定，不能仅根据此表手动重建依赖树。

## 技术决策

### Expo Go

v0.1 当前所需原生模块均受 Expo Go 支持，因此开发阶段先使用 Expo Go。只有后续出现 Expo Go 不包含的原生模块或构建配置时，才切换 Development Build。

### SQLite 与 Drizzle

数据访问采用 Drizzle ORM，并在其上保留 Repository 边界。页面和领域层不得直接执行 SQL。Schema、迁移和 Repository 在批次 2 实现，本批次只完成依赖与打包验证。

### Web 定位

iOS 和 Android 是 v0.1 产品目标。Web 只作为开发辅助平台；Expo SQLite 的 Web 支持仍处于 alpha，不将 Web 行为作为移动端存储语义的依据。

## 验证结果

- `npm run typecheck`：通过。
- `npm run lint`：通过。
- `npm test`：1 个测试套件、1 个测试通过。
- `npm run format:check`：通过。
- `npx expo-doctor@latest`：21/21 检查通过。
- iOS、Android、Web 最小应用外壳打包：通过。
- Restyle、SQLite/Drizzle、日历、SVG、Reanimated、Gesture Handler 和 Bottom Sheet 依赖探针三平台打包：通过。

## 已知事项

- `npm audit` 报告 14 个中等级传递依赖问题，来源主要是 Expo CLI/config 工具链。npm 提供的自动修复会错误建议降级到旧 Expo 主版本，因此本批次不执行 `npm audit fix --force`。后续随 Expo SDK 补丁升级复核。
- `react-native-calendars` 已通过打包验证，但连续经期色带和自定义日期单元的视觉能力仍需在批次 1 用真实布局验证。
- 当前应用只显示最小品牌占位文字；导航和业务页面从批次 1 开始实现。

## 下一批入口条件

批次 1 开始前，应再次确认 UI 布局规范没有新增范围，并仅使用模拟数据构建可调整的 UI 原型。
