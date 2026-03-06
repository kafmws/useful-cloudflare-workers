      const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>CloudFlare-Notificaiton — 消息推送服务</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: linear-gradient(170deg, #f3e8ff 0%, #ffffff 100%);
        color: #1f2937;
      }
      .card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border-radius: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.18);
        padding: 40px;
        max-width: 720px;
        width: 90%;
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .card:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 32px;
        font-weight: 700;
        background: linear-gradient(90deg, #8b5cf6, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      p {
        color: #4b5563;
        margin: 0 0 24px;
        font-size: 16px;
        line-height: 1.6;
      }
      .author {
        margin: 20px 0;
        color: #374151;
        font-size: 14px;
      }
      .icons {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 24px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 12px;
        text-decoration: none;
        color: #374151;
        background: #f4f4f5;
        border: 1px solid #e4e4e7;
        font-weight: 700;
        transition: all 0.2s ease;
      }
      .btn:hover {
        background: #ffffff;
        border-color: #d4d4d8;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .icon {
        width: 22px;
        height: 22px;
        display: inline-block;
      }
      footer {
        margin-top: 24px;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>CF-</h1>
      <p>一个极简、可靠的消息推送服务，支持多个消息通道。</p>
      <p>由<a href="https://kafm.eu.org">kafm</a>部署</p>
    </div>
  </body>
</html>`;