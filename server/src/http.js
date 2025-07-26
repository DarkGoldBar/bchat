import express from 'express';
import * as httpHandler from '@bchat/handlers/src/http.js';

export function createHttpServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // 解析 JSON 和 URL 编码的请求体
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 通用路由处理，模拟 API Gateway Lambda 调用模式
  app.all('*', async (req, res) => {
    // 构造 Lambda 风格的事件对象
    const event = {
      httpMethod: req.method,
      path: req.path,
      headers: req.headers,
      queryStringParameters: req.query,
      body: req.body,
    };

    // 创建 Lambda 风格的 context 对象
    const context = {
      functionName: 'httpHandler',
      awsRequestId: Date.now().toString(),
    };

    try {
      const result = await httpHandler.handler(event, context);

      if (result.headers) {
        Object.entries(result.headers).forEach(([key, value]) => {
          res.set(key, value);
        });
      }
      res.status(result.statusCode || 200);

      res.send(result.body);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({
        message: 'Internal Server Error',
        error: error.toString()
      });
    }
  });

  // 启动服务器
  const server = app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
  });

  return server;
}
