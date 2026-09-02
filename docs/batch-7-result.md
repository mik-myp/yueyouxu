# 批次 7 Android GitHub Release 结果

完成日期：2026-09-02

状态：功能实现完成，等待签名 APK 与 Android 真机发布验收

分支：`batch/7-android-github-release`

## 已完成

- 关于页在 Android 和 Web 预览中提供“检查更新”，iOS 不显示 Android 更新入口。
- 更新仅由用户手动触发，不启动后台轮询。
- 使用公开的 `mik-myp/yueyouxu` Latest Release API 比较三段式语义版本。
- 只接受当前仓库 HTTPS Release 中的 `.apk` 资源，拒绝其他主机或仓库的下载地址。
- 发现新版本后显示版本号和 APK 大小；只有用户点击“下载更新”才打开系统浏览器。
- 覆盖无 Release、请求失败、15 秒超时、GitHub 频率限制、无可信 APK、已是最新版本和发现新版本状态。
- `app.json` 增加 Android `versionCode`，应用桌面名称统一为“月有序”。
- `eas.json` 增加 `github` 内部分发构建配置，产物格式为可直接安装的 APK。
- 建立版本、签名、构建、摘要校验、Release 命名、首次安装和覆盖升级规范。
- Expo SDK 57 的四个补丁依赖升级到 Doctor 指定版本。

## 自动与界面验证

- TypeScript 类型检查通过。
- ESLint 通过。
- Prettier 检查通过。
- 13 个测试套件、51 项测试通过；其中更新服务新增 7 项测试。
- Expo Doctor 21/21 通过。
- Android Expo 导出通过。
- 390 × 844 与 375 × 667 Web 移动视口完成默认、无 Release、发现新版本和下载请求检查。
- 下载请求确认只指向 `github.com/mik-myp/yueyouxu/releases/download/.../*.apk`。
- 关于页 WCAG 2 A/AA 自动审计为 0 违规、0 待人工确认项。

## 发布前仍需完成

- 当前 GitHub 仓库是公开仓库，但尚未创建 Release。
- 当前开发环境未登录 Expo/EAS，尚未初始化 Android Keystore，也未生成真实签名 APK。
- 用户登录 EAS 后执行首次构建，并把 Keystore 作为不可替代的发布凭据备份。
- 使用 Android 真机分别验证首次安装与保留 SQLite 数据的覆盖升级。
- 验收通过后创建正式 `v0.1.0` GitHub Release，并复测应用内“已是最新版本”。

具体操作参见 [Android GitHub Release 发布与更新](./android-github-release.md)。
