const API_BASE = '/api';
let apiAvailable = true;

function getToken() {
  return sessionStorage.getItem('sudoku-token') || null;
}

function setToken(token) {
  if (token) {
    sessionStorage.setItem('sudoku-token', token);
  } else {
    sessionStorage.removeItem('sudoku-token');
  }
}

// ======== localStorage 降级函数 ========
function getUsers() {
  return JSON.parse(localStorage.getItem('sudoku-users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('sudoku-users', JSON.stringify(users));
}

function getUserDataKey(username, type) {
  return `sudoku-${username}-${type}`;
}

// ======== API 请求（带降级） ========
async function request(method, path, body) {
  if (!apiAvailable) throw new Error('API offline');
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '请求失败');
    return data;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.message?.includes('fetch')) {
      apiAvailable = false;
    }
    throw err;
  }
}

// ======== 认证（API优先，降级localStorage） ========
export async function apiRegister(username, password) {
  try {
    const data = await request('POST', '/auth/register', { username, password });
    setToken(data.token);
    return data.user;
  } catch {
    // 降级：localStorage
    const users = getUsers();
    if (users.find(u => u.username === username)) throw new Error('用户名已存在');
    users.push({ username, password, isAdmin: false });
    saveUsers(users);
    setToken('local-' + username);
    const progKey = getUserDataKey(username, 'progress');
    const recKey = getUserDataKey(username, 'records');
    if (!localStorage.getItem(progKey)) localStorage.setItem(progKey, '{}');
    if (!localStorage.getItem(recKey)) localStorage.setItem(recKey, '[]');
    // 自动解锁第一关
    const progress = JSON.parse(localStorage.getItem(progKey) || '{}');
    progress[1] = { status: 'unlocked', completedTechniques: [], puzzlesSolved: 0 };
    localStorage.setItem(progKey, JSON.stringify(progress));
    return { username, isAdmin: false };
  }
}

export async function apiLogin(username, password) {
  // 管理员特殊处理（本地也支持）
  if (username === 'admin') {
    try {
      const data = await request('POST', '/auth/login', { username, password });
      setToken(data.token);
      return data.user;
    } catch {
      if (password !== 'admin888') throw new Error('管理员密码错误');
      const users = getUsers();
      if (!users.find(u => u.username === 'admin')) {
        users.push({ username: 'admin', password: 'admin888', isAdmin: true });
        saveUsers(users);
      }
      setToken('local-admin');
      return { username: 'admin', isAdmin: true };
    }
  }

  try {
    const data = await request('POST', '/auth/login', { username, password });
    setToken(data.token);
    return data.user;
  } catch {
    // 降级：localStorage
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) throw new Error('用户名或密码错误');
    setToken('local-' + username);
    return { username, isAdmin: false };
  }
}

export async function apiLogout() {
  try { await request('POST', '/auth/logout'); } catch {}
  setToken(null);
}

export async function apiCheckSession() {
  const token = getToken();
  if (!token) return null;
  // local token
  if (token.startsWith('local-')) {
    const username = token.replace('local-', '');
    const isAdmin = username === 'admin';
    return { username, isAdmin };
  }
  try {
    const data = await request('GET', '/auth/check');
    return data.user;
  } catch {
    setToken(null);
    return null;
  }
}

// ======== 用户数据（API优先，降级localStorage） ========
export async function apiGetProgress() {
  try {
    const data = await request('GET', '/user/progress');
    return data.progress;
  } catch {
    const token = getToken();
    const username = token?.replace('local-', '');
    if (!username) return {};
    return JSON.parse(localStorage.getItem(getUserDataKey(username, 'progress')) || '{}');
  }
}

export async function apiSaveProgress(progress) {
  try {
    await request('POST', '/user/progress', { progress });
  } catch {
    const token = getToken();
    const username = token?.replace('local-', '');
    if (username) {
      localStorage.setItem(getUserDataKey(username, 'progress'), JSON.stringify(progress));
    }
  }
}

export async function apiGetRecords() {
  try {
    const data = await request('GET', '/user/records');
    return data.records;
  } catch {
    const token = getToken();
    const username = token?.replace('local-', '');
    if (!username) return [];
    return JSON.parse(localStorage.getItem(getUserDataKey(username, 'records')) || '[]');
  }
}

export async function apiAddRecord(record) {
  try {
    await request('POST', '/user/records', { record });
  } catch {
    const token = getToken();
    const username = token?.replace('local-', '');
    if (username) {
      const key = getUserDataKey(username, 'records');
      const records = JSON.parse(localStorage.getItem(key) || '[]');
      records.push(record);
      localStorage.setItem(key, JSON.stringify(records));
    }
  }
}

export async function apiSaveRecords(records) {
  try {
    await request('PUT', '/user/records', { records });
  } catch {
    const token = getToken();
    const username = token?.replace('local-', '');
    if (username) {
      localStorage.setItem(getUserDataKey(username, 'records'), JSON.stringify(records));
    }
  }
}

// ======== 管理员（API优先，降级localStorage） ========
export async function apiAdminGetUsers() {
  try {
    const data = await request('GET', '/admin/users');
    return data.users;
  } catch {
    const users = getUsers().filter(u => u.username !== 'admin');
    return users.map(u => ({
      username: u.username,
      password: u.password,
      recordCount: (JSON.parse(localStorage.getItem(getUserDataKey(u.username, 'records')) || '[]')).length,
    }));
  }
}

export async function apiAdminGetUser(username) {
  try {
    const data = await request('GET', `/admin/users/${encodeURIComponent(username)}`);
    return data.user;
  } catch {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user) throw new Error('用户不存在');
    return {
      username: user.username,
      password: user.password,
      progress: JSON.parse(localStorage.getItem(getUserDataKey(username, 'progress')) || '{}'),
      records: JSON.parse(localStorage.getItem(getUserDataKey(username, 'records')) || '[]'),
    };
  }
}

export { getToken, setToken };
