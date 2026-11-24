// 云函数：代理请求 OpenAlex，解决小程序合法域名无法备案的问题
// 只允许请求 api.openalex.org，防止被当作开放代理滥用
const https = require('https');

const ALLOWED_HOST = 'api.openalex.org';
const TIMEOUT_MS = 12000;

exports.main = async (event) => {
  const rawUrl = (event && event.url) || '';

  let u;
  try {
    u = new URL(rawUrl);
  } catch (e) {
    return { ok: false, error: '无效的 URL' };
  }

  if (u.protocol !== 'https:' || u.hostname !== ALLOWED_HOST) {
    return { ok: false, error: '仅允许请求 ' + ALLOWED_HOST };
  }

  const path = u.pathname + u.search;

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: ALLOWED_HOST,
        path: path,
        method: 'GET',
        headers: {
          'User-Agent': 'cd-precursor-checker/1.0 (WeChat cloud function)',
          'Accept': 'application/json'
        },
        timeout: TIMEOUT_MS
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
          if (body.length > 2 * 1024 * 1024) req.destroy();
        });
        res.on('end', () => {
          const code = res.statusCode || 0;
          if (code < 200 || code >= 300) {
            resolve({ ok: false, error: 'OpenAlex HTTP ' + code });
            return;
          }
          try {
            resolve({ ok: true, data: JSON.parse(body) });
          } catch (e) {
            resolve({ ok: false, error: '解析 OpenAlex 响应失败' });
          }
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (e) => {
      resolve({ ok: false, error: '请求 OpenAlex 失败：' + (e.message || 'unknown') });
    });
    req.end();
  });
};
