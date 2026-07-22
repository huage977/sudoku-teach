import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin888';
const PORT = process.env.PORT || 3001;

// ======== 数据存储 ========
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const initial = { users: [], tokens: {}, progress: {}, records: {} };
    saveData(initial);
    return initial;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getToken() {
  return crypto.randomUUID();
}

// ======== 请求解析 ========
function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function getAuthUser(req, data) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const username = data.tokens[token];
  if (!username) return null;
  const user = data.users.find(u => u.username === username);
  return user || null;
}

// ======== API 路由处理 ========
const routes = {
  // POST /api/auth/register
  'POST /api/auth/register': async (req, res, data) => {
    const body = await parseJSON(req);
    const { username, password } = body;
    if (!username || !password) return json(res, 400, { error: '用户名和密码不能为空' });
    if (username === ADMIN_USERNAME) return json(res, 400, { error: '不允许注册该用户名' });
    if (data.users.find(u => u.username === username)) return json(res, 400, { error: '用户名已存在' });

    data.users.push({ username, password, isAdmin: false });
    const token = getToken();
    data.tokens[token] = username;
    data.progress[username] = {};
    data.records[username] = [];
    // 自动解锁第一关
    data.progress[username][1] = { status: 'unlocked', completedTechniques: [], puzzlesSolved: 0 };
    saveData(data);
    json(res, 200, { token, user: { username, isAdmin: false } });
  },

  // POST /api/auth/login
  'POST /api/auth/login': async (req, res, data) => {
    const body = await parseJSON(req);
    const { username, password } = body;

    // 管理员登录
    if (username === ADMIN_USERNAME) {
      if (password !== ADMIN_PASSWORD) return json(res, 400, { error: '管理员密码错误' });
      if (!data.users.find(u => u.username === ADMIN_USERNAME)) {
        data.users.push({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD, isAdmin: true });
      }
      const token = getToken();
      data.tokens[token] = ADMIN_USERNAME;
      saveData(data);
      return json(res, 200, { token, user: { username: ADMIN_USERNAME, isAdmin: true } });
    }

    const user = data.users.find(u => u.username === username && u.password === password);
    if (!user) return json(res, 400, { error: '用户名或密码错误' });

    const token = getToken();
    data.tokens[token] = username;
    saveData(data);
    json(res, 200, { token, user: { username, isAdmin: false } });
  },

  // POST /api/auth/logout
  'POST /api/auth/logout': async (req, res, data) => {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      delete data.tokens[auth.slice(7)];
      saveData(data);
    }
    json(res, 200, { success: true });
  },

  // GET /api/auth/check
  'GET /api/auth/check': async (req, res, data) => {
    const user = getAuthUser(req, data);
    if (!user) return json(res, 401, { error: '未登录或登录已过期' });
    json(res, 200, { user: { username: user.username, isAdmin: user.isAdmin } });
  },

  // GET /api/user/progress
  'GET /api/user/progress': async (req, res, data) => {
    const user = getAuthUser(req, data);
    if (!user) return json(res, 401, { error: '未登录' });
    json(res, 200, { progress: data.progress[user.username] || {} });
  },

  // POST /api/user/progress
  'POST /api/user/progress': async (req, res, data) => {
    const user = getAuthUser(req, data);
    if (!user) return json(res, 401, { error: '未登录' });
    const body = await parseJSON(req);
    data.progress[user.username] = body.progress;
    saveData(data);
    json(res, 200, { success: true });
  },

  // GET /api/user/records
  'GET /api/user/records': async (req, res, data) => {
    const user = getAuthUser(req, data);
    if (!user) return json(res, 401, { error: '未登录' });
    json(res, 200, { records: data.records[user.username] || [] });
  },

  // POST /api/user/records
  'POST /api/user/records': async (req, res, data) => {
    const user = getAuthUser(req, data);
    if (!user) return json(res, 401, { error: '未登录' });
    const body = await parseJSON(req);
    if (!data.records[user.username]) data.records[user.username] = [];
    data.records[user.username].push(body.record);
    saveData(data);
    json(res, 200, { success: true });
  },

  // PUT /api/user/records (replace all records)
  'PUT /api/user/records': async (req, res, data) => {
    const user = getAuthUser(req, data);
    if (!user) return json(res, 401, { error: '未登录' });
    const body = await parseJSON(req);
    data.records[user.username] = body.records || [];
    saveData(data);
    json(res, 200, { success: true });
  },

  // ======== 管理员接口 ========

  // GET /api/admin/users
  'GET /api/admin/users': async (req, res, data) => {
    const user = getAuthUser(req, data);
    if (!user || !user.isAdmin) return json(res, 403, { error: '无权限' });
    const list = data.users
      .filter(u => u.username !== ADMIN_USERNAME)
      .map(u => ({
        username: u.username,
        password: u.password,
        recordCount: (data.records[u.username] || []).length,
      }));
    json(res, 200, { users: list });
  },

  // GET /api/admin/users/:username
  'GET /api/admin/users/:username': async (req, res, data, match) => {
    const user = getAuthUser(req, data);
    if (!user || !user.isAdmin) return json(res, 403, { error: '无权限' });
    const targetUsername = match[1];
    const target = data.users.find(u => u.username === targetUsername);
    if (!target) return json(res, 404, { error: '用户不存在' });
    json(res, 200, {
      user: {
        username: target.username,
        password: target.password,
        progress: data.progress[target.username] || {},
        records: data.records[target.username] || [],
      },
    });
  },
};

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// ======== 静态文件服务 ========
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveStatic(req, res) {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // SPA fallback: if the file doesn't exist and it's not an API route, serve index.html
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}

// ======== 路由匹配 ========
function matchRoute(method, url) {
  // 精确匹配
  const exactKey = `${method} ${url}`;
  if (routes[exactKey]) return { handler: routes[exactKey], params: [] };

  // 带参数匹配 (e.g., /api/admin/users/:username)
  for (const [key, handler] of Object.entries(routes)) {
    const [rmethod, rpath] = key.split(' ');
    if (rmethod !== method) continue;
    const rparts = rpath.split('/');
    const uparts = url.split('/');
    if (rparts.length !== uparts.length) continue;
    const params = [];
    let match = true;
    for (let i = 0; i < rparts.length; i++) {
      if (rparts[i].startsWith(':')) {
        params.push(uparts[i]);
      } else if (rparts[i] !== uparts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { handler, params };
  }
  return null;
}

// ======== 服务器 ========
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // API 路由
  if (pathname.startsWith('/api/')) {
    const data = loadData();
    const matched = matchRoute(req.method, pathname);
    if (matched) {
      try {
        await matched.handler(req, res, data, matched.params);
      } catch (err) {
        console.error('API Error:', err);
        json(res, 500, { error: '服务器内部错误' });
      }
    } else {
      json(res, 404, { error: '接口不存在' });
    }
    return;
  }

  // 静态文件
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 数独学院服务器启动成功`);
  console.log(`   API:    http://localhost:${PORT}/api`);
  console.log(`   网站:   http://localhost:${PORT}`);
  if (fs.existsSync(DIST_DIR)) {
    console.log(`   静态资源: ${DIST_DIR}`);
  } else {
    console.log(`   ⚠️  尚未构建前端，请先运行 npm run build`);
  }
});
