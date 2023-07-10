# disco3

仿造 B 站的 3D 在线蹦迪项目

<!-- <video height="100" width="400" src="https://github.com/huandhu/disco3/video.mp4"> -->

<video height="300" id="video" controls="" preload="none">
      <source src="https://github.com/huandhu/disco3/video.mp4" type="video/mp4">
</videos>

### 安装

-   项目使用 `Creator 3.5.0 开发`，请使用 `3.5.0` 以上版本打开
-   执行 `npm install` 安装项目需要的用到的第三方库

### 配置

由于项目是使用环信 IM sdk 实现的多端消息通信，因此需要对使用该 sdk 的管理里对象的 WebIMManage 进行相关配置， 步骤如下如下：

1. 找到 assets/utils/WebIMManage.ts 文件
2. 找到一下代码填入应用唯一标识 `appKey`

```typescript
const config: EasemobChat.ConnectionParameters = {
    appKey: "XXXXX", // 填入应用唯一标识
    autoReconnectNumMax: 5, // 最大重连次数，默认 5 次。
    delivery: true, // 是否开启已送达回执
    heartBeatWait: 30000, // 心跳时间间隔（单位为毫秒）
    isDebug: true,
    isHttpDNS: true, // 是否启用 DNS。-（默认）true
    useOwnUploadFun: false, // 是否使用自己的上传函数，如想把图片、文件上传到自己的服务器
};
```

3. 找到一下代码填入, client_id 和 client_secret 获取管理 token

```typescript
let res = await api.token({
    grant_type: "client_credentials",
    client_id: "",
    client_secret: "",
    ttl: `${24 * 3600}`,
});
```
