# Android GitHub Release 发布与更新

更新日期：2026-09-02

状态：v0.1 发布方案已确认

## 分发边界

- Android 安装包只通过当前仓库的 GitHub Releases 分发，不提交 Google Play。
- 应用不会后台检查、自动下载或静默安装更新。
- 只有用户在“关于月有序”点击“检查更新”时，应用才请求公开的 GitHub Latest Release API。
- 发现更高版本后，由用户点击“下载更新”打开 GitHub HTTPS 下载地址，再由 Android 系统确认安装。
- iOS 不提供 GitHub IPA 下载；现阶段保留源码构建与开发测试能力。

## 版本与资源约定

每次发布必须同步更新 [app.json](../app.json) 和 [package.json](../package.json) 中的版本：

- `expo.version`：用户可见的语义版本，例如 `0.1.1`。
- `expo.android.versionCode`：只增不减的整数，每次发布至少增加 1。
- `package.json` 的 `version`：与 `expo.version` 保持一致。

Git 标签必须采用 `v<expo.version>`，例如 `v0.1.1`。Release 必须是已发布的正式版本，不能是 Draft 或 Pre-release，因为应用使用 GitHub 的 `releases/latest` 接口。

Release 中必须包含一个且仅一个 `.apk` 文件，命名为：

```text
yueyouxu-v0.1.1.apk
```

不要上传 Debug APK、AAB 或多个架构 APK。更新服务只接受当前仓库 `mik-myp/yueyouxu` 的 GitHub HTTPS Release 下载地址。

## 构建与签名方式

`.github/workflows/android-release.yml` 在推送 `v*.*.*` 标签时执行完整验证，通过 Expo Prebuild 生成 Android 工程，再由 Gradle 构建签名 APK。构建成功后，Actions 自动上传 APK 与 SHA-256 文件并创建 GitHub Release。工作流也支持手动预检；预检只生成 Actions Artifact，不创建公开 Release。

发布签名只从以下 GitHub Actions Secrets 读取：

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Keystore 和密码不得写入 Git、Actions 日志或 Release。必须把本地 Keystore 与系统钥匙串中的密码作为不可替代的发布凭据备份；后续版本必须使用同一个 Keystore，否则 Android 会拒绝覆盖安装，用户只能卸载旧版并丢失本地数据。

## 每次发布流程

1. 更新 `expo.version`、`expo.android.versionCode` 和 `package.json` 的 `version`。
2. 更新发布说明并提交代码。
3. 运行完整校验：

```bash
npm ci
npm run format:check
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo-doctor@latest
```

4. 在 `master` 上手动运行一次预检，确认签名 APK Artifact 构建成功但不发布：

```bash
gh workflow run android-release.yml --ref master -f release_tag=v0.1.1
gh run watch --exit-status
```

5. 创建并推送标签，触发正式 Android Release Actions：

```bash
git tag -a v0.1.1 -m "月有序 v0.1.1"
git push origin v0.1.1
```

6. 在 GitHub Actions 中确认验证、Prebuild、Release 签名和 APK 构建全部通过。
7. 从创建的 Release 下载 APK，独立验证签名与摘要：

```bash
apksigner verify --verbose --print-certs yueyouxu-v0.1.1.apk
shasum -a 256 yueyouxu-v0.1.1.apk
```

8. 在一台没有安装应用的 Android 设备上验证首次安装。
9. 在一台保留旧版本和本地记录的设备上验证覆盖升级，确认初始化状态、经期和每日记录仍然存在。
10. 在应用内点击“检查更新”，确认最新版本判断、下载链接和已是最新版本状态。

## 用户安装与升级

首次安装时，用户从 GitHub Release 下载 APK，并允许当前浏览器或文件管理器“安装未知应用”。Android 可能通过 Play Protect 扫描安装包。

升级时不能先卸载旧版本。使用同一包名和签名、且 `versionCode` 更高的 APK 覆盖安装，Android 会保留应用的 SQLite 数据。卸载应用、清除应用数据或更换签名都会破坏这一升级路径。

## 更新检查的数据边界

更新检查只读取以下公开信息：Release 标签、发布日期和 APK 文件名、大小、下载地址。请求不包含经期、每日记录、设置或设备内数据库内容，应用中也不保存 GitHub Token。

GitHub 未发布 Release、Release 没有 APK、网络不可用或匿名 API 触发频率限制时，界面只展示错误状态，不改变本地数据。

## Android 站外分发验证

Android 开发者验证从 2026 年 9 月 30 日起先在部分地区执行，并计划于 2027 年以后扩展到所有经过认证的 Android 设备。面向不限数量用户发布 GitHub APK 时，应注册 Android Developer Console 的 Full Distribution 账号，登记：

- 包名 `com.mikmyp.yueyouxu`
- 发布 APK 的 SHA-256 签名证书指纹
- 开发者身份信息

Full Distribution 当前为一次性 25 美元。免费的 Limited Distribution 只适合最多 20 台明确授权的设备，不能作为公开 Release 的长期方案。
