# 📦 TeleStash

> 基于 Telegram Bot API + Cloudflare Workers 的云存储系统
> 
> 把 Telegram 频道当作无限存储后端，支持 WebDAV / S3 / OPDS 协议

## ✨ 特性

- 🆓 **完全免费** — 存储在 Telegram 云端，无容量限制
- 🚀 **边缘部署** — Cloudflare Workers 全球节点
- 📁 **虚拟文件夹** — KV 元数据管理，支持多级目录
- 🔐 **密码保护** — JWT 认证
- 📤 **拖拽上传** — 现代化 Web UI，支持多文件上传（最大 50MB）
- ⬇️ **在线下载** — 通过 Worker 代理下载
- ✏️ **重命名/删除** — 完整的文件管理
- 📡 **WebDAV** — 挂载到 macOS/Windows/iOS/Android
- 🪣 **S3 兼容 API** — 支持 aws cli / rclone / Cyberduck
- 📖 **OPDS** — 电子书阅读器直接浏览

## 🚀 部署指南

### 前置要求

- Cloudflare 账户（免费即可）
- Telegram Bot（从 [@BotFather](https://t.me/BotFather) 创建）
- Telegram 私有频道（存储文件用）

### 第一步：创建 Telegram Bot

1. 打开 Telegram，搜索 `@BotFather`
2. 发送 `/newbot`，按提示创建
3. 保存返回的 **Bot Token**

### 第二步：创建 Telegram 频道

1. Telegram → 新建频道 → 设为**私有频道**
2. 进频道 → 设置 → 管理员 → 添加管理员
3. 搜索你的 Bot 用户名 → 添加（给发送消息权限）

### 第三步：获取频道 ID

给 Bot 在频道里发一条消息，然后浏览器访问：

```
https://api.telegram.org/bot你的TOKEN/getUpdates
```

找 `chat.id` 字段（负数，如 `-1001234567890`）

---

### 方式一：网页端部署（推荐新手）

#### 1. 创建 KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单 → **Workers 和 Pages** → **KV**
3. 点击 **创建命名空间** → 名称填 `metadata` → **添加**
4. **记下命名空间 ID**（一串字母数字）

#### 2. 创建 Worker

1. 左侧菜单 → **Workers 和 Pages**
2. 点击 **创建应用程序** → **创建 Worker**
3. 名称填 `telestash` → 点击 **部署**

#### 3. 替换代码

1. 部署后点击 **编辑代码**
2. 在代码编辑器中 **全选删除** 默认代码（`Ctrl+A` → `Delete`）
3. 打开 [worker.js](https://raw.githubusercontent.com/leeyoloo/TeleStash/main/worker.js) → 全选复制 → 粘贴到编辑器
4. 点击右上角 **保存并部署**

#### 4. 绑定 KV

1. 回到 Worker 概览页 → **设置** → **绑定**
2. 点击 **添加** → 选择 **KV 命名空间**
3. 变量名称填 `KV` → KV 命名空间选择第一步创建的 `metadata`
4. 点击 **添加绑定**

#### 5. 配置环境变量

1. **设置** → **变量和机密** → **添加变量**

| 名称 | 类型 | 值 |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | **密钥** | 你的 Bot Token |
| `TELEGRAM_CHANNEL_ID` | **变量** | 你的频道 ID（负数） |
| `ADMIN_PASSWORD` | **密钥** | 你想设的登录密码 |

> 💡 `TELEGRAM_BOT_TOKEN` 和 `ADMIN_PASSWORD` 选**密钥**类型（加密存储），`TELEGRAM_CHANNEL_ID` 选**变量**。

#### 6. 完成

访问 `https://telestash.你的子域名.workers.dev`，输入密码即可使用。

---

### 方式二：命令行部署（Wrangler）

```bash
# 1. 安装 wrangler
npm install -g wrangler

# 2. 登录
wrangler login

# 3. 克隆项目
git clone https://github.com/leeyoloo/TeleStash.git
cd TeleStash

# 4. 创建 KV 命名空间
wrangler kv:namespace create METADATA
# 记下输出的 id

# 5. 编辑 wrangler.toml，填入 KV namespace id
# 6. 部署
wrangler deploy

# 7. 配置环境变量（同上，在 Dashboard 操作）
```

## 📡 WebDAV 接入

| 平台 | 操作 |
|------|------|
| **macOS Finder** | 前往 → 连接服务器 → `https://你的域名/dav/` |
| **Windows** | 映射网络驱动器 → `https://你的域名/dav/` |
| **iOS 文件** | ··· → 连接服务器 → `https://你的域名/dav/` |
| **Android** | Solid Explorer / ES文件浏览器 → 添加 WebDAV |
| **rclone** | `rclone config` → WebDAV → URL: `https://你的域名/dav/` |
| **Cyberduck** | 新建连接 → WebDAV → 输入地址 |

认证方式：**Basic Auth**（用户名任意，密码为管理员密码）

## 🪣 S3 兼容 API

Endpoint: `https://你的域名`

### 生成 Access Key

登录 TeleStash 管理后台 → ⚙️ 接入设置 → S3 兼容 API → 生成新密钥对

### 使用 aws cli

```bash
aws configure
# Access Key ID: 管理后台生成的 Access Key
# Secret Access Key: 管理后台生成的 Secret Key
# Region: us-east-1

# 列出文件
aws --endpoint-url https://你的域名 s3 ls

# 上传文件
aws --endpoint-url https://你的域名 s3 cp ./myfile.txt s3://telestash/

# 下载文件
aws --endpoint-url https://你的域名 s3 cp s3://telestash/myfile.txt ./
```

### 使用 rclone

```bash
rclone config
# New remote → type=s3 → provider=Other
# endpoint=https://你的域名
# access_key_id=你的AccessKey
# secret_access_key=你的SecretKey

rclone ls myremote:/
rclone copy ./myfile.txt myremote:/
```

## 📖 OPDS 电子书目录

Endpoint: `https://你的域名/opds`

认证：Basic Auth

### 支持的阅读器

- **Reeden**（iOS/Android）
- **KyBook**（iOS）
- **Moon+ Reader**（Android）
- 任何标准 OPDS 阅读器

在阅读器中添加 OPDS 源，输入地址和密码即可浏览/下载电子书。

## 📋 API 参考

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/login` | 登录 |
| GET | `/api/auth/check` | 检查登录状态 |
| GET | `/api/files?path=/` | 列出文件 |
| POST | `/api/upload` | 上传文件 |
| GET | `/api/download?path=/file` | 下载文件 |
| POST | `/api/delete` | 删除文件/文件夹 |
| POST | `/api/rename` | 重命名 |
| POST | `/api/mkdir` | 创建文件夹 |
| GET | `/api/admin/s3keys` | 列出 S3 密钥 |
| POST | `/api/admin/s3keys` | 生成 S3 密钥 |
| DELETE | `/api/admin/s3keys/:id` | 删除 S3 密钥 |

### WebDAV

| 方法 | 路径 | 说明 |
|------|------|------|
| PROPFIND | `/dav/*` | 列出文件/属性 |
| GET | `/dav/*` | 下载文件 |
| PUT | `/dav/*` | 上传文件 |
| DELETE | `/dav/*` | 删除 |
| MKCOL | `/dav/*` | 创建文件夹 |
| COPY | `/dav/*` | 复制 |
| MOVE | `/dav/*` | 移动 |

### S3

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/s3/bucket` | 列出桶内文件 |
| GET | `/s3/bucket/key` | 下载文件 |
| PUT | `/s3/bucket/key` | 上传文件 |
| DELETE | `/s3/bucket/key` | 删除文件 |
| HEAD | `/s3/bucket/key` | 获取文件信息 |

### OPDS

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/opds` | 根目录 |
| GET | `/opds/*` | 浏览子目录 |
| GET | `/opds/download/*` | 下载电子书 |

## ⚠️ 限制与注意事项

### KV 免费额度限制

| 限制项 | 免费额度 | 说明 |
|--------|----------|------|
| KV 读取 | **100,000 次/天** | 每次浏览文件列表消耗 1 次 |
| KV 写入 | **1,000 次/天** | 每次上传/创建文件夹/删除消耗 1 次 |
| KV 存储 | **1 GB** | 文件元数据很小，基本不会超 |
| KV 单个 value | **25 MB** | 单个目录下的文件列表 JSON |
| KV 单个 key | **512 bytes** | 路径长度限制 |

> 💡 **实际影响**：免费版 KV 每天最多写入 1000 次，意味着每天最多上传/删除 **1000 个文件**。日常使用完全够用，批量迁移大量文件时需要注意。

### 其他限制

| 限制项 | 说明 |
|--------|------|
| 单文件 **50MB** | Telegram Bot API 上传限制 |
| Worker CPU **10ms** | Cloudflare 免费版，一般够用 |
| Worker 请求 **100K/天** | Cloudflare 免费版 |
| KV 路径不支持某些字符 | 避免在文件名中使用 `\n`、`\r` 等控制字符 |

### KV 超限怎么办？

如果每天 1000 次写入不够用：

1. **升级 Workers Paid 计划**（$5/月）：KV 写入提升到 **每天 1 亿次**，读取 **无限**
2. **改用 D1 数据库**（免费 5M 行读取/天）：适合超大量文件
3. **合并写入操作**：减少单文件操作频率

## 🏗️ 技术栈

- **前端**: 原生 HTML/CSS/JS（零依赖，单文件）
- **后端**: Cloudflare Workers
- **存储**: Telegram Bot API + Channel
- **元数据**: Cloudflare KV
- **认证**: HMAC-SHA256 JWT + Basic Auth
- **协议**: WebDAV / S3 兼容 / OPDS 1.1

## 📜 License

MIT
