// 用户自定义原料组合：本地存储、导入解析与匹配
const cd = require('./cdcheck.js');

const KEY = 'cd_mylib_v1';

function load() {
  try {
    const v = wx.getStorageSync(KEY);
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function save(list) {
  try {
    wx.setStorageSync(KEY, list);
    return true;
  } catch (e) {
    return false;
  }
}

function newId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

function splitMats(s) {
  return String(s || '').split(/[+,，、;；]/).map(x => x.trim()).filter(Boolean);
}

function parse(text) {
  const s = String(text || '').trim();
  if (!s) return [];
  if (s.charAt(0) === '[') {
    const arr = JSON.parse(s);
    if (!Array.isArray(arr)) throw new Error('JSON 顶层必须是数组');
    return arr.filter(x => x && x.name).map(x => ({
      id: newId(),
      name: String(x.name),
      materials: (Array.isArray(x.materials) ? x.materials : splitMats(x.materials)).map(String),
      note: String(x.note || '')
    })).filter(x => x.materials.length);
  }
  return s.split(/\n+/).map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split('|').map(x => x.trim());
    if (parts.length < 2) return null;
    const mats = splitMats(parts[1]);
    if (!mats.length) return null;
    return { id: newId(), name: parts[0], materials: mats, note: parts[2] || '' };
  }).filter(Boolean);
}

function match(term, raw) {
  const t = cd.norm(term);
  const r = cd.norm(raw);
  return load().filter(x => (x.materials || []).some(m => {
    const a = cd.norm(m);
    const b = cd.norm(cd.toEnglish(m));
    return a === t || b === t || a === r || b === r;
  }));
}

module.exports = {
  KEY: KEY,
  load: load,
  save: save,
  newId: newId,
  splitMats: splitMats,
  parse: parse,
  match: match
};
