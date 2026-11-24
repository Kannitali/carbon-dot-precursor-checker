// 碳点原料文献查询：别名、本地高置信条目与判断逻辑
const ALIAS = {
  "柠檬酸":"citric acid","一水柠檬酸":"citric acid","葡萄糖":"glucose","可溶性淀粉":"starch",
  "淀粉":"starch","乙二胺":"ethylenediamine","EDA":"ethylenediamine","二乙烯三胺":"diethylenetriamine",
  "尿素":"urea","硫脲":"thiourea","多巴胺":"dopamine","盐酸多巴胺":"dopamine",
  "壳聚糖":"chitosan","壳寡糖":"chitosan oligosaccharide","甘氨酸":"glycine","Gly":"glycine",
  "半胱氨酸":"L-cysteine","L-半胱氨酸":"L-cysteine","胱氨酸":"cystine","抗坏血酸":"ascorbic acid",
  "维生素C":"ascorbic acid","聚乙烯亚胺":"polyethyleneimine","PEI":"polyethyleneimine",
  "聚乙二醇":"polyethylene glycol","PEG":"polyethylene glycol","聚乙烯吡咯烷酮":"polyvinylpyrrolidone",
  "PVP":"polyvinylpyrrolidone","蔗糖":"sucrose","果糖":"fructose","麦芽糖":"maltose",
  "明胶":"gelatin","牛血清白蛋白":"bovine serum albumin","BSA":"bovine serum albumin",
  "蛋白质":"protein","木质素":"lignin","碱木质素":"lignin","纤维素":"cellulose",
  "微晶纤维素":"cellulose","海藻酸钠":"sodium alginate","阿拉伯胶":"gum arabic",
  "牛奶":"milk","脱脂牛奶":"milk","蜂蜜":"honey","橘皮":"orange peel","橙皮":"orange peel",
  "柚子皮":"pomelo peel","香蕉汁":"banana juice","苹果酸":"malic acid","草酸":"oxalic acid",
  "硼酸":"boric acid","磷酸":"phosphoric acid","甲酰胺":"formamide","乙酰胺":"acetamide",
  "N,N-二甲基甲酰胺":"dimethylformamide","DMF":"dimethylformamide","甘油":"glycerol",
  "间苯二胺":"m-phenylenediamine","mPD":"m-phenylenediamine","对苯二胺":"p-phenylenediamine",
  "pPD":"p-phenylenediamine","邻苯二胺":"o-phenylenediamine","oPD":"o-phenylenediamine",
  "苯二胺":"phenylenediamine","三聚氰胺":"melamine","谷胱甘肽":"glutathione",
  "精氨酸":"arginine","赖氨酸":"lysine","谷氨酸":"glutamic acid","组氨酸":"histidine",
  "色氨酸":"tryptophan","酪氨酸":"tyrosine","丝氨酸":"serine","丙氨酸":"alanine",
  "天冬氨酸":"aspartic acid","牛磺酸":"taurine","叶绿素":"chlorophyll","腐殖酸":"humic acid",
  "咖啡酸":"caffeic acid","阿魏酸":"ferulic acid","柠檬酸钠":"sodium citrate",
  "氯化锌":"zinc chloride","乙酸锌":"zinc acetate","硝酸银":"silver nitrate",
  "硫酸":"sulfuric acid","盐酸":"hydrochloric acid","氢氧化钠":"sodium hydroxide",
  "抗坏血酸钠":"sodium ascorbate","柠檬酸铵":"ammonium citrate","氯化铵":"ammonium chloride"
};

const SEED = {
  "citric acid":[
    {doi:"10.1002/chem.201902497",title:"Carbon Dots from Citric Acid and its Intermediates Formed by Thermal Decomposition",year:2019,journal:"Chemistry – A European Journal",score:6,tags:["合成原料"]},
    {doi:"10.1021/acs.jpcc.6b12519",title:"Molecular Fluorescence in Citric Acid-Based Carbon Dots",year:2017,journal:"The Journal of Physical Chemistry C",score:6,tags:["合成原料"]}
  ],
  "glucose":[
    {doi:"10.1021/acsabm.0c00376",title:"Bioinspired Cryoprotectants of Glucose-Based Carbon Dots",year:2020,journal:"ACS Applied Bio Materials",score:6,tags:["合成原料"]}
  ],
  "ethylenediamine":[
    {doi:"10.1016/j.snb.2015.05.006",title:"Ethylenediamine-assisted hydrothermal synthesis of nitrogen-doped carbon quantum dots as fluorescent probes",year:2015,journal:"Sensors and Actuators B: Chemical",score:6,tags:["合成原料"]}
  ],
  "urea":[
    {doi:"10.1039/c8nr03602k",title:"Luminescence phenomena of carbon dots derived from citric acid and urea – a molecular insight",year:2018,journal:"Nanoscale",score:6,tags:["合成原料"]}
  ],
  "chitosan":[
    {doi:"10.1039/c2ra21705h",title:"Fluorescent carbon dots obtained from chitosan gel",year:2012,journal:"RSC Advances",score:6,tags:["合成原料"]},
    {doi:"10.1038/srep31100",title:"Simple Approach to Synthesize Amino-Functionalized Carbon Dots by Carbonization of Chitosan",year:2016,journal:"Scientific Reports",score:6,tags:["合成原料"]}
  ],
  "gelatin":[
    {doi:"10.1016/j.carbon.2013.04.055",title:"Easy synthesis of highly fluorescent carbon quantum dots from gelatin and their luminescent properties and applications",year:2013,journal:"Carbon",score:6,tags:["合成原料"]}
  ],
  "lignin":[
    {doi:"10.1021/acsami.1c16679",title:"Green Synthesis of Tunable Fluorescent Carbon Quantum Dots from Lignin and Their Application in Anti-Counterfeit Printing",year:2021,journal:"ACS Applied Materials & Interfaces",score:6,tags:["合成原料"]}
  ],
  "starch":[
    {doi:"10.1002/bio.2744",title:"Preparation of carbon quantum dots based on starch and their spectral properties",year:2014,journal:"Luminescence",score:6,tags:["合成原料"]}
  ],
  "orange peel":[
    {doi:"10.1016/j.foodchem.2020.127775",title:"Green one-step synthesis of carbon quantum dots from orange peel for fluorescent detection of Escherichia coli in milk",year:2020,journal:"Food Chemistry",score:6,tags:["合成原料"]}
  ],
  "milk":[
    {doi:"10.1016/j.matlet.2019.01.064",title:"Carbon-quantum dots derived from denatured milk for efficient chromium-ion sensing and supercapacitor applications",year:2019,journal:"Materials Letters",score:6,tags:["合成原料"]}
  ],
  "m-phenylenediamine":[
    {doi:"10.1021/acsanm.1c01838",title:"Polychromatic Carbon Dots Prepared from m-Phenylenediamine and Urea as Multifunctional Fluorescent Probes",year:2021,journal:"ACS Applied Nano Materials",score:6,tags:["合成原料"]}
  ]
};

const norm = s => String(s || "").toLowerCase()
  .replace(/[\u2010-\u2015\u2212\-]/g, " ")
  .replace(/[,.;:()\[\]{}"'`!?/\\]/g, " ")
  .replace(/\s+/g, " ").trim();
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ALIAS_N = {};
for (const k in ALIAS) ALIAS_N[norm(k)] = ALIAS[k];

function toEnglish(raw) {
  const k = norm(raw);
  return ALIAS_N[k] ? ALIAS_N[k] : raw.trim().replace(/\s+/g, " ");
}

function hasCJK(s) {
  return /[\u4e00-\u9fff]/.test(s);
}

function abstractText(inv) {
  if (!inv) return "";
  const words = [];
  for (const w in inv) {
    const positions = inv[w] || [];
    for (const p of positions) words[p] = w;
  }
  return words.filter(Boolean).join(" ");
}

function cueRegex(term, type) {
  const e = esc(term);
  const synth = [
    `${e} based`, `based on ${e}`, `derived from ${e}`, `${e} derived`,
    `from ${e}`, `prepared from ${e}`, `synthesized from ${e}`,
    `synthesis of [^.]{0,90} from ${e}`, `carbonization of ${e}`,
    `pyrolysis of ${e}`, `hydrothermal[^.]{0,70} ${e}`, `using ${e}`,
    `with ${e} as`, `${e} as (a |the )?(carbon|nitrogen|sulfur|dopant|precursor)`,
    `${e} precursor`, `${e} doped`, `${e} doping`, `${e} as carbon source`
  ];
  const detect = [
    `detection of ${e}`, `detecting ${e}`, `determination of ${e}`,
    `sensing of ${e}`, `sensor for ${e}`, `probe for ${e}`,
    `for the detection of ${e}`, `${e} detection`, `${e} sensing`,
    `monitoring ${e}`, `${e} levels`, `sensitive detection of ${e}`
  ];
  return new RegExp((type === "synth" ? synth : detect).join("|"), "i");
}

function scorePaper(p, term) {
  const title = norm(p.title);
  const abs = norm(p.abstract || "");
  const t = norm(term);
  const sr = cueRegex(t, "synth");
  const dr = cueRegex(t, "detect");
  let score = 0;
  const tags = [];
  if (sr.test(title)) { score += 5; tags.push({ text: "标题含合成线索", cls: "synth" }); }
  else if (sr.test(abs)) { score += 2; tags.push({ text: "摘要含合成线索", cls: "synth" }); }
  if (dr.test(title)) { score -= 5; tags.push({ text: "检测用途", cls: "detect" }); }
  else if (dr.test(abs)) { score -= 2; tags.push({ text: "摘要为检测用途", cls: "detect" }); }
  if (title.indexOf(t) >= 0) score += 1;
  return Object.assign({}, p, { score: score, tags: tags });
}

function buildUrl(term, byAbstract) {
  const field = byAbstract ? "abstract.search" : "title.search";
  const filter = [
    "title.search:carbon dots|carbon quantum dots|carbon nanodots|carbon dot",
    field + ":" + term,
    "from_publication_date:2008-01-01"
  ].join(",");
  const select = "doi,title,publication_year,cited_by_count,primary_location,abstract_inverted_index";
  return "https://api.openalex.org/works?filter=" + encodeURIComponent(filter) +
    "&per-page=25&select=" + encodeURIComponent(select);
}

module.exports = {
  ALIAS: ALIAS, SEED: SEED, ALIAS_N: ALIAS_N,
  norm: norm, esc: esc, toEnglish: toEnglish, hasCJK: hasCJK,
  abstractText: abstractText, cueRegex: cueRegex,
  scorePaper: scorePaper, buildUrl: buildUrl
};
