// TeleStash - Telegram Cloud Drive powered by Cloudflare Workers
// Uses Telegram Bot API + Channel as unlimited storage backend
// File metadata stored in Cloudflare KV

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TeleStash</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0f0f1a;--bg2:#16162a;--bg3:#1e1e3a;--bg4:#282850;
  --text:#e0e0ff;--text2:#8888aa;--accent:#6c5ce7;--accent2:#a29bfe;
  --green:#00b894;--red:#ff6b6b;--yellow:#ffeaa7;--border:#2a2a4a;
  --radius:12px;--shadow:0 4px 24px rgba(0,0,0,0.3);
}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow:hidden}
a{color:var(--accent2);text-decoration:none}

/* Login */
.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#0f0f1a,#1a1a3e)}
.login-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:40px;width:380px;box-shadow:var(--shadow)}
.login-box h1{text-align:center;margin-bottom:8px;font-size:28px;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.login-box p{text-align:center;color:var(--text2);margin-bottom:24px;font-size:14px}
.login-box input{width:100%;padding:12px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:15px;outline:none;transition:border .2s}
.login-box input:focus{border-color:var(--accent)}
.login-box button{width:100%;padding:12px;margin-top:16px;background:linear-gradient(135deg,var(--accent),#8b5cf6);border:none;border-radius:8px;color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .2s}
.login-box button:hover{opacity:.9}
.login-box .err{color:var(--red);font-size:13px;margin-top:8px;text-align:center;min-height:20px}

/* App layout */
.app{display:flex;height:100vh}
.sidebar{width:260px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0}
.sidebar-header{padding:20px;border-bottom:1px solid var(--border)}
.sidebar-header h2{font-size:20px;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sidebar-header small{color:var(--text2);font-size:12px}
.tree{flex:1;overflow-y:auto;padding:12px}
.tree-item{padding:8px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text2);transition:all .15s}
.tree-item:hover,.tree-item.active{background:var(--bg3);color:var(--text)}
.tree-item.active{background:var(--accent);color:#fff}
.tree-item .icon{font-size:16px;width:20px;text-align:center}
.sidebar-footer{padding:16px;border-top:1px solid var(--border);font-size:12px;color:var(--text2)}
.storage-bar{height:4px;background:var(--bg4);border-radius:2px;margin-top:8px;overflow:hidden}
.storage-bar .fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:2px;width:0%;transition:width .3s}

/* Main content */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.toolbar{padding:16px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.breadcrumbs{display:flex;align-items:center;gap:4px;flex:1;min-width:0}
.breadcrumbs span{cursor:pointer;padding:4px 8px;border-radius:6px;font-size:14px;color:var(--text2);transition:all .15s;white-space:nowrap}
.breadcrumbs span:hover{background:var(--bg3);color:var(--text)}
.breadcrumbs span:last-child{color:var(--text);font-weight:600}
.breadcrumbs .sep{color:var(--text2);cursor:default;padding:0 2px}
.btn{padding:8px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;white-space:nowrap}
.btn:hover{background:var(--bg4);border-color:var(--accent)}
.btn-primary{background:var(--accent);border-color:var(--accent);color:#fff}
.btn-primary:hover{background:#7c6cf0}
.btn-danger{background:transparent;border-color:var(--red);color:var(--red)}
.btn-danger:hover{background:var(--red);color:#fff}

/* File list */
.file-area{flex:1;overflow-y:auto;padding:16px 24px}
.file-area.drag-over{background:rgba(108,92,231,0.1);outline:2px dashed var(--accent);outline-offset:-8px}
.file-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.file-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;cursor:pointer;transition:all .2s;position:relative}
.file-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:var(--shadow)}
.file-card.selected{border-color:var(--accent);background:var(--bg3)}
.file-card .icon{font-size:36px;margin-bottom:8px;display:block}
.file-card .name{font-size:13px;font-weight:500;word-break:break-all;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.file-card .meta{font-size:11px;color:var(--text2);margin-top:6px}
.file-card .actions{position:absolute;top:8px;right:8px;opacity:0;transition:opacity .15s;display:flex;gap:4px}
.file-card:hover .actions{opacity:1}
.file-card .actions button{width:28px;height:28px;border-radius:6px;border:none;background:var(--bg4);color:var(--text);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}
.file-card .actions button:hover{background:var(--accent);color:#fff}

/* Empty state */
.empty{text-align:center;padding:80px 20px;color:var(--text2)}
.empty .icon{font-size:64px;margin-bottom:16px;opacity:.5}
.empty p{font-size:15px;margin-bottom:8px}

/* Upload area */
.upload-zone{border:2px dashed var(--border);border-radius:var(--radius);padding:40px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:16px}
.upload-zone:hover,.upload-zone.active{border-color:var(--accent);background:rgba(108,92,231,0.05)}
.upload-zone .icon{font-size:40px;margin-bottom:8px}
.upload-zone p{color:var(--text2);font-size:14px}
.upload-progress{margin-top:12px;display:none}
.upload-progress .bar{height:6px;background:var(--bg4);border-radius:3px;overflow:hidden}
.upload-progress .bar .fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .2s;width:0%}
.upload-progress .text{font-size:12px;color:var(--text2);margin-top:4px}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:100}
.modal-overlay.show{display:flex}
.modal{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:24px;width:400px;max-width:90vw;box-shadow:var(--shadow)}
.modal h3{margin-bottom:16px;font-size:18px}
.modal input{width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none}
.modal input:focus{border-color:var(--accent)}
.modal .btns{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}

/* Toast */
.toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;font-size:13px;color:#fff;z-index:200;opacity:0;transform:translateY(20px);transition:all .3s;pointer-events:none}
.toast.show{opacity:1;transform:translateY(0)}
.toast.success{background:var(--green)}
.toast.error{background:var(--red)}
.toast.info{background:var(--accent)}

/* Context menu */
.ctx-menu{position:fixed;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:4px;z-index:150;box-shadow:var(--shadow);display:none;min-width:160px}
.ctx-menu.show{display:block}
.ctx-menu button{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;background:none;color:var(--text);font-size:13px;cursor:pointer;border-radius:6px;text-align:left}
.ctx-menu button:hover{background:var(--bg3)}
.ctx-menu .sep{height:1px;background:var(--border);margin:4px 0}

/* Responsive */
@media(max-width:768px){
  .sidebar{display:none}
  .app{flex-direction:column}
  .file-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
  .toolbar{padding:12px 16px}
  .file-area{padding:12px 16px}
}

/* Scrollbar */
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--accent)}

/* Hidden file input */
#fileInput{display:none}
</style>
</head>
<body>

<!-- Login Screen -->
<div id="loginScreen" class="login-wrap">
  <div class="login-box">
    <h1>📦 TeleStash</h1>
    <p>Telegram 云存储 · Powered by CF Workers</p>
    <input type="password" id="loginPwd" placeholder="输入密码" onkeydown="if(event.key==='Enter')doLogin()">
    <button onclick="doLogin()">登 录</button>
    <div class="err" id="loginErr"></div>
  </div>
</div>

<!-- App -->
<div id="appScreen" class="app" style="display:none">
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>📦 TeleStash</h2>
      <small>Telegram 云存储</small>
    </div>
    <div class="tree" id="folderTree"></div>
    <div class="sidebar-footer">
      <div id="storageInfo">加载中...</div>
      <div class="storage-bar"><div class="fill" id="storageBar"></div></div>
    </div>
  </div>

  <!-- Main -->
  <div class="main">
    <div class="toolbar">
      <div class="breadcrumbs" id="breadcrumbs"></div>
      <button class="btn" onclick="showNewFolder()">📁 新建文件夹</button>
      <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">⬆️ 上传文件</button>
      <input type="file" id="fileInput" multiple onchange="handleUpload(this.files)">
    </div>

    <div class="file-area" id="fileArea">
      <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
        <div class="icon">📤</div>
        <p>拖拽文件到这里，或点击上传</p>
        <div class="upload-progress" id="uploadProgress">
          <div class="bar"><div class="fill" id="uploadBar"></div></div>
          <div class="text" id="uploadText"></div>
        </div>
      </div>
      <div class="file-grid" id="fileGrid"></div>
    </div>
  </div>
</div>

<!-- New Folder Modal -->
<div class="modal-overlay" id="folderModal">
  <div class="modal">
    <h3>📁 新建文件夹</h3>
    <input type="text" id="folderName" placeholder="文件夹名称" onkeydown="if(event.key==='Enter')createFolder()">
    <div class="btns">
      <button class="btn" onclick="closeModal('folderModal')">取消</button>
      <button class="btn btn-primary" onclick="createFolder()">创建</button>
    </div>
  </div>
</div>

<!-- Context Menu -->
<div class="ctx-menu" id="ctxMenu">
  <button onclick="ctxAction('download')">⬇️ 下载</button>
  <button onclick="ctxAction('rename')">✏️ 重命名</button>
  <div class="sep"></div>
  <button onclick="ctxAction('delete')" style="color:var(--red)">🗑️ 删除</button>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
const API = '';
let currentPath = '/';
let ctxTarget = null;

// ===== Auth =====
async function doLogin() {
  const pwd = document.getElementById('loginPwd').value;
  const errEl = document.getElementById('loginErr');
  try {
    const r = await fetch(API + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    });
    const d = await r.json();
    if (d.ok) {
      sessionStorage.setItem('token', d.token);
      showApp();
    } else {
      errEl.textContent = d.error || '密码错误';
    }
  } catch (e) {
    errEl.textContent = '连接失败';
  }
}

async function apiFetch(path, opts = {}) {
  const token = sessionStorage.getItem('token');
  const headers = { ...opts.headers, 'Authorization': 'Bearer ' + token };
  const r = await fetch(API + path, { ...opts, headers });
  if (r.status === 401) {
    sessionStorage.removeItem('token');
    location.reload();
    return;
  }
  return r;
}

// ===== App Init =====
async function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'flex';
  await loadFiles();
}

// ===== File Operations =====
async function loadFiles() {
  try {
    const r = await apiFetch('/api/files?path=' + encodeURIComponent(currentPath));
    if (!r) return;
    const d = await r.json();
    renderBreadcrumbs();
    renderTree(d.tree || []);
    renderFiles(d.items || []);
    renderStorage(d.stats || {});
  } catch (e) {
    toast('加载失败: ' + e.message, 'error');
  }
}

function renderBreadcrumbs() {
  const el = document.getElementById('breadcrumbs');
  const parts = currentPath.split('/').filter(Boolean);
  let html = '<span onclick="navigate(\'/\')">🏠 根目录</span>';
  let path = '/';
  for (const part of parts) {
    path += (path === '/' ? '' : '/') + part;
    const p = path;
    html += '<span class="sep">/</span>';
    html += '<span onclick="navigate(\\''+p+'\\')">' + esc(part) + '</span>';
  }
  el.innerHTML = html;
}

function renderTree(tree) {
  const el = document.getElementById('folderTree');
  let html = '<div class="tree-item ' + (currentPath === '/' ? 'active' : '') + '" onclick="navigate(\'/\')"><span class="icon">🏠</span>根目录</div>';
  for (const folder of tree) {
    const isActive = currentPath === folder.path;
    html += '<div class="tree-item ' + (isActive ? 'active' : '') + '" onclick="navigate(\\''+esc(folder.path)+'\\')">';
    html += '<span class="icon">📁</span>' + esc(folder.name);
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderFiles(items) {
  const el = document.getElementById('fileGrid');
  if (items.length === 0) {
    el.innerHTML = '<div class="empty"><div class="icon">📂</div><p>这里还没有文件</p><p style="font-size:13px">拖拽文件到上方区域开始上传</p></div>';
    return;
  }
  let html = '';
  for (const item of items) {
    const icon = item.is_dir ? '📁' : getFileIcon(item.name);
    const meta = item.is_dir ? '文件夹' : formatSize(item.size);
    html += '<div class="file-card" data-path="' + esc(item.path) + '" data-isdir="' + item.is_dir + '" onclick="onCardClick(event, this)" oncontextmenu="onCtxMenu(event, this)">';
    html += '<span class="icon">' + icon + '</span>';
    html += '<div class="name">' + esc(item.name) + '</div>';
    html += '<div class="meta">' + meta + '</div>';
    if (!item.is_dir) {
      html += '<div class="actions">';
      html += '<button onclick="event.stopPropagation();downloadFile(\\''+esc(item.path)+'\\')" title="下载">⬇️</button>';
      html += '<button onclick="event.stopPropagation();deleteFile(\\''+esc(item.path)+'\\')" title="删除">🗑️</button>';
      html += '</div>';
    }
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderStorage(stats) {
  const info = document.getElementById('storageInfo');
  const bar = document.getElementById('storageBar');
  const count = stats.totalFiles || 0;
  const size = formatSize(stats.totalSize || 0);
  info.textContent = count + ' 个文件 · ' + size;
  bar.style.width = '0%';
}

function navigate(path) {
  currentPath = path;
  loadFiles();
}

function onCardClick(e, el) {
  const path = el.dataset.path;
  const isDir = el.dataset.isdir === 'true';
  if (isDir) {
    navigate(path);
  } else {
    downloadFile(path);
  }
}

// ===== Upload =====
const fileArea = document.getElementById('fileArea');
const uploadZone = document.getElementById('uploadZone');

fileArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('active');
  fileArea.classList.add('drag-over');
});
fileArea.addEventListener('dragleave', e => {
  uploadZone.classList.remove('active');
  fileArea.classList.remove('drag-over');
});
fileArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('active');
  fileArea.classList.remove('drag-over');
  if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
});

async function handleUpload(files) {
  const progress = document.getElementById('uploadProgress');
  const bar = document.getElementById('uploadBar');
  const text = document.getElementById('uploadText');
  progress.style.display = 'block';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    text.textContent = '上传中 (' + (i+1) + '/' + files.length + '): ' + file.name;
    bar.style.width = '0%';

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('path', currentPath);

      const r = await apiFetch('/api/upload', {
        method: 'POST',
        body: form
      });
      if (!r) return;
      const d = await r.json();
      if (d.ok) {
        bar.style.width = '100%';
      } else {
        toast('上传失败: ' + (d.error || '未知错误'), 'error');
      }
    } catch (e) {
      toast('上传失败: ' + e.message, 'error');
    }
  }

  text.textContent = '上传完成！';
  setTimeout(() => {
    progress.style.display = 'none';
    loadFiles();
    document.getElementById('fileInput').value = '';
  }, 1000);
}

// ===== Download =====
async function downloadFile(path) {
  const token = sessionStorage.getItem('token');
  const url = API + '/api/download?path=' + encodeURIComponent(path) + '&token=' + token;
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ===== Delete =====
async function deleteFile(path) {
  if (!confirm('确定删除 "' + path.split('/').pop() + '"？')) return;
  try {
    const r = await apiFetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    if (!r) return;
    const d = await r.json();
    if (d.ok) {
      toast('已删除', 'success');
      loadFiles();
    } else {
      toast('删除失败: ' + (d.error || ''), 'error');
    }
  } catch (e) {
    toast('删除失败: ' + e.message, 'error');
  }
}

// ===== New Folder =====
function showNewFolder() {
  document.getElementById('folderName').value = '';
  document.getElementById('folderModal').classList.add('show');
  document.getElementById('folderName').focus();
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}
async function createFolder() {
  const name = document.getElementById('folderName').value.trim();
  if (!name) return;
  try {
    const r = await apiFetch('/api/mkdir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: currentPath, name })
    });
    if (!r) return;
    const d = await r.json();
    if (d.ok) {
      toast('文件夹已创建', 'success');
      closeModal('folderModal');
      loadFiles();
    } else {
      toast('创建失败: ' + (d.error || ''), 'error');
    }
  } catch (e) {
    toast('创建失败: ' + e.message, 'error');
  }
}

// ===== Context Menu =====
function onCtxMenu(e, el) {
  e.preventDefault();
  ctxTarget = el.dataset.path;
  const menu = document.getElementById('ctxMenu');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.classList.add('show');
}
document.addEventListener('click', () => {
  document.getElementById('ctxMenu').classList.remove('show');
});
async function ctxAction(action) {
  if (!ctxTarget) return;
  if (action === 'download') downloadFile(ctxTarget);
  else if (action === 'delete') deleteFile(ctxTarget);
  else if (action === 'rename') {
    const oldName = ctxTarget.split('/').pop();
    const newName = prompt('重命名', oldName);
    if (newName && newName !== oldName) {
      try {
        const r = await apiFetch('/api/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: ctxTarget, newName })
        });
        if (!r) return;
        const d = await r.json();
        if (d.ok) { toast('已重命名', 'success'); loadFiles(); }
        else toast('重命名失败', 'error');
      } catch (e) { toast('重命名失败', 'error'); }
    }
  }
}

// ===== Helpers =====
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function formatSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b/1048576).toFixed(1) + ' MB';
  return (b/1073741824).toFixed(2) + ' GB';
}
function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    jpg:'🖼️',jpeg:'🖼️',png:'🖼️',gif:'🖼️',webp:'🖼️',svg:'🖼️',bmp:'🖼️',
    mp4:'🎬',mkv:'🎬',avi:'🎬',mov:'🎬',wmv:'🎬',flv:'🎬',
    mp3:'🎵',wav:'🎵',flac:'🎵',aac:'🎵',ogg:'🎵',m4a:'🎵',
    pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',ppt:'📽️',pptx:'📽️',
    txt:'📄',md:'📄',json:'📋',xml:'📋',csv:'📊',
    zip:'📦',rar:'📦',7z:'📦',tar:'📦',gz:'📦',
    exe:'⚙️',dmg:'💿',iso:'💿',apk:'📱',
    js:'💻',ts:'💻',py:'💻',go:'💻',rs:'💻',java:'💻',cpp:'💻',c:'💻',html:'💻',css:'💻',
  };
  return map[ext] || '📄';
}
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  setTimeout(() => el.className = 'toast', 3000);
}

// ===== Init =====
(async () => {
  const token = sessionStorage.getItem('token');
  if (token) {
    try {
      const r = await fetch(API + '/api/auth/check', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (r.ok) { showApp(); return; }
    } catch(e) {}
  }
})();
</script>
</body>
</html>`;

// ===== Telegram API Helpers =====
function tgApi(token, method, body) {
  return fetch('https://api.telegram.org/bot' + token + '/' + method, {
    method: 'POST',
    headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
}

// ===== JWT Helpers (simple HMAC) =====
async function createToken(password, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const payload = btoa(JSON.stringify({ sub: 'admin', iat: Date.now() })).replace(/=/g, '');
  const data = header + '.' + payload;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return data + '.' + signature;
}

async function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const data = parts[0] + '.' + parts[1];
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigStr = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const sig = Uint8Array.from(atob(sigStr), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data));
  } catch { return false; }
}

// ===== KV Helpers =====
async function getDir(kv, path) {
  const data = await kv.get('dir:' + path, 'json');
  return data || { items: [] };
}

async function saveDir(kv, path, dir) {
  await kv.put('dir:' + path, JSON.stringify(dir));
}

function getParentPath(path) {
  if (path === '/') return null;
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

function getFileName(path) {
  return path.split('/').filter(Boolean).pop() || '';
}

async function addToParent(kv, parentPath, item) {
  const dir = await getDir(kv, parentPath);
  const exists = dir.items.find(i => i.name === item.name);
  if (!exists) dir.items.push(item);
  await saveDir(kv, parentPath, dir);
}

async function removeFromParent(kv, parentPath, name) {
  const dir = await getDir(kv, parentPath);
  dir.items = dir.items.filter(i => i.name !== name);
  await saveDir(kv, parentPath, dir);
}

// ===== Main Worker =====
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const token = env.TELEGRAM_BOT_TOKEN;
    const channelId = env.TELEGRAM_CHANNEL_ID;
    const adminPwd = env.ADMIN_PASSWORD || 'admin';
    const secret = token + channelId;

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        }
      });
    }

    const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

    try {
      // ===== HTML =====
      if (path === '/' || path === '') {
        return new Response(HTML_CONTENT, {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
        });
      }

      // ===== Login =====
      if (path === '/api/login' && request.method === 'POST') {
        const body = await request.json();
        if (body.password === adminPwd) {
          const t = await createToken(adminPwd, secret);
          return json({ ok: true, token: t }, corsHeaders);
        }
        return json({ ok: false, error: '密码错误' }, corsHeaders, 401);
      }

      // ===== Auth check =====
      if (path === '/api/auth/check') {
        const ok = await checkAuth(request, secret);
        return json({ ok }, corsHeaders, ok ? 200 : 401);
      }

      // ===== All other API routes require auth =====
      const isDownload = path === '/api/download';
      if (isDownload) {
        // Download uses query param token
        const urlToken = url.searchParams.get('token');
        if (!urlToken || !(await verifyToken(urlToken, secret))) {
          return json({ error: '未授权' }, corsHeaders, 401);
        }
      } else if (path.startsWith('/api/')) {
        if (!(await checkAuth(request, secret))) {
          return json({ error: '未授权' }, corsHeaders, 401);
        }
      }

      // ===== List files =====
      if (path === '/api/files' && request.method === 'GET') {
        const dirPath = url.searchParams.get('path') || '/';
        const dir = await getDir(env.KV, dirPath);

        // Build tree (all folders)
        const tree = await buildTree(env.KV);

        // Stats
        const stats = await getStats(env.KV);

        return json({ items: dir.items, tree, stats }, corsHeaders);
      }

      // ===== Upload =====
      if (path === '/api/upload' && request.method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file');
        const dirPath = formData.get('path') || '/';

        if (!file || !file.name) {
          return json({ ok: false, error: '没有文件' }, corsHeaders, 400);
        }

        // Upload to Telegram
        const tgForm = new FormData();
        tgForm.append('chat_id', channelId);
        tgForm.append('document', file, file.name);
        tgForm.append('caption', dirPath === '/' ? '/' + file.name : dirPath + '/' + file.name);

        const tgResp = await tgApi(token, 'sendDocument', tgForm);
        const tgData = await tgResp.json();

        if (!tgData.ok) {
          return json({ ok: false, error: 'Telegram 上传失败: ' + (tgData.description || '') }, corsHeaders, 500);
        }

        // Get file_id
        const doc = tgData.result.document;
        const fileId = doc.file_id;
        const fileSize = doc.file_size || file.size;
        const msgId = tgData.result.message_id;

        // Save to KV
        const item = {
          name: file.name,
          path: dirPath === '/' ? '/' + file.name : dirPath + '/' + file.name,
          file_id: fileId,
          msg_id: msgId,
          size: fileSize,
          date: Date.now(),
          is_dir: false
        };

        await addToParent(env.KV, dirPath, item);

        return json({ ok: true, item }, corsHeaders);
      }

      // ===== Download =====
      if (isDownload && request.method === 'GET') {
        const filePath = url.searchParams.get('path');
        if (!filePath) return json({ error: '缺少路径' }, corsHeaders, 400);

        // Find file in KV
        const parentPath = getParentPath(filePath);
        const dir = await getDir(env.KV, parentPath || '/');
        const item = dir.items.find(i => i.path === filePath && !i.is_dir);

        if (!item) return json({ error: '文件不存在' }, corsHeaders, 404);

        // Get file path from Telegram
        const fileInfoResp = await tgApi(token, 'getFile', { file_id: item.file_id });
        const fileInfo = await fileInfoResp.json();

        if (!fileInfo.ok) {
          return json({ error: '获取文件失败' }, corsHeaders, 500);
        }

        const fileUrl = 'https://api.telegram.org/file/bot' + token + '/' + fileInfo.result.file_path;
        const fileName = item.name;

        // Proxy the file
        const fileResp = await fetch(fileUrl);
        return new Response(fileResp.body, {
          headers: {
            'Content-Type': fileResp.headers.get('Content-Type') || 'application/octet-stream',
            'Content-Disposition': 'attachment; filename="' + encodeURIComponent(fileName) + '"',
            'Content-Length': fileResp.headers.get('Content-Length'),
            ...corsHeaders
          }
        });
      }

      // ===== Delete =====
      if (path === '/api/delete' && request.method === 'POST') {
        const body = await request.json();
        const filePath = body.path;
        if (!filePath) return json({ error: '缺少路径' }, corsHeaders, 400);

        const parentPath = getParentPath(filePath);
        const dir = await getDir(env.KV, parentPath || '/');
        const item = dir.items.find(i => i.path === filePath);

        if (!item) return json({ error: '文件不存在' }, corsHeaders, 404);

        if (item.is_dir) {
          // Delete folder and all contents recursively
          await deleteRecursive(env.KV, filePath);
        } else {
          // Delete message from Telegram channel
          try {
            await tgApi(token, 'deleteMessage', {
              chat_id: channelId,
              message_id: item.msg_id
            });
          } catch (e) { /* ignore if fails */ }
        }

        // Remove from parent
        await removeFromParent(env.KV, parentPath || '/', item.name);

        return json({ ok: true }, corsHeaders);
      }

      // ===== Rename =====
      if (path === '/api/rename' && request.method === 'POST') {
        const body = await request.json();
        const oldPath = body.path;
        const newName = body.newName;
        if (!oldPath || !newName) return json({ error: '参数不全' }, corsHeaders, 400);

        const parentPath = getParentPath(oldPath);
        const dir = await getDir(env.KV, parentPath || '/');
        const item = dir.items.find(i => i.path === oldPath);
        if (!item) return json({ error: '不存在' }, corsHeaders, 404);

        const oldName = item.name;
        item.name = newName;
        const newPath = parentPath === '/' ? '/' + newName : parentPath + '/' + newName;
        item.path = newPath;

        // Update parent dir
        const idx = dir.items.findIndex(i => i.name === oldName);
        if (idx >= 0) dir.items[idx] = item;
        await saveDir(env.KV, parentPath || '/', dir);

        // If directory, update all children paths
        if (item.is_dir) {
          await updateChildPaths(env.KV, oldPath, newPath);
        }

        return json({ ok: true }, corsHeaders);
      }

      // ===== Mkdir =====
      if (path === '/api/mkdir' && request.method === 'POST') {
        const body = await request.json();
        const parentPath = body.path || '/';
        const folderName = body.name;
        if (!folderName) return json({ error: '缺少名称' }, corsHeaders, 400);

        const folderPath = parentPath === '/' ? '/' + folderName : parentPath + '/' + folderName;

        // Check if exists
        const dir = await getDir(env.KV, parentPath);
        if (dir.items.find(i => i.name === folderName)) {
          return json({ ok: false, error: '已存在同名文件夹' }, corsHeaders, 400);
        }

        const item = {
          name: folderName,
          path: folderPath,
          is_dir: true,
          date: Date.now()
        };

        await addToParent(env.KV, parentPath, item);
        await saveDir(env.KV, folderPath, { items: [] });

        return json({ ok: true, item }, corsHeaders);
      }

      // ===== 404 =====
      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (e) {
      return json({ error: e.message || 'Internal Error' }, corsHeaders, 500);
    }
  }
};

// ===== Auth Helper =====
async function checkAuth(request, secret) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  return verifyToken(auth.slice(7), secret);
}

// ===== JSON Response =====
function json(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

// ===== Build folder tree =====
async function buildTree(kv) {
  const tree = [];
  const rootDir = await getDir(kv, '/');
  for (const item of rootDir.items) {
    if (item.is_dir) {
      tree.push({ name: item.name, path: item.path });
    }
  }
  return tree;
}

// ===== Get stats =====
async function getStats(kv) {
  const rootDir = await getDir(kv, '/');
  let totalFiles = 0;
  let totalSize = 0;

  async function countDir(dirPath) {
    const dir = await getDir(kv, dirPath);
    for (const item of dir.items) {
      if (item.is_dir) {
        await countDir(item.path);
      } else {
        totalFiles++;
        totalSize += item.size || 0;
      }
    }
  }

  await countDir('/');
  return { totalFiles, totalSize };
}

// ===== Delete recursive =====
async function deleteRecursive(kv, dirPath) {
  const dir = await getDir(kv, dirPath);
  for (const item of dir.items) {
    if (item.is_dir) {
      await deleteRecursive(kv, item.path);
    }
    // Note: we don't delete individual file messages here for performance
    // The parent delete will handle the directory message if any
  }
  await kv.delete('dir:' + dirPath);
}

// ===== Update child paths on rename =====
async function updateChildPaths(kv, oldPath, newPath) {
  const dir = await getDir(kv, oldPath);
  for (const item of dir.items) {
    const newChildPath = newPath + '/' + item.name;
    const oldChildPath = oldPath + '/' + item.name;
    item.path = newChildPath;
    if (item.is_dir) {
      await updateChildPaths(kv, oldChildPath, newChildPath);
      await saveDir(kv, newChildPath, await getDir(kv, oldChildPath));
      await kv.delete('dir:' + oldChildPath);
    }
  }
  await saveDir(kv, newPath, dir);
}
