# 部署与上线指南

## 网页版

### 本地打开

双击 `web/index.html` 即可。若个别浏览器限制本地文件的网络请求，用本地服务器：

```bash
cd web
python -m http.server 8080
# 浏览器打开 http://localhost:8080/index.html
```

### GitHub Pages 免费上线（推荐）

网页版是纯静态单文件，最适合用 GitHub Pages 托管，无需服务器、无需备案：

1. 在 GitHub 新建仓库（如 `carbon-dot-precursor-checker`），把本项目推上去。
2. 仓库 → Settings → Pages → Source 选 `GitHub Actions`。
3. 本项目已附带工作流 `.github/workflows/pages.yml`，推送到 `main` 分支后会自动部署。
4. 部署完成后得到 `https://<用户名>.github.io/<仓库名>/` 链接，手机浏览器打开即可，"添加到主屏幕"可当 App 用。

> 若不想用 Actions，也可在 Pages 的 Source 里选 `Deploy from a branch`，分支选 `main`、目录选 `/web`，效果相同。

注意：GitHub Pages 站点是公开的，任何人都能访问。

## 微信小程序版

### 开发阶段

1. 微信开发者工具 → 导入项目 → 目录选 `miniprogram/`，AppID 选测试号。
2. 详情 → 本地设置 → 勾选 **不校验合法域名、web-view、TLS 版本及 HTTPS 证书**。
3. 编译后在模拟器中使用；点"预览"扫码可真机调试。

### 正式上线

小程序要正式发布，需解决三件事：

#### 1. 自己的 AppID

在 [微信公众平台](https://mp.weixin.qq.com/) 注册小程序账号（个人主体即可，免费），在"开发管理 → 开发设置"获取 AppID，填入开发者工具和 `miniprogram/project.config.json` 的 `appid` 字段。

#### 2. 云函数中转（解决合法域名问题）

微信要求 `request` 合法域名必须 ICP 备案，而 OpenAlex 是境外域名，无法备案。因此正式版必须让云函数代为请求：

- 在开发者工具中开通"云开发"，获得云环境 ID（形如 `xxx-1a2b3c4d`）。
- 把 `cloudfunctions/openalexProxy/` 上传到云开发，右键 → "上传并部署：云端安装依赖"。
- 打开 `miniprogram/app.js`，把 `globalData.cloudEnv` 填成你的云环境 ID：

```js
globalData: {
  source: 'OpenAlex',
  version: '1.0.0',
  cloudEnv: '你的云环境ID'   // 如 xxx-1a2b3c4d
}
```

- 代码已内置自动切换：`cloudEnv` 非空时 `request()` 自动走云函数，留空时走直连（方便测试号开发调试）。因此**无需手动改 request 函数**，也**无需**配置 OpenAlex 为合法域名或备案域名。

> 云函数代码已内置安全限制：只允许请求 `api.openalex.org` 域名，防止被当作开放代理滥用。免费额度对本项目这种低频查询通常足够。

#### 3. 小程序备案

2023 年起，所有小程序上线前必须完成小程序备案：公众平台后台 → "小程序备案"入口 → 填写主体信息 → 管局审核（约 1–20 个工作日）。备案通过后才能提交代码审核发布。

### 提交审核

以上完成后：开发者工具点"上传" → 公众平台"版本管理" → 提交审核 → 审核通过后发布。

## 数据备份

本地原料库只存在当前设备（网页 `localStorage` / 小程序 `wx.setStorageSync`），换设备或清缓存会丢失。请用"导出文本"功能备份后再迁移。
