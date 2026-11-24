const ml = require('../../utils/mylib.js');

Page({
  data: {
    list: [],
    name: '',
    mats: '',
    note: '',
    bulk: ''
  },

  onShow: function () {
    this.refresh();
  },

  refresh: function () {
    var list = ml.load().map(function (x) {
      return Object.assign({}, x, { matsText: (x.materials || []).join(' + ') });
    });
    this.setData({ list: list });
  },

  onName: function (e) { this.setData({ name: e.detail.value }); },
  onMats: function (e) { this.setData({ mats: e.detail.value }); },
  onNote: function (e) { this.setData({ note: e.detail.value }); },
  onBulk: function (e) { this.setData({ bulk: e.detail.value }); },

  add: function () {
    const name = (this.data.name || '').trim();
    const mats = ml.splitMats(this.data.mats);
    if (!name || !mats.length) {
      wx.showToast({ title: '请填写名称和至少一个原料', icon: 'none' });
      return;
    }
    const list = ml.load();
    list.push({
      id: ml.newId(),
      name: name,
      materials: mats,
      note: (this.data.note || '').trim()
    });
    if (!ml.save(list)) {
      wx.showToast({ title: '本地存储失败', icon: 'none' });
      return;
    }
    this.setData({ name: '', mats: '', note: '' });
    this.refresh();
    wx.showToast({ title: '已添加', icon: 'success' });
  },

  importText: function () {
    let rows = [];
    try {
      rows = ml.parse(this.data.bulk);
    } catch (err) {
      wx.showToast({ title: '导入失败：' + err.message, icon: 'none' });
      return;
    }
    if (!rows.length) {
      wx.showToast({ title: '未解析到有效记录', icon: 'none' });
      return;
    }
    const list = ml.load().concat(rows);
    if (!ml.save(list)) {
      wx.showToast({ title: '本地存储失败', icon: 'none' });
      return;
    }
    this.setData({ bulk: '' });
    this.refresh();
    wx.showToast({ title: '已导入 ' + rows.length + ' 条', icon: 'success' });
  },

  exportText: function () {
    const txt = ml.load().map(function (x) {
      return [x.name, (x.materials || []).join(','), x.note || ''].join(' | ');
    }).join('\n');
    if (!txt) {
      wx.showToast({ title: '本地库还是空的', icon: 'none' });
      return;
    }
    const self = this;
    this.setData({ bulk: txt });
    wx.setClipboardData({
      data: txt,
      success: function () { wx.showToast({ title: '已复制并填入文本框', icon: 'success' }); }
    });
  },

  clear: function () {
    const self = this;
    wx.showModal({
      title: '清空本地库',
      content: '确定删除本机保存的全部自定义原料组合吗？此操作不可撤销。',
      success: function (res) {
        if (!res.confirm) return;
        self.setData({ bulk: '' });
        ml.save([]);
        self.refresh();
      }
    });
  },

  del: function (e) {
    const id = e.currentTarget.dataset.id;
    ml.save(ml.load().filter(function (x) { return x.id !== id; }));
    this.refresh();
  }
});
