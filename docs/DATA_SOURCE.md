# 数据来源与判断逻辑

## 文献 API

使用 [OpenAlex](https://openalex.org/) 开放 API 检索文献，端点为 `/works`。OpenAlex 覆盖 PubMed、Crossref、Web of Science 等来源，返回字段包含标题、年份、DOI、被引数和摘要倒排索引。

选择它的原因：

- 完全开放，无需 API Key；
- 支持 CORS，浏览器端可直接调用（网页版无需后端）；
- 返回真实 DOI，便于点开原文核对。

## 检索策略

对输入的原料名（先经别名表归一为英文）：

1. **标题双关键词 AND**：`title.search:carbon dots|carbon quantum dots|carbon nanodots|carbon dot` 与 `title.search:<原料>` 同时命中，保证标题里既有碳点又有该原料。
2. **摘要补充检索**：标题检索证据不足时，用 `abstract.search:<原料>` 再查一轮，捞取标题不含原料名但摘要明确提到的文献。
3. 结果按时间与相关性排序，取前若干条进入打分。

## 打分逻辑

对每篇候选文献，检查标题与摘要中的线索词：

- **合成线索（加分）**：`from`、`derived from`、`based on`、`carbonization of`、`synthesized from`、`prepared from`、`using ... as carbon source` —— 表明该原料是合成碳点的前驱体。
- **检测线索（减分/排除）**：`detection of`、`probe for`、`sensing of`、`determination of` —— 表明是用碳点去检测该物质，该原料不是前驱体，属于假阳性。
- 年份、被引数作为弱权重参考。

综合得分决定三档判断：

| 档位 | 阈值 | 含义 |
| --- | --- | --- |
| 已见报道 | 存在强合成线索 | 有明确文献证据 |
| 相关线索·待核对 | 有相关文献但线索不直接 | 需人工点开原文确认 |
| 未确认作为原料 | 无有效结果 | 在线未找到明确用于合成的证据 |

## 本地高置信条目

`utils/cdcheck.js` 中的 `SEED` 是事先逐条核对过的文献（柠檬酸、葡萄糖、乙二胺、尿素、壳聚糖、明胶、木质素、淀粉、橘皮、牛奶等）。它们在网络失败或在线无结果时提供兜底，并以"合成原料"标签直接显示。

## 别名表

`ALIAS` 覆盖常见中文名与缩写（如 `EDA` → `ethylenediamine`、`mPD` → `m-phenylenediamine`、`维生素C` → `ascorbic acid`）。较少见的中文名建议改用英文名查询。

## 缓存

查询结果在浏览器 `localStorage` / 小程序 `wx.setStorageSync` 中缓存 7 天，key 前缀 `cdcheck:`。缓存过期后自动重新检索。手动"重新检索"可跳过缓存。

## 局限

- 这是文献线索工具，不是系统综述；检索不可能穷尽所有文献。
- 打分基于关键词规则，无法理解语义，误判可能存在。
- "未检索到"不等于"没人用过"：可能用了不同命名、在专利或学位论文里、或未被 OpenAlex 收录。
- 任何结论请以原文核实为准。
