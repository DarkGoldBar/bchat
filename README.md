# BChat
一个小规模使用的在线聚会游戏平台。前后端统一使用JavaScript开发。

## Workspace
### client
前端包。
使用Vue3 + Vuetify3 + VueRoute为框架构建。
打包后使用gitpage提供服务。

### server
本地服务器包。
使用express & websocket & redis。
按照apigateway和dynamoDB的风格提供服务。
包含对handlers/interface.js的本地版本实现，在启动时调用接口注入替换为本地接口。

### handlers
服务器逻辑包。
调用aws-cli v3接口。
按照aws-lambda风格写，可以直接使用samcli发布到远端。
在interface.js中封装一个接口，默认提供云服务的调用接口，本地服务时可替换为本地接口。

### types
使用JSDoc的typedef功能为所有项目提供统一的类型定义

## 代码规范
- 遵循let it crash原则，不需要过多的try-catch。
