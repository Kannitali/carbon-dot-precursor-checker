const cd = require('../../utils/cdcheck.js');
const ml = require('../../utils/mylib.js');

const CHIPS = ['柠檬酸', '葡萄糖', '乙二胺', '尿素', '多巴胺', '壳聚糖', '半胱氨酸', '聚乙烯亚胺', '木质素', '间苯二胺'];

function request(url) {
  // 若 app.js 配置了 cloudEnv，走云函数代理（正式上线用）；否则直连（开发调试用）
  var app = getApp();
  var env = app && app.globalData && app.globalData.cloudEnv;
  if (env && wx.cloud) {
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: 'openalexProxy',
        data: { url: url },
        success: function (res) {
          var r = res.result;
          if (r && r.ok) resolve(r.data);
          else reject(new Error((r && r.error) || '云函数返回异常'));
        },
        fail: function (e) {
          reject(new Error(e.errMsg || '云函数调用失败'));
        }
      });
    });
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      method: 'GET',
      timeout: 15000,
      header: { 'content-type': 'application/json' },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject(new Error('HTTP ' + res.statusCode));
      },
      fail: function (e) {
        reject(new Error(e.errMsg || '网络请求失败'));
      }
    });
  });
}

Page({
  data: {
    query: '',
    chips: CHIPS,
    status: {},
    papers: [],
    loading: false,
    error: '',
    cacheNote: '',
    showHelp: false,
    helpLabel: '这个判断是怎么来的？',
    term: '',
    localHits: [],
    libCount: 0
  },

  onShow: function () {
    this.setData({ libCount: ml.load().length });
  },

  onInput: function (e) {
    this.setData({ query: e.detail.value });
  },

  quickTap: function (e) {
    var q = e.currentTarget.dataset.q;
    this.setData({ query: q });
    this.search();
  },

  toggleHelp: function () {
    var next = !this.data.showHelp;
    this.setData({
      showHelp: next,
      helpLabel: next ? '收起判断依据' : '这个判断是怎么来的？'
    });
  },

  parse: function (data) {
    var results = (data && data.results) || [];
    var list = [];
    for (var i = 0; i < results.length; i++) {
      var w = results[i];
      if (!w.doi || !w.title) continue;
      var journal = '';
      if (w.primary_location && w.primary_location.source) {
        journal = w.primary_location.source.display_name || '';
      }
      list.push({
        doi: w.doi.replace(/^https?:\/\/doi\.org\//, ''),
        title: w.title,
        year: w.publication_year,
        journal: journal,
        cited: w.cited_by_count || 0,
        abstract: cd.abstractText(w.abstract_inverted_index)
      });
    }
    return list;
  },

  merge: function (first, second) {
    var seen = {};
    var i;
    for (i = 0; i < first.length; i++) seen[first[i].doi.toLowerCase()] = 1;
    for (i = 0; i < second.length; i++) {
      var key = second[i].doi.toLowerCase();
      if (!seen[key]) {
        first.push(second[i]);
        seen[key] = 1;
      }
    }
    return first;
  },

  getCache: function (term) {
    try {
      var c = wx.getStorageSync('cdcheck:' + cd.norm(term));
      if (c && Date.now() - c.time < 7 * 24 * 3600 * 1000) return c.items;
    } catch (e) {}
    return null;
  },

  setCache: function (term, items) {
    try {
      wx.setStorageSync('cdcheck:' + cd.norm(term), { time: Date.now(), items: items });
    } catch (e) {}
  },

  apply: function (raw, items, offline) {
    var term = cd.toEnglish(raw);
    var strong = items.filter(function (p) { return p.score >= 5; });
    var mid = items.filter(function (p) { return p.score >= 2 && p.score < 5; });
    var status;

    if (strong.length) {
      status = {
        cls: 'ok',
        badge: '已见报道',
        title: '「' + raw + '」已用于碳点领域',
        text: '检索到 ' + strong.length + ' 篇以其参与碳点制备或改性的文献。点开 DOI 即可核对原文。'
      };
    } else if (mid.length) {
      status = {
        cls: 'warn',
        badge: '相关线索 · 待核对',
        title: '「' + raw + '」检索到相关线索',
        text: '未找到标题层面的明确合成证据，但有 ' + mid.length + ' 篇摘要提及该原料与碳点。请打开原文确认其角色。'
      };
    } else if (items.length) {
      status = {
        cls: 'muted',
        badge: '未确认作为原料',
        title: '暂未确认「' + raw + '」作为碳点原料',
        text: '检索到的多为“检测该物质”的应用类文献。这不等于没人用过，建议换别名或英文名称再查。'
      };
    } else {
      status = {
        cls: 'none',
        badge: '未检索到明确报道',
        title: '未找到「' + raw + '」的相关碳点文献',
        text: '本次 OpenAlex 检索没有返回结果。可尝试同义词、化学式、商品名或掺杂形式。'
      };
    }

    var localHits = ml.match(term, raw).map(function (x) {
      return { name: x.name, matsText: (x.materials || []).join(' + '), note: x.note || '' };
    });
    if (localHits.length) {
      status.text += ' 你自己的原料库中有 ' + localHits.length + ' 条组合包含该原料。';
    }

    var shown = items.slice().sort(function (a, b) {
      return b.score - a.score || b.cited - a.cited || b.year - a.year;
    }).slice(0, 12).map(function (p) {
      var parts = [];
      if (p.journal) parts.push(p.journal);
      if (p.year) parts.push(String(p.year));
      if (p.cited) parts.push('被引 ' + p.cited);
      return {
        doi: p.doi,
        title: p.title,
        meta: parts.join(' · '),
        tags: p.tags || []
      };
    });

    this.setData({
      term: term,
      raw: raw,
      status: status,
      papers: shown,
      localHits: localHits,
      libCount: ml.load().length,
      cacheNote: offline ? '在线检索失败，以下仅显示本地已核对条目。' : ''
    });
  },

  search: function () {
    var raw = (this.data.query || '').trim();
    if (!raw) {
      wx.showToast({ title: '请先输入原料名称', icon: 'none' });
      return;
    }

    var term = cd.toEnglish(raw);
    if (cd.hasCJK(raw) && !cd.ALIAS_N[cd.norm(raw)]) {
      this.setData({
        papers: [], error: '', cacheNote: '',
        status: {
          cls: 'warn',
          badge: '需要英文名称',
          title: '「' + raw + '」不在本地词库中',
          text: '请改用英文原料名查询（如 citric acid、L-cysteine），或把这个中文名发给 WorkBuddy 补进词库。'
        }
      });
      return;
    }

    var cached = this.getCache(term);
    if (cached) {
      this.apply(raw, cached, false);
      return;
    }

    var self = this;
    this.setData({ loading: true, error: '', cacheNote: '', papers: [] });

    request(cd.buildUrl(term, false))
      .then(function (data) { return self.parse(data); })
      .then(function (found) {
        var sr = cd.cueRegex(cd.norm(term), 'synth');
        var strong = found.filter(function (p) { return sr.test(cd.norm(p.title)); }).length;
        if (strong >= 2) return found;
        return request(cd.buildUrl(term, true))
          .then(function (d) { return self.parse(d); })
          .then(function (extra) { return self.merge(found, extra); });
      })
      .then(function (all) {
        var scored = all.map(function (p) { return cd.scorePaper(p, term); });
        var seed = cd.SEED[cd.norm(term)] || [];
        seed.forEach(function (s) {
          var hit = scored.some(function (x) { return x.doi.toLowerCase() === s.doi.toLowerCase(); });
          if (!hit) scored.push(Object.assign({}, s, { cited: 0, abstract: '' }));
        });
        self.setCache(term, scored);
        self.apply(raw, scored, false);
      })
      .catch(function (err) {
        var seed = (cd.SEED[cd.norm(term)] || []).map(function (s) {
          return Object.assign({}, s, { cited: 0, abstract: '', tags: [{ text: '本地已核对', cls: 'synth' }] });
        });
        if (seed.length) {
          self.setData({ error: '在线检索失败（' + err.message + '），已切换到本地已核对条目。' });
          self.apply(raw, seed, true);
        } else {
          self.setData({
            error: '检索失败：' + err.message + '。请检查 request 合法域名配置后重试。',
            status: {
              cls: 'none',
              badge: '检索失败',
              title: '暂时无法完成检索',
              text: '请确认 api.openalex.org 已加入小程序后台的 request 合法域名，或稍后重试。'
            }
          });
        }
      })
      .then(
        function () { self.setData({ loading: false }); },
        function () { self.setData({ loading: false }); }
      );
  },

  openLibrary: function () {
    wx.navigateTo({ url: '/pages/library/library' });
  },

  copyDoi: function (e) {
    var doi = e.currentTarget.dataset.doi;
    wx.setClipboardData({
      data: 'https://doi.org/' + doi,
      success: function () { wx.showToast({ title: 'DOI 链接已复制', icon: 'success' }); }
    });
  },

  copySearchLink: function () {
    var url = 'https://openalex.org/works?search=' + encodeURIComponent(this.data.term + ' carbon dots');
    wx.setClipboardData({
      data: url,
      success: function () { wx.showToast({ title: '检索链接已复制，可在浏览器打开', icon: 'none' }); }
    });
  }
});
