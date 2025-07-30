# BChat
一个小规模使用的在线聚会游戏平台。前后端统一使用JavaScript开发。

## NPM Workspace
### client
前端包。使用ESNext标准。
使用Vue3 + Vuetify3 + VueRoute为框架，使用Vite3构建。
打包后使用gitpage提供服务。

### server
本地服务器包。使用ESNext标准。
使用express & websocket & redis。
按照apigateway和dynamoDB的风格提供服务。
包含对handlers/interface.js的本地版本实现，在启动时调用接口注入替换为本地接口。

### handlers
服务器逻辑包。使用CJS标准。
调用aws-cli v3接口。
按照aws-lambda风格写，可以直接使用samcli发布到远端。
在interface.js中封装一个接口，默认提供云服务的调用接口，本地服务时可替换为本地接口。

### shared
业务逻辑包。使用TS编写。
client和handlers两个包都会引用这个包里面的逻辑。
client负责发送消息前的前端验证，handlers负责后端接收消息时的后端验证。

### types
使用JSDoc的typedef功能为所有项目提供统一的类型定义。
仅包含.d.ts类型定义。

## 代码规范
- 遵循let it crash原则，不需要过多的try-catch。
- 使用NPM作为包管理工具
- 使用ESNext作为发布标准，不使用向前兼容工具。