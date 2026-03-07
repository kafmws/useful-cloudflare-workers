# 消息推送服务

## 项目简介
本项目提供一个轻量级的 **Cloudflare Worker**，用于向多种消息通道发送通知。当前实现支持 **微信公众平台测试号**，后续可扩展至 Email、Telegram 等通道。

### 主要功能
- **统一接口**：通过 `/send` 端点接收 JSON 或表单数据，内部根据 `channel` 字段路由到对应的发送实现。
- **安全鉴权**：所有请求需携带 `Authorization` 头或 `token` 参数，值必须与 Worker 环境变量 `API_TOKEN` 匹配。
- **多通道支持**：目前实现 `wechat`，后续可按需添加 `email`、`telegram` 等。
- **交互式测试页面**：访问 `/ctokene` 或 `/view` 可获得简易的前端表单，方便手动测试。

## 环境变量
| 变量 | 说明 | 必填 |
|------|------|------|
| `API_TOKEN` | 用于鉴权的 token | ✅ |
| `WX_APPID` | 微信公众号 AppID（可选，若未设置则使用环境变量） | ❌ |
| `WX_SECRET` | 微信公众号 Secret（可选，若未设置则使用环境变量） | ❌ |

## API 文档

### 1. 发送消息
**URL**：`/send` 或 `/xx` 即 xx 消息通道
**方法**：`POST`  
**请求头**：
```
Content-Type: application/json
Authorization: ctoken   # 可选，若未提供则使用 body/token 参数
```
**请求体**（JSON 或表单）
```
{
  "channel": "wechat",            // 发送通道，URL 为 /send 时必填，当前仅支持 wechat
  "token": "token",               // 必填，鉴权 token
  "title": "测试标题",
  "content": "消息内容",

  // wechat 通道参数
  "userid": "OPENID1|OPENID2",    // 可选，微信用户 ID，支持多用户用 | 分隔
  "appid": "appId",               // 可选，微信 AppID
  "secret": "appsecret",          // 可选，微信 AppSecret
  "template_id": "template_id",   // 可选，微信消息模板 ID
  "base_url": ""                  // 可选，微信消息跳转链接
}
```
**响应**
```
wechat 响应
{"msg":"Successfully sent messages to 1 user(s). First response: ok"}
```
或错误信息。

**方法**：`GET`
https://notify.kafm.eu.org/send?channel=wechat&title=aaa&content=bbb&token=your_token

https://notify.kafm.eu.org/channelName?&title=aaa&content=bbb&token=your_token

### 2. 查看消息
**URL**：`/view`  
**方法**：`GET`  
**查询参数**
| 参数 | 说明 |
|------|------|
| `title` | 消息标题，默认 "消息推送" |
| `message` | 消息内容，默认 "无内容信息" |
| `date` | 时间戳或自定义字符串，默认 "无时间信息" |

**示例**：`/view?title=Hello\u0026message=World\u0026date=2026-03-07`

### 3. 交互式测试页面
访问 `/test/token`（token 必须与 `API_TOKEN` 匹配）即可打开一个表单页面，支持手动填写并发送测试请求。

## 开发与部署
1. 安装 Wrangler：`npm i -g @cloudflare/wrangler`  
2. 进入 `workers/notification` 目录，执行 `wrangler dev` 进行本地调试。  
3. 发布：`wrangler publish`。

## 贡献
欢迎提交 PR，添加更多通道或改进现有实现。

## 许可证
MIT © 2026 kafm
