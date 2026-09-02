# Yueyouxu 文档

本目录记录项目目标、架构决策、批次结果和持续讨论。v0.1 功能已在 `batch/v0.1-complete` 完成实现，等待用户统一测试后合并到 `master`。

## 文档索引

- [产品简报](./product-brief.md)：产品定位、范围、核心流程和 UI 原则。
- [UI 布局规范](./ui-layout.md)：已确认的导航、页面结构、记录交互和视觉约束。
- [Soft Companion 视觉与技术路线](./webview-ui-direction.md)：Expo + React Native 可行性、视觉策略、Registry 参考、移动端约束和 WebView 备选边界。
- [v0.1 开发计划](./development-plan.md)：分批范围、验收门槛、决策点和 Git 工作流。
- [批次 0 工程基线结果](./batch-0-result.md)：已确认版本、技术决策、验证结果和已知事项。
- [批次 1 UI 原型结果](./batch-1-result.md)：页面、交互原型、视觉验收和后续边界。
- [批次 1.5 Soft Companion 视觉验证结果](./batch-1.5-result.md)：限定范围的视觉实现、截图矩阵、自动检查和真机验收入口。
- [批次 1.6 Soft Companion 全局视觉推广结果](./batch-1.6-result.md)：全部现有页面、共享组件和记录面板的视觉推广、交互验证与截图矩阵。
- [批次 2 数据基础与首次初始化](./batch-2-result.md)：SQLite 数据模型、Repository、初始化流程和本地恢复。
- [批次 3 完整记录流程](./batch-3-result.md)：经期事实、开始/结束操作和日期冲突规则。
- [v0.1 完整功能交付结果](./v0.1-result.md)：每日记录、经期修正、确定性预测、趋势、隐私闭环和最终验证范围。
- [架构草案](./architecture.md)：Expo、React Native、Restyle、本地数据与确定性分析算法。
- [v0.1 周期分析口径](./analysis-method.md)：样本筛选、中位数、MAD、预测置信度与每日观察的可追溯定义。
- [讨论记录](./discussion-log.md)：按日期追加已确认事项、提案和待决问题。

## 记录约定

- 已经达成一致的内容标记为“已确认”。
- 尚未验证或仍可调整的内容标记为“提案”。
- 重要技术取舍应同时记录理由、替代方案和后续验证结果。
- 文档描述产品意图；代码和测试才是最终实现事实。
