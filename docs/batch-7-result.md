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
- 增加标签触发的 GitHub Actions：校验项目、生成 Android 工程、使用 Secrets 签名、构建 APK、生成 SHA-256 并创建 Release。
- 增加 Expo 配置插件，确保 Gradle Release 使用专用 Keystore，不再沿用模板中的 Debug 签名。
- Android 发布 Keystore 已初始化并写入 GitHub Actions Secrets；本地密钥使用 `600` 权限保存，密码由 macOS 钥匙串保管。
- 发布证书 SHA-256 指纹：`6C:E4:3B:69:B3:DD:15:9F:71:34:B2:F2:EC:91:83:AA:D5:A3:AA:E8:E9:EF:04:9D:68:7B:25:5A:16:99:72:7D`。
- 建立版本、签名、构建、摘要校验、Release 命名、首次安装和覆盖升级规范。
- Expo SDK 57 的四个补丁依赖升级到 Doctor 指定版本。

## 自动与界面验证

- TypeScript 类型检查通过。
- ESLint 通过。
- Prettier 检查通过。
- 14 个测试套件、53 项测试通过；其中更新服务新增 7 项、Release 签名插件新增 2 项测试。
- Expo Doctor 21/21 通过。
- Android Expo 导出通过。
- 390 × 844 与 375 × 667 Web 移动视口完成默认、无 Release、发现新版本和下载请求检查。
- 下载请求确认只指向 `github.com/mik-myp/yueyouxu/releases/download/.../*.apk`。
- 关于页 WCAG 2 A/AA 自动审计为 0 违规、0 待人工确认项。

## 发布前仍需完成

- 当前 GitHub 仓库是公开仓库，但尚未创建 Release。
- 推送 `v0.1.0` 标签触发 Actions，生成首个真实签名 APK 和 GitHub Release。
- 使用 Android 真机分别验证首次安装与保留 SQLite 数据的覆盖升级。
- 验收通过后创建正式 `v0.1.0` GitHub Release，并复测应用内“已是最新版本”。

具体操作参见 [Android GitHub Release 发布与更新](./android-github-release.md)。
