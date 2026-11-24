# 碳点原料文献查询工具

输入一种原料，快速判断它是否已被用于碳点（Carbon Dots）合成，并给出可核对的真实文献 DOI 链接。

面向碳点 / 荧光探针方向的研究者：构思新前驱体时，先查一眼"这个原料别人用过没"，避免在已被充分报道的体系上重复劳动，或反过来发现没人用过的新原料。

---

## 功能

- **原料查询**：中文常用名、英文名、缩写均可（如 `柠檬酸`、`EDA`、`mPD`）。
- **三档判断**：
  - 已见报道 —— 有明确的"以该原料合成碳点"文献证据；
  - 相关线索·待核对 —— 有相关文献但证据不够直接；
  - 未确认作为原料 —— 在线检索未找到明确用于合成的证据。
- **真实文献链接**：每条结果给出 DOI，点开即可核对原文，支持一键复制。
- **排除假阳性**：区分"用碳点检测某物质"和"用某物质合成碳点"，前者不算原料证据。
- **本地原料库**：可导入自己整理的原料组合，查询时自动显示命中了哪些组合，仅存本机不上传。
- **离线降级**：网络失败时仍显示本地已核对条目。

---

## 目录结构

```
carbon-dot-precursor-checker/
├── web/
│   └── index.html              网页版，单文件，双击即可打开
├── miniprogram/                微信小程序版（原生小程序工程）
│   ├── app.js / app.json / app.wxss
│   ├── pages/index/            查询首页
│   ├── pages/library/          本地原料库
│   └── utils/
│       ├── cdcheck.js          别名表 + 判断打分逻辑
│       └── mylib.js            本地原料库读写
├── cloudfunctions/
│   └── openalexProxy/          云函数中转（小程序上线用，可选）
│       ├── index.js
│       └── package.json
├── docs/
│   ├── DEPLOY.md               部署与上线指南
│   └── DATA_SOURCE.md          数据来源与判断逻辑说明
└── README.md
```

---

## 快速开始

### 网页版

直接双击 `web/index.html` 用浏览器打开即可。首次查询需要联网。

如果想用本地服务器（更稳，避免个别浏览器的本地文件限制）：

```bash
cd web
python -m http.server 8080
```

然后访问 <http://localhost:8080/index.html>。

### 微信小程序版

1. 打开微信开发者工具 → 导入项目 → 目录选 `miniprogram/`，AppID 可先用测试号。
2. 「详情 → 本地设置」勾选 **不校验合法域名**（仅开发阶段）。
3. 点「编译」即可在模拟器中使用。

正式上线需要自己的 AppID、云函数中转（见下）以及小程序备案，详见 [docs/DEPLOY.md](docs/DEPLOY.md)。

---

## 数据来源与判断逻辑

- 文献数据来自 [OpenAlex](https://openalex.org/) 开放学术 API，返回真实 DOI，非人工编造。
- 检索采用"标题双关键词 AND + 摘要补充"策略，按合成线索（`from` / `derived from` / `based on` / `carbonization of`）与检测线索（`detection of` / `probe for`）加权打分，后者不计入原料证据。
- 内置常用中英别名表与少量预先核对的高置信条目；查询结果缓存 7 天。
- 本工具是**文献线索工具，不是系统综述**。"未检索到"不等于无人用过；建议更换别名再查，并以原文核实为准。

详见 [docs/DATA_SOURCE.md](docs/DATA_SOURCE.md)。

---

## 为什么小程序上线需要云函数

微信要求 `request` 合法域名必须完成 ICP 备案，而 OpenAlex 是境外域名（`api.openalex.org`），无法备案。开发阶段勾选"不校验合法域名"只对开发者工具生效，正式版会请求失败。

解决办法：让小程序调用微信云函数，由云函数向 OpenAlex 发起请求——云函数不受域名白名单限制。代码见 `cloudfunctions/openalexProxy/`，接入方式见 [docs/DEPLOY.md](docs/DEPLOY.md)。

---

## 许可证

[MIT](LICENSE) —— 可自由使用、修改、分发， please keep the attribution.

---

## 免责声明

本工具仅提供文献检索线索，不保证检索结果的完整性与准确性，不构成任何科研结论或投稿依据。所有判断请以原始文献为准。
