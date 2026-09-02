# Soft Companion 视觉与技术路线

更新日期：2026-09-01

状态：视觉方向已确认；优先在现有 Expo + React Native 中验证，WebView 保留为备选技术路线

## 决策摘要

`Soft Companion` 是跨技术路线的项目视觉系统，不依赖 shadcn 或 WebView 才能实现。当前优先使用 Expo + React Native + Restyle 验证；如果未来进入 WebView 技术路线，也不直接采用 shadcn/ui 的默认桌面或 SaaS 外观，而是以其可访问交互原语和可复制源码为基础，建立项目自有的移动端设计系统和私有 Registry。

项目视觉方向命名为 `Soft Companion`：面向成年女性，强调成熟、柔和、可信、私密和易操作。卡通与黏土元素用于降低记录压力，但不把产品做成儿童应用，也不以粉色作为“女性化”的唯一表达。

## Expo + React Native 可行性结论

当前 v0.1 的全部功能均可采用 `Soft Companion`，没有发现必须为视觉效果改用 WebView 的功能。现有技术栈已经具备关键实现能力：Restyle 管理语义令牌，React Native 负责原生布局与按压状态，`react-native-calendars` 支持自定义日期单元，Gorhom Bottom Sheet 提供原生手势和键盘处理，SVG 与 Reanimated 可实现周期弧、领域图标和克制微动画，Expo Router 可替换为自定义底部导航。

| 功能区域               | 可行性 | 推荐表达                                                     | 主要约束                                                 |
| ---------------------- | ------ | ------------------------------------------------------------ | -------------------------------------------------------- |
| 记录页与月历           | 高     | Sorbet 状态色、Cashmere 信息层级，记录选项局部使用 Soft Pouf | 日期状态较多，必须同时使用形状、描边或标记，不能只靠颜色 |
| 记录详情底部面板       | 高     | 圆润但克制的原生面板，选项按下与选中时提供轻微内陷感         | 需要真机检查键盘、短屏滚动、关闭手势和 Android 返回键    |
| 底部导航               | 高     | 稳定高度、柔和选中底座和统一图标语言                         | 不能做成漂浮装饰卡片，必须处理安全区和文字放大           |
| 今天页与周期弧         | 高     | 保留周期弧作为产品标志，减少外围装饰                         | 数据状态优先，黏土效果不能削弱周期与预测信息             |
| 趋势页                 | 高     | Cashmere 为主，粉彩只用于图表语义和重点                      | 保持数据优先，不把图表做成玩具化组件                     |
| 设置与隐私             | 高     | 成熟、安静的列表和明确危险操作                               | 少用插画与阴影，隐私说明和清除数据必须保持严肃清晰       |
| 首次设置               | 高     | 简短步骤、温和文案和一处原创插画                             | 不做卡通角色驱动的冗长 onboarding                        |
| 空、错、加载与完成状态 | 高     | 作为 10% 插画和微动画的主要承载位置                          | 插画不能承载唯一信息，减少动态效果时需要静态替代         |

视觉层与离线存储、预测算法、无障碍语义相互独立。真正需要验证的是双平台渲染质量而不是功能可行性：iOS 与 Android 的阴影观感不同，中文系统字体需要稳定回退，连续圆角和轻阴影需要按真机结果收敛，底部面板还需覆盖键盘、安全区和短屏。

因此采用“先局部验证、后全局推广”的方式：新增 `批次 1.5：Soft Companion 视觉验证`，只改造记录页、一个记录详情底部面板和底部导航，继续使用固定模拟数据，不接触数据层。真机确认 `Sorbet + Cashmere + Soft Pouf` 后，再把同一套令牌和组件语言推广到今天页、趋势页、设置页等区域。详细范围和验收门槛见 [v0.1 开发计划](./development-plan.md)。

## 视觉构成

整体视觉按以下比例控制：

```text
70% 成熟清晰的移动端界面
20% 柔软黏土触感
10% 卡通插画与微动画
```

- 成熟清晰：稳定的信息层级、克制的留白、清楚的数据状态和高可读性。
- 黏土触感：只用于快速记录、选中、按压和主要操作等需要触觉暗示的控件。
- 卡通插画：只用于首次引导、空状态、保存成功和少量情绪反馈，不持续占据核心记录界面。

## Registry 参考与使用边界

| 来源                                                                        | 借鉴内容                                                              | 使用结论                                       |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| [shadcn/ui](https://ui.shadcn.com/docs/components)                          | Calendar、Drawer、Field、Toggle Group、Switch、Tabs、Chart 等交互原语 | 作为行为和可访问性基础，重写移动端视觉         |
| [Better Design · Sorbet](https://better-design.com/design-systems/sorbet)   | 柔和多彩日历、圆润控件、轻阴影和记录状态配色                          | 作为主要视觉起点，不安装完整 `all`             |
| [Better Design · Cashmere](https://registry.directory/marvkr/better-design) | 温暖底色、成熟的信息结构、克制阴影和圆润方形                          | 用于提高成年感和长期使用的耐看度               |
| [1st-Pouf](https://1st-pouf.worksonmy.dev/)                                 | 按压感、Segmented、Toggle Group、Slider、BottomNav 和移动安全区处理   | 只借鉴局部触感，不采用其极繁、大字和全局厚阴影 |
| [SmoothUI](https://smoothui.dev/)                                           | 受控的弹簧动画、数字变化和状态过渡                                    | 只选择少量微动画，并支持 reduced motion        |

以下风格不作为主界面基础：

- NeoBrutalism 的粗边框、硬阴影和高对比色过于强势，会削弱经期记录所需的安静感。
- 8bitcn 的像素卡通具有明显游戏语义，不适合作为私密数据工具的长期界面。
- Mischief UI、Animate UI 等趣味组件只能单项评估，不能决定整体视觉语言。
- 不混装多套主题；所有参考最终收敛为一套项目语义令牌。

## 项目组件规划

产品语义组件名称与职责跨技术路线保持稳定，实现代码按平台选择：

```text
PeriodCalendar
CycleStatus
CycleTimeline
FlowSelector
PainScale
SymptomGrid
MoodSelector
QuickRecordDock
DayRecordDrawer
CycleRangeChart
MobileBottomNav
```

| 能力           | Expo + React Native 实现                      | WebView 备选实现                       |
| -------------- | --------------------------------------------- | -------------------------------------- |
| 主题与语义令牌 | Restyle theme 与 React Native styles          | CSS variables 与 Tailwind theme        |
| 月历           | `react-native-calendars` 自定义 day component | shadcn Calendar / React DayPicker 源码 |
| 记录详情       | Gorhom Bottom Sheet                           | Vaul Drawer                            |
| 图标与领域图形 | 单一 React Native 图标库 + 项目 SVG           | 单一 React 图标库 + 项目 SVG           |
| 状态与微动画   | Pressable + Reanimated                        | CSS transitions + Motion               |
| 底部导航       | Expo Router custom tab bar                    | React Router + 项目 MobileBottomNav    |

React Native 组件由项目源码直接维护，不进入 shadcn Registry。如果未来选择 WebView，稳定的 Web 组件可发布到项目私有 Registry；Registry 是内部设计系统的分发方式，不是引入未经审查的外部整套皮肤。

## 关键页面表达

### 日历

- 月历保持平整和清楚，不为整个月历添加厚重黏土卡片。
- 实际经期使用连续实色带；预测经期使用低饱和填充或轮廓。
- 今天、选中日期和存在记录的日期同时通过形状与颜色区分。
- 日历日期单元需要自定义，不能直接使用通用 Date Picker 的默认样式。

### 快速记录

- 流量、痛感、症状和心情采用大触控区的图标化选择器。
- 选中和按压状态可以使用轻微内陷或黏土阴影，让用户明确感知已记录。
- 单选、多选和备注都先暂存，点击确认后统一提交，保持现有 v0.1 交互原则。

### 卡通与插画

- 使用原创、克制、成年化的插画语言，不复制美柚或 Registry 中的品牌角色。
- 不为每种症状绘制夸张拟人角色，以免弱化严肃疼痛或不适的表达。
- 插画不承载唯一信息；状态仍必须由文字、形状和可访问标签表达。

## 色彩方向

- 页面底色使用温暖的灰白色，避免纯白刺眼，也避免大面积粉色背景。
- 实际经期使用珊瑚红或莓红；预测使用同色系的低饱和浅色或描边。
- 薄荷绿、柔和薰衣草和浅蓝只用于症状、完成状态和次级分类。
- 正文使用暖黑或深灰，所有重要文字和控件状态需要通过 WCAG AA 对比度检查。
- 色彩不得成为区分事实记录、预测结果和操作状态的唯一手段。

## 移动端约束

- React Native 页面使用 Safe Area Insets；WebView 页面使用 `100dvh` 与 CSS `env(safe-area-inset-*)`。
- React Native 触控目标不小于 44pt/48dp；WebView 触控目标不小于 `44px`，主要记录选项优先达到 `48px`。
- WebView 中 iOS 文本输入字号不小于 `16px`，避免自动缩放；React Native 输入框需要验证系统字体缩放和键盘避让。
- 底部导航和底部面板必须处理软键盘、滚动、焦点恢复、关闭手势和 Android 返回键。
- 不依赖 hover 才能发现操作；动画必须提供 reduced-motion 降级。
- 页面不使用桌面侧栏、悬浮工具条、嵌套卡片或营销页式大标题。

## 技术路线边界

本文件确认视觉和组件策略，不修改当前 Expo + React Native + Restyle 架构。shadcn Registry 的 React DOM 代码不能直接用于 React Native，但它的色彩、层级、状态和触感可以通过 Restyle、React Native 样式、SVG 和 Reanimated 复现。如果后续因非视觉原因正式切换 WebView，建议技术组合为：

```text
Capacitor + React + Vite + TypeScript
shadcn/ui source components
Tailwind CSS v4 + semantic CSS variables
React DayPicker
Vaul Drawer
Motion
Lucide React
Recharts or Visx
```

不建议在 Expo 中仅嵌入一个全屏 WebView 作为长期架构。是否切换需要先通过一个移动端原型验证日历、底部记录 Drawer、键盘、返回手势、离线存储和 iOS/Android 真机表现。

## 引入外部 Registry 的规则

1. 安装前查看 Registry 项目的许可证、维护状态、源码和依赖。
2. 不执行包含数百个组件的整套 `all` 安装，只引入已确定用途的组件。
3. Calendar、Drawer 和表单组件必须重点检查依赖版本、焦点管理和移动端行为。
4. 外部源码进入项目后由项目负责维护，并统一为项目的图标、令牌、组件组合和无障碍规范。
5. 外部组件先进入实验分支，通过移动端截图、触控和键盘验收后再进入正式组件目录。

## 下一决策点

不再把 Sorbet、Soft Pouf 和 Cashmere 作为三套互斥皮肤，而是在同一个 `Soft Companion` 原型中分工组合：Sorbet 负责日历与状态色，Cashmere 负责成熟结构，Soft Pouf 负责局部触感。

先在现有 Expo + React Native 项目执行视觉验证批次，并完成 iOS、Android 真机验收。通过后推广到其余页面；未通过则调整后复验或放弃该组合。是否切换 WebView 应由后续非视觉需求、维护成本和运行时限制决定，不能仅因组件默认样式做出切换。
