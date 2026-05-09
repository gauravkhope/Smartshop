const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'POSTMAN_134_TEST_CASES_DETAILED.md');
const outputPath = path.join(root, 'POSTMAN_134_COLLECTION.json');

const scriptMap = {
  S1: 'pm.test("Status 200", function () { pm.response.to.have.status(200); });',
  S2: 'pm.test("Status 201", function () { pm.response.to.have.status(201); });',
  S3: 'pm.test("Expected error", function () { pm.expect([400,401,403,404,429,500]).to.include(pm.response.code); });',
  S4: 'pm.test("JSON response", function () { pm.response.to.be.json; });',
  S5: 'const j = pm.response.json(); if (j.token) { pm.environment.set("jwtToken", j.token); }',
  S6: 'const t = pm.response.text(); pm.expect(t.toLowerCase()).to.include("backend api running");',
  S7: 'if (pm.response.code >= 400) { const j = pm.response.json(); pm.expect(j).to.be.an("object"); }',
  S8: 'const j = pm.response.json(); pm.expect(j.user).to.be.an("object");',
  S9: 'const j = pm.response.json(); pm.expect(Array.isArray(j) || Array.isArray(j.data) || Array.isArray(j.products) || Array.isArray(j.history) || Array.isArray(j.payments)).to.eql(true);',
  S10: 'pm.test("Latency", function () { pm.expect(pm.response.responseTime).to.be.below(1000); });',
};

const pattern = /^TC-(\d{3})\s\|\s(.+?)\s\|\sURL\s(.+?)\s\|\sMethod\s(.+?)\s\|\sAuth\s(.+?)\s\|\sBody\s(.+?)\s\|\sScript\s(.+)$/;
const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/);

function inferExpectedStatuses({ title, urlRaw, method, scriptRaw }) {
  const t = title.toLowerCase();
  const sr = (scriptRaw || '').toUpperCase();

  if (sr.includes('S3')) return [400, 401, 403, 404, 429, 500];
  if (sr.includes('S2')) return [201];
  if (sr.includes('S1')) return [200];

  if (t.includes('no token')) return [401];
  if (t.includes('no body')) return [400];
  if (t.includes('invalid token')) return [403];
  if (t.includes('non-admin')) return [403];
  if (t.includes('another user')) return [403];
  if (t.includes('different id')) return [403];
  if (t.includes('mismatch')) return [403];

  if (t.includes('lockout') || t.includes('rate limit') || t.includes('blocked')) return [429];

  if (t.includes('not found') || t.includes('non-existent') || t.includes('unregistered')) return [404];

  if (
    t.includes('missing') ||
    t.includes('invalid') ||
    t.includes('wrong') ||
    t.includes('duplicate') ||
    t.includes('expired') ||
    t.includes('short') ||
    t.includes('empty') ||
    t.includes('negative') ||
    t.includes('over refund')
  ) {
    return [400];
  }

  if (method === 'POST') {
    if (urlRaw.includes('/api/orders') && !urlRaw.includes('/cancel') && !urlRaw.includes('/status')) return [201];
    if (urlRaw.includes('/return-replace') && !urlRaw.includes('/cancel')) return [201];
    if (urlRaw.includes('/api/payments/create')) return [201];
  }

  return [200];
}

function buildDynamicAssertions({ tc, title, urlRaw, method, expectedStatuses }) {
  const t = title.toLowerCase();
  const isErrorCase = expectedStatuses.every((s) => s >= 400);

  const exec = [
    `pm.test("TC-${tc} status code", function () { pm.expect(${JSON.stringify(expectedStatuses)}).to.include(pm.response.code); });`,
    'pm.test("Response time < 5000ms", function () { pm.expect(pm.response.responseTime).to.be.below(5000); });',
    'const _ct = (pm.response.headers.get("Content-Type") || "").toLowerCase();',
    'let _json = null;',
    'if (_ct.includes("application/json")) { try { _json = pm.response.json(); } catch (e) {} }',
  ];

  if (urlRaw.includes('/api/')) {
    exec.push('pm.test("API responses should be JSON", function () { pm.expect(_ct).to.include("application/json"); });');
  }

  if (isErrorCase) {
    exec.push('pm.test("Error payload has message or error", function () { if (_json) { pm.expect(Boolean(_json.message || _json.error)).to.eql(true); } });');
  }

  if (urlRaw.endsWith('/api/auth/login') && method === 'POST' && !isErrorCase) {
    exec.push('pm.test("Login returns token", function () { pm.expect(_json && _json.token).to.be.a("string"); });');
    exec.push('pm.test("Login returns user object", function () { pm.expect(_json && _json.user).to.be.an("object"); });');
    exec.push('if (_json && _json.token) { pm.environment.set("jwtToken", _json.token); pm.environment.set("userToken", _json.token); }');
    exec.push('if (_json && _json.user && _json.user.id) { pm.environment.set("userId", String(_json.user.id)); }');
  }

  if (urlRaw.endsWith('/api/user/profile') && method === 'GET' && !isErrorCase) {
    exec.push('pm.test("Profile has user object", function () { pm.expect(_json && _json.user).to.be.an("object"); });');
    exec.push('pm.test("Profile should not leak password", function () { pm.expect(JSON.stringify(_json || {}).toLowerCase()).to.not.include("password"); });');
    exec.push('if (_json && _json.user && _json.user.id) { pm.environment.set("userId", String(_json.user.id)); }');
  }

  if (urlRaw.endsWith('/api/orders') && method === 'POST' && !isErrorCase) {
    exec.push('pm.test("Order create returns order", function () { pm.expect(_json && _json.order).to.be.an("object"); });');
    exec.push('if (_json && _json.order && _json.order.id) { pm.environment.set("orderId", String(_json.order.id)); }');
  }

  if (urlRaw.includes('/api/payments/create') && method === 'POST' && !isErrorCase) {
    exec.push('pm.test("Payment create returns payment", function () { pm.expect(_json && _json.payment).to.be.an("object"); });');
    exec.push('if (_json && _json.payment && _json.payment.providerId) { pm.environment.set("providerId", String(_json.payment.providerId)); }');
  }

  if (urlRaw.includes('/api/products') && method === 'GET' && !isErrorCase) {
    exec.push('pm.test("Products response shape is valid", function () { if (_json) { pm.expect(Array.isArray(_json) || Array.isArray(_json.products) || Array.isArray(_json.data)).to.eql(true); } });');
  }

  if (urlRaw === '{{baseUrl}}/') {
    exec.push('pm.test("Root health text contains backend", function () { pm.expect(pm.response.text().toLowerCase()).to.include("backend"); });');
  }

  if (t.includes('idempotency')) {
    exec.push('pm.test("Idempotency response is successful", function () { pm.expect([200, 201]).to.include(pm.response.code); });');
  }

  return exec;
}

function buildPostmanUrl(rawUrl) {
  const cleaned = rawUrl.trim();
  const baseVar = '{{baseUrl}}';

  if (!cleaned.startsWith(baseVar)) {
    return { raw: cleaned };
  }

  const remainder = cleaned.slice(baseVar.length); // e.g. /api/x?x=1
  const [pathPart, queryPart] = remainder.split('?');

  const path = (pathPart || '')
    .split('/')
    .filter(Boolean)
    .map((p) => p.trim())
    .filter(Boolean);

  const query = [];
  if (queryPart) {
    for (const pair of queryPart.split('&')) {
      if (!pair) continue;
      const [key, ...rest] = pair.split('=');
      query.push({ key: key || '', value: rest.join('=') || '' });
    }
  }

  const url = {
    raw: cleaned,
    host: [baseVar],
    path,
  };

  if (query.length > 0) {
    url.query = query;
  }

  return url;
}

const collection = {
  info: {
    name: 'E-Commerce Backend SDET 134 Cases',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    description: 'Import-ready flat collection with 134 requests and TC IDs in names.',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:5000' },
    { key: 'jwtToken', value: '' },
    { key: 'userToken', value: '' },
    { key: 'adminToken', value: '' },
    { key: 'userId', value: '' },
    { key: 'orderId', value: '' },
    { key: 'providerId', value: '' },
    { key: 'productId', value: '' },
    { key: 'category', value: '' },
    { key: 'brand', value: '' },
  ],
  item: [],
};

for (const line of lines) {
  const m = line.match(pattern);
  if (!m) continue;

  const [, tc, titleRaw, urlRaw, methodRaw, authRaw, bodyRaw, scriptRaw] = m;
  const title = titleRaw.trim();
  const method = methodRaw.trim().toUpperCase();
  const authText = authRaw.trim();
  const bodyText = bodyRaw.trim();

  const headers = [];
  let body;

  if (bodyText.startsWith('{')) {
    const normalized = bodyText
      .replace(/\s+repeated$/, '')
      .replace(/\s+rapid$/, '')
      .replace(/\s+expired$/, '');
    headers.push({ key: 'Content-Type', value: 'application/json', type: 'text' });
    body = {
      mode: 'raw',
      raw: normalized,
      options: { raw: { language: 'json' } },
    };
  } else if (bodyText.startsWith('form-data')) {
    body = {
      mode: 'formdata',
      formdata: [
        { key: 'name', value: 'John Doe', type: 'text' },
        { key: 'email', value: 'john@example.com', type: 'text' },
        { key: 'avatar', type: 'file', src: '' },
      ],
    };
  }

  let auth = { type: 'noauth' };
  const bearerVar = authText.match(/^Bearer\s+\{\{(.+?)\}\}$/);
  if (bearerVar) {
    auth = {
      type: 'bearer',
      bearer: [{ key: 'token', value: `{{${bearerVar[1]}}}`, type: 'string' }],
    };
  } else if (/^Bearer\s+invalid$/i.test(authText)) {
    auth = {
      type: 'bearer',
      bearer: [{ key: 'token', value: 'invalid', type: 'string' }],
    };
  }

  const exec = scriptRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => scriptMap[s] || s);

  const expectedStatuses = inferExpectedStatuses({
    title,
    urlRaw: urlRaw.trim(),
    method,
    scriptRaw,
  });
  const dynamicExec = buildDynamicAssertions({
    tc,
    title,
    urlRaw: urlRaw.trim(),
    method,
    expectedStatuses,
  });

  const finalExec = [...dynamicExec, ...exec];

  const request = {
    method,
    header: headers,
    url: buildPostmanUrl(urlRaw),
    auth,
    description: `TC-${tc}: ${title}`,
  };

  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    request.body = body;
  }

  collection.item.push({
    name: `TC-${tc} | ${title}`,
    request,
    event: [
      {
        listen: 'test',
        script: { type: 'text/javascript', exec: finalExec },
      },
    ],
  });
}

fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), 'utf8');
console.log(`Generated ${path.basename(outputPath)} with requests=${collection.item.length}`);
