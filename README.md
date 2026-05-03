# 📦 TeleStash

> 基于 Telegram Bot API + Cloudflare Workers 的云存储系统

把 Telegram 频道当作无限存储后端，通过 Cloudflare Workers 提供 Web 管理界面。

## ✨ 特性

- 🆓 **完全免费** — 存储在 Telegram 云端，无容量限制
- 🚀 **边缘部署** — Cloudflare Workers 全球节点，访问飞快
- 📁 **虚拟文件夹** — KV 元数据管理，支持多级目录
- 🔐 **密码保护** — JWT 认证，安全访问
- 📤 **拖拽上传** — 现代化 UI，支持多文件上传
- ⬇️ **在线下载** — 通过 Worker 代理下载，无需打开 Telegram
- ✏️ **重命名/删除** — 完整的文件管理功能

## 🚀 部署

### 前置要求

- Cloudflare 账户
- Telegram Bot（从 [@BotFather](https://t.me/BotFather) 创建）
- Telegram 私有频道（用于存储文件）

### 步骤

#### 1. 创建 Telegram Bot

打开 Telegram，搜索 `@BotFather`，发送：

```
/newbot
```

按提示创建 Bot，获取 Token。

#### 2. 创建 Telegram 频道

1. 新建私有频道
2. 将 Bot 添加为频道管理员（需要发送消息权限）

#### 3. 获取频道 ID

给 Bot 发一条消息，然后访问：

```
https://api.telegram.org/bot你的TOKEN/getUpdates
```

找 `chat.id` 字段（负数，以 `-100` 开头）。

#### 4. 部署到 Cloudflare Workers

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 KV 命名空间
wrangler kv:namespace create METADATA

# 编辑 wrangler.toml，填入 KV namespace ID 和你的配置
# 然后部署
wrangler deploy
```

#### 5. 配置环境变量

在 Cloudflare Dashboard → Workers → 你的 Worker → 设置 → 变量和机密：

| 变量名 | 说明 |
|--------|------|
| `TELEGRAM_BOT_TOKEN` | Bot 的 Token |
| `TELEGRAM_CHANNEL_ID` | 频道 ID（负数） |
| `ADMIN_PASSWORD` | 管理员密码 |

## 📋 API

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

## ⚠️ 限制

- **单文件上限 50MB**（Telegram Bot API 限制）
- 通过 Worker 代理下载上限约 20MB
- Telegram 不保证文件永久存储（极低概率清理）

## 🏗️ 技术栈

- **前端**: 原生 HTML/CSS/JS（零依赖）
- **后端**: Cloudflare Workers
- **存储**: Telegram Bot API + Channel
- **元数据**: Cloudflare KV
- **认证**: HMAC-SHA256 JWT

## 📜 License

MIT
