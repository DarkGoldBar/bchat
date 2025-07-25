# BChat
一个小规模使用的在线聚会游戏平台。前后端统一使用JavaScript开发。

## Workspace
### client
前端包。
打包后使用gitpage提供服务。
使用Vue3 + Vuetify3 + VueRoute为框架构建。

### server
本地服务器包。
使用express & websocket & redis，按照apigateway和dynamoDB的风格提供服务。
启动时调用handlers的逻辑，并注入本地数据库接口和WS接口。

### handlers
服务器逻辑包。
按照aws-lambda风格写，可以直接使用samcli发布到远端。
对于DynamoDB和apigateway的调用全部做二次封装，以便本地调用时注入为本地服务。

### types
使用JSDoc的typedef功能为所有项目提供统一的类型定义

## 代码规范
- 遵循let it crash原则，不需要过多的try-catch。
