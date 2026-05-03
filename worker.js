// TeleStash - Telegram Cloud Drive with WebDAV, S3, OPDS
// Powered by Cloudflare Workers

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
.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#0f0f1a,#1a1a3e)}
.login-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:40px;width:380px;box-shadow:var(--shadow)}
.login-box h1{text-align:center;margin-bottom:8px;font-size:28px;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.login-box p{text-align:center;color:var(--text2);margin-bottom:24px;font-size:14px}
.login-box input{width:100%;padding:12px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:15px;outline:none;transition:border .2s}
.login-box input:focus{border-color:var(--accent)}
.login-box button{width:100%;padding:12px;margin-top:16px;background:linear-gradient(135deg,var(--accent),#8b5cf6);border:none;border-radius:8px;color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .2s}
.login-box button:hover{opacity:.9}
.login-box .err{color:var(--red);font-size:13px;margin-top:8px;text-align:center;min-height:20px}
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
.sidebar-nav{padding:8px 12px;border-top:1px solid var(--border)}
.sidebar-nav a{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;font-size:13px;color:var(--text2);transition:all .15s}
.sidebar-nav a:hover{background:var(--bg3);color:var(--text)}
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
.file-area{flex:1;overflow-y:auto;padding:16px 24px}
.file-area.drag-over{background:rgba(108,92,231,0.1);outline:2px dashed var(--accent);outline-offset:-8px}
.file-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.file-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;cursor:pointer;transition:all .2s;position:relative}
.file-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:var(--shadow)}
.file-card .icon{font-size:36px;margin-bottom:8px;display:block}
.file-card .name{font-size:13px;font-weight:500;word-break:break-all;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.file-card .meta{font-size:11px;color:var(--text2);margin-top:6px}
.file-card .actions{position:absolute;top:8px;right:8px;opacity:0;transition:opacity .15s;display:flex;gap:4px}
.file-card:hover .actions{opacity:1}
.file-card .actions button{width:28px;height:28px;border-radius:6px;border:none;background:var(--bg4);color:var(--text);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}
.file-card .actions button:hover{background:var(--accent);color:#fff}
.empty{text-align:center;padding:80px 20px;color:var(--text2)}
.empty .icon{font-size:64px;margin-bottom:16px;opacity:.5}
.upload-zone{border:2px dashed var(--border);border-radius:var(--radius);padding:40px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:16px}
.upload-zone:hover,.upload-zone.active{border-color:var(--accent);background:rgba(108,92,231,0.05)}
.upload-progress{margin-top:12px;display:none}
.upload-progress .bar{height:6px;background:var(--bg4);border-radius:3px;overflow:hidden}
.upload-progress .bar .fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .2s;width:0%}
.upload-progress .text{font-size:12px;color:var(--text2);margin-top:4px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:100}
.modal-overlay.show{display:flex}
.modal{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:24px;width:400px;max-width:90vw;box-shadow:var(--shadow)}
.modal h3{margin-bottom:16px;font-size:18px}
.modal input{width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none}
.modal input:focus{border-color:var(--accent)}
.modal .btns{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
.toast{position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;font-size:13px;color:#fff;z-index:200;opacity:0;transform:translateY(20px);transition:all .3s;pointer-events:none}
.toast.show{opacity:1;transform:translateY(0)}
.toast.success{background:var(--green)}.toast.error{background:var(--red)}.toast.info{background:var(--accent)}
.ctx-menu{position:fixed;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:4px;z-index:150;box-shadow:var(--shadow);display:none;min-width:160px}
.ctx-menu.show{display:block}
.ctx-menu button{display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;background:none;color:var(--text);font-size:13px;cursor:pointer;border-radius:6px;text-align:left}
.ctx-menu button:hover{background:var(--bg3)}
.ctx-menu .sep{height:1px;background:var(--border);margin:4px 0}

/* Settings panel */
.settings-panel{display:none;padding:24px;overflow-y:auto;flex:1}
.settings-panel.show{display:block}
.settings-section{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px}
.settings-section h3{margin-bottom:12px;font-size:16px;color:var(--accent2)}
.settings-section .info{font-size:13px;color:var(--text2);line-height:1.8}
.settings-section code{background:var(--bg3);padding:2px 8px;border-radius:4px;font-size:12px;color:var(--yellow);font-family:'Courier New',monospace}
.settings-section .copy-btn{margin-left:8px;padding:2px 8px;border-radius:4px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:11px;cursor:pointer}
.settings-section .copy-btn:hover{background:var(--accent)}

@media(max-width:768px){
  .sidebar{display:none}
  .file-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
  .toolbar{padding:12px 16px}
  .file-area{padding:12px 16px}
}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--accent)}
#fileInput{display:none}
</style>
</head>
<body>
<div id="loginScreen" class="login-wrap">
  <div class="login-box">
    <h1>📦 TeleStash</h1>
    <p>Telegram 无限云存储 · WebDAV / S3 / OPDS</p>
    <input type="password" id="loginPwd" placeholder="输入密码" onkeydown="if(event.key==='Enter')doLogin()">
    <button onclick="doLogin()">登 录</button>
    <div class="err" id="loginErr"></div>
  </div>
</div>

<div id="appScreen" class="app" style="display:none">
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>📦 TeleStash</h2>
      <small>Telegram 无限云存储</small>
    </div>
    <div class="tree" id="folderTree"></div>
    <div class="sidebar-nav">
      <a onclick="showSettings()">⚙️ 接入设置 (WebDAV/S3/OPDS)</a>
    </div>
    <div class="sidebar-footer">
      <div id="storageInfo">加载中...</div>
      <div class="storage-bar"><div class="fill" id="storageBar"></div></div>
    </div>
  </div>

  <div class="main">
    <div class="toolbar" id="mainToolbar">
      <div class="breadcrumbs" id="breadcrumbs"></div>
      <button class="btn" onclick="showNewFolder()">📁 新建文件夹</button>
      <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">⬆️ 上传文件</button>
      <input type="file" id="fileInput" multiple onchange="handleUpload(this.files)">
    </div>

    <!-- File browser -->
    <div class="file-area" id="fileArea">
      <div class="upload-zone" id="uploadZone" onclick="document.getElementById('fileInput').click()">
        <div class="icon">📤</div>
        <p>拖拽文件到这里，或点击上传（最大 50MB）</p>
        <div class="upload-progress" id="uploadProgress">
          <div class="bar"><div class="fill" id="uploadBar"></div></div>
          <div class="text" id="uploadText"></div>
        </div>
      </div>
      <div class="file-grid" id="fileGrid"></div>
    </div>

    <!-- Settings panel -->
    <div class="settings-panel" id="settingsPanel">
      <div class="settings-section">
        <h3>📡 WebDAV 接入</h3>
        <div class="info" id="webdavInfo">加载中...</div>
      </div>
      <div class="settings-section">
        <h3>🪣 S3 兼容 API</h3>
        <div class="info" id="s3Info">加载中...</div>
      </div>
      <div class="settings-section">
        <h3>📖 OPDS 电子书目录</h3>
        <div class="info" id="opdsInfo">加载中...</div>
      </div>
      <div class="settings-section">
        <h3>🔑 认证信息</h3>
        <div class="info" id="authInfo">加载中...</div>
      </div>
    </div>
  </div>
</div>

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

<div class="ctx-menu" id="ctxMenu">
  <button onclick="ctxAction('download')">⬇️ 下载</button>
  <button onclick="ctxAction('rename')">✏️ 重命名</button>
  <div class="sep"></div>
  <button onclick="ctxAction('delete')" style="color:var(--red)">🗑️ 删除</button>
</div>

<div class="toast" id="toast"></div>

<script>
const API='';
let currentPath='/';
let ctxTarget=null;

async function doLogin(){
  const pwd=document.getElementById('loginPwd').value;
  const errEl=document.getElementById('loginErr');
  const btn=document.querySelector('.login-box button');
  if(!pwd){errEl.textContent='请输入密码';return;}
  btn.textContent='登录中...';btn.disabled=true;errEl.textContent='';
  try{
    const r=await fetch(API+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pwd})});
    if(!r.ok){const d=await r.json().catch(()=>({}));errEl.textContent=d.error||'服务器错误 ('+r.status+')';btn.textContent='登 录';btn.disabled=false;return;}
    const d=await r.json();
    if(d.ok){sessionStorage.setItem('token',d.token);await showApp();}
    else{errEl.textContent=d.error||'密码错误';}
  }catch(e){errEl.textContent='连接失败: '+e.message;}
  btn.textContent='登 录';btn.disabled=false;
}

async function apiFetch(path,opts={}){
  const token=sessionStorage.getItem('token');
  const headers={...opts.headers,'Authorization':'Bearer '+token};
  const r=await fetch(API+path,{...opts,headers});
  if(r.status===401){sessionStorage.removeItem('token');location.reload();return;}
  return r;
}

async function showApp(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appScreen').style.display='flex';
  try{
    await loadFiles();
  }catch(e){
    document.getElementById('fileGrid').innerHTML='<div class="empty"><div class="icon">⚠️</div><p>加载失败</p><p style="font-size:13px;color:var(--red)">'+esc(e.message)+'</p><p style="font-size:13px;margin-top:12px">请检查 KV 绑定是否正确配置</p></div>';
  }
}

async function loadFiles(){
  const r=await apiFetch('/api/files?path='+encodeURIComponent(currentPath));
  if(!r)throw new Error('未登录或会话过期');
  if(!r.ok){
    const d=await r.json().catch(()=>({}));
    throw new Error(d.error||'服务器错误 ('+r.status+')');
  }
  const d=await r.json();
  renderBreadcrumbs();renderTree(d.tree||[]);renderFiles(d.items||[]);renderStorage(d.stats||{});
}

function renderBreadcrumbs(){
  const el=document.getElementById('breadcrumbs');
  const parts=currentPath.split('/').filter(Boolean);
  let html='<span onclick="navigate(\\'/\\')">🏠 根目录</span>';
  let path='/';
  for(const part of parts){path+=(path==='/'?'':'/')+part;const p=path;html+='<span class="sep">/</span><span onclick="navigate(\\''+p+'\\')">'+esc(part)+'</span>';}
  el.innerHTML=html;
}

function renderTree(tree){
  const el=document.getElementById('folderTree');
  let html='<div class="tree-item '+(currentPath==='/'?'active':'')+'" onclick="navigate(\\'/\\')"><span class="icon">🏠</span>根目录</div>';
  for(const f of tree){html+='<div class="tree-item '+(currentPath===f.path?'active':'')+'" onclick="navigate(\\''+esc(f.path)+'\\')"><span class="icon">📁</span>'+esc(f.name)+'</div>';}
  el.innerHTML=html;
}

function renderFiles(items){
  const el=document.getElementById('fileGrid');
  if(items.length===0){el.innerHTML='<div class="empty"><div class="icon">📂</div><p>这里还没有文件</p><p style="font-size:13px">拖拽文件到上方区域开始上传</p></div>';return;}
  let html='';
  for(const item of items){
    const icon=item.is_dir?'📁':getFileIcon(item.name);
    const meta=item.is_dir?'文件夹':formatSize(item.size);
    html+='<div class="file-card" data-path="'+esc(item.path)+'" data-isdir="'+item.is_dir+'" onclick="onCardClick(event,this)" oncontextmenu="onCtxMenu(event,this)">';
    html+='<span class="icon">'+icon+'</span><div class="name">'+esc(item.name)+'</div><div class="meta">'+meta+'</div>';
    if(!item.is_dir){html+='<div class="actions"><button onclick="event.stopPropagation();downloadFile(\\''+esc(item.path)+'\\')" title="下载">⬇️</button><button onclick="event.stopPropagation();deleteFile(\\''+esc(item.path)+'\\')" title="删除">🗑️</button></div>';}
    html+='</div>';
  }
  el.innerHTML=html;
}

function renderStorage(stats){
  document.getElementById('storageInfo').textContent=(stats.totalFiles||0)+' 个文件 · '+formatSize(stats.totalSize||0);
}

function navigate(path){currentPath=path;hideSettings();loadFiles();}
function onCardClick(e,el){if(el.dataset.isdir==='true')navigate(el.dataset.path);else downloadFile(el.dataset.path);}

const fileArea=document.getElementById('fileArea');
const uploadZone=document.getElementById('uploadZone');
fileArea.addEventListener('dragover',e=>{e.preventDefault();uploadZone.classList.add('active');fileArea.classList.add('drag-over');});
fileArea.addEventListener('dragleave',()=>{uploadZone.classList.remove('active');fileArea.classList.remove('drag-over');});
fileArea.addEventListener('drop',e=>{e.preventDefault();uploadZone.classList.remove('active');fileArea.classList.remove('drag-over');if(e.dataTransfer.files.length)handleUpload(e.dataTransfer.files);});

async function handleUpload(files){
  const progress=document.getElementById('uploadProgress');
  const bar=document.getElementById('uploadBar');
  const text=document.getElementById('uploadText');
  progress.style.display='block';
  for(let i=0;i<files.length;i++){
    const file=files[i];
    text.textContent='上传中 ('+(i+1)+'/'+files.length+'): '+file.name;
    bar.style.width='0%';
    try{
      const form=new FormData();form.append('file',file);form.append('path',currentPath);
      const r=await apiFetch('/api/upload',{method:'POST',body:form});
      if(!r)return;const d=await r.json();
      if(d.ok)bar.style.width='100%';else toast('上传失败: '+(d.error||''),'error');
    }catch(e){toast('上传失败: '+e.message,'error');}
  }
  text.textContent='上传完成！';
  setTimeout(()=>{progress.style.display='none';loadFiles();document.getElementById('fileInput').value='';},1000);
}

async function downloadFile(path){
  const token=sessionStorage.getItem('token');
  const a=document.createElement('a');a.href=API+'/api/download?path='+encodeURIComponent(path)+'&token='+token;a.download='';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
}

async function deleteFile(path){
  if(!confirm('确定删除 "'+path.split('/').pop()+'"？'))return;
  try{
    const r=await apiFetch('/api/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path})});
    if(!r)return;const d=await r.json();
    if(d.ok){toast('已删除','success');loadFiles();}else toast('删除失败','error');
  }catch(e){toast('删除失败','error');}
}

function showNewFolder(){document.getElementById('folderName').value='';document.getElementById('folderModal').classList.add('show');document.getElementById('folderName').focus();}
function closeModal(id){document.getElementById(id).classList.remove('show');}
async function createFolder(){
  const name=document.getElementById('folderName').value.trim();if(!name)return;
  try{
    const r=await apiFetch('/api/mkdir',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:currentPath,name})});
    if(!r)return;const d=await r.json();
    if(d.ok){toast('文件夹已创建','success');closeModal('folderModal');loadFiles();}else toast('创建失败','error');
  }catch(e){toast('创建失败','error');}
}

function onCtxMenu(e,el){e.preventDefault();ctxTarget=el.dataset.path;const menu=document.getElementById('ctxMenu');menu.style.left=e.clientX+'px';menu.style.top=e.clientY+'px';menu.classList.add('show');}
document.addEventListener('click',()=>document.getElementById('ctxMenu').classList.remove('show'));
async function ctxAction(action){
  if(!ctxTarget)return;
  if(action==='download')downloadFile(ctxTarget);
  else if(action==='delete')deleteFile(ctxTarget);
  else if(action==='rename'){
    const oldName=ctxTarget.split('/').pop();const newName=prompt('重命名',oldName);
    if(newName&&newName!==oldName){
      try{const r=await apiFetch('/api/rename',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:ctxTarget,newName})});
      if(!r)return;const d=await r.json();if(d.ok){toast('已重命名','success');loadFiles();}else toast('重命名失败','error');}catch(e){toast('重命名失败','error');}
    }
  }
}

function showSettings(){
  document.getElementById('fileArea').style.display='none';
  document.getElementById('settingsPanel').classList.add('show');
  const base=location.origin;
  document.getElementById('webdavInfo').innerHTML=
    'Endpoint: <code>'+base+'/dav/</code> <button class="copy-btn" onclick="copyText(\\''+base+'/dav/\\')">复制</button><br>'+
    '认证: Basic Auth（用户名任意，密码为管理员密码）<br><br>'+
    '<b>支持的客户端：</b><br>'+
    '• macOS Finder → 前往 → 连接服务器<br>'+
    '• Windows → 映射网络驱动器<br>'+
    '• iOS 文件 App → 连接服务器<br>'+
    '• Solid Explorer / ES文件浏览器（Android）<br>'+
    '• Cyberduck / Mountain Duck<br>'+
    '• rclone（配置 WebDAV remote）';
  document.getElementById('s3Info').innerHTML=
    'Endpoint: <code>'+base+'</code> <button class="copy-btn" onclick="copyText(\\''+base+'\\')">复制</button><br>'+
    'Region: <code>us-east-1</code><br>'+
    'Access Key: 在管理后台生成<br><br>'+
    '<b>使用方式：</b><br>'+
    '<code>aws configure</code> → 输入 Access Key / Secret Key<br>'+
    '<code>aws --endpoint-url '+base+' s3 ls</code><br>'+
    '<code>rclone config</code> → type=s3 → provider=Other';
  document.getElementById('opdsInfo').innerHTML=
    'Endpoint: <code>'+base+'/opds</code> <button class="copy-btn" onclick="copyText(\\''+base+'/opds\\')">复制</button><br>'+
    '认证: Basic Auth<br><br>'+
    '<b>支持的阅读器：</b><br>'+
    '• Reeden（iOS/Android）<br>'+
    '• KyBook（iOS）<br>'+
    '• Moon+ Reader（Android）<br>'+
    '• 任何标准 OPDS 阅读器';
  document.getElementById('authInfo').innerHTML=
    '<b>S3 Access Key 管理</b><br><br>'+
    '<div id="s3KeysList">加载中...</div>'+
    '<button class="btn btn-primary" style="margin-top:12px" onclick="createS3Key()">🔑 生成新密钥对</button>';
  loadS3Keys();
}

function hideSettings(){
  document.getElementById('settingsPanel').classList.remove('show');
  document.getElementById('fileArea').style.display='';
}

async function loadS3Keys(){
  try{
    const r=await apiFetch('/api/admin/s3keys');if(!r)return;const d=await r.json();
    const el=document.getElementById('s3KeysList');
    if(!d.keys||d.keys.length===0){el.innerHTML='<span style="color:var(--text2)">暂无密钥</span>';return;}
    let html='<table style="width:100%;font-size:12px;border-collapse:collapse">';
    html+='<tr style="color:var(--text2)"><td style="padding:4px">Access Key</td><td>创建时间</td><td>操作</td></tr>';
    for(const k of d.keys){html+='<tr><td style="padding:4px"><code>'+k.access_key+'</code></td><td>'+new Date(k.created).toLocaleDateString()+'</td><td><button class="btn" style="padding:2px 8px;font-size:11px" onclick="deleteS3Key(\\''+k.id+'\\')">删除</button></td></tr>';}
    html+='</table>';el.innerHTML=html;
  }catch(e){}
}

async function createS3Key(){
  try{const r=await apiFetch('/api/admin/s3keys',{method:'POST'});if(!r)return;const d=await r.json();
  if(d.ok){toast('密钥已生成，请保存 Secret Key: '+d.secret_key,'info');loadS3Keys();}else toast('生成失败','error');}catch(e){toast('生成失败','error');}
}

async function deleteS3Key(id){
  if(!confirm('确定删除此密钥？'))return;
  try{const r=await apiFetch('/api/admin/s3keys/'+id,{method:'DELETE'});if(!r)return;loadS3Keys();}catch(e){}
}

function copyText(text){navigator.clipboard.writeText(text);toast('已复制','success');}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function formatSize(b){if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';if(b<1073741824)return(b/1048576).toFixed(1)+' MB';return(b/1073741824).toFixed(2)+' GB';}
function getFileIcon(name){
  const ext=name.split('.').pop().toLowerCase();
  const m={jpg:'🖼️',jpeg:'🖼️',png:'🖼️',gif:'🖼️',webp:'🖼️',svg:'🖼️',mp4:'🎬',mkv:'🎬',avi:'🎬',mov:'🎬',mp3:'🎵',wav:'🎵',flac:'🎵',pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',ppt:'📽️',pptx:'📽️',txt:'📄',md:'📄',json:'📋',csv:'📊',zip:'📦',rar:'📦','7z':'📦',exe:'⚙️',js:'💻',ts:'💻',py:'💻',epub:'📖',mobi:'📖',cbr:'📖',cbz:'📖'};
  return m[ext]||'📄';
}
function toast(msg,type){const el=document.getElementById('toast');el.textContent=msg;el.className='toast show '+type;setTimeout(()=>el.className='toast',3000);}

(async()=>{const token=sessionStorage.getItem('token');if(token){try{const r=await fetch(API+'/api/auth/check',{headers:{'Authorization':'Bearer '+token}});if(r.ok){showApp();return;}}catch(e){}}})();
</script>
</body>
</html>`;

// ===== Config =====
function getConfig(env) {
  return {
    token: env.TELEGRAM_BOT_TOKEN,
    channelId: env.TELEGRAM_CHANNEL_ID,
    adminPwd: env.ADMIN_PASSWORD || 'admin',
    secret: env.JWT_SECRET || ((env.TELEGRAM_BOT_TOKEN || '') + (env.TELEGRAM_CHANNEL_ID || ''))
  };
}

// ===== Telegram API =====
async function tgApi(token, method, body) {
  const opts = { method: 'POST' };
  if (body instanceof FormData) {
    opts.body = body;
  } else {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  return fetch('https://api.telegram.org/bot' + token + '/' + method, opts);
}

// ===== JWT (HMAC-SHA256) =====
async function createToken(secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const now = Date.now();
  const payload = btoa(JSON.stringify({ sub: 'admin', iat: now, exp: now + 7 * 24 * 60 * 60 * 1000 })).replace(/=/g, '');
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
    if (!(await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data)))) return false;
    // Check expiration
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() > payload.exp) return false;
    return true;
  } catch { return false; }
}

// ===== Basic Auth =====
function parseBasicAuth(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Basic ')) return null;
  try {
    const decoded = atob(auth.slice(6));
    const [user, pass] = decoded.split(':');
    return { user, pass };
  } catch { return null; }
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

function joinPath(base, name) {
  return base === '/' ? '/' + name : base + '/' + name;
}

async function addToParent(kv, parentPath, item) {
  const dir = await getDir(kv, parentPath);
  if (!dir.items.find(i => i.name === item.name)) dir.items.push(item);
  await saveDir(kv, parentPath, dir);
}

async function removeFromParent(kv, parentPath, name) {
  const dir = await getDir(kv, parentPath);
  dir.items = dir.items.filter(i => i.name !== name);
  await saveDir(kv, parentPath, dir);
}

// ===== Path sanitization (prevent traversal) =====
function sanitizePath(p) {
  const parts = p.split('/').filter(Boolean);
  const clean = [];
  for (const part of parts) {
    if (part === '..') continue; // block traversal
    if (part === '.') continue;
    clean.push(part);
  }
  return '/' + clean.join('/');
}

// ===== Find file by path =====
async function findFile(kv, filePath) {
  const parentPath = getParentPath(filePath) || '/';
  const dir = await getDir(kv, parentPath);
  return dir.items.find(i => i.path === filePath && !i.is_dir);
}

// ===== Recursive delete =====
async function deleteRecursive(kv, dirPath) {
  const dir = await getDir(kv, dirPath);
  for (const item of dir.items) {
    if (item.is_dir) await deleteRecursive(kv, item.path);
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

// ===== Build folder tree =====
async function buildTree(kv) {
  const rootDir = await getDir(kv, '/');
  return rootDir.items.filter(i => i.is_dir).map(i => ({ name: i.name, path: i.path }));
}

// ===== Stats (with KV cache, 60s TTL) =====
async function getStats(kv) {
  const cached = await kv.get('_stats_cache', 'json');
  if (cached && cached.ts && Date.now() - cached.ts < 60000) {
    return { totalFiles: cached.totalFiles, totalSize: cached.totalSize };
  }
  let totalFiles = 0, totalSize = 0;
  async function countDir(dirPath) {
    const dir = await getDir(kv, dirPath);
    for (const item of dir.items) {
      if (item.is_dir) await countDir(item.path);
      else { totalFiles++; totalSize += item.size || 0; }
    }
  }
  await countDir('/');
  const result = { totalFiles, totalSize };
  try { await kv.put('_stats_cache', JSON.stringify({ ...result, ts: Date.now() }), { expirationTtl: 120 }); } catch (e) {}
  return result;
}

// ===== S3 Signature (简化版: 支持 Basic Auth 和 Query Auth) =====
function generateS3Key() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let accessKey = 'TS';
  for (let i = 0; i < 18; i++) accessKey += chars[Math.floor(Math.random() * chars.length)];
  let secretKey = '';
  for (let i = 0; i < 40; i++) secretKey += chars[Math.floor(Math.random() * chars.length)];
  return { access_key: accessKey, secret_key: secretKey };
}

// ===== EPUB Cover Extraction =====
function parseZipEntries(data) {
  const entries = [];
  const view = new DataView(data.buffer || data);
  const sig = 0x02014b50;
  let pos = data.length - 22;
  while (pos >= 0) {
    if (view.getUint32(pos, true) === 0x06054b50) {
      const cdSize = view.getUint32(pos + 12, true);
      const cdOffset = view.getUint32(pos + 16, true);
      pos = cdOffset;
      break;
    }
    pos--;
  }
  if (pos < 0) return entries;
  while (pos < data.length - 4) {
    if (view.getUint32(pos, true) !== sig) break;
    const compMethod = view.getUint16(pos + 10, true);
    const compSize = view.getUint32(pos + 20, true);
    const uncompSize = view.getUint32(pos + 24, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const localOffset = view.getUint32(pos + 42, true);
    const name = new TextDecoder().decode(data.slice(pos + 46, pos + 46 + nameLen));
    entries.push({ name, compMethod, compSize, uncompSize, localOffset });
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function getZipFileData(data, entry) {
  const view = new DataView(data.buffer || data);
  const nameLen = view.getUint16(entry.localOffset + 26, true);
  const extraLen = view.getUint16(entry.localOffset + 28, true);
  const dataStart = entry.localOffset + 30 + nameLen + extraLen;
  const rawData = data.slice(dataStart, dataStart + entry.compSize);
  if (entry.compMethod === 0) return rawData;
  if (entry.compMethod === 8 && typeof DecompressionStream !== 'undefined') {
    return null; // async needed, handled in caller
  }
  return rawData;
}

// Async version that handles decompression
async function getZipFileDataAsync(data, entry) {
  const view = new DataView(data.buffer || data);
  const nameLen = view.getUint16(entry.localOffset + 26, true);
  const extraLen = view.getUint16(entry.localOffset + 28, true);
  const dataStart = entry.localOffset + 30 + nameLen + extraLen;
  if (entry.compMethod === 0) {
    return data.slice(dataStart, dataStart + entry.compSize);
  }
  if (entry.compMethod === 8 && typeof DecompressionStream !== 'undefined') {
    const rawData = data.slice(dataStart, dataStart + entry.compSize);
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(rawData);
    writer.close();
    const reader = ds.readable.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    const result = new Uint8Array(totalLen);
    let off = 0;
    for (const c of chunks) { result.set(c, off); off += c.length; }
    return result;
  }
  return data.slice(dataStart, dataStart + entry.compSize);
}

async function extractEpubCover(fileData) {
  try {
    const entries = parseZipEntries(fileData);
    // Find container.xml
    const container = entries.find(e => e.name === 'META-INF/container.xml');
    if (!container) return null;
    const containerData = await getZipFileDataAsync(fileData, container);
    const containerXml = new TextDecoder().decode(containerData);
    // Find OPF file path
    const rootMatch = containerXml.match(/full-path="([^"]+)"/);
    if (!rootMatch) return null;
    const opfPath = rootMatch[1];
    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
    // Find OPF file
    const opfEntry = entries.find(e => e.name === opfPath);
    if (!opfEntry) return null;
    const opfData = await getZipFileDataAsync(fileData, opfEntry);
    const opfXml = new TextDecoder().decode(opfData);
    // Find cover image: try meta name="cover" first
    let coverId = null;
    const coverMeta = opfXml.match(/name="cover"\s+content="([^"]+)"/);
    if (coverMeta) coverId = coverMeta[1];
    // Also try <meta property="cover"> (EPUB3)
    if (!coverId) {
      const coverProp = opfXml.match(/property="cover"[^>]*>([^<]+)</);
      if (coverProp) coverId = coverProp[1].trim();
    }
    // Find the item with cover id or cover-image property
    let coverHref = null;
    if (coverId) {
      const idMatch = opfXml.match(new RegExp('id="' + coverId + '"[^>]*href="([^"]+)"'));
      if (idMatch) coverHref = opfDir + idMatch[1];
    }
    // Fallback: find item with properties="cover-image" (EPUB3)
    if (!coverHref) {
      const propsMatch = opfXml.match(/properties="cover-image"\s+href="([^"]+)"/);
      if (!propsMatch) {
        const propsMatch2 = opfXml.match(/href="([^"]+)"[^>]*properties="cover-image"/);
        if (propsMatch2) coverHref = opfDir + propsMatch2[1];
      } else {
        coverHref = opfDir + propsMatch[1];
      }
    }
    // Fallback: find file named cover.jpg/png in entries
    if (!coverHref) {
      const coverFile = entries.find(e => /cover\.(jpg|jpeg|png|webp)/i.test(e.name));
      if (coverFile) coverHref = coverFile.name;
    }
    // Fallback: find any image file in the EPUB
    if (!coverHref) {
      const imgFile = entries.find(e => /\.(jpg|jpeg|png|webp)$/i.test(e.name));
      if (imgFile) coverHref = imgFile.name;
    }
    if (!coverHref) return null;
    // Decode URL-encoded path
    coverHref = decodeURIComponent(coverHref);
    // Find and extract the cover image
    const imgEntry = entries.find(e => e.name === coverHref);
    if (!imgEntry) return null;
    const imgData = await getZipFileDataAsync(fileData, imgEntry);
    if (!imgData || imgData.length === 0) return null;
    const type = imgEntry.name.match(/\.png$/i) ? 'image/png' : 'image/jpeg';
    return { data: imgData, type };
  } catch (e) {
    return null;
  }
}

// ===== OPDS XML Builder =====
function opdsFeed(title, entries, baseUrl) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opds="http://opds-spec.org/2010/catalog">\n';
  xml += '  <title>' + escXml(title) + '</title>\n';
  xml += '  <id>' + escXml(baseUrl) + '</id>\n';
  xml += '  <updated>' + new Date().toISOString() + '</updated>\n';
  xml += '  <link rel="self" href="' + escXml(baseUrl) + '" type="application/atom+xml;profile=opds-catalog"/>\n';
  xml += '  <author><name>TeleStash</name></author>\n';
  for (const entry of entries) {
    xml += '  <entry>\n';
    xml += '    <title>' + escXml(entry.title) + '</title>\n';
    xml += '    <id>' + escXml(entry.id) + '</id>\n';
    xml += '    <updated>' + new Date(entry.updated || Date.now()).toISOString() + '</updated>\n';
    if (entry.isNav) {
      // Navigation entries (folders) - only subsection link, no acquisition link
      xml += '    <link rel="subsection" href="' + escXml(entry.link) + '" type="application/atom+xml;profile=opds-catalog"/>\n';
    } else if (entry.link) {
      // Acquisition entries (books/files)
      xml += '    <link rel="' + (entry.rel || 'http://opds-spec.org/acquisition/open-access') + '" href="' + escXml(entry.link) + '" type="' + (entry.type || 'application/epub+zip') + '"/>\n';
    }
    if (entry.image) {
      xml += '    <link rel="http://opds-spec.org/image" href="' + escXml(entry.image) + '" type="image/jpeg"/>\n';
      xml += '    <link rel="http://opds-spec.org/image/thumbnail" href="' + escXml(entry.image) + '" type="image/jpeg"/>\n';
    }
    if (entry.content) xml += '    <content type="text">' + escXml(entry.content) + '</content>\n';
    xml += '  </entry>\n';
  }
  xml += '</feed>';
  return xml;
}

function formatSize(b) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  if (b < 1073741824) return (b / 1048576).toFixed(1) + " MB";
  return (b / 1073741824).toFixed(2) + " GB";
}

function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isEbook(name) {
  return /\.(epub|mobi|pdf|cbr|cbz|txt)$/i.test(name);
}

function ebookMimeType(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = { epub: 'application/epub+zip', mobi: 'application/x-mobipocket-ebook', pdf: 'application/pdf', cbr: 'application/x-cbr', cbz: 'application/x-cbz', txt: 'text/plain' };
  return map[ext] || 'application/octet-stream';
}

// ===== XML Response Helper =====
function xmlResponse(xml, status = 200) {
  return new Response(xml, {
    status,
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'DAV': '1, 2', 'Allow': 'OPTIONS, GET, HEAD, PUT, DELETE, MKCOL, PROPFIND, COPY, MOVE' }
  });
}

// ===== WebDAV XML Helpers =====
function webdavMultistatus(items, baseUrl) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<D:multistatus xmlns:D="DAV:">\n';
  for (const item of items) {
    xml += '  <D:response>\n';
    xml += '    <D:href>' + escXml(baseUrl + encodeURI(item.path).replace(/%2F/g, '/')) + '</D:href>\n';
    xml += '    <D:propstat>\n';
    xml += '      <D:prop>\n';
    xml += '        <D:displayname>' + escXml(item.name) + '</D:displayname>\n';
    if (item.is_dir) {
      xml += '        <D:resourcetype><D:collection/></D:resourcetype>\n';
      xml += '        <D:getcontentlength>0</D:getcontentlength>\n';
    } else {
      xml += '        <D:resourcetype/>\n';
      xml += '        <D:getcontentlength>' + (item.size || 0) + '</D:getcontentlength>\n';
      xml += '        <D:getcontenttype>' + escXml(getMimeType(item.name)) + '</D:getcontenttype>\n';
      if (item.file_id) xml += '        <D:getetag>"' + item.file_id.slice(0, 16) + '"</D:getetag>\n';
    }
    xml += '        <D:getlastmodified>' + new Date(item.date || Date.now()).toUTCString() + '</D:getlastmodified>\n';
    xml += '      </D:prop>\n';
    xml += '      <D:status>HTTP/1.1 200 OK</D:status>\n';
    xml += '    </D:propstat>\n';
    xml += '  </D:response>\n';
  }
  xml += '</D:multistatus>';
  return xml;
}

function getMimeType(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    html: 'text/html', css: 'text/css', js: 'application/javascript', json: 'application/json',
    xml: 'application/xml', txt: 'text/plain', md: 'text/markdown', csv: 'text/csv',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', mkv: 'video/x-matroska', avi: 'video/x-msvideo', mov: 'video/quicktime',
    mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg',
    pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip: 'application/zip', rar: 'application/x-rar-compressed', '7z': 'application/x-7z-compressed',
    epub: 'application/epub+zip', mobi: 'application/x-mobipocket-ebook',
    cbr: 'application/x-cbr', cbz: 'application/x-cbz'
  };
  return map[ext] || 'application/octet-stream';
}

// ===== S3 XML Helpers =====
function s3ListBucket(bucket, objects, prefixes, baseUrl) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">\n';
  xml += '  <Name>' + escXml(bucket) + '</Name>\n';
  xml += '  <Prefix></Prefix>\n';
  xml += '  <IsTruncated>false</IsTruncated>\n';
  for (const prefix of prefixes) {
    xml += '  <CommonPrefixes>\n';
    xml += '    <Prefix>' + escXml(prefix) + '</Prefix>\n';
    xml += '  </CommonPrefixes>\n';
  }
  for (const obj of objects) {
    xml += '  <Contents>\n';
    xml += '    <Key>' + escXml(obj.name) + '</Key>\n';
    xml += '    <Size>' + (obj.size || 0) + '</Size>\n';
    xml += '    <LastModified>' + new Date(obj.date || Date.now()).toISOString() + '</LastModified>\n';
    xml += '    <StorageClass>STANDARD</StorageClass>\n';
    xml += '  </Contents>\n';
  }
  xml += '</ListBucketResult>';
  return xml;
}

// ===== Main Worker =====
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cfg = getConfig(env);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,MKCOL,COPY,MOVE,PROPFIND,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization,Depth,Destination,Overwrite'
        }
      });
    }

    const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

    try {
      // ===== WebDAV =====
      if (path.startsWith('/dav')) {
        return await handleWebDAV(request, env, cfg, path, corsHeaders);
      }

      // ===== S3 Compatible API =====
      if (path.startsWith('/s3/') || request.headers.get('Authorization')?.startsWith('AWS ') || url.searchParams.has('AWSAccessKeyId')) {
        return await handleS3(request, env, cfg, path, url, corsHeaders);
      }

      // ===== OPDS =====
      if (path === '/opds' || path.startsWith('/opds/')) {
        return await handleOPDS(request, env, cfg, path, url, corsHeaders);
      }

      // ===== HTML =====
      if (path === '/' || path === '') {
        return new Response(HTML_CONTENT, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } });
      }

      // ===== Login =====
      if (path === '/api/login' && request.method === 'POST') {
        const body = await request.json();
        if (body.password === cfg.adminPwd) {
          const t = await createToken(cfg.secret);
          return json({ ok: true, token: t }, corsHeaders);
        }
        return json({ ok: false, error: '密码错误' }, corsHeaders, 401);
      }

      // ===== Auth check =====
      if (path === '/api/auth/check') {
        const ok = await checkAuth(request, cfg.secret);
        return json({ ok }, corsHeaders, ok ? 200 : 401);
      }

      // ===== Download (token in query) =====
      if (path === '/api/download') {
        const urlToken = url.searchParams.get('token');
        if (!urlToken || !(await verifyToken(urlToken, cfg.secret))) {
          return json({ error: '未授权' }, corsHeaders, 401);
        }
        const filePath = url.searchParams.get('path');
        if (!filePath) return json({ error: '缺少路径' }, corsHeaders, 400);
        const item = await findFile(env.KV, filePath);
        if (!item) return json({ error: '文件不存在' }, corsHeaders, 404);

        const fileInfoResp = await tgApi(cfg.token, 'getFile', { file_id: item.file_id });
        const fileInfo = await fileInfoResp.json();
        if (!fileInfo.ok) return json({ error: '获取文件失败' }, corsHeaders, 500);

        const fileUrl = 'https://api.telegram.org/file/bot' + cfg.token + '/' + fileInfo.result.file_path;
        const fileResp = await fetch(fileUrl);
        return new Response(fileResp.body, {
          headers: {
            'Content-Type': getMimeType(item.name),
            'Content-Disposition': 'attachment; filename="' + encodeURIComponent(item.name) + '"',
            'Content-Length': fileResp.headers.get('Content-Length'),
            ...corsHeaders
          }
        });
      }

      // ===== Other API routes require Bearer auth =====
      if (path.startsWith('/api/')) {
        if (!(await checkAuth(request, cfg.secret))) {
          return json({ error: '未授权' }, corsHeaders, 401);
        }
      }

      // ===== List files =====
      if (path === '/api/files' && request.method === 'GET') {
        const dirPath = url.searchParams.get('path') || '/';
        const dir = await getDir(env.KV, dirPath);
        const tree = await buildTree(env.KV);
        const stats = await getStats(env.KV);
        return json({ items: dir.items, tree, stats }, corsHeaders);
      }

      // ===== Upload =====
      if (path === '/api/upload' && request.method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file');
        const dirPath = formData.get('path') || '/';
        if (!file || !file.name) return json({ ok: false, error: '没有文件' }, corsHeaders, 400);

        const tgForm = new FormData();
        tgForm.append('chat_id', cfg.channelId);
        tgForm.append('document', file, file.name);
        tgForm.append('caption', joinPath(dirPath, file.name));

        const tgResp = await tgApi(cfg.token, 'sendDocument', tgForm);
        const tgData = await tgResp.json();
        if (!tgData.ok) return json({ ok: false, error: 'TG上传失败: ' + (tgData.description || '') }, corsHeaders, 500);

        const doc = tgData.result.document;
        const item = {
          name: file.name,
          path: joinPath(dirPath, file.name),
          file_id: doc.file_id,
          msg_id: tgData.result.message_id,
          size: doc.file_size || file.size,
          date: Date.now(),
          is_dir: false
        };
        // Remove old file with same name if exists
        const dir = await getDir(env.KV, dirPath);
        const oldIdx = dir.items.findIndex(i => i.name === file.name && !i.is_dir);
        if (oldIdx >= 0) {
          try { await tgApi(cfg.token, 'deleteMessage', { chat_id: cfg.channelId, message_id: dir.items[oldIdx].msg_id }); } catch (e) {}
          dir.items.splice(oldIdx, 1);
        }
        dir.items.push(item);
        await saveDir(env.KV, dirPath, dir);
        return json({ ok: true, item }, corsHeaders);
      }

      // ===== Delete =====
      if (path === '/api/delete' && request.method === 'POST') {
        const body = await request.json();
        const filePath = body.path;
        if (!filePath) return json({ error: '缺少路径' }, corsHeaders, 400);

        const parentPath = getParentPath(filePath) || '/';
        const dir = await getDir(env.KV, parentPath);
        const item = dir.items.find(i => i.path === filePath);
        if (!item) return json({ error: '不存在' }, corsHeaders, 404);

        if (item.is_dir) {
          await deleteRecursive(env.KV, filePath);
        } else {
          try { await tgApi(cfg.token, 'deleteMessage', { chat_id: cfg.channelId, message_id: item.msg_id }); } catch (e) {}
        }
        await removeFromParent(env.KV, parentPath, item.name);
        return json({ ok: true }, corsHeaders);
      }

      // ===== Rename =====
      if (path === '/api/rename' && request.method === 'POST') {
        const body = await request.json();
        const oldPath = body.path, newName = body.newName;
        if (!oldPath || !newName) return json({ error: '参数不全' }, corsHeaders, 400);

        const parentPath = getParentPath(oldPath) || '/';
        const dir = await getDir(env.KV, parentPath);
        const item = dir.items.find(i => i.path === oldPath);
        if (!item) return json({ error: '不存在' }, corsHeaders, 404);

        item.name = newName;
        item.path = joinPath(parentPath, newName);
        // Check if destination name already exists (don't silently overwrite)
        const existIdx = dir.items.findIndex(i => i.name === newName && i.path !== oldPath);
        if (existIdx >= 0) return json({ error: '同名文件已存在' }, corsHeaders, 409);

        const idx = dir.items.findIndex(i => i.path === oldPath);
        if (idx >= 0) dir.items[idx] = item;
        await saveDir(env.KV, parentPath, dir);

        if (item.is_dir) await updateChildPaths(env.KV, oldPath, item.path);
        return json({ ok: true }, corsHeaders);
      }

      // ===== Mkdir =====
      if (path === '/api/mkdir' && request.method === 'POST') {
        const body = await request.json();
        const parentPath = body.path || '/';
        const folderName = body.name;
        if (!folderName) return json({ error: '缺少名称' }, corsHeaders, 400);

        const folderPath = joinPath(parentPath, folderName);
        const dir = await getDir(env.KV, parentPath);
        if (dir.items.find(i => i.name === folderName)) return json({ ok: false, error: '已存在' }, corsHeaders, 400);

        const item = { name: folderName, path: folderPath, is_dir: true, date: Date.now() };
        await addToParent(env.KV, parentPath, item);
        await saveDir(env.KV, folderPath, { items: [] });
        return json({ ok: true, item }, corsHeaders);
      }

      // ===== S3 Keys Management =====
      if (path === '/api/admin/s3keys' && request.method === 'GET') {
        const keys = await env.KV.get('s3keys', 'json') || [];
        return json({ keys: keys.map(k => ({ id: k.id, access_key: k.access_key, created: k.created })) }, corsHeaders);
      }

      if (path === '/api/admin/s3keys' && request.method === 'POST') {
        const keys = await env.KV.get('s3keys', 'json') || [];
        const newKey = { ...generateS3Key(), id: crypto.randomUUID(), created: Date.now() };
        keys.push(newKey);
        await env.KV.put('s3keys', JSON.stringify(keys));
        return json({ ok: true, access_key: newKey.access_key, secret_key: newKey.secret_key }, corsHeaders);
      }

      if (path.startsWith('/api/admin/s3keys/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        let keys = await env.KV.get('s3keys', 'json') || [];
        keys = keys.filter(k => k.id !== id);
        await env.KV.put('s3keys', JSON.stringify(keys));
        return json({ ok: true }, corsHeaders);
      }

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

function json(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

// ===== WebDAV Handler =====
async function handleWebDAV(request, env, cfg, path, corsHeaders) {
  const davPath = sanitizePath(decodeURIComponent(path.slice(4))) || '/'; // Remove '/dav', decode, sanitize
  const method = request.method;

  // Basic Auth
  const auth = parseBasicAuth(request);
  if (!auth || auth.pass !== cfg.adminPwd) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="TeleStash WebDAV"', ...corsHeaders }
    });
  }

  const baseUrl = '/dav';

  // OPTIONS
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'DAV': '1, 2',
        'Allow': 'OPTIONS, GET, HEAD, PUT, DELETE, MKCOL, PROPFIND, COPY, MOVE',
        'MS-Author-Via': 'DAV',
        ...corsHeaders
      }
    });
  }

  // PROPFIND
  if (method === 'PROPFIND') {
    const depth = request.headers.get('Depth') || 'infinity';

    // Check if it's a file
    const item = await findFile(env.KV, davPath);
    if (item) {
      const xml = webdavMultistatus([{ ...item, is_dir: false }], baseUrl);
      return xmlResponse(xml, 207);
    }

    // Directory
    const dir = await getDir(env.KV, davPath);
    const items = [
      { name: davPath === '/' ? '/' : davPath.split('/').pop(), path: davPath, is_dir: true, date: Date.now() },
      ...dir.items
    ];

    if (depth === '0') {
      const xml = webdavMultistatus([items[0]], baseUrl);
      return xmlResponse(xml, 207);
    }

    const xml = webdavMultistatus(items, baseUrl);
    return xmlResponse(xml, 207);
  }

  // GET
  if (method === 'GET' || method === 'HEAD') {
    const item = await findFile(env.KV, davPath);
    if (!item) return new Response('Not Found', { status: 404, headers: corsHeaders });

    const fileInfoResp = await tgApi(cfg.token, 'getFile', { file_id: item.file_id });
    const fileInfo = await fileInfoResp.json();
    if (!fileInfo.ok) return new Response('File Error', { status: 500, headers: corsHeaders });

    const fileUrl = 'https://api.telegram.org/file/bot' + cfg.token + '/' + fileInfo.result.file_path;
    const fileResp = await fetch(fileUrl);

    if (method === 'HEAD') {
      return new Response(null, {
        headers: {
          'Content-Length': fileResp.headers.get('Content-Length'),
          'Content-Type': getMimeType(item.name),
          'Last-Modified': new Date(item.date).toUTCString(),
          ...corsHeaders
        }
      });
    }

    return new Response(fileResp.body, {
      headers: {
        'Content-Type': getMimeType(item.name),
        'Content-Length': fileResp.headers.get('Content-Length'),
        'Content-Disposition': 'inline; filename="' + encodeURIComponent(item.name) + '"',
        'Last-Modified': new Date(item.date).toUTCString(),
        ...corsHeaders
      }
    });
  }

  // PUT
  if (method === 'PUT') {
    const parentPath = getParentPath(davPath) || '/';
    const fileName = davPath.split('/').pop();
    const body = await request.arrayBuffer();

    // Check size limit (50MB)
    if (body.byteLength > 50 * 1024 * 1024) {
      return new Response('File too large (max 50MB)', { status: 413, headers: corsHeaders });
    }

    // Upload to Telegram
    const tgForm = new FormData();
    tgForm.append('chat_id', cfg.channelId);
    const blob = new Blob([body]);
    tgForm.append('document', blob, fileName);
    tgForm.append('caption', davPath);

    const tgResp = await tgApi(cfg.token, 'sendDocument', tgForm);
    const tgData = await tgResp.json();
    if (!tgData.ok) return new Response('Upload failed', { status: 500, headers: corsHeaders });

    // Remove old file if exists
    const dir = await getDir(env.KV, parentPath);
    const oldIdx = dir.items.findIndex(i => i.name === fileName && !i.is_dir);
    if (oldIdx >= 0) {
      try { await tgApi(cfg.token, 'deleteMessage', { chat_id: cfg.channelId, message_id: dir.items[oldIdx].msg_id }); } catch (e) {}
      dir.items.splice(oldIdx, 1);
    }

    const doc = tgData.result.document;
    const item = {
      name: fileName, path: davPath, file_id: doc.file_id,
      msg_id: tgData.result.message_id, size: doc.file_size || body.byteLength,
      date: Date.now(), is_dir: false
    };
    dir.items.push(item);
    await saveDir(env.KV, parentPath, dir);

    return new Response('Created', { status: 201, headers: corsHeaders });
  }

  // DELETE
  if (method === 'DELETE') {
    const item = await findFile(env.KV, davPath);
    if (!item) {
      // Try directory
      const parentPath = getParentPath(davPath) || '/';
      const dir = await getDir(env.KV, parentPath);
      const dirItem = dir.items.find(i => i.path === davPath && i.is_dir);
      if (dirItem) {
        await deleteRecursive(env.KV, davPath);
        await removeFromParent(env.KV, parentPath, dirItem.name);
        return new Response('No Content', { status: 204, headers: corsHeaders });
      }
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    }

    try { await tgApi(cfg.token, 'deleteMessage', { chat_id: cfg.channelId, message_id: item.msg_id }); } catch (e) {}
    const parentPath = getParentPath(davPath) || '/';
    await removeFromParent(env.KV, parentPath, item.name);
    return new Response('No Content', { status: 204, headers: corsHeaders });
  }

  // MKCOL
  if (method === 'MKCOL') {
    const parentPath = getParentPath(davPath) || '/';
    const folderName = davPath.split('/').pop();
    const dir = await getDir(env.KV, parentPath);
    if (dir.items.find(i => i.name === folderName)) return new Response('Conflict', { status: 409, headers: corsHeaders });

    const item = { name: folderName, path: davPath, is_dir: true, date: Date.now() };
    dir.items.push(item);
    await saveDir(env.KV, parentPath, dir);
    await saveDir(env.KV, davPath, { items: [] });
    return new Response('Created', { status: 201, headers: corsHeaders });
  }

  // COPY / MOVE
  if (method === 'COPY' || method === 'MOVE') {
    const dest = request.headers.get('Destination');
    if (!dest) return new Response('Bad Request', { status: 400, headers: corsHeaders });

    // Parse destination path (remove host part) - robust URL decoding
    let destPath;
    try {
      const parsedUrl = new URL(dest);
      destPath = decodeURIComponent(parsedUrl.pathname.slice(4));
    } catch {
      destPath = decodeURIComponent(dest.slice(4));
    }
    if (!destPath) destPath = davPath;

    // Find file or directory
    let item = await findFile(env.KV, davPath);
    let isDir = false;
    if (!item) {
      // Check if it's a directory
      const srcParent = getParentPath(davPath) || '/';
      const srcDir = await getDir(env.KV, srcParent);
      const dirItem = srcDir.items.find(i => i.path === davPath && i.is_dir);
      if (!dirItem) return new Response('Not Found', { status: 404, headers: corsHeaders });
      item = dirItem;
      isDir = true;
    }

    const overwrite = request.headers.get('Overwrite') !== 'F';
    const destParent = getParentPath(destPath) || '/';
    const destDir = await getDir(env.KV, destParent);
    const destName = destPath.split('/').pop();

    // Check if destination exists
    const existIdx = destDir.items.findIndex(i => i.name === destName);
    if (existIdx >= 0 && !overwrite) return new Response('Precondition Failed', { status: 412, headers: corsHeaders });
    if (existIdx >= 0) {
      const exist = destDir.items[existIdx];
      if (exist.is_dir) {
        await deleteRecursive(env.KV, exist.path);
      } else {
        try { await tgApi(cfg.token, 'deleteMessage', { chat_id: cfg.channelId, message_id: exist.msg_id }); } catch (e) {}
      }
      destDir.items.splice(existIdx, 1);
    }

    // Add to destination
    const newItem = { ...item, name: destName, path: destPath };
    destDir.items.push(newItem);
    await saveDir(env.KV, destParent, destDir);

    // If MOVE, remove from source
    if (method === 'MOVE') {
      const srcParentPath = getParentPath(davPath) || '/';
      await removeFromParent(env.KV, srcParentPath, item.name);
      // If directory, move all children and update paths
      if (isDir) {
        const srcDirData = await getDir(env.KV, davPath);
        await saveDir(env.KV, destPath, srcDirData);
        await kv.delete('dir:' + davPath);
        // Update child paths recursively
        async function updatePaths(oldBase, newBase, dirData) {
          for (const child of dirData.items) {
            const oldChildPath = oldBase + '/' + child.name;
            const newChildPath = newBase + '/' + child.name;
            child.path = newChildPath;
            if (child.is_dir) {
              const childDir = await getDir(env.KV, oldChildPath);
              await updatePaths(oldChildPath, newChildPath, childDir);
              await saveDir(env.KV, newChildPath, childDir);
              await env.KV.delete('dir:' + oldChildPath);
            }
          }
          await saveDir(env.KV, newBase, dirData);
        }
        await updatePaths(davPath, destPath, srcDirData);
      }
    }

    return new Response(method === 'MOVE' ? 'No Content' : 'Created', {
      status: method === 'MOVE' ? 204 : 201,
      headers: corsHeaders
    });
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}

// ===== S3 Handler =====
async function handleS3(request, env, cfg, path, url, corsHeaders) {
  // S3 auth: support Basic Auth with access_key:secret_key
  const auth = parseBasicAuth(request);
  let authenticated = false;

  if (auth) {
    const keys = await env.KV.get('s3keys', 'json') || [];
    const key = keys.find(k => k.access_key === auth.user);
    if (key && key.secret_key === auth.pass) authenticated = true;
  }

  // Also support admin password as fallback
  if (!authenticated && auth && auth.pass === cfg.adminPwd) authenticated = true;

  if (!authenticated) {
    return new Response('<?xml version="1.0"?><Error><Code>InvalidAccessKeyId</Code><Message>Invalid credentials</Message></Error>', {
      status: 403,
      headers: { 'Content-Type': 'application/xml', ...corsHeaders }
    });
  }

  // Parse bucket and key from path
  // /s3/bucket/key or /s3/bucket
  const s3Path = sanitizePath(decodeURIComponent(path.slice(4))); // Remove '/s3', decode, sanitize
  const parts = s3Path.split('/').filter(Boolean);
  const bucket = parts[0] || '';
  const key = parts.slice(1).join('/');

  // List objects in bucket (root directory)
  if (request.method === 'GET' && !key) {
    const dirPath = bucket ? '/' + bucket : '/';
    const dir = await getDir(env.KV, dirPath);
    const objects = dir.items.filter(i => !i.is_dir).map(i => ({ name: i.name, size: i.size, date: i.date }));
    const prefixes = dir.items.filter(i => i.is_dir).map(i => i.name + '/');
    const xml = s3ListBucket(bucket || 'telestash', objects, prefixes);
    return new Response(xml, { headers: { 'Content-Type': 'application/xml', ...corsHeaders } });
  }

  // Get object
  if (request.method === 'GET' && key) {
    const filePath = '/' + bucket + '/' + key;
    const item = await findFile(env.KV, filePath);
    if (!item) {
      return new Response('<?xml version="1.0"?><Error><Code>NoSuchKey</Code><Message>Key not found</Message></Error>', {
        status: 404, headers: { 'Content-Type': 'application/xml', ...corsHeaders }
      });
    }

    const fileInfoResp = await tgApi(cfg.token, 'getFile', { file_id: item.file_id });
    const fileInfo = await fileInfoResp.json();
    if (!fileInfo.ok) return new Response('Error', { status: 500, headers: corsHeaders });

    const fileUrl = 'https://api.telegram.org/file/bot' + cfg.token + '/' + fileInfo.result.file_path;
    const fileResp = await fetch(fileUrl);
    return new Response(fileResp.body, {
      headers: {
        'Content-Type': getMimeType(item.name),
        'Content-Length': fileResp.headers.get('Content-Length'),
        'ETag': '"' + item.file_id.slice(0, 16) + '"',
        ...corsHeaders
      }
    });
  }

  // Put object
  if (request.method === 'PUT' && key) {
    const filePath = '/' + bucket + '/' + key;
    const keyParts = key.split('/');
    const fileName = keyParts.pop();
    const keyDir = keyParts.join('/');
    const parentPath = keyDir ? '/' + bucket + '/' + keyDir : '/' + bucket;
    const body = await request.arrayBuffer();

    if (body.byteLength > 50 * 1024 * 1024) {
      return new Response('<?xml version="1.0"?><Error><Code>EntityTooLarge</Code><Message>Max 50MB</Message></Error>', {
        status: 400, headers: { 'Content-Type': 'application/xml', ...corsHeaders }
      });
    }

    const tgForm = new FormData();
    tgForm.append('chat_id', cfg.channelId);
    tgForm.append('document', new Blob([body]), fileName);
    tgForm.append('caption', filePath);

    const tgResp = await tgApi(cfg.token, 'sendDocument', tgForm);
    const tgData = await tgResp.json();
    if (!tgData.ok) return new Response('Upload failed', { status: 500, headers: corsHeaders });

    // Update KV
    const dir = await getDir(env.KV, parentPath);
    const oldIdx = dir.items.findIndex(i => i.name === fileName);
    if (oldIdx >= 0) dir.items.splice(oldIdx, 1);

    const doc = tgData.result.document;
    dir.items.push({
      name: fileName, path: filePath, file_id: doc.file_id,
      msg_id: tgData.result.message_id, size: doc.file_size || body.byteLength,
      date: Date.now(), is_dir: false
    });
    await saveDir(env.KV, parentPath, dir);

    return new Response('', { status: 200, headers: { 'ETag': '"' + doc.file_id.slice(0, 16) + '"', ...corsHeaders } });
  }

  // Delete object
  if (request.method === 'DELETE' && key) {
    const filePath = '/' + bucket + '/' + key;
    const item = await findFile(env.KV, filePath);
    if (item) {
      // Delete from Telegram too
      if (item.msg_id) {
        try { await tgApi(cfg.token, 'deleteMessage', { chat_id: cfg.channelId, message_id: item.msg_id }); } catch (e) {}
      }
      const parentPath = getParentPath(filePath) || '/' + bucket;
      await removeFromParent(env.KV, parentPath, item.name);
    }
    return new Response('', { status: 204, headers: corsHeaders });
  }

  // Head object
  if (request.method === 'HEAD' && key) {
    const filePath = '/' + bucket + '/' + key;
    const item = await findFile(env.KV, filePath);
    if (!item) return new Response('', { status: 404, headers: corsHeaders });
    return new Response('', {
      headers: {
        'Content-Length': item.size || 0,
        'Content-Type': getMimeType(item.name),
        'ETag': '"' + item.file_id.slice(0, 16) + '"',
        ...corsHeaders
      }
    });
  }

  return new Response('Not Implemented', { status: 501, headers: corsHeaders });
}

// ===== OPDS Handler =====
async function handleOPDS(request, env, cfg, path, url, corsHeaders) {
  // Basic Auth
  const auth = parseBasicAuth(request);
  if (!auth || auth.pass !== cfg.adminPwd) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="TeleStash OPDS"', ...corsHeaders }
    });
  }

  const opdsPath = sanitizePath(decodeURIComponent(path.slice(5))) || '/'; // Remove '/opds', decode, sanitize
  const baseUrl = '/opds';

  // Cover image endpoint
  if (opdsPath.startsWith('/cover')) {
    const filePath = opdsPath.slice(6); // Remove '/cover'
    const item = await findFile(env.KV, filePath);
    if (!item) return new Response('Not Found', { status: 404, headers: corsHeaders });

    const cacheKey = 'cover:v2:' + filePath;
    const cached = await env.KV.get(cacheKey, 'arrayBuffer');
    if (cached) {
      const ct = await env.KV.get(cacheKey + ':type') || 'image/jpeg';
      return new Response(cached, { headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400', ...corsHeaders } });
    }

    const fileInfoResp = await tgApi(cfg.token, 'getFile', { file_id: item.file_id });
    const fileInfo = await fileInfoResp.json();
    if (!fileInfo.ok) return new Response('Error', { status: 500, headers: corsHeaders });

    const fileUrl = 'https://api.telegram.org/file/bot' + cfg.token + '/' + fileInfo.result.file_path;
    const fileResp = await fetch(fileUrl);
    const fileData = new Uint8Array(await fileResp.arrayBuffer());

    const cover = await extractEpubCover(fileData);
    if (!cover) return new Response('No Cover', { status: 404, headers: corsHeaders });

    try {
      await env.KV.put(cacheKey, cover.data.buffer || cover.data, { expirationTtl: 86400 });
      await env.KV.put(cacheKey + ':type', cover.type, { expirationTtl: 86400 });
    } catch (e) {}

    return new Response(cover.data, { headers: { 'Content-Type': cover.type, 'Cache-Control': 'public, max-age=86400', ...corsHeaders } });
  }

  // Root catalog
  if (opdsPath === '/') {
    const dir = await getDir(env.KV, '/');
    const entries = [];

    // Folders as navigation
    for (const item of dir.items) {
      if (item.is_dir) {
        entries.push({
          title: '📁 ' + item.name,
          id: 'nav:' + item.path,
          link: baseUrl + item.path,
          isNav: true,
          content: '文件夹'
        });
      } else if (isEbook(item.name)) {
        entries.push({
          title: item.name,
          id: 'book:' + item.path,
          link: baseUrl + '/download' + item.path,
          type: ebookMimeType(item.name),
          content: formatSize(item.size),
          image: item.name.endsWith('.epub') ? baseUrl + '/cover' + item.path : null
        });
      }
    }

    const xml = opdsFeed('TeleStash 电子书目录', entries, baseUrl);
    return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8', ...corsHeaders } });
  }

  // Sub-directory
  if (!opdsPath.startsWith('/download') && !opdsPath.startsWith('/cover')) {
    const dir = await getDir(env.KV, opdsPath);
    const entries = [];

    for (const item of dir.items) {
      if (item.is_dir) {
        entries.push({
          title: '📁 ' + item.name,
          id: 'nav:' + item.path,
          link: baseUrl + item.path,
          isNav: true,
          content: '文件夹'
        });
      } else if (isEbook(item.name)) {
        entries.push({
          title: item.name,
          id: 'book:' + item.path,
          link: baseUrl + '/download' + item.path,
          type: ebookMimeType(item.name),
          content: formatSize(item.size),
          image: item.name.endsWith('.epub') ? baseUrl + '/cover' + item.path : null
        });
      }
    }

    const title = opdsPath.split('/').filter(Boolean).pop() || 'TeleStash';
    const xml = opdsFeed(title, entries, baseUrl + opdsPath);
    return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8', ...corsHeaders } });
  }

  // Download ebook
  if (opdsPath.startsWith('/download')) {
    const filePath = opdsPath.slice(9); // Remove '/download'
    const item = await findFile(env.KV, filePath);
    if (!item) return new Response('Not Found', { status: 404, headers: corsHeaders });

    const fileInfoResp = await tgApi(cfg.token, 'getFile', { file_id: item.file_id });
    const fileInfo = await fileInfoResp.json();
    if (!fileInfo.ok) return new Response('Error', { status: 500, headers: corsHeaders });

    const fileUrl = 'https://api.telegram.org/file/bot' + cfg.token + '/' + fileInfo.result.file_path;
    const fileResp = await fetch(fileUrl);
    return new Response(fileResp.body, {
      headers: {
        'Content-Type': ebookMimeType(item.name),
        'Content-Disposition': 'inline; filename="' + encodeURIComponent(item.name) + '"',
        'Content-Length': fileResp.headers.get('Content-Length'),
        ...corsHeaders
      }
    });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}
