# Aliyun React Native Push - Expo Config Plugin

这是一个用于 [aliyun-react-native-push](https://github.com/your-repo/aliyun-react-native-push) 的 Expo Config Plugin，可以自动配置阿里云推送服务所需的原生项目设置。

## 功能特性

- 🚀 **自动配置**：自动完成 Android 和 iOS 原生配置
- 🔧 **厂商通道支持**：支持华为、小米、OPPO、VIVO、魅族、荣耀、FCM 等厂商推送通道
- 📱 **双平台兼容**：同时支持 Android 和 iOS 平台
- 🎯 **零手动配置**：无需手动修改原生代码

## 安装

```bash
# 安装推送库
npm install aliyun-react-native-push

# 安装此插件（如果发布到 npm）
npm install expo-plugin-aliyun-push
```

## 配置

在 `app.json` 或 `app.config.js` 中添加插件配置：

### 完整配置（包含厂商通道）

```json
{
  "expo": {
    "plugins": [
      [
        "expo-plugin-aliyun-push",
        {
          "huawei": {
            "appId": "YOUR_HUAWEI_APP_ID"
          },
          "xiaomi": {
            "appId": "YOUR_XIAOMI_APP_ID",
            "appKey": "YOUR_XIAOMI_APP_KEY"
          },
          "oppo": {
            "key": "YOUR_OPPO_KEY",
            "secret": "YOUR_OPPO_SECRET"
          },
          "vivo": {
            "apiKey": "YOUR_VIVO_API_KEY",
            "appId": "YOUR_VIVO_APP_ID"
          },
          "meizu": {
            "appId": "YOUR_MEIZU_APP_ID",
            "appKey": "YOUR_MEIZU_APP_KEY"
          },
          "honor": {
            "appId": "YOUR_HONOR_APP_ID"
          },
          "fcm": {
            "senderId": "YOUR_FCM_SENDER_ID",
            "applicationId": "YOUR_FCM_APP_ID",
            "projectId": "YOUR_FCM_PROJECT_ID",
            "apiKey": "YOUR_FCM_API_KEY"
          }
        }
      ]
    ]
  }
}
```

### 使用 app.config.js (推荐用于环境变量)

```javascript
export default {
  expo: {
    plugins: [
      [
        "expo-plugin-aliyun-push",
        {
          // 可选：厂商推送配置
          huawei: {
            appId: process.env.HUAWEI_APP_ID,
          },
          xiaomi: {
            appId: process.env.XIAOMI_APP_ID,
            appKey: process.env.XIAOMI_APP_KEY,
          },
          // ... 其他厂商配置
        },
      ],
    ],
  },
};
```

## 插件自动配置内容

### Android 配置

1. **Maven 仓库**：自动添加阿里云和华为 Maven 仓库
2. **AndroidManifest.xml**：
   - 添加必要的权限
   - 配置厂商推送的 meta-data
   - 注册阿里云推送消息接收器
3. **ProGuard 规则**：添加混淆规则以防止 SDK 被混淆

### iOS 配置

1. **Podfile**：添加阿里云 CocoaPods 仓库源
2. **AppDelegate**：
   - 导入必要的头文件
   - 添加推送相关的回调方法
   - 配置 UNUserNotificationCenter delegate
3. **Capabilities**：
   - 启用 Push Notifications
   - 添加 Background Modes (remote-notification, fetch)
4. **桥接头文件**：为 Swift 项目自动创建和配置桥接头文件

## 使用方法

### 1. 配置插件

按照上述配置方法，在 `app.json` 或 `app.config.js` 中配置插件。

### 2. 构建项目

使用 EAS Build 或本地构建：

```bash
# 使用 EAS Build
eas build --platform ios
eas build --platform android

# 或本地构建
expo prebuild
expo run:ios
expo run:android
```

### 3. 在代码中初始化推送

```typescript
import * as AliyunPush from "aliyun-react-native-push";
import { Platform } from "react-native";

// 初始化推送服务
const initPush = async () => {
  const config = Platform.select({
    ios: {
      appKey: "YOUR_IOS_APP_KEY",
      appSecret: "YOUR_IOS_APP_SECRET",
    },
    android: {
      appKey: "YOUR_ANDROID_APP_KEY",
      appSecret: "YOUR_ANDROID_APP_SECRET",
    },
  });

  try {
    const result = await AliyunPush.initPush(config?.appKey, config?.appSecret);

    if (result.code === AliyunPush.kAliyunPushSuccessCode) {
      console.log("推送服务初始化成功");

      // 获取设备 ID
      const deviceId = await AliyunPush.getDeviceId();
      console.log("设备 ID:", deviceId);
    } else {
      console.error("推送服务初始化失败:", result.errorMsg);
    }
  } catch (error) {
    console.error("初始化错误:", error);
  }
};

// 注册通知回调
AliyunPush.addNotificationCallback((notification) => {
  console.log("收到通知:", notification);
});

AliyunPush.addNotificationOpenedCallback((notification) => {
  console.log("通知被点击:", notification);
});

// 初始化
initPush();
```

## 注意事项

### iOS 配置

1. **推送证书**：确保已在苹果开发者中心创建推送证书，并上传到阿里云推送控制台
2. **环境切换**：插件会根据 `EAS_BUILD_PROFILE` 环境变量自动选择开发或生产环境
3. **Swift 支持**：如果项目使用 Swift，插件会自动创建桥接头文件

### Android 配置

1. **厂商通道**：各厂商推送需要在对应的开发者平台申请并配置
2. **混淆规则**：插件已自动添加必要的混淆规则，无需手动配置
3. **最低版本**：确保 `minSdkVersion >= 21`

## 环境变量配置

推荐使用环境变量管理敏感信息：

### .env 文件

```bash
# 厂商推送（可选）
HUAWEI_APP_ID=your_huawei_app_id
XIAOMI_APP_ID=your_xiaomi_app_id
XIAOMI_APP_KEY=your_xiaomi_app_key
# ... 其他厂商配置
```

### 使用 dotenv

```bash
npm install dotenv
```

在 `app.config.js` 中：

```javascript
import "dotenv/config";

export default {
  // ... 配置
};
```

## 故障排查

### 常见问题

1. **构建失败**

   - 确保已运行 `expo prebuild --clean` 清理缓存
   - 检查配置的 appKey 和 appSecret 是否正确

2. **iOS 推送不工作**

   - 确认推送证书已正确配置
   - 检查设备是否允许应用发送通知
   - 使用真机测试（模拟器不支持推送）

3. **Android 厂商通道不工作**
   - 确认已在厂商开发者平台完成配置
   - 检查手机是否安装了对应厂商的推送服务
   - 某些厂商需要应用在后台或被杀死才能收到推送

### 调试建议

1. 启用调试日志：

```typescript
AliyunPush.setLogLevel(AliyunPush.AliyunPushLogLevel.Debug);
```

2. 检查设备注册状态：

```typescript
const deviceId = await AliyunPush.getDeviceId();
console.log("Device ID:", deviceId);
```

3. 验证配置：
   - Android: 检查 `android/app/src/main/AndroidManifest.xml`
   - iOS: 检查 Xcode 项目的 Capabilities 和 AppDelegate

## 开发

### 本地开发

```bash
# 克隆仓库
git clone <repository-url>
cd plugin

# 安装依赖
npm install

# 构建插件
npm run build

# 在项目中使用本地插件
cd ../your-expo-project
npm install ../plugin
```

### 发布

```bash
# 构建
npm run build

# 发布到 npm
npm publish
```

## 配置选项说明

| 选项                | 类型   | 必需 | 描述               |
| ------------------- | ------ | ---- | ------------------ |
| `huawei.appId`      | string | 否   | 华为推送 App ID    |
| `xiaomi.appId`      | string | 否   | 小米推送 App ID    |
| `xiaomi.appKey`     | string | 否   | 小米推送 App Key   |
| `oppo.key`          | string | 否   | OPPO 推送 Key      |
| `oppo.secret`       | string | 否   | OPPO 推送 Secret   |
| `vivo.apiKey`       | string | 否   | VIVO 推送 API Key  |
| `vivo.appId`        | string | 否   | VIVO 推送 App ID   |
| `meizu.appId`       | string | 否   | 魅族推送 App ID    |
| `meizu.appKey`      | string | 否   | 魅族推送 App Key   |
| `honor.appId`       | string | 否   | 荣耀推送 App ID    |
| `fcm.senderId`      | string | 否   | FCM Sender ID      |
| `fcm.applicationId` | string | 否   | FCM Application ID |
| `fcm.projectId`     | string | 否   | FCM Project ID     |
| `fcm.apiKey`        | string | 否   | FCM API Key        |